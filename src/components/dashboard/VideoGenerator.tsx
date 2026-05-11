import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useDropZone } from "@/hooks/useDropZone";
import InlineGenerationCard from "./InlineGenerationCard";
import ToolCreationsGrid from "./ToolCreationsGrid";
import AssetPicker from "./AssetPicker";
import { resizeImageForAspectRatio } from "@/utils/imageResize";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AnimatedIconify from "@/components/ui/animated-iconify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoGeneratorProps {
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

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const videoSelectOptions = {
  seconds: [
    { value: "4", label: "4s" },
    { value: "8", label: "8s" },
    { value: "12", label: "12s" },
  ],
  aspectRatio: [
    { value: "1:1", label: "1:1" },
    { value: "16:9", label: "16:9" },
    { value: "9:16", label: "9:16" },
  ],
  quality: [
    { value: "hd", label: "HD" },
    { value: "4k", label: "4K" },
  ],
  modelPreset: [
    { value: "cinema", label: "Cinema" },
    { value: "ugc", label: "UGC" },
    { value: "product", label: "Product" },
    { value: "social", label: "Social" },
  ],
  cameraMove: [
    { value: "auto", label: "Auto" },
    { value: "push", label: "Push" },
    { value: "orbit", label: "Orbit" },
    { value: "handheld", label: "Hand" },
  ],
  motionStrength: [
    { value: "subtle", label: "Soft" },
    { value: "balanced", label: "Mid" },
    { value: "dynamic", label: "Fast" },
  ],
};

