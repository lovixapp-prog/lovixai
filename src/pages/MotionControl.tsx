import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Wand2, Move, User, Zap, Layers } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import VideoCard from "@/components/VideoCard";
import VideoModal from "@/components/VideoModal";

const features = [
  { icon: <Move className="w-5 h-5" />, text: "Precise Movement Control" },
  { icon: <User className="w-5 h-5" />, text: "Character Animation" },
  { icon: <Layers className="w-5 h-5" />, text: "Motion Style Transfer" },
  { icon: <Zap className="w-5 h-5" />, text: "Dynamic Scene Generation" },
  { icon: <Wand2 className="w-5 h-5" />, text: "Keyframe Interpolation" },
];

const motionExamples = [
  { src: "/videos/motion-preview.mp4", title: "Dance Motion Transfer", description: "AI-driven character animation" },
  { src: "/videos/hero-video.mp4", title: "Camera Movement", description: "Cinematic camera paths" },
  { src: "/videos/showcase-video.mp4", title: "Object Animation", description: "Precise object control" },
  { src: "/videos/video-model-preview.mp4", title: "Scene Dynamics", description: "Environmental motion" },
];

const MotionControl = () => {
  const [selectedVideo, setSelectedVideo] = useState<{ src: string; title: string } | null>(null);

  return (
    <PageLayout>
      <SEOHead
        title="AI Motion Control - Transfer Motion & Animate Images | LOVIX"
        description="Advanced AI motion control technology. Transfer motion between videos, animate static images, create precise character animations and cinematic camera movements. Hollywood-quality at your fingertips."
        keywords="AI motion control, motion transfer AI, image animation AI, video motion AI, character animation AI, camera movement AI, lip sync AI, AI animation software, motion style transfer"
        canonicalPath="/motion-control"
      />
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                <Wand2 className="w-4 h-4" />
                Motion Control AI
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                LOVIX
                <br />
                <span className="gradient-text">Motion Control</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Take complete control over motion and animation in your AI-generated 
                content. Define precise movement paths, transfer motion styles between 
                subjects, and bring characters to life with natural, fluid animation.
              </p>

              {/* Features List */}
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                      {feature.icon}
                    </div>
                    <span className="text-foreground font-medium flex-1">{feature.text}</span>
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  </li>
                ))}
              </ul>

              <Link to="/dashboard">
                <button className="btn-hero-primary">
                  Try Motion Control
                </button>
              </Link>
            </div>

            {/* Preview Video */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden glow-primary">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full aspect-video object-cover"
                >
                  <source src="/videos/motion-preview.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
              
              {/* Motion path visualization */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <svg className="w-full h-20 opacity-50" viewBox="0 0 400 80">
                  <path
                    d="M 0 40 Q 100 10 200 40 T 400 40"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    className="animate-pulse"
                  />
                </svg>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 px-6 py-3 rounded-xl glass-strong">
                <div className="flex items-center gap-3">
                  <Move className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-foreground font-medium">Motion Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Motion Examples Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Motion Examples
            </h2>
            <p className="text-muted-foreground">
              See how LOVIX Motion Control transforms static content into dynamic, living scenes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {motionExamples.map((video, index) => (
              <VideoCard
                key={index}
                src={video.src}
                title={video.title}
                description={video.description}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoSrc={selectedVideo?.src || ""}
        title={selectedVideo?.title}
      />
    </PageLayout>
  );
};

export default MotionControl;
