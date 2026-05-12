import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Zap, Lock } from "lucide-react";
import { callAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { Influencer } from "./AIInfluencer";
import type { InfluencerPose } from "./InfluencerDetailPage";
import InlineGenerationCard from "./InlineGenerationCard";
import ToolCreationsGrid from "./ToolCreationsGrid";

interface InfluencerVideoTabProps {
  influencer: Influencer;
  selectedPose?: InfluencerPose | null;
  onCreditsUpdate: () => void;
  availableCredits: number;
  hasSubscription: boolean;
  onUpgrade: () => void;
}

interface Generation {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  prompt: string;
  resultUrl: string | null;
  error: string | null;
}

const DURATIONS = [
  { value: 5, label: "5s", credits: 225 },
  { value: 10, label: "10s", credits: 450 },
];

const ASPECT_RATIOS = [
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
  { value: "1:1", label: "1:1" },
];

const QUALITIES = [
  { value: "hd", label: "HD", multiplier: 1 },
  { value: "4k", label: "4K", multiplier: 1.5 },
];

const InfluencerVideoTab = ({
  influencer,
  selectedPose,
  onCreditsUpdate,
  availableCredits,
  hasSubscription,
  onUpgrade
}: InfluencerVideoTabProps) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [quality, setQuality] = useState("4k");
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const durationOption = DURATIONS.find(d => d.value === seconds) || DURATIONS[0];
  const qualityOption = QUALITIES.find(q => q.value === quality) || QUALITIES[1];
  const creditCost = Math.round(durationOption.credits * qualityOption.multiplier);

  const canGenerate = hasSubscription || availableCredits >= creditCost;

  const getReferenceImageUrl = (): string | undefined => {
    return selectedPose?.image_url || undefined;
  };


  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }

    setIsOptimizing(true);
    try {
      const data = await callAPI<{ optimizedPrompt?: string; error?: string }>('optimize-prompt', {
        prompt,
        type: 'video',
        context: `AI influencer named ${influencer.name}, ${influencer.gender}, ${influencer.age_range}${influencer.fashion_style ? `, ${influencer.fashion_style} style` : ''}`,
        referenceImage: influencer.avatar_image
      });

      if (data?.optimizedPrompt) {
        setPrompt(data.optimizedPrompt);
        toast.success("Prompt optimized with visual analysis!");
      }
    } catch (error: any) {
      console.error('Optimize error:', error);
      toast.error("Failed to optimize prompt");
    } finally {
      setIsOptimizing(false);
    }
  };

  const pollVideoStatus = async (generationId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setActiveGeneration(prev => prev ? { ...prev, status: 'failed', error: 'Generation timed out' } : null);
        return;
      }

      try {
        const data = await callAPI<{ status?: string; resultUrl?: string; error?: string }>('check-video-status', { generationId });

        if (data.status === 'completed' && data.resultUrl) {
          setActiveGeneration(prev => prev ? { 
            ...prev, 
            status: 'completed', 
            resultUrl: data.resultUrl 
          } : null);
          onCreditsUpdate();
          toast.success("Video generated successfully!");
          return;
        } else if (data.status === 'failed') {
          setActiveGeneration(prev => prev ? { 
            ...prev, 
            status: 'failed', 
            error: data.error || 'Generation failed' 
          } : null);
          toast.error("Video generation failed");
          return;
        }

        attempts++;
        setTimeout(poll, 5000);
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!canGenerate) {
      toast.error("Not enough credits");
      return;
    }

    setIsGenerating(true);
    setActiveGeneration({
      id: '',
      status: 'pending',
      prompt: prompt,
      resultUrl: null,
      error: null
    });

    try {
      // STEP 1: Automatically optimize prompt with visual analysis of reference image
      toast.info("Analyzing influencer reference image...");
      
      let finalPrompt = prompt;
      
      let optimizeError: Error | null = null;
      let optimizeData: { optimizedPrompt?: string } | null = null;
      try {
        optimizeData = await callAPI<{ optimizedPrompt?: string }>('optimize-prompt', {
          prompt: prompt,
          type: 'video',
          context: `AI influencer named ${influencer.name}, ${influencer.gender}, ${influencer.age_range}${influencer.fashion_style ? `, ${influencer.fashion_style} style` : ''}`,
          referenceImage: influencer.avatar_image
        });
      } catch (e) {
        optimizeError = e as Error;
      }

      if (optimizeError) {
        console.warn('Optimize warning (continuing with fallback prompt):', optimizeError);
        // Fallback: use basic enhanced prompt if optimization fails
        finalPrompt = `${prompt}. The subject is ${influencer.name}, a ${influencer.gender} ${influencer.age_range}${influencer.fashion_style ? ` with ${influencer.fashion_style} style` : ''}${influencer.personality_tags?.length ? `, personality: ${influencer.personality_tags.join(', ')}` : ''}.`;
      } else if (optimizeData?.optimizedPrompt) {
        finalPrompt = optimizeData.optimizedPrompt;
        console.log('Using optimized prompt with visual description from reference image');
      }

      // STEP 2: Generate video with visually-optimized prompt and reference image
      toast.info("Starting video generation...");
      
      const referenceImageUrl = getReferenceImageUrl();
      
      const data = await callAPI<{ generationId?: string; error?: string }>('generate-video', {
        prompt: finalPrompt,
        seconds,
        aspectRatio,
        quality,
        credits: creditCost,
        type: 'influencer-video',
        referenceImageUrl: referenceImageUrl
      });

      if (data?.generationId) {
        setActiveGeneration(prev => prev ? { ...prev, id: data.generationId, status: 'processing' } : null);
        pollVideoStatus(data.generationId);
      } else {
        throw new Error('No generation ID returned');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setActiveGeneration(prev => prev ? { ...prev, status: 'failed', error: error.message } : null);
      toast.error(error.message || "Failed to start generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismissGeneration = () => {
    setActiveGeneration(null);
    setPrompt("");
  };

  return (
    <div className="influencer-content-tool space-y-3">
      {/* Reference Preview with Status */}
      <div className="bg-muted/50 rounded-xl p-2.5 flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden border border-primary/50">
            <img
              src={selectedPose?.image_url || influencer.avatar_image}
              alt="Reference"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Lock className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Reference Image</p>
          <p className="text-xs text-muted-foreground">
            Using {selectedPose?.is_original ? 'original avatar' : 'selected pose'} for video
          </p>
          
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Describe what your influencer should do or say in the video..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[84px] resize-none text-sm"
          disabled={isGenerating}
        />
        <div className="flex justify-end -mt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimizePrompt}
            disabled={isOptimizing || !prompt.trim()}
            className="gap-2"
          >
            {isOptimizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Optimize Prompt
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Duration */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Duration</label>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <Button
                key={d.value}
                variant={seconds === d.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSeconds(d.value)}
                className="flex-1"
              >
                {d.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Aspect Ratio</label>
          <div className="flex gap-2">
            {ASPECT_RATIOS.map(ar => (
              <Button
                key={ar.value}
                variant={aspectRatio === ar.value ? "default" : "outline"}
                size="sm"
                onClick={() => setAspectRatio(ar.value)}
                className="flex-1"
              >
                {ar.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Quality</label>
          <div className="flex gap-2">
            {QUALITIES.map(q => (
              <Button
                key={q.value}
                variant={quality === q.value ? "default" : "outline"}
                size="sm"
                onClick={() => setQuality(q.value)}
                className="flex-1"
              >
                {q.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex flex-row items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-2 justify-center py-2 px-4">
          <Zap className="w-4 h-4 text-primary" />
          <span>{creditCost} credits</span>
        </Badge>
        
        {canGenerate ? (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-generate flex-1 gap-2 h-9 px-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Video
              </>
            )}
          </Button>
        ) : (
          <Button onClick={onUpgrade} className="btn-generate flex-1 gap-2 h-9 px-4">
            <Zap className="w-4 h-4" />
            Upgrade to Generate
          </Button>
        )}
      </div>

      {/* Active Generation */}
      {activeGeneration && (
        <InlineGenerationCard
          generation={{
            id: activeGeneration.id,
            status: activeGeneration.status,
            prompt: activeGeneration.prompt,
            result_url: activeGeneration.resultUrl,
            error_message: activeGeneration.error,
            type: 'influencer-video',
            created_at: new Date().toISOString()
          }}
          onDismiss={handleDismissGeneration}
        />
      )}

      {/* Recent Creations */}
      {user && <ToolCreationsGrid userId={user.id} type="influencer-video" />}
    </div>
  );
};

export default InfluencerVideoTab;
