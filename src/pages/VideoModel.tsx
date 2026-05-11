import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Play, Camera, Sparkles, Film, Layers, ArrowRight, Volume2, Monitor, Clock } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import VideoCard from "@/components/VideoCard";
import VideoModal from "@/components/VideoModal";

const features = [
  { icon: <Sparkles className="w-5 h-5" />, text: "Text to Video Generation" },
  { icon: <Camera className="w-5 h-5" />, text: "Image to Video Transformation" },
  { icon: <Layers className="w-5 h-5" />, text: "Advanced Style Control" },
  { icon: <Film className="w-5 h-5" />, text: "Camera Movement Simulation" },
  { icon: <Play className="w-5 h-5" />, text: "Cinematic Realism Engine" },
];

const videoExamples = [
  { src: "/videos/hero-video.mp4", title: "Cinematic Landscape", tags: ["#cinematic", "#landscape"] },
  { src: "/videos/video-model-preview.mp4", title: "Dynamic Motion", tags: ["#motion", "#ai-video"] },
  { src: "/videos/motion-preview.mp4", title: "Character Animation", tags: ["#character", "#animation"] },
  { src: "/videos/showcase-video.mp4", title: "Product Visualization", tags: ["#product", "#3d"] },
];

const VideoModel = () => {
  const [selectedVideo, setSelectedVideo] = useState<{ src: string; title: string } | null>(null);

  return (
    <PageLayout>
      <SEOHead
        title="AI Video Generator - Create 4K Cinematic Videos from Text | LOVIX"
        description="Generate professional 4K AI videos from text prompts or images. Text-to-video, image-to-video, camera simulation, and cinematic effects. Best Sora alternative. Try free today."
        keywords="AI video generator, text to video AI, image to video AI, 4K video generation, AI movie maker, cinematic AI video, Sora alternative, video AI model, professional AI video, text to video free"
        canonicalPath="/video-model"
      />

      {/* Hero */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        {/* Aurora blobs */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "hsl(var(--primary)/0.1)", filter: "blur(100px)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[400px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "hsl(var(--violet)/0.08)", filter: "blur(80px)" }}
        />
        <div className="absolute inset-0 grid-dot-bg opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Content */}
            <div className="space-y-7 animate-fade-in-up">
              <span className="badge-neon">
                <Play className="w-3.5 h-3.5" />
                Video Generation AI
              </span>

              <h1
                className="font-display font-bold leading-tight"
                style={{ letterSpacing: "-0.025em" }}
              >
                <span className="text-4xl md:text-5xl lg:text-6xl text-foreground block">LOVIX</span>
                <span className="text-4xl md:text-5xl lg:text-6xl gradient-text block">Video Model</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Generate breathtaking, realistic AI videos from simple text prompts,
                reference images, or existing footage. Our advanced neural networks
                understand context, motion, and cinematic principles to deliver
                professional-quality results.
              </p>

              {/* Features */}
              <ul className="space-y-2.5">
                {features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/12 text-primary flex items-center justify-center flex-shrink-0">
                      {f.icon}
                    </div>
                    <span className="text-foreground font-medium text-sm flex-1">{f.text}</span>
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  </li>
                ))}
              </ul>

              {/* Stats row */}
              <div className="flex flex-wrap gap-5 pt-1">
                {[
                  { icon: <Monitor className="w-4 h-4" />, val: "4K Ultra HD", color: "text-primary" },
                  { icon: <Volume2 className="w-4 h-4" />, val: "AI Audio", color: "text-green-400" },
                  { icon: <Clock className="w-4 h-4" />, val: "Under 5 min", color: "text-blue-400" },
                ].map(({ icon, val, color }) => (
                  <div key={val} className={`flex items-center gap-1.5 text-sm font-semibold ${color}`}>
                    {icon}
                    {val}
                  </div>
                ))}
              </div>

              <Link to="/dashboard" className="btn-hero-primary gap-2 w-fit">
                <Play className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Try Video Generation</span>
              </Link>
            </div>

            {/* Preview */}
            <div className="relative">
              <div
                className="relative rounded-2xl overflow-hidden border border-gradient border-gradient-visible"
                style={{ boxShadow: "0 0 60px hsl(var(--primary)/0.15), 0 20px 60px hsl(var(--background)/0.5)" }}
              >
                <video autoPlay muted loop playsInline className="w-full aspect-video object-cover">
                  <source src="/videos/video-model-preview.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent pointer-events-none" />
                {/* Quality badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm bg-primary/90 text-primary-foreground">
                    GOOGLE VEO 2
                  </span>
                </div>
              </div>

              {/* Floating status */}
              <div
                className="absolute -bottom-5 -right-5 px-5 py-3 rounded-xl glass-strong flex items-center gap-3 border"
                style={{ borderColor: "hsl(var(--border)/0.5)" }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-foreground font-semibold text-sm">AI Processing</span>
              </div>

              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                style={{ background: "hsl(var(--primary)/0.12)", filter: "blur(40px)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, transparent, hsl(var(--card)/0.2) 50%, transparent)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              AI-Generated Examples
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore what's possible with LOVIX Video Model.
              Click any video to view full screen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {videoExamples.map((video, i) => (
              <VideoCard
                key={i}
                src={video.src}
                title={video.title}
                tags={video.tags}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/dashboard" className="btn-hero-primary gap-2">
              <ArrowRight className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Start Generating Now</span>
            </Link>
          </div>
        </div>
      </section>

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoSrc={selectedVideo?.src || ""}
        title={selectedVideo?.title}
      />
    </PageLayout>
  );
};

export default VideoModel;
