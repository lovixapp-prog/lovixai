import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image, Video, Music, Trash2, Download, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnail_url: string | null;
  file_size: number | null;
  created_at: string;
}

interface AssetsPageProps {
  userId: string;
}

const AssetsPage = ({ userId }: AssetsPageProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "audio">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  useEffect(() => {
    fetchAssets();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('assets-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchAssets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchAssets = async () => {
    const query = supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setAssets(data as Asset[]);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith("image/") ? "image" :
                     file.type.startsWith("video/") ? "video" :
                     file.type.startsWith("audio/") ? "audio" : null;

    if (!fileType) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image, video, or audio file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${fileType}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("generations")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("generations")
        .getPublicUrl(data.path);

      // Save to assets table
      const { error: insertError } = await supabase
        .from("assets")
        .insert({
          user_id: userId,
          name: file.name,
          type: fileType,
          url: publicUrl,
          file_size: file.size,
        });

      if (insertError) throw insertError;

      toast({
        title: "Asset uploaded",
        description: "Your file has been uploaded successfully.",
      });

      fetchAssets();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Asset removed successfully",
      });
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "audio": return <Music className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  const filteredAssets = filterType === "all" 
    ? assets 
    : assets.filter(a => a.type === filterType);

  const assetCounts = {
    all: assets.length,
    image: assets.filter(a => a.type === "image").length,
    video: assets.filter(a => a.type === "video").length,
    audio: assets.filter(a => a.type === "audio").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            Assets
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your uploaded files and reuse them across tools
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleUpload}
            className="hidden"
            id="assets-upload"
            disabled={uploading}
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="assets-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload"}
            </label>
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All ({assetCounts.all})
          </Button>
          <Button
            variant={filterType === "image" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("image")}
            className="gap-1.5"
          >
            <Image className="w-3.5 h-3.5" />
            Images ({assetCounts.image})
          </Button>
          <Button
            variant={filterType === "video" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("video")}
            className="gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            Videos ({assetCounts.video})
          </Button>
          <Button
            variant={filterType === "audio" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("audio")}
            className="gap-1.5"
          >
            <Music className="w-3.5 h-3.5" />
            Audio ({assetCounts.audio})
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid" ? "bg-background text-foreground" : "text-muted-foreground"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list" ? "bg-background text-foreground" : "text-muted-foreground"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Assets Grid/List */}
      {loading ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          : "space-y-2"
        }>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className={viewMode === "grid" ? "aspect-square rounded-xl" : "h-16 rounded-lg"} />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">No assets yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload files to use them in your creations
          </p>
          <Button asChild size="sm">
            <label htmlFor="assets-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload First Asset
            </label>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all duration-300"
            >
              {/* Preview */}
              {asset.type === "image" ? (
                <img
                  src={asset.thumbnail_url || asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : asset.type === "video" ? (
                <video
                  src={asset.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Music className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
                <div className="flex items-center gap-2">
                  <a
                    href={asset.url}
                    download={asset.name}
                    className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-9 h-9 rounded-full bg-muted text-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete asset?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{asset.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(asset.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-xs text-center text-foreground truncate w-full px-2">
                  {asset.name}
                </p>
              </div>

              {/* Type Badge */}
              <Badge 
                variant="outline" 
                className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-[10px] uppercase"
              >
                {asset.type}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {asset.type === "image" ? (
                  <img
                    src={asset.thumbnail_url || asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : asset.type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{asset.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {getTypeIcon(asset.type)}
                    {asset.type}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(asset.file_size)}</span>
                  <span>•</span>
                  <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <a
                  href={asset.url}
                  download={asset.name}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete asset?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{asset.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(asset.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
