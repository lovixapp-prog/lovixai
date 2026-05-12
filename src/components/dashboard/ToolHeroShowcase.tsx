import { Link } from "react-router-dom";
import AnimatedIconify from "@/components/ui/animated-iconify";
import styleArtistic from "@/assets/style-artistic.jpg";
import styleCinematic from "@/assets/style-cinematic.jpg";
import styleCommercial from "@/assets/style-commercial.jpg";
import influencerPink from "@/assets/ai-influencer-pink.jpg";
import influencerSelfie from "@/assets/ai-influencer-selfie.jpg";
import influencerExample from "@/assets/ai-influencer-example.jpg";

type ToolHeroVariant = "video" | "image" | "motion" | "ugc" | "influencer";

const HERO_CONFIG: Record<ToolHeroVariant, {
  eyebrow: string;
  title: string;
  description: string;
  guideHref?: string;
  guideLabel?: string;
  icon: string;
  className: string;
}> = {
  video: {
    eyebrow: "Lovix Video",
    title: "Video generator",
    description: "Create cinematic clips from a prompt or reference image, with social formats and controlled duration.",
    guideHref: "/guide/video",
    guideLabel: "Video guide",
    icon: "solar:videocamera-record-bold-duotone",
    className: "tool-identity-video",
  },
  image: {
    eyebrow: "Lovix Image",
    title: "Image studio",
    description: "Generate campaign visuals, creative concepts, and editorial images with consistent style.",
    guideHref: "/guide/image",
    guideLabel: "Image guide",
    icon: "solar:gallery-wide-bold-duotone",
    className: "tool-identity-image",
  },
  motion: {
    eyebrow: "Lovix Motion",
    title: "Motion control",
    description: "Transfer motion, animate characters, and create lip sync from video, image, or audio files.",
    guideHref: "/guide/motion",
    guideLabel: "Motion guide",
    icon: "solar:magic-stick-3-bold-duotone",
    className: "tool-identity-motion",
  },
  ugc: {
    eyebrow: "UGC Ads",
    title: "Product ad studio",
    description: "Turn a product, URL, and brief into UGC content ready for paid social campaigns.",
    icon: "solar:shop-bold-duotone",
    className: "tool-identity-ugc",
  },
  influencer: {
    eyebrow: "AI Influencer Studio",
    title: "Creator builder",
    description: "Design a reusable creator for videos, poses, motion, and consistent social content.",
    icon: "solar:user-id-bold-duotone",
    className: "tool-identity-influencer",
  },
};

const ToolMedia = ({ variant }: { variant: ToolHeroVariant }) => {
  if (variant === "image") {
    return (
      <div className="tool-identity-image-stack">
        {[styleArtistic, styleCinematic, styleCommercial].map((src, index) => (
          <img key={src} src={src} alt="" className={`tool-identity-image-card tool-identity-image-card-${index + 1}`} />
        ))}
      </div>
    );
  }

  if (variant === "influencer") {
    return (
      <div className="tool-identity-portrait-stack">
        {[influencerPink, influencerSelfie, influencerExample].map((src, index) => (
          <img key={src} src={src} alt="" className={`tool-identity-portrait tool-identity-portrait-${index + 1}`} />
        ))}
      </div>
    );
  }

  const videoSrc = variant === "motion" ? "/videos/motion-preview.mp4" : variant === "ugc" ? "/videos/video-model-preview.mp4" : "/videos/hero-video.mp4";
  const sideImage = variant === "ugc" ? styleCommercial : variant === "motion" ? influencerSelfie : styleCinematic;

  return (
    <div className="tool-identity-video-frame">
      <video src={videoSrc} className="tool-identity-video-media" autoPlay muted loop playsInline />
      <img src={sideImage} alt="" className="tool-identity-side-thumb" />
      <span className="tool-identity-play">
        <AnimatedIconify icon="solar:play-bold" className="h-5 w-5" />
      </span>
    </div>
  );
};

export default function ToolHeroShowcase({ variant, compact = false }: { variant: ToolHeroVariant; compact?: boolean }) {
  const config = HERO_CONFIG[variant];

  return (
    <section className={`tool-identity-hero ${config.className} ${compact ? "tool-identity-hero-compact" : ""}`}>
      <div className="tool-identity-copy">
        <div className="tool-identity-eyebrow">
          <AnimatedIconify icon={config.icon} className="h-4 w-4" />
          <span>{config.eyebrow}</span>
        </div>
        <h1>{config.title}</h1>
        <p>{config.description}</p>
        {config.guideHref && (
          <Link to={config.guideHref} className="tool-identity-guide">
            <AnimatedIconify icon="solar:notebook-bookmark-bold-duotone" className="h-4 w-4" />
            {config.guideLabel}
          </Link>
        )}
      </div>
      <ToolMedia variant={variant} />
    </section>
  );
}
