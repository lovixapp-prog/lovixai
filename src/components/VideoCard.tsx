import { useState, useRef } from "react";
import { Play, Pause, Maximize2 } from "lucide-react";

interface VideoCardProps {
  src: string;
  title: string;
  description?: string;
  tags?: string[];
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3";
  autoPlayOnHover?: boolean;
  showControls?: boolean;
  onClick?: () => void;
}

const VideoCard = ({
  src,
  title,
  description,
  tags,
  aspectRatio = "16:9",
  autoPlayOnHover = true,
  showControls = true,
  onClick,
}: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const aspectClasses = {
    "16:9": "aspect-video",
    "9:16": "aspect-[9/16]",
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]",
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (autoPlayOnHover && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (autoPlayOnHover && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className="video-card group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className={`relative ${aspectClasses[aspectRatio]} bg-muted/30`}>
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="auto"
          poster={src + "#t=0.5"}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            video.currentTime = 0.5;
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

        {/* Play button */}
        {showControls && (
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center transition-transform duration-300 hover:scale-110 glow-primary"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-primary-foreground" />
              ) : (
                <Play className="w-6 h-6 text-primary-foreground ml-1" />
              )}
            </button>
          </div>
        )}

        {/* Expand icon */}
        {onClick && (
          <button
            className={`absolute top-4 right-4 p-2 rounded-lg bg-background/50 backdrop-blur-sm transition-opacity duration-300 z-20 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Maximize2 className="w-4 h-4 text-foreground" />
          </button>
        )}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 z-20">
          <h3 className="font-display text-lg lg:text-xl font-semibold text-foreground mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {description}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
