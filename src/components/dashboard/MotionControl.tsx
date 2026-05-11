import { useState } from "react";
import { Link } from "react-router-dom";

const MagicStar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import InlineGenerationCard from "./InlineGenerationCard";
import ToolCreationsGrid from "./ToolCreationsGrid";
import AssetPicker from "./AssetPicker";
import DropZone from "./DropZone";
import AnimatedIconify from "@/components/ui/animated-iconify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MotionControlProps {
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

type MotionMode = "motion-transfer" | "lip-sync";

const motionSelectOptions = {
  orientation: [
    { value: "video", label: "Match video movement" },
    { value: "image", label: "Keep image direction" },
  ],
};

const ToolSelect = ({
  icon,
  value,
  onValueChange,
  options,
  ariaLabel,
}: {
  icon: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger aria-label={ariaLabel} className="tool-select-control">
      <AnimatedIconify icon={icon} className="h-4 w-4 shrink-0 text-muted-foreground" />
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

const MotionControl = ({ onCreditsUpdate, availableCredits = 0, hasSubscription = false, onUpgradeClick }: MotionControlProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [motionMode, setMotionMode] = useState<MotionMode>("motion-transfer");

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [characterOrientation, setCharacterOrientation] = useState<"video" | "image">("video");
  const [quality, setQuality] = useState<"standard" | "pro">("standard");
  const [cfgScale, setCfgScale] = useState(0.5);
  const [keepOriginalSound, setKeepOriginalSound] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [activeGeneration, setActiveGeneration] = useState<ActiveGeneration | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showVideoPicker, setShowVideoPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showAudioPicker, setShowAudioPicker] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const creditsCost = motionMode === "motion-transfer"
    ? (quality === "pro" ? 250 : 200)
    : (quality === "pro" ? 200 : 150);

  const canGenerate = hasSubscription || availableCredits >= creditsCost;

  const handleVideoSelect = (url: string) => { setVideoUrl(url); setVideoPreview(url); };
  const handleImageSelect = (url: string) => { setImageUrl(url); setImagePreview(url); };
  const handleAudioSelect = (url: string) => {
    setAudioUrl(url);
    const parts = url.split('/');
    setAudioName(parts[parts.length - 1] || 'Audio file');
  };

  const uploadToStorage = async (file: File, folder: string) => {
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("generations").upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("generations").getPublicUrl(data.path);
    return publicUrl;
  };

  const handleVideoFileDrop = async (file: File) => {
    try {
      const url = await uploadToStorage(file, 'video');
      if (!url) return;
      setVideoUrl(url); setVideoPreview(url);
      await supabase.from("assets").insert({ user_id: user!.id, name: file.name, type: "video", url, file_size: file.size });
      toast({ title: "Video uploaded", description: "Ready for motion transfer." });
    } catch (e) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  const handleImageFileDrop = async (file: File) => {
    try {
      const url = await uploadToStorage(file, 'image');
      if (!url) return;
      setImageUrl(url); setImagePreview(url);
      await supabase.from("assets").insert({ user_id: user!.id, name: file.name, type: "image", url, file_size: file.size });
      toast({ title: "Image uploaded", description: "Ready for motion transfer." });
    } catch (e) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  const handleAudioFileDrop = async (file: File) => {
    try {
      const url = await uploadToStorage(file, 'audio');
      if (!url) return;
      setAudioUrl(url); setAudioName(file.name);
      await supabase.from("assets").insert({ user_id: user!.id, name: file.name, type: "audio", url, file_size: file.size });
      toast({ title: "Audio uploaded", description: "Ready for lip sync." });
    } catch (e) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  const handleGenerate = async () => {
    if (motionMode === "motion-transfer" && (!videoUrl || !imageUrl)) {
      toast({ title: "Missing files", description: "Upload both a reference video and a character image.", variant: "destructive" });
      return;
    }
    if (motionMode === "lip-sync" && (!videoUrl || !audioUrl)) {
      toast({ title: "Missing files", description: "Upload both a video and an audio file for lip sync.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in to generate motion videos");
      await supabase.auth.refreshSession();

      const tempId = `temp-${Date.now()}`;
      setActiveGeneration({
        id: tempId, type: "motion", status: "pending",
        prompt: motionMode === "lip-sync" ? "Lip Sync" : prompt || "Motion Transfer",
        result_url: null, error_message: null, created_at: new Date().toISOString(),
        settings: { motionMode, quality, characterOrientation, cfgScale },
      });

      const data = await callAPI<{ success: boolean; generationId?: string; creditsUsed?: number; error?: string }>("generate-motion", {
        videoUrl,
        imageUrl: motionMode === "motion-transfer" ? imageUrl : undefined,
        audioUrl: motionMode === "lip-sync" ? audioUrl : undefined,
        prompt: prompt || undefined,
        characterOrientation,
        quality,
        keepOriginalSound,
        cfgScale,
      });

      if (!data.success) throw new Error(data.error || "Generation failed");

      setActiveGeneration(prev => prev ? { ...prev, id: data.generationId } : null);
      toast({
        title: motionMode === "lip-sync" ? "Lip sync started!" : "Motion transfer started!",
        description: `Using ${data.creditsUsed} credits. This may take a few minutes.`,
      });

      pollMotionStatus(data.generationId);
      onCreditsUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      setActiveGeneration(prev => prev ? { ...prev, status: "failed", error_message: message } : null);
      toast({ title: "Generation failed", description: message, variant: "destructive" });
      setIsGenerating(false);
    }
  };

  const pollMotionStatus = async (generationId: string) => {
    const maxAttempts = quality === "pro" ? 360 : 240;
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const data = await callAPI<{ status: string; resultUrl?: string; error?: string }>("check-motion-status", { generationId });

        if (data.status === "completed") {
          setIsGenerating(false);
          setActiveGeneration(prev => prev ? { ...prev, status: "completed", result_url: data.resultUrl } : null);
          setRefreshKey(prev => prev + 1);
          toast({ title: "Video ready!", description: "Your motion video has been generated." });
          return;
        }
        if (data.status === "failed") {
          setActiveGeneration(prev => prev ? { ...prev, status: "failed", error_message: data.error } : null);
          throw new Error(data.error || "Generation failed");
        }

        setActiveGeneration(prev => prev ? { ...prev, status: "processing" } : null);
        if (attempts < maxAttempts) setTimeout(poll, 5000);
        else throw new Error("Generation timed out");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to check status";
        toast({ title: "Generation failed", description: message, variant: "destructive" });
        setIsGenerating(false);
      }
    };

    poll();
  };

  const UploadZone = ({ onDrop, accept, preview, icon, title, subtitle, onPickerOpen, maxSize }: {
    onDrop: (f: File) => void;
    accept: string[];
    preview?: React.ReactNode;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPickerOpen: () => void;
    maxSize: number;
  }) => (
    <DropZone
      onDrop={onDrop}
      accept={accept}
      maxSize={maxSize}
      onError={(msg) => toast({ title: "Upload error", description: msg, variant: "destructive" })}
      className="min-h-[170px] rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/50 transition-all duration-200 cursor-pointer"
      dropMessage="Drop here"
    >
      {preview || (
        <div className="p-3 sm:p-6 text-center space-y-3 sm:space-y-4">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{title}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors text-xs font-medium">
              <input type="file" accept={accept.join(',')} onChange={(e) => e.target.files?.[0] && onDrop(e.target.files[0])} className="hidden" />
              <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Upload</span>
            </label>
            <button onClick={() => onPickerOpen()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors text-xs font-medium">
              <AnimatedIconify icon="solar:database-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Assets</span>
            </button>
          </div>
        </div>
      )}
    </DropZone>
  );

  const VideoPreviewContent = (previewUrl: string, onPickerOpen: () => void) => (
    <div className="p-3 space-y-3">
      <video src={previewUrl} className="w-full aspect-video rounded-xl object-cover" muted loop autoPlay playsInline />
      <div className="flex items-center justify-center gap-2">
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors text-xs">
          <input type="file" accept="video/*,.mp4,.webm" onChange={(e) => e.target.files?.[0] && handleVideoFileDrop(e.target.files[0])} className="hidden" />
          <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
          Change
        </label>
        <button onClick={onPickerOpen} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors text-xs">
          <AnimatedIconify icon="solar:database-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
          Assets
        </button>
      </div>
    </div>
  );

  const ImagePreviewContent = (previewUrl: string, onPickerOpen: () => void) => (
    <div className="p-3 space-y-3">
      <img src={previewUrl} alt="Character" className="w-full aspect-video rounded-xl object-cover bg-muted/50" />
      <div className="flex items-center justify-center gap-2">
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors text-xs">
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageFileDrop(e.target.files[0])} className="hidden" />
          <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
          Change
        </label>
        <button onClick={onPickerOpen} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors text-xs">
          <AnimatedIconify icon="solar:database-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
          Assets
        </button>
      </div>
    </div>
  );

  return (
    <div className="py-4 sm:py-6 space-y-6">

      {/* ── Cinematic Hero ─────────────────────────────────── */}
      <div className="tool-hero rounded-2xl">
        <div className="tool-hero-bg" />
        <div className="tool-hero-grid" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="star-icon star-icon-lg"><MagicStar className="w-7 h-7" /></div>
            <span className="badge-violet text-xs">Lovix Motion</span>
          </div>
          <h1 className="tool-hero-title">Animate Any Character</h1>
          <p className="tool-hero-subtitle">Transfer motion from any video to your character, or sync lips with custom audio.</p>
          <Link to="/guide/motion" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1">
            <AnimatedIconify icon="solar:notebook-bookmark-bold-duotone" className="w-3.5 h-3.5 text-primary" /> Motion Guide
          </Link>
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs value={motionMode} onValueChange={(v) => setMotionMode(v as MotionMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-10">
          <TabsTrigger value="motion-transfer" className="gap-2 text-sm">
            <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-4 h-4" />
            Motion Transfer
          </TabsTrigger>
          <TabsTrigger value="lip-sync" className="gap-2 text-sm">
            <AnimatedIconify icon="solar:microphone-3-bold-duotone" className="w-4 h-4 text-pink-400" />
            Lip Sync
          </TabsTrigger>
        </TabsList>

        {/* Motion Transfer */}
        <TabsContent value="motion-transfer" className="space-y-4 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <AnimatedIconify icon="solar:bolt-bold-duotone" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">How it works:</strong> Upload a reference video with the motion you want to copy + your character image. The AI transfers the movements to your character while preserving its visual identity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">1. Motion reference video</p>
              <UploadZone
                onDrop={handleVideoFileDrop}
                accept={["video/*", ".mp4", ".webm"]}
                maxSize={100 * 1024 * 1024}
                preview={videoPreview ? VideoPreviewContent(videoPreview, () => setShowVideoPicker(true)) : undefined}
                icon={<AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-7 h-7 text-primary" />}
                title="Reference video"
                subtitle="MP4, WebM — max 100MB, 3–30 sec"
                onPickerOpen={() => setShowVideoPicker(true)}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">2. Character image</p>
              <UploadZone
                onDrop={handleImageFileDrop}
                accept={["image/*"]}
                maxSize={10 * 1024 * 1024}
                preview={imagePreview ? ImagePreviewContent(imagePreview, () => setShowImagePicker(true)) : undefined}
                icon={<AnimatedIconify icon="solar:gallery-wide-bold-duotone" className="w-7 h-7 text-primary" />}
                title="Character image"
                subtitle="PNG, JPG, WebP — min 300px"
                onPickerOpen={() => setShowImagePicker(true)}
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prompt (optional)</label>
            <Textarea
              placeholder="Describe the motion style... e.g. 'energetic dance, fluid and natural movements'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Character direction</span>
            <ToolSelect
              icon="solar:route-bold"
              value={characterOrientation}
              onValueChange={(value) => setCharacterOrientation(value as "video" | "image")}
              options={motionSelectOptions.orientation}
              ariaLabel="Character direction"
            />
          </div>
        </TabsContent>

        {/* Lip Sync */}
        <TabsContent value="lip-sync" className="space-y-4 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <AnimatedIconify icon="solar:microphone-3-bold-duotone" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Lip Sync:</strong> The character in the video will speak with lips synced to the audio. Use a video with a clear frontal view of a face.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Video with face</p>
              <UploadZone
                onDrop={handleVideoFileDrop}
                accept={["video/*", ".mp4", ".webm"]}
                maxSize={50 * 1024 * 1024}
                preview={videoPreview ? VideoPreviewContent(videoPreview, () => setShowVideoPicker(true)) : undefined}
                icon={<AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-7 h-7 text-primary" />}
                title="Video with frontal face"
                subtitle="MP4, WebM — max 50MB"
                onPickerOpen={() => setShowVideoPicker(true)}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audio file</p>
              <DropZone
                onDrop={handleAudioFileDrop}
                accept={["audio/*", ".mp3", ".wav", ".m4a"]}
                maxSize={20 * 1024 * 1024}
                onError={(msg) => toast({ title: "Upload error", description: msg, variant: "destructive" })}
                className="min-h-[170px] rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/50 transition-all duration-200"
                dropMessage="Drop audio here"
              >
                {audioName ? (
                  <div className="p-3 sm:p-6 text-center space-y-3">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                      <AnimatedIconify icon="solar:music-note-3-bold-duotone" className="w-7 h-7 text-primary" />
                    </div>
                    <p className="font-medium text-foreground text-sm truncate px-4">{audioName}</p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors text-xs">
                        <input type="file" accept="audio/*,.mp3,.wav,.m4a" onChange={(e) => e.target.files?.[0] && handleAudioFileDrop(e.target.files[0])} className="hidden" />
                        <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Change</span>
                      </label>
                      <button onClick={() => setShowAudioPicker(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors text-xs">
                        <AnimatedIconify icon="solar:database-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Assets</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 sm:p-6 text-center space-y-3 sm:space-y-4">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <AnimatedIconify icon="solar:music-note-3-bold-duotone" className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Audio file</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">MP3, WAV, M4A — max 20MB</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors text-xs font-medium">
                        <input type="file" accept="audio/*,.mp3,.wav,.m4a" onChange={(e) => e.target.files?.[0] && handleAudioFileDrop(e.target.files[0])} className="hidden" />
                        <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Upload</span>
                      </label>
                      <button onClick={() => setShowAudioPicker(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors text-xs">
                        <AnimatedIconify icon="solar:database-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Assets</span>
                      </button>
                    </div>
                  </div>
                )}
              </DropZone>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setQuality(quality === "pro" ? "standard" : "pro")}
            className={`quality-switch ${quality === "pro" ? "quality-switch-on" : ""}`}
            aria-pressed={quality === "pro"}
          >
            <span className="quality-switch-track">
              <span className="quality-switch-thumb" />
            </span>
            <span className="text-xs font-semibold">{quality === "pro" ? "Pro quality" : "Standard"}</span>
          </button>

          {/* Keep sound — only motion-transfer */}
          {motionMode === "motion-transfer" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={keepOriginalSound} onChange={(e) => setKeepOriginalSound(e.target.checked)} className="sr-only" />
              <div className={`w-9 h-5 rounded-full transition-colors ${keepOriginalSound ? "bg-primary" : "bg-muted"}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${keepOriginalSound ? "translate-x-4" : "translate-x-0.5"} mt-0.5`} />
              </div>
              <AnimatedIconify icon="solar:volume-loud-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Keep sound</span>
            </label>
          )}

          {/* Advanced toggle */}
          {motionMode === "motion-transfer" && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${showAdvanced ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}
            >
              <AnimatedIconify icon="solar:settings-minimalistic-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground" />
              Advanced
            </button>
          )}
        </div>

        {/* Advanced settings */}
        {showAdvanced && motionMode === "motion-transfer" && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Guidance (cfg_scale)</label>
                <span className="text-xs text-foreground font-mono">{cfgScale.toFixed(2)}</span>
              </div>
              <Slider
                value={[cfgScale]}
                onValueChange={([v]) => setCfgScale(v)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
              <p className="text-[11px] text-muted-foreground">Low = more creative · High = more prompt-adherent</p>
            </div>
          </div>
        )}

        {/* Credits + Generate */}
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="text-primary border-primary/50 text-xs px-3">
            {creditsCost} credits
          </Badge>

          <Button
            onClick={canGenerate ? handleGenerate : onUpgradeClick}
            disabled={isGenerating || (canGenerate ? (motionMode === "motion-transfer" ? (!videoUrl || !imageUrl) : (!videoUrl || !audioUrl)) : false)}
            style={{ background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--pink)))" }}
            className="text-white gap-2 h-10 px-6 font-medium hover:opacity-90 transition-opacity"
          >
            {isGenerating ? (
              <>
                <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4 text-white" spin />
                Generating...
              </>
            ) : !canGenerate ? (
              <>
                <AnimatedIconify icon="solar:crown-star-bold-duotone" className="w-4 h-4" />
                Upgrade
              </>
            ) : (
              <>
                <AnimatedIconify icon="solar:stars-bold-duotone" className="w-4 h-4" />
                {motionMode === "lip-sync" ? "Generate Lip Sync" : "Generate Motion"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Active Generation */}
      {activeGeneration && (
        <InlineGenerationCard
          generation={activeGeneration}
          onDismiss={activeGeneration.status === "completed" || activeGeneration.status === "failed" ? () => setActiveGeneration(null) : undefined}
        />
      )}

      {/* Recent Creations */}
      {user && <ToolCreationsGrid key={refreshKey} userId={user.id} type="motion" maxItems={6} />}

      {/* Asset Pickers */}
      {user && (
        <>
          <AssetPicker open={showVideoPicker} onOpenChange={setShowVideoPicker} userId={user.id} acceptedTypes={["video"]} onSelect={handleVideoSelect} />
          <AssetPicker open={showImagePicker} onOpenChange={setShowImagePicker} userId={user.id} acceptedTypes={["image"]} onSelect={handleImageSelect} />
          <AssetPicker open={showAudioPicker} onOpenChange={setShowAudioPicker} userId={user.id} acceptedTypes={["audio"]} onSelect={handleAudioSelect} />
        </>
      )}
    </div>
  );
};

export default MotionControl;
