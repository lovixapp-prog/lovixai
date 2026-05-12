import { useState } from "react";
import { Link } from "react-router-dom";

const MagicStar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import ToolHeroShowcase from "./ToolHeroShowcase";

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
    { value: "video", label: "Video motion" },
    { value: "image", label: "Image pose" },
  ],
};

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
  const [openComposerPanel, setOpenComposerPanel] = useState<'mode' | 'settings' | null>(null);

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
            <label className="tool-upload-btn cursor-pointer">
              <input type="file" accept={accept.join(',')} onChange={(e) => e.target.files?.[0] && onDrop(e.target.files[0])} className="hidden" />
              <AnimatedIconify icon="solar:cloud-upload-bold-duotone" className="w-3.5 h-3.5" />
              <span>Upload</span>
            </label>
            <button onClick={() => onPickerOpen()} className="tool-assets-btn">
              <AnimatedIconify icon="solar:gallery-wide-bold-duotone" className="w-3.5 h-3.5" />
              <span>Assets</span>
            </button>
          </div>
        </div>
      )}
    </DropZone>
  );

  const MotionUploadCard = ({ kind, title, subtitle, previewUrl, onDrop, accept, maxSize, onPickerOpen }: {
    kind: 'video' | 'image' | 'audio';
    title: string;
    subtitle: string;
    previewUrl?: string | null;
    onDrop: (f: File) => void;
    accept: string[];
    maxSize: number;
    onPickerOpen: () => void;
  }) => (
    <DropZone
      onDrop={onDrop}
      accept={accept}
      maxSize={maxSize}
      onError={(msg) => toast({ title: "Upload error", description: msg, variant: "destructive" })}
      className="motion-upload-card"
      dropMessage="Drop here"
    >
      <div className="motion-upload-preview">
        {kind === 'video' && previewUrl ? (
          <video src={`${previewUrl}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-contain" />
        ) : kind === 'image' && previewUrl ? (
          <img src={previewUrl} alt="" className="h-full w-full object-contain" />
        ) : kind === 'audio' && audioName ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-primary/10 text-primary">
            <AnimatedIconify icon="solar:music-note-3-bold-duotone" className="h-7 w-7" />
            <span className="max-w-[90%] truncate text-xs font-bold">{audioName}</span>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/35 text-muted-foreground">
            <AnimatedIconify
              icon={kind === 'video' ? 'solar:videocamera-record-bold-duotone' : kind === 'image' ? 'solar:gallery-wide-bold-duotone' : 'solar:music-note-3-bold-duotone'}
              className="h-7 w-7 text-primary"
            />
            <span className="text-xs font-black uppercase tracking-[0.12em]">{kind}</span>
          </div>
        )}
      </div>
      <div className="motion-upload-body">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="motion-upload-actions">
          <label className="chat-icon-tool cursor-pointer" aria-label={`Upload ${kind}`} title={`Upload ${kind}`}>
            <input type="file" accept={accept.join(',')} onChange={(e) => e.target.files?.[0] && onDrop(e.target.files[0])} className="hidden" />
            <AnimatedIconify icon="solar:cloud-upload-bold" className="h-4 w-4" />
          </label>
          <button type="button" onClick={onPickerOpen} className="chat-icon-tool" aria-label={`${kind} assets`} title="Assets">
            <AnimatedIconify icon="solar:gallery-wide-bold" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </DropZone>
  );

  const VideoPreviewContent = (previewUrl: string, onPickerOpen: () => void) => (
    <div className="p-3 space-y-3">
      <video src={previewUrl} className="w-full aspect-video rounded-xl object-cover" muted loop autoPlay playsInline />
      <div className="flex items-center justify-center gap-2">
        <label className="tool-upload-btn cursor-pointer">
          <input type="file" accept="video/*,.mp4,.webm" onChange={(e) => e.target.files?.[0] && handleVideoFileDrop(e.target.files[0])} className="hidden" />
          <AnimatedIconify icon="solar:cloud-upload-bold-duotone" className="w-3.5 h-3.5" />
          <span>Change</span>
        </label>
        <button onClick={onPickerOpen} className="tool-assets-btn">
          <AnimatedIconify icon="solar:gallery-wide-bold-duotone" className="w-3.5 h-3.5" />
          <span>Assets</span>
        </button>
      </div>
    </div>
  );

  const ImagePreviewContent = (previewUrl: string, onPickerOpen: () => void) => (
    <div className="p-3 space-y-3">
      <img src={previewUrl} alt="Character" className="w-full aspect-video rounded-xl object-cover bg-muted/50" />
      <div className="flex items-center justify-center gap-2">
        <label className="tool-upload-btn cursor-pointer">
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageFileDrop(e.target.files[0])} className="hidden" />
          <AnimatedIconify icon="solar:cloud-upload-bold-duotone" className="w-3.5 h-3.5" />
          <span>Change</span>
        </label>
        <button onClick={onPickerOpen} className="tool-assets-btn">
          <AnimatedIconify icon="solar:gallery-wide-bold-duotone" className="w-3.5 h-3.5" />
          <span>Assets</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="py-4 sm:py-6 space-y-6">

      {/* â”€â”€ Cinematic Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="hidden">
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
      </div>

      <ToolHeroShowcase variant="motion" />

      <div className="chat-input-wrapper">
        <div className={`chat-composer motion-project-composer ${isGenerating ? 'opacity-75' : ''}`}>
          <div className="chat-composer-main">
            <Textarea
              placeholder={motionMode === "lip-sync" ? "Add notes for lip sync timing or expression..." : "Describe the motion style..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="chat-composer-textarea min-h-[72px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              rows={3}
            />
          </div>

          <div className="motion-upload-grid">
            <MotionUploadCard
              kind="video"
              title={motionMode === "lip-sync" ? "Video with face" : "Motion reference video"}
              subtitle={motionMode === "lip-sync" ? "MP4, WebM - max 50MB" : "MP4, WebM - max 100MB"}
              previewUrl={videoPreview}
              onDrop={handleVideoFileDrop}
              accept={["video/*", ".mp4", ".webm"]}
              maxSize={(motionMode === "lip-sync" ? 50 : 100) * 1024 * 1024}
              onPickerOpen={() => setShowVideoPicker(true)}
            />
            {motionMode === "lip-sync" ? (
              <MotionUploadCard
                kind="audio"
                title="Audio file"
                subtitle="MP3, WAV, M4A - max 20MB"
                previewUrl={audioUrl}
                onDrop={handleAudioFileDrop}
                accept={["audio/*", ".mp3", ".wav", ".m4a"]}
                maxSize={20 * 1024 * 1024}
                onPickerOpen={() => setShowAudioPicker(true)}
              />
            ) : (
              <MotionUploadCard
                kind="image"
                title="Character image"
                subtitle="PNG, JPG, WebP - min 300px"
                previewUrl={imagePreview}
                onDrop={handleImageFileDrop}
                accept={["image/*"]}
                maxSize={10 * 1024 * 1024}
                onPickerOpen={() => setShowImagePicker(true)}
              />
            )}
          </div>

          <div className="chat-composer-actions">
            <div className="chat-action-group">
              <div className="relative">
                <button type="button" className={`chat-round-tool ${openComposerPanel === 'mode' ? 'chat-round-tool-active' : ''}`} onClick={() => setOpenComposerPanel(openComposerPanel === 'mode' ? null : 'mode')} aria-label="Mode">
                  <AnimatedIconify icon={motionMode === "lip-sync" ? "solar:microphone-3-bold" : "solar:videocamera-record-bold"} className="h-5 w-5" />
                </button>
                {openComposerPanel === 'mode' && (
                  <div className="chat-popover motion-mode-popover">
                    <button type="button" onClick={() => { setMotionMode("motion-transfer"); setOpenComposerPanel(null); }} className="chat-popover-choice">
                      <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="h-5 w-5" />
                      <span><strong>Motion Transfer</strong><small>Video motion plus character image</small></span>
                    </button>
                    <button type="button" onClick={() => { setMotionMode("lip-sync"); setOpenComposerPanel(null); }} className="chat-popover-choice">
                      <AnimatedIconify icon="solar:microphone-3-bold-duotone" className="h-5 w-5" />
                      <span><strong>Lip Sync</strong><small>Video face plus audio file</small></span>
                    </button>
                  </div>
                )}
              </div>
              <button type="button" className={`chat-icon-tool ${openComposerPanel === 'settings' ? 'chat-icon-tool-active' : ''}`} onClick={() => setOpenComposerPanel(openComposerPanel === 'settings' ? null : 'settings')} aria-label="Settings">
                <AnimatedIconify icon="solar:tuning-2-bold" className="h-5 w-5" />
              </button>
              {openComposerPanel === 'settings' && (
                <div className="chat-popover motion-settings-popover">
                  <div className="chat-settings-head">
                    <span>Settings</span>
                    <button type="button" onClick={() => setOpenComposerPanel(null)} aria-label="Close settings">
                      <AnimatedIconify icon="solar:alt-arrow-down-bold" className="h-4 w-4" />
                    </button>
                  </div>
                  {motionMode === "motion-transfer" && (
                    <>
                      <button type="button" className="chat-settings-row">
                        <span className="chat-settings-row-main"><AnimatedIconify icon="solar:route-bold" className="h-4 w-4" /><span>Character motion</span></span>
                        <span className="chat-settings-current">{characterOrientation === "video" ? "Video" : "Image"}</span>
                        <AnimatedIconify icon="solar:alt-arrow-right-bold" className="h-4 w-4" />
                      </button>
                      <div className="chat-settings-section">
                        <div className="chat-option-grid">
                          {motionSelectOptions.orientation.map(option => (
                            <button key={option.value} type="button" onClick={() => setCharacterOrientation(option.value as "video" | "image")} className={`chat-option-pill ${characterOrientation === option.value ? 'chat-option-pill-active' : ''}`}>
                              <AnimatedIconify icon={option.value === "video" ? "solar:route-bold" : "solar:user-hands-bold"} className="h-3.5 w-3.5" />
                              <span>{option.value === "video" ? "Video" : "Image"}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <button type="button" className="chat-settings-row">
                    <span className="chat-settings-row-main"><AnimatedIconify icon="solar:medal-ribbon-star-bold" className="h-4 w-4" /><span>Quality</span></span>
                    <span className="chat-settings-current">{quality === "pro" ? "Pro" : "Standard"}</span>
                    <AnimatedIconify icon="solar:alt-arrow-right-bold" className="h-4 w-4" />
                  </button>
                  <div className="chat-settings-section">
                    <div className="chat-option-grid">
                      {(["standard", "pro"] as const).map(option => (
                        <button key={option} type="button" onClick={() => setQuality(option)} className={`chat-option-pill ${quality === option ? 'chat-option-pill-active' : ''}`}>
                          <AnimatedIconify icon={option === "pro" ? "solar:crown-star-bold" : "solar:star-bold"} className="h-3.5 w-3.5" />
                          <span>{option === "pro" ? "Pro" : "Std"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {motionMode === "motion-transfer" && (
                    <label className="chat-settings-row cursor-pointer">
                      <span className="chat-settings-row-main"><AnimatedIconify icon="solar:volume-loud-bold" className="h-4 w-4" /><span>Keep sound</span></span>
                      <input type="checkbox" checked={keepOriginalSound} onChange={(e) => setKeepOriginalSound(e.target.checked)} className="sr-only" />
                      <span className={`quality-switch-track ${keepOriginalSound ? 'bg-primary' : ''}`}><span className={`quality-switch-thumb ${keepOriginalSound ? 'translate-x-4' : ''}`} /></span>
                    </label>
                  )}
                  {motionMode === "motion-transfer" && (
                    <div className="chat-settings-section pt-1">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
                        <span>Guidance</span>
                        <span>{cfgScale.toFixed(2)}</span>
                      </div>
                      <Slider value={[cfgScale]} onValueChange={([v]) => setCfgScale(v)} min={0} max={1} step={0.05} className="w-full" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="chat-action-group chat-action-group-right">
              <div className="hidden rounded-full bg-muted/50 px-3 py-2 text-xs font-black text-muted-foreground sm:block">{creditsCost} credits</div>
              <button
                onClick={canGenerate ? handleGenerate : onUpgradeClick}
                disabled={isGenerating || (canGenerate ? (motionMode === "motion-transfer" ? (!videoUrl || !imageUrl) : (!videoUrl || !audioUrl)) : false)}
                className={`chat-send-btn ${canGenerate ? 'chat-send-btn-active' : ''}`}
                type="button"
                aria-label={motionMode === "lip-sync" ? "Generate lip sync" : "Generate motion"}
              >
                {isGenerating ? <AnimatedIconify icon="solar:refresh-circle-bold" className="h-5 w-5" spin /> : !canGenerate ? <AnimatedIconify icon="solar:crown-star-bold" className="h-5 w-5" /> : <AnimatedIconify icon="solar:arrow-up-bold" className="h-5 w-5" />}
              </button>
            </div>
          </div>
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
