import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Users } from "lucide-react";
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
    <div className="influencer-dashboard space-y-4">
      {/* Header */}
      <div className="influencer-panel flex items-center justify-between gap-3 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold leading-tight">AI Influencers</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {influencers.length} influencer{influencers.length !== 1 ? 's' : ''} created
            </p>
          </div>
        </div>
        <Button onClick={onCreateNew} size="sm" className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create New</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Grid of influencer cards - more compact on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={onCreateNew}
          className="influencer-create-tile group"
        >
          <span className="influencer-create-orb">
            <Sparkles className="w-5 h-5" />
          </span>
          <span className="font-bold text-sm">New Creator</span>
          <span className="text-[11px] text-muted-foreground">Build persona</span>
        </button>
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
