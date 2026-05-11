import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Loader2, Zap, Sparkles, Music, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { Influencer } from "./AIInfluencer";
import InlineGenerationCard from "./InlineGenerationCard";
import ToolCreationsGrid from "./ToolCreationsGrid";

interface InfluencerLipSyncTabProps {
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

const QUALITIES = [
  { value: "standard", label: "Standard", credits: 150 },
  { value: "pro", label: "Pro", credits: 200 },
];

const InfluencerLipSyncTab = ({
  influencer,
  onCreditsUpdate,
  availableCredits,
  hasSubscription,
  onUpgrade
}: InfluencerLipSyncTabProps) => {
  const { user } = useAuth();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState("pro");
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
  
  const audioInputRef = useRef<HTMLInputElement>(null);

  const qualityOption = QUALITIES.find(q => q.value === quality) || QUALITIES[1];
  const creditCost = qualityOption.credits;
  const canGenerate = hasSubscription || availableCredits >= creditCost;

  const handleAudioUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error("Please upload an audio file");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `audio_${Date.now()}.${fileExt}`;
      const filePath = `audio-references/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('generations')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('generations')
        .getPublicUrl(filePath);

      setAudioUrl(urlData.publicUrl);
      setAudioFileName(file.name);
      toast.success("Audio uploaded");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Failed to upload audio");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAudioUpload(file);
  };

  const removeAudio = () => {
    setAudioUrl(null);
    setAudioFileName(null);
  };

  const pollLipSyncStatus = async (generationId: string) => {
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
          toast.success("Lip sync completed!");
          return;
        } else if (data.status === 'failed') {
          setActiveGeneration(prev => prev ? { 
            ...prev, 
            status: 'failed', 
            error: data.error || 'Generation failed' 
          } : null);
          toast.error("Lip sync failed");
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
    if (!audioUrl) {
      toast.error("Please upload an audio file");
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
      prompt: `Lip sync for ${influencer.name}`,
      resultUrl: null,
      error: null
    });

    try {
      const data = await callAPI<{ generationId?: string; error?: string }>('generate-motion', {
        mode: 'lip-sync',
        audioUrl: audioUrl,
        imageUrl: influencer.avatar_image,
        quality,
        credits: creditCost,
        type: 'influencer-lipsync'
      });

      if (data?.generationId) {
        setActiveGeneration(prev => prev ? { ...prev, id: data.generationId, status: 'processing' } : null);
        pollLipSyncStatus(data.generationId);
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
    setAudioUrl(null);
    setAudioFileName(null);
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
        <div className="min-w-0">
          <p className="text-sm font-medium">Character Image (Locked)</p>
          <p className="text-xs text-muted-foreground">
            {influencer.name}'s avatar will speak with lip-synced audio
          </p>
        </div>
      </div>

      {/* Audio Upload */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Audio File</label>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {audioUrl ? (
          <div className="relative rounded-xl overflow-hidden bg-muted p-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Music className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{audioFileName}</p>
                <p className="text-sm text-muted-foreground">Audio file ready</p>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={removeAudio}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <audio
              src={audioUrl}
              controls
              className="w-full mt-4"
            />
          </div>
        ) : (
          <button
            onClick={() => audioInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 bg-muted/30"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Music className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Upload Audio</p>
                  <p className="text-xs text-muted-foreground">
                    MP3, WAV, or other audio formats
                  </p>
                </div>
              </>
            )}
          </button>
        )}
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

      {/* Generate Button */}
      <div className="flex flex-row items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-2 justify-center py-2 px-4">
          <Zap className="w-4 h-4 text-primary" />
          <span>{creditCost} credits</span>
        </Badge>
        
        {canGenerate ? (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !audioUrl}
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
                Generate Lip Sync
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
            type: 'influencer-lipsync',
            created_at: new Date().toISOString()
          }}
          onDismiss={handleDismissGeneration}
        />
      )}

      {/* Recent Creations */}
      {user && <ToolCreationsGrid userId={user.id} type="influencer-lipsync" />}
    </div>
  );
};

export default InfluencerLipSyncTab;
