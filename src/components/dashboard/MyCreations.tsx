import { useEffect, useState } from "react";
import {
  Video,
  Image,
  Wand2,
  FolderOpen,
  Download,
  Trash2,
  Loader2,
  Play,
  X,
  UserCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreationCard from "./CreationCard";

interface Generation {
  id: string;
  type: string;
  prompt: string | null;
  status: string;
  created_at: string;
  result_url: string | null;
  settings: any;
  credits_used: number;
}

interface InfluencerPose {
  id: string;
  influencer_id: string;
  user_id: string;
  image_url: string;
  prompt: string | null;
  is_original: boolean | null;
  created_at: string | null;
}

interface MyCreationsProps {
  userId: string;
}

const MyCreations = ({ userId }: MyCreationsProps) => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [poses, setPoses] = useState<InfluencerPose[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<Generation | null>(null);
  const [previewPose, setPreviewPose] = useState<InfluencerPose | null>(null);
  const { toast } = useToast();

  const fetchGenerations = async () => {
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Show all completed generations
      const validGenerations = data.filter(
        (gen) => gen.status === "completed" && gen.result_url
      );
      setGenerations(validGenerations);
    }
  };

  const fetchPoses = async () => {
    const { data, error } = await supabase
      .from("influencer_poses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPoses(data as InfluencerPose[]);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchGenerations(), fetchPoses()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    // Subscribe to real-time updates for generations
    const generationsChannel = supabase
      .channel("my-creations-generations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "generations",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchGenerations();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for poses
    const posesChannel = supabase
      .channel("my-creations-poses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "influencer_poses",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchPoses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(generationsChannel);
      supabase.removeChannel(posesChannel);
    };
  }, [userId]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("generations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGenerations((prev) => prev.filter((gen) => gen.id !== id));
      toast({
        title: "Deleted",
        description: "Creation has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete creation.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeletePose = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("influencer_poses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPoses((prev) => prev.filter((pose) => pose.id !== id));
      toast({
        title: "Deleted",
        description: "Pose has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pose.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPose = async (pose: InfluencerPose) => {
    try {
      const response = await fetch(pose.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pose-${pose.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(pose.image_url, '_blank');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
      case "influencer-video":
        return <Video className="w-5 h-5" />;
      case "image":
        return <Image className="w-5 h-5" />;
      case "motion":
      case "influencer-motion":
      case "influencer-lipsync":
        return <Wand2 className="w-5 h-5" />;
      case "ugc":
      case "ugc-final":
        return <Video className="w-5 h-5" />;
      default:
        return <FolderOpen className="w-5 h-5" />;
    }
  };

  const isInfluencerType = (type: string) => type.startsWith('influencer-');

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "influencer-video": return "Video";
      case "influencer-motion": return "Motion";
      case "influencer-lipsync": return "Lip Sync";
      case "ugc": return "UGC Ad";
      case "ugc-final": return "UGC Ad";
      default: return type.toUpperCase();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async (gen: Generation) => {
    if (!gen.result_url) return;
    
    const isVideoType = ['video', 'motion', 'influencer-video', 'influencer-motion', 'influencer-lipsync', 'ugc', 'ugc-final'].includes(gen.type);
    
    try {
      const response = await fetch(gen.result_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gen.type}-${gen.id}.${isVideoType ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(gen.result_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="generating-spinner" />
      </div>
    );
  }

  const totalItems = generations.length + poses.length;

  if (totalItems === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="heading-section mb-2">
            My Creations
          </h2>
          <p className="text-muted-foreground">
            View and manage your generated content
          </p>
        </div>

        <div className="border border-border rounded-2xl p-12 text-center bg-card/50">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No creations yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Start generating content to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-section mb-2">
          My Creations
        </h2>
        <p className="text-status">
          {totalItems} creation{totalItems !== 1 ? "s" : ""} saved
        </p>
      </div>

      {/* Videos & Motion */}
      {generations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {generations.map((gen) => (
            <CreationCard
              key={gen.id}
              generation={gen}
              onPreview={setPreviewItem}
              onDownload={handleDownload}
              onDelete={handleDelete}
              isDeleting={deletingId === gen.id}
            />
          ))}
        </div>
      )}

      {/* Influencer Poses Section */}
      {poses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Influencer Poses
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {poses.map((pose) => (
              <div
                key={pose.id}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-muted"
                onClick={() => setPreviewPose(pose)}
              >
                <div className="aspect-[3/4]">
                  <img
                    src={pose.image_url}
                    alt="Influencer Pose"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {pose.is_original && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5"
                  >
                    Original
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-7 h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPose(pose);
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  {!pose.is_original && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-7 h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePose(pose.id);
                      }}
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
            ))}
          </div>
        </div>
      )}

      {/* Pose Preview Modal */}
      <Dialog open={!!previewPose} onOpenChange={() => setPreviewPose(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border/50 shadow-premium">
          {previewPose && (
            <div className="relative">
              <button
                onClick={() => setPreviewPose(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-all duration-200 border border-border/50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-background/50 flex items-center justify-center min-h-[300px] max-h-[70vh]">
                <img
                  src={previewPose.image_url}
                  alt="Influencer Pose"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>

              <div className="p-6 space-y-4 border-t border-border/50">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <UserCircle className="w-3 h-3" />
                    AI Influencer Pose
                  </Badge>
                  {previewPose.is_original && (
                    <Badge variant="outline">Original</Badge>
                  )}
                  <span className="text-status ml-auto">
                    {previewPose.created_at && formatDate(previewPose.created_at)}
                  </span>
                </div>

                {previewPose.prompt && (
                  <p className="text-foreground/90 text-sm leading-relaxed">
                    {previewPose.prompt}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="default"
                    size="default"
                    onClick={() => handleDownloadPose(previewPose)}
                    className="gap-2 btn-morph"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  {!previewPose.is_original && (
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => {
                        handleDeletePose(previewPose.id);
                        setPreviewPose(null);
                      }}
                      disabled={deletingId === previewPose.id}
                      className="gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors duration-200"
                    >
                      {deletingId === previewPose.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border/50 shadow-premium">
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
                {['video', 'motion', 'influencer-video', 'influencer-motion', 'influencer-lipsync', 'ugc', 'ugc-final'].includes(previewItem.type) && previewItem.result_url ? (
                  <video
                    key={previewItem.id}
                    src={previewItem.result_url}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[70vh] object-contain"
                    onError={(e) => console.error("Video load error:", e)}
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
              <div className="p-6 space-y-4 border-t border-border/50">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    {getIcon(previewItem.type)}
                  </div>
                  {isInfluencerType(previewItem.type) && (
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <UserCircle className="w-3 h-3" />
                      AI Influencer
                    </Badge>
                  )}
                  <Badge variant="outline" className="creation-type-badge">
                    {isInfluencerType(previewItem.type) ? getTypeLabel(previewItem.type) : previewItem.type.toUpperCase()}
                  </Badge>
                  <span className="text-status ml-auto">
                    {formatDate(previewItem.created_at)}
                  </span>
                </div>

                {previewItem.prompt && (
                  <p className="text-foreground/90 text-sm leading-relaxed">
                    {previewItem.prompt}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="default"
                    size="default"
                    onClick={() => handleDownload(previewItem)}
                    className="gap-2 btn-morph"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => {
                      handleDelete(previewItem.id);
                      setPreviewItem(null);
                    }}
                    disabled={deletingId === previewItem.id}
                    className="gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors duration-200"
                  >
                    {deletingId === previewItem.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
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

export default MyCreations;
