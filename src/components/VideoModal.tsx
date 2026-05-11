import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
}

const VideoModal = ({ isOpen, onClose, videoSrc, title }: VideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      videoRef.current?.play();
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-card hover:bg-muted transition-colors z-10"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>

        {/* Video container - adapts to video's native aspect ratio */}
        <div className="rounded-2xl overflow-hidden bg-card border border-border glow-primary max-h-[80vh]">
          <video
            ref={videoRef}
            src={videoSrc}
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
            controls
            autoPlay
            loop
          />
        </div>

        {/* Title */}
        {title && (
          <h3 className="font-display text-xl font-semibold text-foreground mt-4 text-center max-w-md">
            {title}
          </h3>
        )}
      </div>
    </div>
  );
};

export default VideoModal;
