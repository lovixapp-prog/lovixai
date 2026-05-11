import { useState } from "react";
import { Link } from "react-router-dom";

const MagicStar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useDropZone } from "@/hooks/useDropZone";
import InlineGenerationCard from "./InlineGenerationCard";
import ToolCreationsGrid from "./ToolCreationsGrid";
import AssetPicker from "./AssetPicker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AnimatedIconify from "@/components/ui/animated-iconify";

interface ImageGeneratorProps {
  onCreditsUpdate: () => void;
  availableCredits?: number;
  hasSubscription?: boolean;
  onUpgradeClick?: () => void;
}

interface ActiveGeneration {
  id: string;
  type: string;
  status: string;
  prompt: string | null;
  result_url: string | null;
  error_message: string | null;
  created_at: string;
  settings?: Record<string, unknown> | null;
}

const styles = [
  { id: "none", label: "Default", description: "Natural AI interpretation", icon: "solar:stars-bold-duotone", color: "text-primary" },
  { id: "photorealistic", label: "Photo", description: "Ultra realistic photography", icon: "solar:camera-bold-duotone", color: "text-cyan-400" },
  { id: "artistic", label: "Artistic", description: "Painterly and expressive", icon: "solar:palette-bold-duotone", color: "text-pink-400" },
  { id: "anime", label: "Anime", description: "Japanese animation style", icon: "solar:bolt-bold-duotone", color: "text-amber-400" },
  { id: "3d", label: "3D", description: "Cinematic CGI quality", icon: "solar:box-bold-duotone", color: "text-violet-400" },
];

