import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lock, Video, Wand2, Mic } from "lucide-react";
import type { Influencer } from "./AIInfluencer";
import InfluencerVideoTab from "./InfluencerVideoTab";
import InfluencerMotionTab from "./InfluencerMotionTab";
import InfluencerLipSyncTab from "./InfluencerLipSyncTab";

interface InfluencerCreationStudioProps {
  influencer: Influencer;
  onBack: () => void;
  onCreditsUpdate: () => void;
  availableCredits: number;
  hasSubscription: boolean;
  onUpgrade: () => void;
}

type StudioTab = "video" | "motion-transfer" | "lip-sync";

const InfluencerCreationStudio = ({
  influencer,
  onBack,
  onCreditsUpdate,
  availableCredits,
  hasSubscription,
  onUpgrade
}: InfluencerCreationStudioProps) => {
  const [activeTab, setActiveTab] = useState<StudioTab>("video");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Creation Studio</h1>
          <p className="text-muted-foreground text-sm">
            Create content with your AI influencer
          </p>
        </div>
      </div>

      {/* Locked Influencer Card */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl overflow-hidden">
            <img
              src={influencer.avatar_image}
              alt={influencer.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Lock className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{influencer.name}</h3>
          <p className="text-sm text-muted-foreground">
            {influencer.gender} • {influencer.age_range}
            {influencer.fashion_style && ` • ${influencer.fashion_style}`}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Locked</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StudioTab)}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger 
            value="video" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video</span>
          </TabsTrigger>
          <TabsTrigger 
            value="motion-transfer" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Motion Transfer</span>
          </TabsTrigger>
          <TabsTrigger 
            value="lip-sync" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Lip Sync</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-6">
          <InfluencerVideoTab
            influencer={influencer}
            onCreditsUpdate={onCreditsUpdate}
            availableCredits={availableCredits}
            hasSubscription={hasSubscription}
            onUpgrade={onUpgrade}
          />
        </TabsContent>

        <TabsContent value="motion-transfer" className="mt-6">
          <InfluencerMotionTab
            influencer={influencer}
            onCreditsUpdate={onCreditsUpdate}
            availableCredits={availableCredits}
            hasSubscription={hasSubscription}
            onUpgrade={onUpgrade}
          />
        </TabsContent>

        <TabsContent value="lip-sync" className="mt-6">
          <InfluencerLipSyncTab
            influencer={influencer}
            onCreditsUpdate={onCreditsUpdate}
            availableCredits={availableCredits}
            hasSubscription={hasSubscription}
            onUpgrade={onUpgrade}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluencerCreationStudio;
