import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, Zap, Sparkles, Video as VideoIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { Influencer } from "./AIInfluencer";
import InlineGenerationCard from "./InlineGenerationCard";
import ToolCreationsGrid from "./ToolCreationsGrid";

interface InfluencerMotionTabProps {
  influencer: Influencer;
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

const ORIENTATIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const QUALITIES = [
  { value: "standard", label: "Standard", credits: 200 },
  { value: "pro", label: "Pro", credits: 250 },
];

const InfluencerMotionTab = ({
  influencer,
  onCreditsUpdate,
  availableCredits,
  hasSubscription,
  onUpgrade
}: InfluencerMotionTabProps) => {
  const { user } = useAuth();
  const [motionVideoUrl, setMotionVideoUrl] = useState<string | null>(null);
  const [motionVideoPreview, setMotionVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [orientation, setOrientation] = useState("center");
  const [quality, setQuality] = useState("pro");
  const [keepSound, setKeepSound] = useState(true);
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);

  const qualityOption = QUALITIES.find(q => q.value === quality) || QUALITIES[1];
  const creditCost = qualityOption.credits;
  const canGenerate = hasSubscription || availableCredits >= creditCost;

  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error("Please upload a video file");
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Video too large", {
        description: "Maximum file size is 100MB"
      });
      return;
    }

    setIsUploading(true);
    console.log('Starting video upload:', file.name, file.size, file.type);
    
    try {
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `motion_${Date.now()}.${fileExt}`;
      // Path must start with userId for RLS policy: auth.uid()::text = (storage.foldername(name))[1]
      const filePath = `${user?.id}/motion-references/${fileName}`;

      console.log('Uploading to path:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('generations')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const { data: urlData } = supabase.storage
        .from('generations')
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);
      
      setMotionVideoUrl(urlData.publicUrl);
      setMotionVideoPreview(URL.createObjectURL(file));
      toast.success("Video uploaded successfully");
    } catch (error: any) {
      console.error('Upload error details:', error);
      toast.error("Failed to upload video", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoUpload(file);
  };

  const removeVideo = () => {
    setMotionVideoUrl(null);
    setMotionVideoPreview(null);
  };

  const pollMotionStatus = async (generationId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setActiveGeneration(prev => prev ? { ...prev, status: 'failed', error: 'Generation timed out' } : null);
        return;
      }

      try {
        const data = await callAPI<{ status?: string; resultUrl?: string; error?: string }>('check-motion-status', { generationId });

        if (data.status === 'completed' && data.resultUrl) {
          setActiveGeneration(prev => prev ? { 
            ...prev, 
            status: 'completed', 
            resultUrl: data.resultUrl 
          } : null);
          onCreditsUpdate();
          toast.success("Motion transfer completed!");
          return;
        } else if (data.status === 'failed') {
          setActiveGeneration(prev => prev ? { 
            ...prev, 
            status: 'failed', 
            error: data.error || 'Generation failed' 
          } : null);
          toast.error("Motion transfer failed");
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
    if (!motionVideoUrl) {
      toast.error("Please upload a motion reference video");
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
      prompt: `Motion transfer for ${influencer.name}`,
      resultUrl: null,
      error: null
    });

    try {
      const data = await callAPI<{ generationId?: string; error?: string }>('generate-motion', {
        mode: 'motion-transfer',
        videoUrl: motionVideoUrl,
        imageUrl: influencer.avatar_image,
        orientation,
        quality,
        keepSound,
        credits: creditCost,
        type: 'influencer-motion'
      });

      if (data?.generationId) {
        setActiveGeneration(prev => prev ? { ...prev, id: data.generationId, status: 'processing' } : null);
        pollMotionStatus(data.generationId);
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
    setMotionVideoUrl(null);
    setMotionVideoPreview(null);
  };

  return (
    <div className="influencer-content-tool space-y-3">
      {/* Locked Avatar Preview */}
      <div className="bg-muted/50 rounded-xl p-2.5 flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden border border-primary/50">
            <img
              src={influencer.avatar_image}
              alt="Reference"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Lock className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Character Image (Locked)</p>
          <p className="text-xs text-muted-foreground">
            {influencer.name}'s avatar will be animated with the motion video
          </p>
        </div>
      </div>

      {/* Motion Video Upload */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Motion Reference Video</label>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {motionVideoPreview ? (
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
            <video
              src={motionVideoPreview}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-3 right-3"
              onClick={removeVideo}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading}
            className="w-full min-h-[128px] sm:min-h-[180px] aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 bg-muted/30"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <VideoIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload Motion Video</p>
                  <p className="text-xs text-muted-foreground">
                    Click to upload a video with the motion you want to transfer
                  </p>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Orientation */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Character Orientation</label>
          <div className="flex gap-2">
            {ORIENTATIONS.map(o => (
              <Button
                key={o.value}
                variant={orientation === o.value ? "default" : "outline"}
                size="sm"
                onClick={() => setOrientation(o.value)}
                className="flex-1"
              >
                {o.label}
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

      {/* Keep Sound Toggle */}
      <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-xl">
        <div className="space-y-0.5">
          <Label htmlFor="keep-sound" className="text-sm font-medium">Keep Original Sound</Label>
          <p className="text-xs text-muted-foreground">
            Preserve audio from the motion reference video
          </p>
        </div>
        <Switch
          id="keep-sound"
          checked={keepSound}
          onCheckedChange={setKeepSound}
        />
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
            disabled={isGenerating || !motionVideoUrl}
            className="flex-1 gap-2 h-9"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Motion Transfer
              </>
            )}
          </Button>
        ) : (
          <Button onClick={onUpgrade} className="flex-1 gap-2">
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
            type: 'influencer-motion',
            created_at: new Date().toISOString()
          }}
          onDismiss={handleDismissGeneration}
        />
      )}

      {/* Recent Creations */}
      {user && <ToolCreationsGrid userId={user.id} type="influencer-motion" />}
    </div>
  );
};

export default InfluencerMotionTab;
