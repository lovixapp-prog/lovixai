import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, Download, Trash2, ChevronRight, X, Eye, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AnimatedIconify from "@/components/ui/animated-iconify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as AlertContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Creation {
  id: string;
  type: string;
  status: string;
  prompt: string | null;
  result_url: string | null;
  created_at: string;
}

type ContentType = "video" | "image" | "motion" | "influencer-video" | "influencer-motion" | "influencer-lipsync";

interface ToolCreationsGridProps {
  userId: string;
  type: ContentType;
  maxItems?: number;
  onViewAll?: () => void;
}

const ToolCreationsGrid = ({ userId, type, maxItems = 6, onViewAll }: ToolCreationsGridProps) => {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<Creation | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleVideoLoaded = (id: string) => {
    setLoadedVideos(prev => new Set(prev).add(id));
  };

  useEffect(() => {
    fetchCreations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('tool-creations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generations',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchCreations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, type]);

  const fetchCreations = async () => {
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(maxItems);

    if (!error && data) {
      setCreations(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete creation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Creation removed successfully",
      });
      fetchCreations();
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "video":
      case "influencer-video":
        return <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-4 h-4" />;
      case "image":
        return <AnimatedIconify icon="solar:gallery-wide-bold-duotone" className="w-4 h-4" />;
      case "motion":
      case "influencer-motion":
      case "influencer-lipsync":
        return <AnimatedIconify icon="solar:magic-stick-3-bold-duotone" className="w-4 h-4" />;
      default:
        return <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "video": return "Videos";
      case "image": return "Images";
      case "motion": return "Motion";
      case "influencer-video": return "Influencer Videos";
      case "influencer-motion": return "Motion Transfers";
      case "influencer-lipsync": return "Lip Syncs";
      default: return "Creations";
    }
  };

  const isInfluencerType = type.startsWith('influencer-');
  const isVideoType = ['video', 'motion', 'influencer-video', 'influencer-motion', 'influencer-lipsync'].includes(type);

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
            {getTypeIcon()}
            Recent {getTypeLabel()}
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-lg sm:rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (creations.length === 0) {
    return (
      <div className="rounded-lg sm:rounded-xl border border-dashed border-border bg-muted/30 p-4 sm:p-6 text-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 sm:mb-3">
          {getTypeIcon()}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          No {getTypeLabel().toLowerCase()} created yet
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1">
          Your creations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
          {getTypeIcon()}
          Recent {getTypeLabel()}
        </h3>
        {onViewAll && creations.length >= maxItems && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-[11px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3">
            View All
            <ChevronRight className="w-3 h-3 ml-0.5 sm:ml-1" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {creations.map((creation) => (
          <div
            key={creation.id}
            className="group relative aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-muted/50 border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer"
            onClick={() => setPreviewItem(creation)}
          >
            {/* Preview - uses contain to show full content */}
            {!isVideoType ? (
              <img
                src={creation.result_url || ""}
                alt={creation.prompt || "Generated image"}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="relative w-full h-full">
                {/* Loading placeholder - always visible until video loads */}
                {!loadedVideos.has(creation.id) && (
                  <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
                    <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-6 h-6 text-muted-foreground/50" pulse />
                  </div>
                )}
                <video
                  src={creation.result_url || ""}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    loadedVideos.has(creation.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  muted
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    try {
                      video.currentTime = Math.min(0.2, video.duration || 0.2);
                    } catch {
                      handleVideoLoaded(creation.id);
                    }
                  }}
                  onLoadedData={() => {
                    handleVideoLoaded(creation.id);
                  }}
                  onError={() => {
                    // Still mark as loaded so placeholder disappears and shows error state
                    handleVideoLoaded(creation.id);
                  }}
                />
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 sm:gap-2">
              {/* Play/View Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewItem(creation);
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform"
              >
                {isVideoType ? (
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>

              <a
                href={creation.result_url || ""}
                download
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted/80 text-foreground flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted/80 text-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertContent className="max-w-[90vw] sm:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base sm:text-lg">Delete creation?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                      This action cannot be undone. This will permanently delete your creation.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(creation.id)} className="text-sm">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertContent>
              </AlertDialog>
            </div>

            {/* Play indicator for videos (visible when not hovered) */}
            {isVideoType && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 group-hover:opacity-0 transition-opacity">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/30 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
            )}

            {/* Type Badge with AI Influencer indicator */}
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1">
              {isInfluencerType && (
                <div className="p-1 rounded-full bg-primary/90 backdrop-blur-sm">
                  <UserCircle className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="px-1.5 sm:px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {type.replace('influencer-', '')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border/50">
          {previewItem && (
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-all duration-200 border border-border/50"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Media preview */}
              <div className="bg-background/50 flex items-center justify-center min-h-[300px] max-h-[70vh]">
                {isVideoType && previewItem.result_url ? (
                  <video
                    key={previewItem.id}
                    src={previewItem.result_url}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : previewItem.result_url ? (
                  <img
                    src={previewItem.result_url}
                    alt={previewItem.prompt || "Generated content"}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : null}
              </div>

              {/* Info & Actions */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 border-t border-border/50">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                    {getTypeIcon()}
                  </div>
                  {isInfluencerType && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <UserCircle className="w-3 h-3" />
                      AI Influencer
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {type.replace('influencer-', '')}
                  </span>
                </div>

                {previewItem.prompt && (
                  <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed">
                    {previewItem.prompt}
                  </p>
                )}

                <div className="flex gap-2 sm:gap-3 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (previewItem.result_url) {
                        const a = document.createElement('a');
                        a.href = previewItem.result_url;
                        a.download = `${type}-${previewItem.id}.${isVideoType ? 'mp4' : 'png'}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    }}
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDelete(previewItem.id);
                      setPreviewItem(null);
                    }}
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToolCreationsGrid;
