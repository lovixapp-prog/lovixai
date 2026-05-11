import { useEffect, useState, useRef } from "react";
import { X, Clock, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AnimatedIconify from "@/components/ui/animated-iconify";
import type { Json } from "@/integrations/supabase/types";

interface Generation {
  id: string;
  type: string;
  prompt: string | null;
  status: string;
  created_at: string;
  result_url: string | null;
  error_message: string | null;
  settings?: Json | null;
}

interface GenerationProgressProps {
  userId: string;
  onComplete?: () => void;
}

const MagicStar = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);

const getEstimatedTime = (type: string, settings?: Json | null): number => {
  const s = settings as Record<string, unknown> | null;
  if (type === "influencer-video" || type === "video") {
    const duration = (s?.duration as number) || (s?.seconds as number) || 5;
    const quality = (s?.quality as string) || "standard";
    const baseTime = duration >= 10 ? 420 : 360;
    return quality === "hd" || quality === "4k" ? Math.round(baseTime * 1.3) : baseTime;
  }
  if (type === "influencer-motion" || type === "motion") {
    const quality = ((s?.quality as string) || "standard").toLowerCase();
    if (quality === "pro") return 20 * 60;
    return quality === "high" ? 7 * 60 : 6 * 60;
  }
  if (type === "image" || type === "influencer-pose") return 45;
  return 360;
};

const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Almost done…";
  if (seconds < 60) return `~${Math.ceil(seconds)}s left`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  if (secs === 0) return `~${minutes}m left`;
  return `~${minutes}m ${secs}s left`;
};

const getTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    video: "Video",
    "influencer-video": "Influencer Video",
    image: "Image",
    "influencer-pose": "Influencer Pose",
    motion: "Motion",
    "influencer-motion": "Influencer Motion",
    ugc: "UGC Ad",
    "ugc-final": "UGC Video",
  };
  return map[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const TypeIcon = ({ type }: { type: string }) => {
  if (type.includes("video") || type.includes("ugc")) return <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-3.5 h-3.5" pulse />;
  if (type.includes("image") || type.includes("pose")) return <AnimatedIconify icon="solar:gallery-wide-bold-duotone" className="w-3.5 h-3.5" pulse />;
  if (type.includes("motion")) return <AnimatedIconify icon="solar:magic-stick-3-bold-duotone" className="w-3.5 h-3.5" pulse />;
  return <AnimatedIconify icon="solar:stars-bold-duotone" className="w-3.5 h-3.5" pulse />;
};

const STALE_THRESHOLD_SECONDS = 20 * 60;

const GenerationProgress = ({ userId, onComplete }: GenerationProgressProps) => {
  const [activeGenerations, setActiveGenerations] = useState<Generation[]>([]);
  const [elapsedTime, setElapsedTime] = useState<Record<string, number>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [recentlyCompleted, setRecentlyCompleted] = useState<Generation[]>([]);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickInFlightRef = useRef(false);

  const reconcileGenerationStatus = async (gens: Generation[]) => {
    const toCheck = gens.filter((g) => g.status === "processing" || g.status === "submitted");
    await Promise.allSettled(
      toCheck.map(async (gen) => {
        if (gen.type === "motion") {
          await callAPI("check-motion-status", { generationId: gen.id }).catch(() => {});
          return;
        }
        if (gen.type === "video") {
          await callAPI("check-video-status", { generationId: gen.id }).catch(() => {});
        }
      })
    );
  };

  const fetchActiveGenerations = async (): Promise<Generation[]> => {
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["processing", "submitted"])
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    setActiveGenerations(data);
    const now = Date.now();
    setElapsedTime((prev) => {
      const updated = { ...prev };
      data.forEach((gen) => {
        if (!updated[gen.id]) {
          const createdAt = new Date(gen.created_at).getTime();
          updated[gen.id] = Math.floor((now - createdAt) / 1000);
        }
      });
      return updated;
    });
    return data;
  };

  useEffect(() => {
    void (async () => {
      const gens = await fetchActiveGenerations();
      await reconcileGenerationStatus(gens);
    })();

    const channel = supabase
      .channel("generations-progress")
      .on("postgres_changes", { event: "*", schema: "public", table: "generations", filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === "INSERT" && payload.new.status === "processing") {
          const newGen = payload.new as Generation;
          setActiveGenerations((prev) => [newGen, ...prev]);
          setElapsedTime((prev) => ({ ...prev, [newGen.id]: 0 }));
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as Generation;
          if (updated.status === "completed") {
            setRecentlyCompleted((prev) => [updated, ...prev]);
            setTimeout(() => {
              setRecentlyCompleted((prev) => prev.filter((g) => g.id !== updated.id));
            }, 4000);
            setActiveGenerations((prev) => prev.filter((gen) => gen.id !== updated.id));
            setElapsedTime((prev) => { const s = { ...prev }; delete s[updated.id]; return s; });
            onComplete?.();
          } else if (updated.status === "failed") {
            setActiveGenerations((prev) => prev.filter((gen) => gen.id !== updated.id));
            setElapsedTime((prev) => { const s = { ...prev }; delete s[updated.id]; return s; });
            onComplete?.();
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, onComplete]);

  useEffect(() => {
    if (activeGenerations.length === 0) {
      if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
      return;
    }
    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => { updated[id] = (updated[id] || 0) + 1; });
        return updated;
      });
    }, 1000);

    const tick = async () => {
      if (tickInFlightRef.current) return;
      tickInFlightRef.current = true;
      try {
        const gens = await fetchActiveGenerations();
        await reconcileGenerationStatus(gens);
      } finally { tickInFlightRef.current = false; }
    };
    pollIntervalRef.current = setInterval(() => { void tick(); }, 10000);
    void tick();
    return () => {
      clearInterval(interval);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeGenerations.length]);

  const handleDismiss = (id: string) => setDismissed((prev) => new Set([...prev, id]));

  const handleCancel = async (id: string) => {
    setCancellingIds((prev) => new Set([...prev, id]));
    try {
      const { error } = await supabase
        .from("generations")
        .update({ status: "failed", error_message: "Cancelled by user" })
        .eq("id", id)
        .eq("user_id", userId);
      if (!error) {
        setActiveGenerations((prev) => prev.filter((gen) => gen.id !== id));
        setElapsedTime((prev) => { const s = { ...prev }; delete s[id]; return s; });
      }
    } catch (e) {
      console.error("Failed to cancel generation:", e);
    } finally {
      setCancellingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const visibleGenerations = activeGenerations.filter((gen) => !dismissed.has(gen.id));
  if (visibleGenerations.length === 0 && recentlyCompleted.length === 0) return null;

  return (
    <div className="gen-progress-panel">
      {/* Completed */}
      {recentlyCompleted.map((gen) => (
        <div key={`completed-${gen.id}`} className="gen-completed-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
              <AnimatedIconify icon="solar:check-circle-bold-duotone" className="w-4 h-4" pulse />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-300 text-sm">{getTypeLabel(gen.type)} Ready!</p>
              <p className="text-xs text-green-400/70">Check My Creations</p>
            </div>
          </div>
        </div>
      ))}

      {/* Active */}
      {visibleGenerations.map((gen) => {
        const estimatedTotal = getEstimatedTime(gen.type, gen.settings);
        const elapsed = elapsedTime[gen.id] || 0;
        const remaining = Math.max(0, estimatedTotal - elapsed);
        const rawProgress = (elapsed / estimatedTotal) * 100;
        const progress = Math.min(94, rawProgress);
        const isStale = elapsed > STALE_THRESHOLD_SECONDS;
        const isCancelling = cancellingIds.has(gen.id);

        return (
          <div key={gen.id} className="gen-progress-card">
            {/* Animated top border */}
            <div className={cn(
              "h-0.5 w-full",
              isStale
                ? "bg-yellow-500/60"
                : "bg-gradient-to-r from-violet-500 via-primary to-cyan-500"
            )} style={!isStale ? { backgroundSize: '200% 100%', animation: 'border-flow 2s linear infinite' } : {}} />

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                  isStale
                    ? "bg-yellow-500/15 text-yellow-400"
                    : "bg-primary/12 text-primary"
                )}>
                  {isStale
                    ? <AlertTriangle className="w-4 h-4" />
                    : <TypeIcon type={gen.type} />}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-foreground text-sm leading-tight">
                        {getTypeLabel(gen.type)}
                        {isStale && <span className="text-yellow-400 text-[10px] ml-1.5 font-normal">(taking long…)</span>}
                      </p>
                      {gen.prompt && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                          {gen.prompt}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDismiss(gen.id)}
                      className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0 mt-0.5"
                      aria-label="Dismiss"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="gen-progress-bar-track mt-2.5">
                    <div
                      className={cn("gen-progress-bar-fill", isStale && "!bg-yellow-500 !shadow-none")}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {!isStale && <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-3 h-3 text-primary/70" spin />}
                      <Clock className="w-3 h-3" />
                      <span>{isStale ? `${Math.floor(elapsed / 60)}m elapsed` : formatTimeRemaining(remaining)}</span>
                    </div>
                    {isStale && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(gen.id)}
                        disabled={isCancelling}
                        className="h-6 px-2 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isCancelling ? <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-3 h-3" spin /> : <><XCircle className="w-3 h-3 mr-1" />Cancel</>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GenerationProgress;
