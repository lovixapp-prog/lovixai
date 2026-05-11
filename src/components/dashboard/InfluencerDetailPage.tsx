import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Video, 
  Wand2, 
  Mic, 
  ImagePlus, 
  User, 
  Calendar,
  Sparkles,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Influencer } from "./AIInfluencer";
import InfluencerVideoTab from "./InfluencerVideoTab";
import InfluencerMotionTab from "./InfluencerMotionTab";
import InfluencerLipSyncTab from "./InfluencerLipSyncTab";
import InfluencerPoseGenerator from "./InfluencerPoseGenerator";
import InfluencerPoseGallery from "./InfluencerPoseGallery";

export interface InfluencerPose {
  id: string;
  influencer_id: string;
  user_id: string;
  image_url: string;
  image_url_16_9: string | null;
  image_url_9_16: string | null;
  prompt: string | null;
  is_original: boolean;
  created_at: string;
}

interface InfluencerDetailPageProps {
  influencer: Influencer;
  onBack: () => void;
  onCreditsUpdate: () => void;
  availableCredits: number;
  hasSubscription: boolean;
  onUpgrade: () => void;
}

type DetailTab = "overview" | "video" | "motion" | "lipsync";

const InfluencerDetailPage = ({
  influencer,
  onBack,
  onCreditsUpdate,
  availableCredits,
  hasSubscription,
  onUpgrade
}: InfluencerDetailPageProps) => {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [poses, setPoses] = useState<InfluencerPose[]>([]);
  const [selectedPose, setSelectedPose] = useState<InfluencerPose | null>(null);
  const [loadingPoses, setLoadingPoses] = useState(true);
  const [videoCount, setVideoCount] = useState(0);

  // Fetch poses for this influencer
  const fetchPoses = async () => {
    try {
      const { data, error } = await supabase
        .from('influencer_poses')
        .select('*')
        .eq('influencer_id', influencer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedPoses = (data || []) as unknown as InfluencerPose[];
      
      // If no poses exist, create the original pose
      if (typedPoses.length === 0) {
        const { data: newPose, error: insertError } = await supabase
          .from('influencer_poses')
          .insert({
            influencer_id: influencer.id,
            user_id: influencer.user_id,
            image_url: influencer.avatar_image,
            prompt: 'Original avatar',
            is_original: true,
          })
          .select()
          .single();

        if (!insertError && newPose) {
          const typedNewPose = newPose as unknown as InfluencerPose;
          setPoses([typedNewPose]);
          setSelectedPose(typedNewPose);
        }
      } else {
        setPoses(typedPoses);
        // Select original or first pose by default
        const original = typedPoses.find(p => p.is_original) || typedPoses[0];
        setSelectedPose(original);
      }
    } catch (error) {
      console.error('Error fetching poses:', error);
    } finally {
      setLoadingPoses(false);
    }
  };

  // Fetch video count
  const fetchVideoCount = async () => {
    try {
      const { count, error } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', influencer.user_id)
        .in('type', ['influencer-video', 'influencer-motion', 'influencer-lipsync'])
        .eq('status', 'completed');

      if (!error && count !== null) {
        setVideoCount(count);
      }
    } catch (error) {
      console.error('Error fetching video count:', error);
    }
  };

  useEffect(() => {
    fetchPoses();
    fetchVideoCount();
  }, [influencer.id]);

  const handlePoseGenerated = (newPose: InfluencerPose) => {
    setPoses(prev => [newPose, ...prev]);
    setSelectedPose(newPose);
    onCreditsUpdate();
    toast.success("New pose generated!");
  };

  const handlePoseDeleted = (poseId: string) => {
    setPoses(prev => prev.filter(p => p.id !== poseId));
    if (selectedPose?.id === poseId) {
      const remaining = poses.filter(p => p.id !== poseId);
      setSelectedPose(remaining[0] || null);
    }
  };

  const createdDate = new Date(influencer.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Create modified influencer with selected pose
  const influencerWithPose: Influencer = selectedPose 
    ? { ...influencer, avatar_image: selectedPose.image_url }
    : influencer;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{influencer.name}</h1>
          <p className="text-muted-foreground text-sm">
            Influencer Profile & Content Studio
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="aspect-[3/4] relative">
              <img
                src={selectedPose?.image_url || influencer.avatar_image}
                alt={influencer.name}
                className="w-full h-full object-cover"
              />
              {selectedPose?.is_original && (
                <Badge className="absolute top-3 left-3 bg-primary/90">
                  Original
                </Badge>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{influencer.gender}</Badge>
                <Badge variant="secondary">{influencer.age_range}</Badge>
                {influencer.ethnicity && (
                  <Badge variant="outline">{influencer.ethnicity}</Badge>
                )}
              </div>
              {influencer.fashion_style && (
                <p className="text-sm text-muted-foreground">
                  Style: {influencer.fashion_style}
                </p>
              )}
              {influencer.personality_tags && influencer.personality_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {influencer.personality_tags.map(tag => (
                    <span key={tag} className="text-xs text-primary">
                      #{tag.toLowerCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info & Poses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <ImagePlus className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{poses.length}</p>
              <p className="text-xs text-muted-foreground">Poses</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Video className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{videoCount}</p>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <User className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{influencer.gender === 'Male' ? 'M' : 'F'}</p>
              <p className="text-xs text-muted-foreground">Gender</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-bold">{createdDate}</p>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>
          </div>

          {/* Pose Generator */}
          <InfluencerPoseGenerator
            influencer={influencer}
            onPoseGenerated={handlePoseGenerated}
            availableCredits={availableCredits}
            hasSubscription={hasSubscription}
            onUpgrade={onUpgrade}
          />

          {/* Pose Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Available Poses</h3>
              <span className="text-sm text-muted-foreground">
                Select a pose for content creation
              </span>
            </div>
            <InfluencerPoseGallery
              poses={poses}
              selectedPoseId={selectedPose?.id}
              onPoseSelect={(pose) => setSelectedPose(pose as InfluencerPose)}
              onPoseDeleted={fetchPoses}
              loading={loadingPoses}
            />
          </div>
        </div>
      </div>

      {/* Content Creation Tabs */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Create Content</h2>
          {selectedPose && (
            <Badge variant="secondary" className="gap-1">
              <Check className="w-3 h-3" />
              Using: {selectedPose.is_original ? 'Original' : 'Pose ' + poses.findIndex(p => p.id === selectedPose.id)}
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTab)}>
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger 
              value="overview" 
              className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger 
              value="motion" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Motion</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lipsync" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Lip Sync</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab("video")}
                    >
                      <Video className="w-4 h-4" />
                      Generate Video
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab("motion")}
                    >
                      <Wand2 className="w-4 h-4" />
                      Motion Transfer
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab("lipsync")}
                    >
                      <Mic className="w-4 h-4" />
                      Lip Sync
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium mb-2">Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Generate multiple poses for variety</li>
                    <li>• Select a pose before creating content</li>
                    <li>• All poses maintain face consistency</li>
                    <li>• Videos use the selected pose as reference</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="mt-6">
            <InfluencerVideoTab
              influencer={influencerWithPose}
              selectedPose={selectedPose}
              onCreditsUpdate={onCreditsUpdate}
              availableCredits={availableCredits}
              hasSubscription={hasSubscription}
              onUpgrade={onUpgrade}
            />
          </TabsContent>

          <TabsContent value="motion" className="mt-6">
            <InfluencerMotionTab
              influencer={influencerWithPose}
              onCreditsUpdate={onCreditsUpdate}
              availableCredits={availableCredits}
              hasSubscription={hasSubscription}
              onUpgrade={onUpgrade}
            />
          </TabsContent>

          <TabsContent value="lipsync" className="mt-6">
            <InfluencerLipSyncTab
              influencer={influencerWithPose}
              onCreditsUpdate={onCreditsUpdate}
              availableCredits={availableCredits}
              hasSubscription={hasSubscription}
              onUpgrade={onUpgrade}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InfluencerDetailPage;
