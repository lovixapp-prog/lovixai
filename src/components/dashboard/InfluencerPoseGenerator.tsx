import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { toast } from "sonner";
import type { Influencer } from "./AIInfluencer";
import type { InfluencerPose } from "./InfluencerDetailPage";

interface InfluencerPoseGeneratorProps {
  influencer: Influencer;
  onPoseGenerated: (pose: InfluencerPose) => void;
  availableCredits: number;
  hasSubscription: boolean;
  onUpgrade: () => void;
}

const POSE_SUGGESTIONS = [
  "Smiling confidently, looking at camera",
  "Casual side profile, natural lighting",
  "Arms crossed, professional look",
  "Candid laugh, joyful expression",
  "Thoughtful pose, looking away",
  "Relaxed sitting pose, casual vibes",
];

const InfluencerPoseGenerator = ({
  influencer,
  onPoseGenerated,
  availableCredits,
  hasSubscription,
  onUpgrade
}: InfluencerPoseGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingPosesCount, setExistingPosesCount] = useState<number | null>(null);

  // First pose is always FREE, subsequent poses cost 30 credits
  const isFirstPose = existingPosesCount !== null && existingPosesCount <= 1; // Only original pose exists
  const creditCost = isFirstPose ? 0 : 30;
  const canGenerate = isFirstPose || hasSubscription || availableCredits >= creditCost;

  // Fetch existing poses count on mount
  useEffect(() => {
    const fetchPosesCount = async () => {
      const { count } = await supabase
        .from('influencer_poses')
        .select('*', { count: 'exact', head: true })
        .eq('influencer_id', influencer.id);
      setExistingPosesCount(count ?? 0);
    };
    fetchPosesCount();
  }, [influencer.id]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Not enough credits");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await callAPI<{ success?: boolean; imageUrl?: string; poseId?: string; error?: string }>('generate-influencer-pose', {
        influencerId: influencer.id,
        referenceImageUrl: influencer.avatar_image,
        prompt: prompt.trim() || "Natural, confident pose with a different angle",
        isFirstPose: isFirstPose,
        influencerDetails: {
          name: influencer.name,
          gender: influencer.gender,
          ageRange: influencer.age_range,
          ethnicity: influencer.ethnicity,
          hairStyle: influencer.hair_style,
          fashionStyle: influencer.fashion_style,
        }
      });

      if (data?.success && data?.imageUrl) {
        onPoseGenerated({
          id: data.poseId,
          influencer_id: influencer.id,
          user_id: influencer.user_id,
          image_url: data.imageUrl,
          image_url_16_9: null, // Will be set by background resize
          image_url_9_16: null, // Will be set by background resize
          prompt: prompt,
          is_original: false,
          created_at: new Date().toISOString(),
        });
        setPrompt("");
      } else {
        throw new Error(data?.error || 'Failed to generate pose');
      }
    } catch (error: any) {
      console.error('Pose generation error:', error);
      toast.error(error.message || "Failed to generate pose");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="bg-muted/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ImagePlus className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Generate New Pose</h3>
        {isFirstPose ? (
          <Badge variant="default" className="ml-auto gap-1 bg-primary">
            <Sparkles className="w-3 h-3" />
            FREE
          </Badge>
        ) : (
          <Badge variant="secondary" className="ml-auto gap-1">
            <Zap className="w-3 h-3" />
            {creditCost} credits
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Create additional poses while maintaining {influencer.name}'s exact face and appearance.
      </p>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {POSE_SUGGESTIONS.slice(0, 4).map((suggestion, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isGenerating}
          >
            {suggestion}
          </Button>
        ))}
      </div>

      {/* Prompt Input */}
      <Textarea
        placeholder="Describe the pose, expression, or scene... (face will remain consistent)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[80px] resize-none"
        disabled={isGenerating}
      />

      {/* Generate Button */}
      {canGenerate ? (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Pose...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Pose
            </>
          )}
        </Button>
      ) : (
        <Button onClick={onUpgrade} className="w-full gap-2">
          <Zap className="w-4 h-4" />
          Upgrade to Generate
        </Button>
      )}
    </div>
  );
};

export default InfluencerPoseGenerator;
