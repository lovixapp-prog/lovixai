import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  videoSrc: string;
  link: string;
  icon?: React.ReactNode;
}

const FeatureCard = ({ title, description, videoSrc, link, icon }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    videoRef.current?.pause();
  };

  return (
    <Link
      to={link}
      className="feature-card group block border-gradient"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video */}
      <div className="relative aspect-video overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          loop
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            (e.currentTarget as HTMLVideoElement).currentTime = 0.5;
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 50% 80%, hsl(var(--primary)/0.12), transparent 70%)",
          }}
        />

        {/* Icon badge */}
        {icon && (
          <div
            className={`absolute top-4 left-4 p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
              isHovered
                ? "bg-primary/25 border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                : "bg-primary/12 border-primary/25"
            }`}
          >
            {icon}
          </div>
        )}

        {/* Play hint */}
        <div
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/15 transition-all duration-300 ${
            isHovered ? "opacity-100 bg-white/12" : "opacity-0"
          }`}
        >
          <svg className="w-3 h-3 text-white ml-0.5" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 1.5l9 4.5-9 4.5V1.5z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-7">
        <h3 className="font-display text-xl font-bold text-foreground mb-2.5 flex items-center gap-2.5 leading-snug">
          {title}
          <ArrowRight
            className={`w-4 h-4 text-primary flex-shrink-0 transition-all duration-300 ${
              isHovered ? "translate-x-1 opacity-100" : "opacity-0 -translate-x-1"
            }`}
          />
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>

      {/* Bottom accent bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--violet)/0.6), hsl(var(--primary)), hsl(var(--cyan)/0.6))",
        }}
      />
    </Link>
  );
};

export default FeatureCard;