const ImageGenerator = ({ onCreditsUpdate, availableCredits = 0, hasSubscription = false, onUpgradeClick }: ImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "9:16" | "16:9">("1:1");
  const [renderQuality, setRenderQuality] = useState<"standard" | "studio" | "ultra">("studio");
  const [imageCount, setImageCount] = useState<1 | 2 | 4>(1);
  const [cameraPreset, setCameraPreset] = useState<"auto" | "product" | "portrait" | "editorial">("auto");
  const [activeGeneration, setActiveGeneration] = useState<ActiveGeneration | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const creditsCost = 50 * imageCount;
  
  // Check if user can generate based on credits or subscription
  const canGenerate = hasSubscription || availableCredits >= creditsCost;

  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a prompt first",
        description: "Write something to optimize.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const data = await callAPI<{ success: boolean; optimizedPrompt?: string; error?: string }>("optimize-prompt", { prompt, type: "image" });

      if (!data.success) {
        throw new Error(data.error || "Failed to optimize prompt");
      }

      setPrompt(data.optimizedPrompt!);
      toast({
        title: "Prompt optimized!",
        description: "Your prompt has been enhanced for better results.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to optimize prompt";
      toast({
        title: "Optimization failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/edit-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("generations")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("generations")
        .getPublicUrl(data.path);

      setReferenceImage(publicUrl);

      // Save to assets
      await supabase.from("assets").insert({
        user_id: user.id,
        name: file.name,
        type: "image",
        url: publicUrl,
        file_size: file.size,
      });

      toast({
        title: "Image uploaded",
        description: "Ready for editing.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const { isDragging, dragProps } = useDropZone({
    onDrop: uploadFile,
    accept: ["image/*"],
    maxSize: 10 * 1024 * 1024,
    onError: (message) => toast({ title: "Upload error", description: message, variant: "destructive" }),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 10MB.",
        variant: "destructive",
      });
      return;
    }

    await uploadFile(file);
  };

  const handleAssetSelect = (url: string) => {
    setReferenceImage(url);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a prompt",
        description: referenceImage 
          ? "Describe how you want to edit the image."
          : "Please describe the image you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please sign in to generate images");
      }

      // Set active generation for inline card
      const tempId = `temp-${Date.now()}`;
      setActiveGeneration({
        id: tempId,
        type: "image",
        status: "processing",
        prompt: prompt,
        result_url: null,
        error_message: null,
        created_at: new Date().toISOString(),
        settings: { style: selectedStyle, aspectRatio, renderQuality, imageCount, cameraPreset, isEdit: !!referenceImage },
      });

      const data = await callAPI<{ success: boolean; imageUrl?: string; generationId?: string; creditsUsed?: number; error?: string }>("generate-image", {
        prompt, style: selectedStyle, aspectRatio, quality: renderQuality, imageCount, cameraPreset, imageUrl: referenceImage || undefined,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      setActiveGeneration(prev => prev ? { 
        ...prev, 
        id: data.generationId || prev.id,
        status: "completed", 
        result_url: data.imageUrl 
      } : null);
      setRefreshKey(prev => prev + 1);
      
      toast({
        title: referenceImage ? "Image edited!" : "Image generated!",
        description: `Used ${data.creditsUsed} credit.`,
      });
      onCreditsUpdate();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate image";
      setActiveGeneration(prev => prev ? { ...prev, status: "failed", error_message: message } : null);
      toast({
        title: "Generation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismissGeneration = () => {
    setActiveGeneration(null);
  };

  return (
    <div className="py-4 sm:py-6 space-y-6">

      {/* ── Cinematic Hero ─────────────────────────────────── */}
      <div className="tool-hero rounded-2xl">
        <div className="tool-hero-bg" />
        <div className="tool-hero-grid" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="star-icon star-icon-lg"><MagicStar className="w-7 h-7" /></div>
            <span className="badge-cyan text-xs">Lovix Image</span>
          </div>
          <h1 className="tool-hero-title">Create Stunning AI Images</h1>
          <p className="tool-hero-subtitle">Generate or edit images with AI. Photorealistic, artistic, anime, 3D — your vision, instantly.</p>
          <Link to="/guide/image" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1">
            <AnimatedIconify icon="solar:notebook-bookmark-bold-duotone" className="w-3.5 h-3.5 text-primary" /> Prompting Guide
          </Link>
        </div>
      </div>

      {/* ── Prompt Bar ─────────────────────────────────────── */}
      <div
        {...dragProps}
        className={`prompt-bar transition-all ${isDragging ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]' : ''}`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-primary/8 backdrop-blur-sm">
            <div className="text-center">
              <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-10 h-10 text-primary mx-auto mb-2" pulse />
              <p className="text-base font-semibold text-primary">Drop image to edit</p>
            </div>
          </div>
        )}

        {/* Reference image */}
        {referenceImage && (
          <div className="px-4 pt-3 flex items-center gap-3">
            <div className="relative inline-block">
              <img src={referenceImage} alt="Reference" className="h-14 rounded-xl object-cover ring-1 ring-border" />
              <button
                onClick={() => setReferenceImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              >
                <AnimatedIconify icon="solar:close-circle-bold-duotone" className="w-3 h-3" />
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary">Edit Mode</p>
              <p className="text-xs text-muted-foreground">Describe the changes</p>
            </div>
          </div>
        )}

        {/* Style pills */}
        <div className="flex items-center gap-1.5 px-4 pt-3 flex-wrap">
          {styles.map(({ id, label, icon, color }) => (
            <button
              key={id}
              onClick={() => setSelectedStyle(id)}
              className={`settings-pill ${selectedStyle === id ? 'active' : ''}`}
            >
              <AnimatedIconify icon={icon} className={`w-3.5 h-3.5 ${color}`} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-4 pt-2 flex-wrap">
          {(["1:1", "3:4", "9:16", "16:9"] as const).map((r) => (
            <button key={r} onClick={() => setAspectRatio(r)} className={`settings-pill ${aspectRatio === r ? 'active' : ''}`}>
              <AnimatedIconify icon={r === "9:16" ? "solar:smartphone-bold-duotone" : r === "16:9" ? "solar:monitor-bold-duotone" : "solar:crop-minimalistic-bold-duotone"} className="w-3.5 h-3.5 text-emerald-400" />
              {r}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-0.5" />
          {(["standard", "studio", "ultra"] as const).map((q) => (
            <button key={q} onClick={() => setRenderQuality(q)} className={`settings-pill capitalize ${renderQuality === q ? 'active' : ''}`}>
              <AnimatedIconify icon={q === "ultra" ? "solar:crown-star-bold-duotone" : "solar:medal-ribbon-star-bold-duotone"} className="w-3.5 h-3.5 text-pink-400" />
              {q}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-0.5 hidden sm:block" />
          {([1, 2, 4] as const).map((n) => (
            <button key={n} onClick={() => setImageCount(n)} className={`settings-pill ${imageCount === n ? 'active' : ''}`}>
              <AnimatedIconify icon="solar:gallery-minimalistic-bold-duotone" className="w-3.5 h-3.5 text-cyan-400" />
              {n}x
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-0.5 hidden sm:block" />
          {([
            ["auto", "Auto", "solar:magic-stick-3-bold-duotone"],
            ["product", "Product", "solar:box-bold-duotone"],
            ["portrait", "Portrait", "solar:user-id-bold-duotone"],
            ["editorial", "Editorial", "solar:camera-bold-duotone"],
          ] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setCameraPreset(id)} className={`settings-pill ${cameraPreset === id ? 'active' : ''}`}>
              <AnimatedIconify icon={icon} className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          placeholder={referenceImage ? "Describe how to edit this image…" : "Describe your image… (or drag & drop to edit)"}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full min-h-[100px] sm:min-h-[120px] p-4 text-sm sm:text-base bg-transparent border-0 resize-none outline-none text-foreground placeholder:text-muted-foreground/60 leading-relaxed"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 flex-wrap gap-y-2">
          <div className="flex items-center gap-1.5">
            <label className="settings-pill cursor-pointer" title="Upload image">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Upload</span>
            </label>
            <button onClick={() => setShowAssetPicker(true)} className="settings-pill" title="My Assets">
              <AnimatedIconify icon="solar:database-bold-duotone" className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Assets</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground font-mono">{creditsCost} cr</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleOptimizePrompt}
                  disabled={isOptimizing || !prompt.trim()}
                  className="btn-optimize px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  {isOptimizing ? <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-3.5 h-3.5" spin /> : <AnimatedIconify icon="solar:magic-stick-3-bold-duotone" className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Enhance</span>
                </button>
              </TooltipTrigger>
              <TooltipContent><p>AI prompt enhancement</p></TooltipContent>
            </Tooltip>

            <button
              onClick={canGenerate ? handleGenerate : onUpgradeClick}
              disabled={isGenerating || (canGenerate && !prompt.trim())}
              className="btn-generate text-sm px-5 py-2"
            >
              {isGenerating ? (
                <><AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" spin /><span>{referenceImage ? "Editing…" : "Generating…"}</span></>
              ) : !canGenerate ? (
                <><AnimatedIconify icon="solar:crown-star-bold-duotone" className="w-4 h-4" /><span>Upgrade</span></>
              ) : (
                <><div className="star-icon star-icon-sm"><MagicStar className="w-4 h-4" /></div><span>{referenceImage ? "Edit" : "Generate"}</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Generation Card */}
      {activeGeneration && (
        <InlineGenerationCard
          generation={activeGeneration}
          onDismiss={activeGeneration.status === "completed" || activeGeneration.status === "failed" ? handleDismissGeneration : undefined}
        />
      )}

      {/* Recent Creations */}
      {user && <ToolCreationsGrid key={refreshKey} userId={user.id} type="image" maxItems={6} />}

      {/* Asset Picker */}
      {user && (
        <AssetPicker
          open={showAssetPicker}
          onOpenChange={setShowAssetPicker}
          userId={user.id}
          acceptedTypes={["image"]}
          onSelect={handleAssetSelect}
        />
      )}
    </div>
  );
};

export default ImageGenerator;
