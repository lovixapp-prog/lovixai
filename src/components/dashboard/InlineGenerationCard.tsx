import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Download, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedIconify from "@/components/ui/animated-iconify";

const MagicStar = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);

interface Generation {
  id: string;
  type: string;
  status: string;
  prompt: string | null;
  result_url: string | null;
  error_message: string | null;
  created_at: string;
  settings?: Record<string, unknown> | null;
}

interface InlineGenerationCardProps {
  generation: Generation;
  onDismiss?: () => void;
}

const ESTIMATED_TIMES: Record<string, number> = {
  video: 360,
  "influencer-video": 360,
  image: 45,
  motion: 360,
  "influencer-motion": 360,
  ugc: 420,
};

const GENERATION_STEPS: Record<string, string[]> = {
  video: ["Analyzing prompt", "Crafting scene", "Generating frames", "Rendering video", "Finalizing"],
  image: ["Processing prompt", "Generating image", "Enhancing quality"],
  motion: ["Parsing motion data", "Generating sequence", "Rendering output"],
  ugc: ["Analyzing product", "Writing script", "Generating scene", "Compositing", "Rendering"],
};

function getSteps(type: string): string[] {
  return GENERATION_STEPS[type] ?? GENERATION_STEPS.video;
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    video: "Video Generation",
    "influencer-video": "Influencer Video",
    image: "Image Generation",
    motion: "Motion Control",
    "influencer-motion": "Influencer Motion",
    ugc: "UGC Ad",
  };
  return map[type] ?? "Generation";
}

function TypeIcon({ type, className = "w-5 h-5" }: { type: string; className?: string }) {
  if (type === "image") return <AnimatedIconify icon="solar:gallery-wide-bold-duotone" className={className} pulse />;
  if (type === "motion" || type === "influencer-motion") return <AnimatedIconify icon="solar:magic-stick-3-bold-duotone" className={className} pulse />;
  if (type === "ugc") return <AnimatedIconify icon="solar:clapperboard-play-bold-duotone" className={className} pulse />;
  return <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className={className} pulse />;
}

function getAccentColor(type: string): string {
  if (type === "image") return "var(--cyan)";
  if (type === "motion" || type === "influencer-motion") return "var(--violet)";
  if (type === "ugc") return "43 95% 62%";
  return "var(--primary)";
}

const InlineGenerationCard = ({ generation, onDismiss }: InlineGenerationCardProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progress, setProgress] = useState(0);

  const estimatedTime = ESTIMATED_TIMES[generation.type] ?? 360;
  const steps = getSteps(generation.type);

  useEffect(() => {
    if (generation.status === "pending" || generation.status === "processing") {
      const startTime = new Date(generation.created_at).getTime();
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);
        setProgress(Math.min((elapsed / estimatedTime) * 100, 95));
      }, 1000);
      return () => clearInterval(interval);
    } else if (generation.status === "completed") {
      setProgress(100);
    }
  }, [generation.status, generation.created_at, estimatedTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const isGenerating = generation.status === "pending" || generation.status === "processing";
  const isCompleted = generation.status === "completed";
  const isFailed = generation.status === "failed";

  const currentStepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
  const currentStep = steps[currentStepIndex];
  const accentHsl = getAccentColor(generation.type);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
        isCompleted ? "gen-completed-card" : "gen-progress-card"
      }`}
      style={isFailed ? { borderColor: "hsl(var(--destructive)/0.4)", background: "hsl(var(--destructive)/0.04)" } : undefined}
    >
      {/* Animated gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{
          background: isCompleted
            ? "linear-gradient(90deg, transparent, hsl(142 71% 45% / 0.8), hsl(142 71% 45% / 0.5), transparent)"
            : isFailed
            ? "linear-gradient(90deg, transparent, hsl(var(--destructive)/0.8), transparent)"
            : `linear-gradient(90deg, transparent, hsl(${accentHsl}/0.9), hsl(var(--primary)/0.6), hsl(${accentHsl}/0.4), transparent)`,
        }}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">

          {/* Icon */}
          <div
            className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center"
            style={{
              background: isCompleted
                ? "hsl(142 71% 45% / 0.12)"
                : isFailed
                ? "hsl(var(--destructive)/0.12)"
                : `hsl(${accentHsl}/0.12)`,
              color: isCompleted
                ? "hsl(142 71% 45%)"
                : isFailed
                ? "hsl(var(--destructive))"
                : `hsl(${accentHsl})`,
            }}
          >
            {isFailed ? <AlertCircle className="w-5 h-5" /> :
             isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
             <TypeIcon type={generation.type} />}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {isGenerating && (
                    <div className="star-icon star-icon-sm animate-pulse">
                      <MagicStar className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {getTypeLabel(generation.type)}
                  </span>
                  {isCompleted && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 tracking-wider">
                      DONE
                    </span>
                  )}
                  {isFailed && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive tracking-wider">
                      FAILED
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-[280px] sm:max-w-[400px]">
                  {generation.prompt ? generation.prompt.slice(0, 70) + (generation.prompt.length > 70 ? "…" : "") : "No prompt"}
                </p>
              </div>

              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Generating state */}
            {isGenerating && (
              <div className="mt-3 space-y-2.5">
                {/* Progress track */}
                <div className="gen-progress-bar-track">
                  <div
                    className="gen-progress-bar-fill"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, hsl(${accentHsl}/0.6), hsl(${accentHsl}), hsl(var(--primary)))`,
                    }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 opacity-60" />
                    <span className="font-medium text-foreground/80">{currentStep}</span>
                    <span className="loading-ellipsis" />
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="font-semibold" style={{ color: `hsl(${accentHsl})` }}>
                      {Math.round(progress)}%
                    </span>
                    <span>·</span>
                    <span>~{formatTime(Math.max(0, estimatedTime - elapsedSeconds))}</span>
                  </div>
                </div>

                {/* Step indicators */}
                <div className="flex items-center gap-1 mt-1">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className="h-0.5 flex-1 rounded-full transition-all duration-500"
                      style={{
                        background: i <= currentStepIndex
                          ? `hsl(${accentHsl})`
                          : "hsl(var(--border))",
                        opacity: i < currentStepIndex ? 0.5 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed — action buttons */}
            {isCompleted && generation.result_url && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <a
                  href={generation.result_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settings-pill"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View
                </a>
                <a
                  href={generation.result_url}
                  download
                  className="settings-pill"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            )}

            {/* Failed */}
            {isFailed && (
              <p className="text-xs text-destructive mt-2 leading-relaxed">
                {generation.error_message || "Generation failed. Please try again."}
              </p>
            )}
          </div>
        </div>

        {/* Result preview */}
        {isCompleted && generation.result_url && (
          <div className="mt-4 rounded-xl overflow-hidden ring-1 ring-white/8">
            {generation.type === "image" ? (
              <img
                src={generation.result_url}
                alt="Generated result"
                className="w-full max-h-64 sm:max-h-80 object-contain bg-black/30"
                loading="lazy"
              />
            ) : (
              <video
                src={generation.result_url}
                controls
                className="w-full max-h-64 sm:max-h-80 bg-black"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineGenerationCard;