const ToolSelect = ({
  icon,
  value,
  onValueChange,
  options,
  ariaLabel,
  glyph,
}: {
  icon: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  glyph?: React.ReactNode;
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger aria-label={ariaLabel} className="tool-select-control">
      {glyph || <AnimatedIconify icon={icon} className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="tool-select-menu">
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const FormatGlyph = ({ ratio }: { ratio: string }) => (
  <span
    className={`format-glyph ${
      ratio === "9:16" ? "format-glyph-vertical" : ratio === "1:1" ? "format-glyph-square" : "format-glyph-wide"
    }`}
    aria-hidden="true"
  />
);

const MagicStar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);

const VideoGenerator = ({
  onCreditsUpdate,
  availableCredits = 0,
  hasSubscription = false,
  onUpgradeClick,
}: VideoGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [seconds, setSeconds] = useState<4 | 8 | 12>(4);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("16:9");
  const [quality, setQuality] = useState<"hd" | "4k">("hd");
  const [modelPreset, setModelPreset] = useState<"cinema" | "ugc" | "product" | "social">("cinema");
  const [cameraMove, setCameraMove] = useState<"auto" | "push" | "orbit" | "handheld">("auto");
  const [motionStrength, setMotionStrength] = useState<"subtle" | "balanced" | "dynamic">("balanced");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [activeGeneration, setActiveGeneration] = useState<ActiveGeneration | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const creditsCost = seconds >= 8 ? 450 : 225;
  const canGenerate = hasSubscription || availableCredits >= creditsCost;

  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) {
      toast({ title: "Enter a prompt first", variant: "destructive" });
      return;
    }
    setIsOptimizing(true);
    try {
      const data = await callAPI<{ success: boolean; optimizedPrompt?: string; error?: string }>("optimize-prompt", { prompt, type: "video" });
      if (!data.success) throw new Error(data.error || "Failed to optimize prompt");
      setPrompt(data.optimizedPrompt!);
      toast({ title: "Prompt enhanced!", description: "Cinematic quality boost applied." });
    } catch (error) {
      toast({ title: "Optimization failed", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
    } finally {
      setIsOptimizing(false);
    }
  };

  const uploadReferenceImage = async (file: File) => {
    if (!user) return;
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast({ title: "Invalid format", description: "JPG, PNG, or WebP only.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/ref-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from("generations").upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("generations").getPublicUrl(data.path);
      setReferenceImage(publicUrl);
      setReferenceImageFile(file);
      await supabase.from("assets").insert({ user_id: user.id, name: file.name, type: "image", url: publicUrl, file_size: file.size });
      toast({ title: "Reference image uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
    }
  };

  const { isDragging, dragProps } = useDropZone({
    onDrop: uploadReferenceImage,
    accept: ["image/*"],
    maxSize: MAX_FILE_SIZE,
    onError: (message) => toast({ title: "Upload error", description: message, variant: "destructive" }),
  });

  const handleAssetSelect = (url: string) => { setReferenceImage(url); setReferenceImageFile(null); };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast({ title: "Enter a prompt", variant: "destructive" }); return; }
    if (!user) { toast({ title: "Not signed in", variant: "destructive" }); return; }
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      let finalReferenceUrl: string | null = null;
      if (referenceImage) {
        setIsResizing(true);
        try {
          finalReferenceUrl = await resizeImageForAspectRatio(supabase, referenceImage, aspectRatio, user.id, () => {});
        } catch { toast({ title: "Image resize failed", description: "Continuing without reference.", variant: "destructive" }); }
        finally { setIsResizing(false); }
      }
      const data = await callAPI<{ success: boolean; generationId?: string; creditsUsed?: number; error?: string }>("generate-video", {
        prompt, seconds, aspectRatio, quality, modelPreset, cameraMove, motionStrength, referenceImageUrl: finalReferenceUrl,
      });
      if (!data.success) throw new Error(data.error || "Failed to start");
      setActiveGeneration({
        id: data.generationId, type: "video", status: "pending", prompt,
        result_url: null, error_message: null, created_at: new Date().toISOString(),
        settings: { seconds, aspectRatio, quality, modelPreset, cameraMove, motionStrength },
      });
      toast({ title: "Video generation started!", description: `${data.creditsUsed} credits used.` });
      pollVideoStatus(data.generationId);
      onCreditsUpdate();
    } catch (error: unknown) {
      toast({ title: "Generation failed", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
      setIsGenerating(false);
      setActiveGeneration(null);
    }
  };

  const pollVideoStatus = async (generationId: string) => {
    const maxAttempts = 60;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const data = await callAPI<{ status: string; resultUrl?: string; error?: string }>("check-video-status", { generationId });
        if (data.status === "completed") {
          setIsGenerating(false);
          setActiveGeneration(prev => prev ? { ...prev, status: "completed", result_url: data.resultUrl } : null);
          setRefreshKey(prev => prev + 1);
          toast({ title: "Video ready!", description: "Your video has been generated." });
          return;
        }
        if (data.status === "failed") {
          setActiveGeneration(prev => prev ? { ...prev, status: "failed", error_message: data.error } : null);
          throw new Error(data.error || "Generation failed");
        }
        setActiveGeneration(prev => prev ? { ...prev, status: "processing" } : null);
        if (attempts < maxAttempts) setTimeout(poll, 5000);
        else throw new Error("Generation timed out");
      } catch (error: unknown) {
        toast({ title: "Generation failed", description: error instanceof Error ? error.message : "Failed", variant: "destructive" });
        setIsGenerating(false);
      }
    };
    poll();
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
            <span className="badge-violet text-xs">Lovix Video</span>
          </div>
          <h1 className="tool-hero-title">Bring Your Vision to Life</h1>
          <p className="tool-hero-subtitle">Generate cinematic AI videos from text or image. Up to 12s, HD quality, sound included.</p>
          <Link to="/guide/video" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1">
            <AnimatedIconify icon="solar:notebook-bookmark-bold-duotone" className="w-3.5 h-3.5 text-primary" /> Prompting Guide
          </Link>
        </div>
      </div>

      {/* ── Prompt Bar ─────────────────────────────────────── */}
      <div {...dragProps} className={`prompt-bar transition-all ${isDragging ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]' : ''}`}>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-primary/8 backdrop-blur-sm">
            <div className="text-center">
              <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-10 h-10 text-primary mx-auto mb-2" pulse />
              <p className="text-base font-semibold text-primary">Drop reference image</p>
            </div>
          </div>
        )}

        {/* Reference image preview */}
        {referenceImage && (
          <div className="px-4 pt-3 flex gap-2">
            <div className="relative inline-block">
              <img src={referenceImage} alt="Reference" className="h-14 rounded-xl object-cover ring-1 ring-border" />
              {isResizing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                  <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4 text-white" spin />
                </div>
              )}
              <button
                onClick={() => { setReferenceImage(null); setReferenceImageFile(null); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              >
                <AnimatedIconify icon="solar:close-circle-bold-duotone" className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Image to Video</p>
              <p className="text-xs text-foreground font-medium">{referenceImageFile?.name || 'Reference image'}</p>
            </div>
          </div>
        )}

        {/* Textarea */}
        <textarea
          placeholder={referenceImage ? "Describe the motion and scene…" : "Describe the video you want to create… (or drag & drop a reference image)"}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full min-h-[78px] sm:min-h-[92px] p-4 text-sm sm:text-base bg-transparent border-0 resize-none outline-none text-foreground placeholder:text-muted-foreground/60 leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 flex-wrap gap-y-2">
          <div className="tool-input-row">
            <ToolSelect icon="solar:clock-circle-bold" value={String(seconds)} onValueChange={(value) => setSeconds(Number(value) as 4 | 8 | 12)} options={videoSelectOptions.seconds} ariaLabel="Duration" />
            <ToolSelect icon="solar:crop-minimalistic-bold" glyph={<FormatGlyph ratio={aspectRatio} />} value={aspectRatio} onValueChange={(value) => setAspectRatio(value as "1:1" | "16:9" | "9:16")} options={videoSelectOptions.aspectRatio} ariaLabel="Format" />
            <div className="w-px h-4 bg-border mx-0.5" />

            <label className="tool-upload-btn cursor-pointer" title="Upload reference image">
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadReferenceImage(e.target.files[0])} className="hidden" />
              <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-3.5 h-3.5" />
              <span>Upload</span>
            </label>

            <button onClick={() => setShowAssetPicker(true)} className="tool-assets-btn" title="My Assets">
              <AnimatedIconify icon="solar:folder-with-files-bold-duotone" className="w-3.5 h-3.5" />
              <span>Assets</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Credits cost */}
            <span className="text-xs text-muted-foreground font-mono">{creditsCost} cr</span>

            {/* Optimize */}
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

            {/* Generate CTA */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || isResizing || !canGenerate}
              className="btn-generate text-sm px-5 py-2"
            >
              {isResizing ? (
                <><AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" spin /><span className="hidden sm:inline">Preparing…</span></>
              ) : isGenerating ? (
                <><AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" spin /><span>Generating…</span></>
              ) : (
                <><div className="star-icon star-icon-sm"><MagicStar className="w-4 h-4" /></div><span>Generate</span></>
              )}
            </button>
          </div>
        </div>

        {/* Upgrade prompt */}
        {!canGenerate && (
          <div className="mx-3 mb-3 flex items-center gap-3 p-3 rounded-xl bg-primary/8 border border-primary/20">
            <AnimatedIconify icon="solar:crown-star-bold-duotone" className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-primary flex-1">
              {availableCredits} credits available — need {creditsCost} to generate
            </span>
            <Button size="sm" onClick={onUpgradeClick}>Upgrade</Button>
          </div>
        )}
      </div>

      {/* ── Active Generation ───────────────────────────────── */}
      {activeGeneration && <InlineGenerationCard generation={activeGeneration} onDismiss={() => setActiveGeneration(null)} />}

      {/* ── Recent Creations ────────────────────────────────── */}
      {user && <ToolCreationsGrid key={refreshKey} userId={user.id} type="video" maxItems={8} />}

      {/* Asset Picker */}
      {user && (
        <AssetPicker
          open={showAssetPicker}
          onOpenChange={setShowAssetPicker}
          onSelect={handleAssetSelect}
          userId={user.id}
          acceptedTypes={['image']}
        />
      )}
    </div>
  );
};

export default VideoGenerator;
