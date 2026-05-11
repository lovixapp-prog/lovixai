import { useState } from "react";
import {
  Download,
  Trash2,
  Play,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AnimatedIconify from "@/components/ui/animated-iconify";

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

interface CreationCardProps {
  generation: Generation;
  onPreview: (gen: Generation) => void;
  onDownload: (gen: Generation) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const CreationCard = ({
  generation,
  onPreview,
  onDownload,
  onDelete,
  isDeleting,
}: CreationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "video":
        return <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className={iconClass} />;
      case "image":
        return <AnimatedIconify icon="solar:gallery-wide-bold-duotone" className={iconClass} />;
      case "motion":
        return <AnimatedIconify icon="solar:magic-stick-3-bold-duotone" className={iconClass} />;
      default:
        return <AnimatedIconify icon="solar:folder-with-files-bold-duotone" className={iconClass} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isVideo = ['video', 'motion', 'influencer-video', 'influencer-motion', 'influencer-lipsync', 'ugc', 'ugc-final'].includes(generation.type);
  const isMotion = generation.type === "motion";

  return (
    <div
      className="creation-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPreview(generation)}
    >
      {/* Gradient Border Effect */}
      <div className="creation-card-border" />

      {/* Preview Layer - uses contain to show full content */}
      <div className="creation-card-preview bg-muted/50">
        {isVideo && generation.result_url ? (
          <>
            <video
              src={generation.result_url}
              className={`w-full h-full object-contain transition-all duration-500 ${
                isHovered ? "scale-105" : "scale-100"
              }`}
              muted
              preload="auto"
              playsInline
              poster={generation.result_url + "#t=0.1"}
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                video.currentTime = 0.1;
              }}
              onLoadedData={() => setImageLoaded(true)}
              onCanPlay={() => setImageLoaded(true)}
            />
            {/* Motion Glow Indicator */}
            {isMotion && (
              <div className="absolute top-3 left-3 z-20">
                <div className="creation-motion-badge">
                  <AnimatedIconify icon="solar:magic-stick-3-bold-duotone" className="w-3 h-3" />
                  <span>Motion</span>
                </div>
              </div>
            )}
          </>
        ) : generation.result_url ? (
          <img
            src={generation.result_url}
            alt={generation.prompt || "Generated image"}
            className={`w-full h-full object-contain transition-all duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            {getIcon(generation.type)}
          </div>
        )}

        {/* Skeleton loader */}
        {!imageLoaded && generation.result_url && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Gradient Overlay */}
        <div className="creation-card-gradient" />

        {/* Hover Action Layer */}
        <div
          className={`creation-card-actions ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-3">
            {isVideo ? (
              <button
                className="creation-action-btn creation-action-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(generation);
                }}
              >
                <Play className="w-6 h-6 fill-current" />
              </button>
            ) : (
              <button
                className="creation-action-btn creation-action-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(generation);
                }}
              >
                <Eye className="w-6 h-6" />
              </button>
            )}

            <button
              className="creation-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(generation);
              }}
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              className="creation-action-btn creation-action-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(generation.id);
              }}
              disabled={isDeleting}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Play indicator for videos (visible when not hovered) */}
        {isVideo && !isHovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-14 h-14 rounded-full bg-background/30 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all duration-300">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Info Layer */}
      <div className="creation-card-info">
        <div className="flex items-center gap-2">
          <div className="creation-type-icon">{getIcon(generation.type)}</div>
          <Badge variant="outline" className="creation-type-badge">
            {generation.type === 'ugc' || generation.type === 'ugc-final' ? 'UGC Ad' : generation.type.toUpperCase()}
          </Badge>
          <span className="text-xs text-muted-foreground/70 ml-auto tracking-wide uppercase">
            {formatDate(generation.created_at)}
          </span>
        </div>

        {/* Prompt preview on hover */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isHovered ? "max-h-12 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <p className="text-xs text-muted-foreground line-clamp-2">
            {(generation.type === 'ugc' || generation.type === 'ugc-final')
              ? (generation.settings?.productName as string) || generation.prompt || 'UGC Ad'
              : generation.prompt || 'No prompt'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreationCard;
