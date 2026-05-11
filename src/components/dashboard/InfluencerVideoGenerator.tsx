import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  Video, 
  Coins, 
  Loader2,
  Wand2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import InlineGenerationCard from "./InlineGenerationCard";
import ToolCreationsGrid from "./ToolCreationsGrid";
import { resizeImageForAspectRatio } from "@/utils/imageResize";
import type { Influencer } from "./AIInfluencer";

interface InfluencerVideoGeneratorProps {
  influencer: Influencer;
  onBack: () => void;
  onCreditsUpdate: () => void;
  availableCredits: number;
  hasSubscription: boolean;
  onUpgrade: () => void;
}

interface Generation {
  id: string;
  type: string;
  status: string;
  prompt: string | null;
  result_url: string | null;
  error_message: string | null;
  created_at: string;
  settings?: Record<string, unknown> | null;
  resultUrl?: string;
  error?: string;
}

const DURATIONS = [
  { value: 4, label: "4s", credits: 225 },
  { value: 8, label: "8s", credits: 450 },
  { value: 12, label: "12s", credits: 450 }
];

const ASPECT_RATIOS = [
  { value: "9:16", label: "9:16", description: "TikTok / Reels" },
  { value: "1:1", label: "1:1", description: "Square" },
  { value: "16:9", label: "16:9", description: "YouTube" }
];

const QUALITIES = [
  { value: "hd", label: "HD", multiplier: 1 },
  { value: "4k", label: "4K", multiplier: 1.5 }
];

