import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InfluencerWizard from "./InfluencerWizard";
import InfluencerDashboard from "./InfluencerDashboard";
import InfluencerDetailPage from "./InfluencerDetailPage";
import { Skeleton } from "@/components/ui/skeleton";

export interface Influencer {
  id: string;
  user_id: string;
  name: string;
  avatar_image: string;
  gender: string;
  age_range: string;
  ethnicity: string | null;
  hair_style: string | null;
  fashion_style: string | null;
  personality_tags: string[] | null;
  voice_profile: string | null;
  influencer_type: "human" | "animal" | "custom" | null;
  body_type: string | null;
  created_at: string;
  updated_at: string;
}

interface AIInfluencerProps {
  onCreditsUpdate: () => void;
  availableCredits: number;
  hasSubscription: boolean;
  onUpgrade: () => void;
}

type ViewState = 'loading' | 'wizard' | 'dashboard' | 'detail';

const AIInfluencer = ({ 
  onCreditsUpdate, 
  availableCredits, 
  hasSubscription, 
  onUpgrade 
}: AIInfluencerProps) => {
  const { user } = useAuth();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>('loading');
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);

  const fetchInfluencers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedInfluencers = (data || []) as unknown as Influencer[];
      setInfluencers(typedInfluencers);
      
      if (typedInfluencers.length === 0) {
        setActiveView('wizard');
      } else {
        setActiveView('dashboard');
      }
    } catch (error) {
      console.error('Error fetching influencers:', error);
      setActiveView('wizard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [user]);

  const handleInfluencerCreated = (newInfluencer: Influencer) => {
    setInfluencers(prev => [newInfluencer, ...prev]);
    setSelectedInfluencer(newInfluencer);
    setActiveView('detail');
    onCreditsUpdate();
  };

  const handleSelectInfluencer = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setActiveView('detail');
  };

  const handleBackToDashboard = () => {
    setSelectedInfluencer(null);
    setActiveView('dashboard');
    fetchInfluencers();
  };

  const handleCreateNew = () => {
    setActiveView('wizard');
  };

  const handleInfluencerDeleted = (deletedId: string) => {
    setInfluencers(prev => prev.filter(i => i.id !== deletedId));
  };

  // Loading state
  if (loading || activeView === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Wizard view (no influencers or creating new)
  if (activeView === 'wizard') {
    return (
      <InfluencerWizard
        onComplete={handleInfluencerCreated}
        onBack={influencers.length > 0 ? handleBackToDashboard : undefined}
        availableCredits={availableCredits}
        onCreditsUpdate={onCreditsUpdate}
        hasSubscription={hasSubscription}
        onUpgrade={onUpgrade}
      />
    );
  }

  // Detail page view (selected influencer)
  if (activeView === 'detail' && selectedInfluencer) {
    return (
      <InfluencerDetailPage
        influencer={selectedInfluencer}
        onBack={handleBackToDashboard}
        onCreditsUpdate={onCreditsUpdate}
        availableCredits={availableCredits}
        hasSubscription={hasSubscription}
        onUpgrade={onUpgrade}
      />
    );
  }

  // Dashboard view (has influencers)
  return (
    <InfluencerDashboard
      influencers={influencers}
      onSelectInfluencer={handleSelectInfluencer}
      onCreateNew={handleCreateNew}
      onInfluencerDeleted={handleInfluencerDeleted}
    />
  );
};

export default AIInfluencer;
