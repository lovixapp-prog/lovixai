import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Trash2, ZoomIn, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface InfluencerPose {
  id: string;
  image_url: string;
  image_url_16_9?: string | null;
  image_url_9_16?: string | null;
  prompt: string | null;
  is_original: boolean | null;
  created_at: string | null;
  // Optional fields for compatibility
  influencer_id?: string;
  user_id?: string;
}

interface InfluencerPoseGalleryProps {
  poses: InfluencerPose[];
  selectedPose?: InfluencerPose | null;
  onSelectPose?: (pose: InfluencerPose) => void;
  onDeletePose?: (poseId: string) => void;
  loading?: boolean;
  // Legacy props for backward compatibility
  onPoseDeleted?: () => void;
  selectedPoseId?: string | null;
  onPoseSelect?: (pose: InfluencerPose) => void;
}

const InfluencerPoseGallery = ({ 
  poses, 
  selectedPose,
  onSelectPose,
  onDeletePose,
  loading,
  onPoseDeleted, 
  selectedPoseId,
  onPoseSelect 
}: InfluencerPoseGalleryProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [zoomedPose, setZoomedPose] = useState<InfluencerPose | null>(null);
  const [localPoses, setLocalPoses] = useState<InfluencerPose[]>(poses);

  // Use either new or legacy props
  const actualSelectedPoseId = selectedPose?.id || selectedPoseId;
  const handleSelect = onSelectPose || onPoseSelect;

  // Update local poses when props change
  useEffect(() => {
    setLocalPoses(poses);
  }, [poses]);

  // Subscribe to realtime updates for pose video processing status
  useEffect(() => {
    if (poses.length === 0) return;

    const poseIds = poses.map(p => p.id);
    
    const channel = supabase
      .channel('pose-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'influencer_poses',
          filter: `id=in.(${poseIds.join(',')})`,
        },
        (payload) => {
          console.log('Pose updated:', payload);
          const updatedPose = payload.new as InfluencerPose;
          setLocalPoses(prev => 
            prev.map(p => p.id === updatedPose.id ? { ...p, ...updatedPose } : p)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poses]);

  const handleDelete = async (poseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (poses.find(p => p.id === poseId)?.is_original) {
      toast.error("Cannot delete the original avatar image");
      return;
    }

    setDeletingId(poseId);
    try {
      if (onDeletePose) {
        onDeletePose(poseId);
      } else {
        const { error } = await supabase
          .from('influencer_poses')
          .delete()
          .eq('id', poseId);

        if (error) throw error;
        toast.success("Pose deleted successfully");
        onPoseDeleted?.();
      }
    } catch (error) {
      console.error('Error deleting pose:', error);
      toast.error("Failed to delete pose");
    } finally {
      setDeletingId(null);
    }
  };

  const handleZoom = (pose: InfluencerPose, e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomedPose(pose);
  };

  const handlePoseClick = (pose: InfluencerPose) => {
    handleSelect?.(pose);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (localPoses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No poses generated yet. Create your first pose above!
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {localPoses.map((pose) => {
          const isSelected = actualSelectedPoseId === pose.id;

          return (
            <div
              key={pose.id}
              className={`relative group cursor-pointer rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/25 shadow-lg'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handlePoseClick(pose)}
            >
              <div className="aspect-[4/5]">
                <img
                  src={pose.image_url}
                  alt={pose.prompt || "Influencer pose"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Original badge */}
              {pose.is_original && (
                <Badge 
                  variant="outline" 
                  className="absolute top-1.5 left-1.5 text-[9px] bg-background/90 shadow-md px-1.5 py-0"
                >
                  Original
                </Badge>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-7 h-7 bg-black/70 hover:bg-black/90 text-white border-0 shadow-lg backdrop-blur-sm"
                  onClick={(e) => handleZoom(pose, e)}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>

                {!pose.is_original && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="w-7 h-7 shadow-lg"
                    onClick={(e) => handleDelete(pose.id, e)}
                    disabled={deletingId === pose.id}
                  >
                    {deletingId === pose.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom dialog */}
      <Dialog open={!!zoomedPose} onOpenChange={() => setZoomedPose(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">
            {zoomedPose?.prompt || "Pose preview"}
          </DialogTitle>
          {zoomedPose && (
            <div className="space-y-3">
              <img
                src={zoomedPose.image_url}
                alt={zoomedPose.prompt || "Influencer pose"}
                className="w-full rounded-lg"
              />
              {zoomedPose.prompt && (
                <p className="text-sm text-muted-foreground px-2">
                  {zoomedPose.prompt}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InfluencerPoseGallery;