const InfluencerVideoGenerator = ({
  influencer,
  onBack,
  onCreditsUpdate,
  availableCredits,
  hasSubscription,
  onUpgrade
}: InfluencerVideoGeneratorProps) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isResizingAvatar, setIsResizingAvatar] = useState(false);
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
  
  // Video settings - defaults optimized for social media
  const [seconds, setSeconds] = useState(4);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [quality, setQuality] = useState("4k");

  // Calculate credits
  const baseDuration = DURATIONS.find(d => d.value === seconds);
  const qualityOption = QUALITIES.find(q => q.value === quality);
  const creditCost = baseDuration?.credits ?? 225;

  const canGenerate = prompt.trim() && !isGenerating && !isResizingAvatar;
  const hasEnoughCredits = availableCredits >= creditCost || hasSubscription;

  const handleOptimizePrompt = async () => {
    if (!prompt.trim() || isOptimizing) return;
    
    setIsOptimizing(true);
    try {
      const data = await callAPI<{ optimizedPrompt?: string; error?: string }>('optimize-prompt', {
        prompt,
        type: 'influencer-video',
        context: `This is for an AI influencer named ${influencer.name}, ${influencer.gender}, ${influencer.age_range} years old, ${influencer.fashion_style} style.`
      });

      if (data?.optimizedPrompt) {
        setPrompt(data.optimizedPrompt);
        toast.success("Prompt optimized!");
      }
    } catch (error: any) {
      console.error('Error optimizing prompt:', error);
      toast.error("Failed to optimize prompt");
    } finally {
      setIsOptimizing(false);
    }
  };

  const pollVideoStatus = async (generationId: string, externalId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setActiveGeneration(prev => prev ? { ...prev, status: 'failed', error_message: 'Generation timed out' } : null);
        return;
      }

      try {
        const data = await callAPI<{ status?: string; resultUrl?: string; error?: string }>('check-video-status', { generationId, externalId });

        if (data?.status === 'completed' && data?.resultUrl) {
          setActiveGeneration(prev => prev ? { ...prev, status: 'completed', result_url: data.resultUrl } : null);
          onCreditsUpdate();
          toast.success("Video generated successfully!");
        } else if (data?.status === 'failed') {
          setActiveGeneration(prev => prev ? { ...prev, status: 'failed', error_message: data.error || 'Generation failed' } : null);
        } else {
          attempts++;
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  const handleGenerate = async () => {
    if (!canGenerate || !user) return;

    if (!hasEnoughCredits) {
      toast.error("Not enough credits", {
        description: `You need ${creditCost} credits for this video.`
      });
      return;
    }

    setIsGenerating(true);
    setIsResizingAvatar(true);
    const now = new Date().toISOString();
    setActiveGeneration({
      id: 'temp',
      type: 'video',
      status: 'pending',
      prompt: prompt,
      result_url: null,
      error_message: null,
      created_at: now
    });

    try {
      // Resize avatar on-demand to match the selected aspect ratio
      toast.info("Preparing image...", {
        description: `Resizing avatar to match ${aspectRatio} format.`
      });
      
      let referenceImageUrl: string | null = null;
      
      try {
        referenceImageUrl = await resizeImageForAspectRatio(
          supabase,
          influencer.avatar_image,
          aspectRatio as '16:9' | '9:16' | '1:1',
          user.id,
          (status) => console.log('Avatar resize status:', status)
        );
        console.log('Avatar resized, signed URL:', referenceImageUrl?.substring(0, 100) + '...');
      } catch (resizeError) {
        console.error('Failed to resize avatar:', resizeError);
        toast.error("Failed to prepare image", {
          description: "Please try again."
        });
        setIsGenerating(false);
        setIsResizingAvatar(false);
        setActiveGeneration(null);
        return;
      }
      
      setIsResizingAvatar(false);

      const enhancedPrompt = `${influencer.name}, an AI influencer (${influencer.gender}, ${influencer.age_range} years old, ${influencer.fashion_style} style): ${prompt}. The person should have natural facial expressions and movements, speaking directly to camera.`;

      const data = await callAPI<{ generationId?: string; videoId?: string; externalId?: string; error?: string }>('generate-video', {
        prompt: enhancedPrompt,
        seconds,
        aspectRatio,
        quality,
        referenceImageUrl,
        influencerId: influencer.id
      });

      if (data?.generationId && (data?.videoId || data?.externalId)) {
        setActiveGeneration(prev => prev ? { ...prev, id: data.generationId, status: 'processing' } : null);
        pollVideoStatus(data.generationId, data.videoId || data.externalId);
      } else {
        throw new Error("No generation ID returned");
      }
    } catch (error: any) {
      console.error('Error generating video:', error);
      setActiveGeneration(prev => prev ? { ...prev, status: 'failed', error_message: error.message || 'Failed to start generation' } : null);
      toast.error("Failed to generate video", {
        description: error.message
      });
      setIsGenerating(false);
      setIsResizingAvatar(false);
    }
  };

  const handleDismissGeneration = () => {
    setActiveGeneration(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Influencer Video Generation</h1>
          <p className="text-muted-foreground">Create social videos using your AI influencer</p>
        </div>
      </div>

      {/* Locked influencer preview */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
        <div className="relative">
          <img 
            src={influencer.avatar_image} 
            alt={influencer.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary"
          />
          {isResizingAvatar && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{influencer.name}</p>
          <p className="text-xs text-muted-foreground">
            {isResizingAvatar ? 'Preparing for video...' : 'Influencer locked for this video'}
          </p>
        </div>
        <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>

      {/* Main generation area */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4">
        {/* Prompt input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Write what the influencer should say or do..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none bg-background/50"
          />
          
          {/* Optimize button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOptimizePrompt}
              disabled={!prompt.trim() || isOptimizing}
              className={`gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 text-[10px] sm:text-xs relative ${
                prompt.trim() && !isOptimizing
                  ? 'border-[rgb(139,92,246)] bg-gradient-to-r from-[rgb(139,92,246)]/10 to-[rgb(236,72,153)]/10 text-[rgb(139,92,246)] hover:from-[rgb(139,92,246)]/20 hover:to-[rgb(236,72,153)]/20 shadow-[0_0_12px_rgba(139,92,246,0.3)] animate-pulse'
                  : ''
              }`}
            >
              {isOptimizing ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span>Optimize</span>
              {prompt.trim() && !isOptimizing && (
                <span className="absolute -top-2.5 -right-1 sm:-right-2 bg-gradient-to-r from-[rgb(139,92,246)] to-[rgb(236,72,153)] text-white text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                  AI ✨
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-3 gap-3">
          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Duration</label>
            <div className="flex gap-1">
              {DURATIONS.map(d => (
                <Button
                  key={d.value}
                  variant={seconds === d.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeconds(d.value)}
                  className="flex-1 text-xs"
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Aspect Ratio</label>
            <div className="flex gap-1">
              {ASPECT_RATIOS.map(ar => (
                <Button
                  key={ar.value}
                  variant={aspectRatio === ar.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAspectRatio(ar.value)}
                  className="flex-1 text-xs"
                >
                  {ar.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Quality</label>
            <div className="flex gap-1">
              {QUALITIES.map(q => (
                <Button
                  key={q.value}
                  variant={quality === q.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuality(q.value)}
                  className="flex-1 text-xs"
                >
                  {q.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Coins className="w-3 h-3" />
              {creditCost} credits
            </Badge>
            <span className="text-xs text-muted-foreground">
              Optimized for TikTok & Instagram
            </span>
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating || !hasEnoughCredits}
            className="gap-2 w-full sm:w-auto"
          >
            {isResizingAvatar ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparing...
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Generate Video
              </>
            )}
          </Button>
        </div>

        {!hasEnoughCredits && (
          <Button variant="outline" className="w-full" onClick={onUpgrade}>
            Upgrade for more credits
          </Button>
        )}
      </div>

      {/* Active generation */}
      {activeGeneration && (
        <InlineGenerationCard
          generation={activeGeneration}
          onDismiss={handleDismissGeneration}
        />
      )}

      {/* Recent videos */}
      {user && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Influencer Videos</h3>
          <ToolCreationsGrid
            userId={user.id}
            type="video"
            maxItems={6}
          />
        </div>
      )}
    </div>
  );
};

export default InfluencerVideoGenerator;
