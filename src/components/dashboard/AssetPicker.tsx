import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, History, Database, X, Check, Image, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnail_url: string | null;
  created_at: string;
}

interface AssetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  acceptedTypes: ("image" | "video" | "audio")[];
  onSelect: (url: string, file?: File) => void;
  onUpload?: (file: File) => Promise<string>;
}

const AssetPicker = ({ 
  open, 
  onOpenChange, 
  userId, 
  acceptedTypes, 
  onSelect,
  onUpload 
}: AssetPickerProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAssets();
    }
  }, [open, userId, acceptedTypes]);

  const fetchAssets = async () => {
    setLoading(true);
    
    // Fetch all assets
    const { data: allAssets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId)
      .in("type", acceptedTypes)
      .order("created_at", { ascending: false });

    if (!error && allAssets) {
      setAssets(allAssets as Asset[]);
      setRecentAssets(allAssets.slice(0, 10) as Asset[]);
    }
    
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type.startsWith("image/") ? "image" :
                     file.type.startsWith("video/") ? "video" :
                     file.type.startsWith("audio/") ? "audio" : null;

    if (!fileType || !acceptedTypes.includes(fileType as "image" | "video" | "audio")) {
      toast({
        title: "Invalid file type",
        description: `Please upload a ${acceptedTypes.join(" or ")} file.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let url: string;
      
      if (onUpload) {
        url = await onUpload(file);
      } else {
        // Default upload to generations bucket
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${fileType}-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from("generations")
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("generations")
          .getPublicUrl(data.path);

        url = publicUrl;
      }

      // Save to assets table
      const { error: insertError } = await supabase
        .from("assets")
        .insert({
          user_id: userId,
          name: file.name,
          type: fileType,
          url: url,
          file_size: file.size,
        });

      if (insertError) {
        console.error("Failed to save asset:", insertError);
      }

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });

      onSelect(url, file);
      onOpenChange(false);
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

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset.id);
  };

  const handleConfirmSelection = () => {
    const asset = assets.find(a => a.id === selectedAsset);
    if (asset) {
      onSelect(asset.url);
      onOpenChange(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "audio": return <Music className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  const getAcceptString = () => {
    const types: string[] = [];
    if (acceptedTypes.includes("image")) types.push("image/*");
    if (acceptedTypes.includes("video")) types.push("video/*,.mp4,.webm");
    if (acceptedTypes.includes("audio")) types.push("audio/*");
    return types.join(",");
  };

  const renderAssetGrid = (assetList: Asset[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      );
    }

    if (assetList.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Database className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No assets found</p>
          <p className="text-xs text-muted-foreground/70">Upload files to see them here</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
        {assetList.map((asset) => (
          <button
            key={asset.id}
            onClick={() => handleSelectAsset(asset)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              selectedAsset === asset.id 
                ? "border-primary ring-2 ring-primary/30" 
                : "border-transparent hover:border-primary/50"
            }`}
          >
            {asset.type === "image" ? (
              <img 
                src={asset.thumbnail_url || asset.url} 
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : asset.type === "video" ? (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Music className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            
            {selectedAsset === asset.id && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-1">
              <div className="flex items-center gap-1">
                {getTypeIcon(asset.type)}
                <span className="text-[10px] text-foreground truncate">{asset.name}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Asset</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="gap-1.5">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Recent</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-1.5">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept={getAcceptString()}
                onChange={handleFileUpload}
                className="hidden"
                id="asset-upload"
                disabled={uploading}
              />
              <label htmlFor="asset-upload" className="cursor-pointer block">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium text-foreground mb-1">
                  {uploading ? "Uploading..." : "Click to upload"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {acceptedTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")} files
                </p>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {renderAssetGrid(recentAssets)}
          </TabsContent>

          <TabsContent value="assets" className="mt-4">
            {renderAssetGrid(assets)}
          </TabsContent>
        </Tabs>

        {selectedAsset && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setSelectedAsset(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSelection}>
              Use Selected
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssetPicker;
