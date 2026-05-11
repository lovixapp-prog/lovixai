import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import InfluencerCard from "./InfluencerCard";
import type { Influencer } from "./AIInfluencer";

interface InfluencerDashboardProps {
  influencers: Influencer[];
  onSelectInfluencer: (influencer: Influencer) => void;
  onCreateNew: () => void;
  onInfluencerDeleted: (id: string) => void;
}

const InfluencerDashboard = ({
  influencers,
  onSelectInfluencer,
  onCreateNew,
  onInfluencerDeleted
}: InfluencerDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My AI Influencers</h1>
            <p className="text-muted-foreground text-sm">
              {influencers.length} influencer{influencers.length !== 1 ? 's' : ''} created
            </p>
          </div>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Influencer
        </Button>
      </div>

      {/* Grid of influencer cards - more compact on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {influencers.map((influencer) => (
          <InfluencerCard
            key={influencer.id}
            influencer={influencer}
            onSelect={() => onSelectInfluencer(influencer)}
            onDeleted={() => onInfluencerDeleted(influencer.id)}
          />
        ))}
      </div>

      {/* Empty state (shouldn't normally show, but just in case) */}
      {influencers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No influencers yet</h3>
          <p className="text-muted-foreground mb-4">Create your first AI influencer to get started</p>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Influencer
          </Button>
        </div>
      )}
    </div>
  );
};

export default InfluencerDashboard;
