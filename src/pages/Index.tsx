import { Link } from "react-router-dom";
import {
  Video, Image, Wand2, ArrowRight, Play, Zap, DollarSign, Clock,
  Sparkles, Check, Star, Users, TrendingUp, Layers, Palette, Film,
  Crown, Volume2, Monitor, Clapperboard, Music, UserCircle, Quote,
  Download, Laptop, ShoppingBag, Mic2,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import FeatureCard from "@/components/FeatureCard";
import SEOHead from "@/components/SEOHead";
import influencerPink from "@/assets/ai-influencer-pink.jpg";
import influencerSelfie from "@/assets/ai-influencer-selfie.jpg";

/* ── Reusable section badge ── */
const SectionBadge = ({
  icon,
  label,
  variant = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  variant?: "primary" | "violet" | "cyan" | "pink" | "aurora";
}) => {
  const cls =
    variant === "violet" ? "badge-violet" :
    variant === "cyan"   ? "badge-cyan" :
    variant === "aurora" ? "badge-aurora" :
    "badge-neon";
  return (
    <span className={`${cls} mb-5 inline-flex`}>
      {icon}
      {label}
    </span>
  );
};

/* ── Feature mini card ── */
const MiniFeature = ({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 transition-colors">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-foreground text-sm leading-tight mb-0.5">{title}</h4>
      <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
    </div>
  </div>
);

const Index = () => {
  return (
    <PageLayout>
      <SEOHead
        title="LOVIX - #1 AI Video Generator | Create 4K Videos, Images & Motion Free"
        description="Generate stunning AI videos, images, and animations in 4K quality. Best text-to-video AI tool for TikTok, YouTube Shorts & Instagram Reels. Free to start, no credit card required."
        keywords="AI video generator, text to video AI, AI video maker, 4K video generator, AI image generator, AI animation, motion control AI, video AI free, Sora alternative, AI content creator, TikTok video maker, YouTube Shorts AI, Instagram Reels AI, best AI video generator 2025"
        canonicalPath="/"
      />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative -mt-16 flex min-h-[92vh] items-center overflow-hidden pt-16 lg:-mt-20 lg:pt-20">

        {/* Video background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay muted loop playsInline preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/38 via-background/22 to-background/96" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/94 via-background/62 to-background/32" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, hsl(var(--background) / 0.96) 0%, hsl(var(--background) / 0.82) 40%, hsl(var(--background) / 0.34) 70%, transparent 100%)",
            }}
          />
        </div>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 z-0 grid-dot-bg opacity-20" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl space-y-7 animate-fade-in-up">

            <h1 className="font-display text-5xl font-bold leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
              AI content studio for videos, images and UGC ads
            </h1>

            {/* Sub */}
            <p className="max-w-2xl text-base font-medium leading-7 text-foreground/78 sm:text-lg">
              Describe the campaign. LOVIX turns it into creative assets, editable plans and production-ready outputs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/auth?mode=signup" className="btn-hero-primary w-full justify-center gap-2 sm:w-auto">
                <Play className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Try LOVIX free</span>
              </Link>
              <Link to="/dashboard" className="btn-hero-secondary w-full justify-center gap-2 sm:w-auto">
                Open app
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {["No credit card", "150 free credits", "Video + Image + UGC"].map(item => (
                <span key={item} className="rounded-full border border-border/80 bg-white/66 px-3 py-1.5 text-xs font-semibold text-foreground/78 backdrop-blur">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════
          FEATURE — 4K VIDEO + AUDIO
      ══════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, hsl(var(--primary)/0.05), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Video preview */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10 border-gradient border-gradient-visible">
                <video autoPlay muted loop playsInline className="w-full aspect-video object-cover">
                  <source src="/videos/hero-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold backdrop-blur-sm">
                    4K ULTRA HD
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-green-500/90 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> AUDIO
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
                style={{ background: "hsl(var(--primary)/0.18)", filter: "blur(40px)" }} />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full"
                style={{ background: "hsl(var(--violet)/0.12)", filter: "blur(50px)" }} />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <SectionBadge icon={<Video className="w-3.5 h-3.5" />} label="AI Video Generation" />
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style={{ letterSpacing: "-0.02em" }}>
                Generate 4K Videos with
                <br />
                <span className="gradient-text">Synchronized Sound</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Breathtaking cinematic videos in 4K with AI-generated audio perfectly synced.
                From ambient soundscapes to dramatic scores — all generated automatically.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <MiniFeature icon={<Monitor className="w-5 h-5 text-primary" />} title="4K Ultra HD" desc="Crystal-clear resolution" color="bg-primary/15" />
                <MiniFeature icon={<Music className="w-5 h-5 text-green-400" />} title="AI Audio Sync" desc="Sound matches visuals" color="bg-green-500/15" />
                <MiniFeature icon={<Clock className="w-5 h-5 text-blue-400" />} title="Under 5 Minutes" desc="Fast generation time" color="bg-blue-500/15" />
                <MiniFeature icon={<Clapperboard className="w-5 h-5 text-purple-400" />} title="Cinema Quality" desc="Hollywood-grade output" color="bg-purple-500/15" />
              </div>

              <Link to="/video-model" className="btn-hero-primary gap-2 w-fit">
                <Play className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Try Video Generation</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE — MOTION CONTROL
      ══════════════════════════════════════════ */}
      <section
        className="py-24 lg:py-36 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, hsl(var(--card)/0.25), transparent)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none grid-dot-bg opacity-20"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, hsl(var(--violet)/0.06), transparent 65%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Content */}
            <div className="space-y-6">
              <SectionBadge icon={<Wand2 className="w-3.5 h-3.5" />} label="Motion Control" variant="violet" />
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style={{ letterSpacing: "-0.02em" }}>
                Cinema-Quality Motion
                <br />
                <span className="gradient-text-cool">At Your Command</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Transfer motion from any reference video to your images. Control camera movements,
                character animations, and object dynamics — like having a Hollywood studio in your browser.
              </p>

              <div className="space-y-3">
                {[
                  { icon: Video, label: "Video-to-Video Transfer", desc: "Apply motion from any reference to your content" },
                  { icon: Image, label: "Image Animation", desc: "Bring static images to life with natural movement" },
                  { icon: Film, label: "Camera Control", desc: "Pan, zoom, orbit — cinematic movements made easy" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-violet/30 transition-all group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
                      style={{ background: "hsl(var(--violet)/0.14)" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "hsl(var(--violet))" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">{label}</h4>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  </div>
                ))}
              </div>

              <Link
                to="/motion-control"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm tracking-widest uppercase text-white transition-all duration-300 hover:scale-105 w-fit"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--violet-soft)))",
                  boxShadow: "0 4px 24px hsl(var(--violet)/0.28)",
                }}
              >
                <Wand2 className="w-4 h-4" />
                Explore Motion Control
              </Link>
            </div>

            {/* Video preview */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl border-gradient border-gradient-visible"
                style={{ "--grad-color": "hsl(var(--violet)/0.5)" } as React.CSSProperties}
              >
                <video autoPlay muted loop playsInline className="w-full aspect-video object-cover">
                  <source src="/videos/motion-preview.mp4" type="video/mp4" />
                </video>
                <div className="absolute top-3 right-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm text-white"
                    style={{ background: "hsl(var(--violet)/0.85)" }}
                  >
                    MOTION CONTROL
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full"
                style={{ background: "hsl(var(--violet)/0.18)", filter: "blur(40px)" }} />
              <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full"
                style={{ background: "hsl(var(--cyan)/0.12)", filter: "blur(50px)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE — AI INFLUENCER
      ══════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 60%, hsl(316 85% 62% / 0.06), transparent 55%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm"
                style={{
                  background: "hsl(316 85% 62% / 0.1)",
                  borderColor: "hsl(316 85% 62% / 0.3)",
                  color: "hsl(316 85% 62%)",
                }}
              >
                <UserCircle className="w-3.5 h-3.5" />
                NEW
                <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                AI Influencer
              </div>

              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style={{ letterSpacing: "-0.02em" }}>
                Create Your Own
                <br />
                <span className="gradient-text-fire">Virtual Influencer</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Design hyper-realistic AI influencers that create viral content 24/7. Perfect for brands,
                agencies, and creators who want to dominate social media without the drama.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <MiniFeature icon={<UserCircle className="w-5 h-5" style={{ color: "hsl(316 85% 62%)" }} />} title="Fully Customizable" desc="Gender, age, style & personality" color="bg-pink-500/15" />
                <MiniFeature icon={<Video className="w-5 h-5 text-purple-400" />} title="4K Vertical Video" desc="Optimized for TikTok & Reels" color="bg-purple-500/15" />
                <MiniFeature icon={<Volume2 className="w-5 h-5 text-blue-400" />} title="Voice & Lip-Sync" desc="Natural speech with perfect sync" color="bg-blue-500/15" />
                <MiniFeature icon={<TrendingUp className="w-5 h-5 text-green-400" />} title="Unlimited Content" desc="Create 24/7, never miss a trend" color="bg-green-500/15" />
              </div>

              <Link
                to="/ai-influencer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm tracking-widest uppercase text-white transition-all duration-300 hover:scale-105 w-fit"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(316 85% 55%), hsl(263 90% 60%))",
                  boxShadow: "0 4px 24px hsl(316 85% 55% / 0.28)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Explore AI Influencer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual */}
            <div className="relative">
              <div
                className="relative rounded-2xl overflow-hidden border p-7"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(316 85% 55% / 0.08), hsl(var(--card)), hsl(var(--violet)/0.06))",
                  borderColor: "hsl(316 85% 55% / 0.2)",
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { src: influencerPink, name: "Sophia Rose", niche: "Fashion • Lifestyle" },
                    { src: influencerSelfie, name: "Mia Travel", niche: "Travel • Adventure" },
                  ].map((inf) => (
                    <div
                      key={inf.name}
                      className="rounded-xl bg-card border border-border/50 p-3.5 hover:scale-[1.03] transition-transform duration-300 cursor-default"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3">
                        <img src={inf.src} alt={inf.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-semibold text-sm text-foreground leading-tight">{inf.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{inf.niche}</p>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-4 p-4 rounded-xl border backdrop-blur-sm"
                  style={{
                    background: "hsl(var(--background)/0.5)",
                    borderColor: "hsl(var(--border)/0.4)",
                  }}
                >
                  <div className="flex items-center justify-around text-sm">
                    {[
                      { val: "2.4M", lbl: "Followers" },
                      { val: "98%", lbl: "Engagement" },
                      { val: "∞", lbl: "Content" },
                    ].map((s) => (
                      <div key={s.lbl} className="text-center">
                        <div className="font-bold text-white text-base">{s.val}</div>
                        <div className="text-muted-foreground text-xs">{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, hsl(316 85% 55%), hsl(263 90% 60%))",
                    }}
                  >
                    NEW
                  </span>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
                style={{ background: "hsl(316 85% 55% / 0.15)", filter: "blur(50px)" }} />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full"
                style={{ background: "hsl(var(--violet)/0.12)", filter: "blur(40px)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          UGC VIDEO ADS SECTION
      ══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 80% 60%, hsl(186 85% 50% / 0.06), transparent 55%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Visual */}
            <div className="relative order-2 lg:order-1">
              <div
                className="relative rounded-2xl overflow-hidden border p-7"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--cyan)/0.08), hsl(var(--card)), hsl(var(--violet)/0.06))",
                  borderColor: "hsl(var(--cyan)/0.2)",
                }}
              >
                <div className="space-y-3">
                  {[
                    { label: "Style", value: "Authentic UGC" },
                    { label: "Product", value: "Wireless Headphones" },
                    { label: "Voice", value: "Nova · English" },
                    { label: "Format", value: "9:16 Vertical" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/40 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium text-foreground">{row.value}</span>
                    </div>
                  ))}
                  <div
                    className="mt-2 p-4 rounded-xl border text-center"
                    style={{ background: "hsl(var(--cyan)/0.06)", borderColor: "hsl(var(--cyan)/0.25)" }}
                  >
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-white text-base">225</div>
                        <div className="text-muted-foreground text-xs">Credits</div>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="text-center">
                        <div className="font-bold text-white text-base">5s</div>
                        <div className="text-muted-foreground text-xs">Video</div>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="text-center">
                        <div className="font-bold text-white text-base">HD</div>
                        <div className="text-muted-foreground text-xs">Quality</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, hsl(var(--cyan)), hsl(var(--primary)))" }}
                  >
                    NEW
                  </span>
                </div>
              </div>
              <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full"
                style={{ background: "hsl(var(--cyan)/0.12)", filter: "blur(50px)" }} />
              <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full"
                style={{ background: "hsl(var(--primary)/0.1)", filter: "blur(40px)" }} />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm"
                style={{
                  background: "hsl(var(--cyan)/0.1)",
                  borderColor: "hsl(var(--cyan)/0.3)",
                  color: "hsl(var(--cyan))",
                }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                NEW
                <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                UGC Video Ads
              </div>

              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style={{ letterSpacing: "-0.02em" }}>
                Turn Products Into
                <br />
                <span className="gradient-text-aurora">Viral UGC Ads</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Create authentic UGC-style product video ads with real-looking avatars. Add your product, pick a voice and style — get a scroll-stopping ad in minutes.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <MiniFeature icon={<ShoppingBag className="w-5 h-5 text-cyan-400" />} title="Product Library" desc="Save & reuse your products" color="bg-cyan-500/15" />
                <MiniFeature icon={<UserCircle className="w-5 h-5 text-purple-400" />} title="Custom Avatar" desc="Upload your own UGC model" color="bg-purple-500/15" />
                <MiniFeature icon={<Mic2 className="w-5 h-5 text-green-400" />} title="AI Voice" desc="10 languages, 6 voices (Pro+)" color="bg-green-500/15" />
                <MiniFeature icon={<Video className="w-5 h-5 text-primary" />} title="Lovix AI Video" desc="Vertical, square or horizontal" color="bg-primary/15" />
              </div>

              <Link
                to="/ugc-marketing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm tracking-widest uppercase text-white transition-all duration-300 hover:scale-105 w-fit"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--cyan)), hsl(var(--primary)))",
                  boxShadow: "0 4px 24px hsl(var(--cyan)/0.28)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Explore UGC Ads
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VALUE CARDS — BENTO
      ══════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none grid-line-bg opacity-100"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, hsl(var(--primary)/0.05), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionBadge icon={<Sparkles className="w-3.5 h-3.5" />} label="Why Creators Choose LOVIX" />
            <h2
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
              style={{ letterSpacing: "-0.02em" }}
            >
              Extraordinary Content.
              <br />
              <span className="gradient-text-aurora">Unbeatable Value.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Professional-grade content that would cost thousands — at a fraction of the price, in minutes instead of days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                color: "green",
                icon: <DollarSign className="w-7 h-7 text-green-400" />,
                bg: "bg-green-500/15",
                title: "90% Lower Cost",
                body: "What costs $5,000+ with production studios takes just a few credits with LOVIX. Professional quality without the professional price tag.",
                check: "Starting at just 50 credits per image",
                checkColor: "text-green-400",
                borderHover: "hover:border-green-500/35",
                glowColor: "hsl(142 70% 45% / 0.12)",
              },
              {
                color: "blue",
                icon: <Clock className="w-7 h-7 text-blue-400" />,
                bg: "bg-blue-500/15",
                title: "Minutes, Not Days",
                body: "Generate stunning videos in under 5 minutes. No waiting for production teams, no endless revision cycles. Instant creativity.",
                check: "Average generation time: 3 minutes",
                checkColor: "text-blue-400",
                borderHover: "hover:border-blue-500/35",
                glowColor: "hsl(217 91% 60% / 0.12)",
              },
              {
                color: "violet",
                icon: <Zap className="w-7 h-7" style={{ color: "hsl(var(--violet))" }} />,
                bg: "bg-violet/15",
                title: "Studio Quality",
                body: "4K resolution, cinematic effects, and professional-grade output. Content that rivals Hollywood production at indie prices.",
                check: "Up to 4K resolution output",
                checkColor: "text-violet",
                borderHover: "hover:border-violet/35",
                glowColor: "hsl(var(--violet) / 0.1)",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`group relative p-8 rounded-3xl bg-card/60 border border-border/50 ${card.borderHover} transition-all duration-400 overflow-hidden backdrop-blur-sm`}
                style={{ boxShadow: "0 0 0 1px hsl(var(--border)/0.3)" }}
              >
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none transition-opacity duration-400 opacity-0 group-hover:opacity-100"
                  style={{ background: card.glowColor, filter: "blur(40px)" }}
                />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6`}>
                    {card.icon}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">{card.title}</h3>
                  <p className="text-muted-foreground mb-5 text-sm leading-relaxed">{card.body}</p>
                  <div className={`flex items-center gap-2 ${card.checkColor} text-sm font-medium`}>
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {card.check}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE CARDS — 3 MODELS
      ══════════════════════════════════════════ */}
      <section
        className="py-24 lg:py-32"
        style={{
          background:
            "linear-gradient(180deg, transparent, hsl(var(--card)/0.25) 50%, transparent)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
              style={{ letterSpacing: "-0.02em" }}
            >
              Powerful AI Models
            </h2>
            <p className="text-muted-foreground text-lg">
              Cutting-edge AI tools designed for the next generation of content creators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            <FeatureCard
              title="AI Video Generation"
              description="Transform text prompts into stunning cinematic videos. Professional-quality content in minutes."
              videoSrc="/videos/hero-video.mp4"
              link="/video-model"
              icon={<Video className="w-5 h-5 text-primary" />}
            />
            <FeatureCard
              title="AI Image Generation"
              description="Generate photorealistic images, concept art, and illustrations with unprecedented detail."
              videoSrc="/videos/video-model-preview.mp4"
              link="/image-model"
              icon={<Image className="w-5 h-5 text-primary" />}
            />
            <FeatureCard
              title="Motion Control"
              description="Control movement and animation. Define precise motion paths and bring your characters to life."
              videoSrc="/videos/motion-preview.mp4"
              link="/motion-control"
              icon={<Wand2 className="w-5 h-5 text-primary" />}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, hsl(var(--primary)/0.04), transparent 70%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionBadge icon={<Film className="w-3.5 h-3.5" />} label="Simple Process" />
            <h2
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{ letterSpacing: "-0.02em" }}
            >
              From Idea to Reality
              <br />
              <span className="gradient-text">In 3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6 max-w-5xl mx-auto">
            {[
              { step: "01", icon: <Sparkles className="w-6 h-6" />, title: "Describe Your Vision", desc: "Write a simple text description of what you want. Be as detailed or brief as you like." },
              { step: "02", icon: <Zap className="w-6 h-6" />, title: "AI Works Its Magic", desc: "Our AI processes your prompt and generates high-quality content in minutes." },
              { step: "03", icon: <Play className="w-6 h-6" />, title: "Download & Share", desc: "Get your stunning content ready. Download in high resolution and share anywhere." },
            ].map(({ step, icon, title, desc }, i) => (
              <div key={step} className="relative text-center group">
                {/* Connector */}
                {i < 2 && (
                  <div
                    className="absolute top-10 left-1/2 w-full h-px hidden md:block pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, hsl(var(--primary)/0.25), hsl(var(--violet)/0.2))",
                    }}
                  />
                )}

                <div
                  className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--violet)/0.15))",
                    border: "1px solid hsl(var(--primary)/0.25)",
                    boxShadow: "0 8px 32px hsl(var(--primary)/0.08)",
                  }}
                >
                  <span style={{ color: "hsl(var(--primary))" }}>{icon}</span>
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                    style={{ background: "hsl(var(--primary))" }}
                  >
                    {i + 1}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground mb-2.5">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px] mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          USE CASES
      ══════════════════════════════════════════ */}
      <section
        className="py-24 lg:py-32"
        style={{ background: "linear-gradient(180deg, hsl(var(--card)/0.22), transparent)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <SectionBadge icon={<Users className="w-3.5 h-3.5" />} label="Built for Creators" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold" style={{ letterSpacing: "-0.02em" }}>
              Perfect for Every
              <br />
              <span className="gradient-text">Creative Need</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { color: "text-pink-400", bg: "bg-pink-500/10", hoverBorder: "hover:border-pink-500/35", icon: TrendingUp, title: "Social Media", desc: "Create viral content for TikTok, Instagram Reels, and YouTube Shorts in seconds." },
              { color: "text-orange-400", bg: "bg-orange-500/10", hoverBorder: "hover:border-orange-500/35", icon: Layers, title: "Marketing", desc: "Generate ads, product videos, and campaign visuals without expensive production." },
              { color: "text-cyan-400", bg: "bg-cyan-500/10", hoverBorder: "hover:border-cyan-500/35", icon: Palette, title: "Artists", desc: "Explore new creative directions and visualize concepts before committing hours of work." },
              { color: "text-emerald-400", bg: "bg-emerald-500/10", hoverBorder: "hover:border-emerald-500/35", icon: Film, title: "Filmmakers", desc: "Pre-visualize scenes, create B-roll, and enhance productions with AI content." },
            ].map(({ color, bg, hoverBorder, icon: Icon, title, desc }) => (
              <div
                key={title}
                className={`group p-6 rounded-2xl bg-card/70 border border-border/50 ${hoverBorder} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, hsl(var(--primary)/0.04), transparent 65%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <SectionBadge icon={<Star className="w-3.5 h-3.5" />} label="Loved by Creators" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold" style={{ letterSpacing: "-0.02em" }}>
              Join 500,000+ Creators
              <br />
              <span className="gradient-text">Already Using LOVIX</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                quote: "LOVIX transformed my content workflow. I used to spend $2000 per video with a production company. Now I create better content for a fraction of the cost.",
                author: "Sarah M.",
                role: "Content Creator, 1.2M followers",
                avatar: "from-pink-400 to-purple-500",
              },
              {
                quote: "The quality is insane. My clients can't believe these videos are AI-generated. LOVIX pays for itself 100x every single month.",
                author: "Marcus K.",
                role: "Marketing Agency Owner",
                avatar: "from-blue-400 to-cyan-500",
              },
              {
                quote: "From idea to finished video in 3 minutes. No more waiting weeks for edits. LOVIX is the future of creative content.",
                author: "Alex T.",
                role: "Indie Filmmaker",
                avatar: "from-green-400 to-emerald-500",
              },
            ].map(({ quote, author, role, avatar }) => (
              <div
                key={author}
                className="relative p-7 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm hover:border-primary/25 transition-all duration-300 hover:-translate-y-1"
              >
                <Quote
                  className="w-7 h-7 mb-4 opacity-30"
                  style={{ color: "hsl(var(--primary))" }}
                />
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground/90 text-sm leading-relaxed mb-6">{quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar} flex-shrink-0`} />
                  <div>
                    <div className="font-semibold text-foreground text-sm">{author}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING TEASER
      ══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative p-10 sm:p-14 rounded-3xl overflow-hidden border"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--card)/0.95), hsl(var(--card)))",
                borderColor: "hsl(var(--primary)/0.2)",
              }}
            >
              {/* Aurora blobs */}
              <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: "hsl(var(--primary)/0.12)", filter: "blur(60px)" }}
              />
              <div
                className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "hsl(var(--violet)/0.1)", filter: "blur(50px)" }}
              />
              {/* Gradient border top */}
              <div
                className="absolute top-0 left-8 right-8 h-px pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(var(--primary)/0.7), hsl(var(--violet)/0.5), transparent)",
                }}
              />

              <div className="relative z-10 text-center">
                <SectionBadge icon={<Crown className="w-3.5 h-3.5" />} label="Incredible Value" />
                <h2
                  className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Start Creating
                  <br />
                  <span className="gradient-text">For Less Than a Coffee</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  Generate stunning AI videos for as low as $0.50 per video. No subscriptions required —
                  pay only for what you use. Plans start at just $9/month.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/pricing" className="btn-hero-primary gap-2">
                    <span className="relative z-10">View Pricing</span>
                  </Link>
                  <Link to="/auth?mode=signup" className="btn-hero-secondary gap-2">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground/70 mt-6">
                  Free credits included when you sign up — no credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DESKTOP APP DOWNLOAD
      ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, hsl(var(--violet)/0.07), hsl(var(--primary)/0.04) 40%, transparent 70%)",
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "hsl(var(--violet)/0.08)",
              borderColor: "hsl(var(--violet)/0.25)",
              color: "hsl(var(--violet))",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Desktop App — Free Download
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text-aurora">LOVIX for Desktop</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-base sm:text-lg max-w-xl mx-auto">
            Native desktop experience. Same powerful AI tools, dedicated window, tray icon, no browser needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api/track-download?platform=win"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl font-semibold text-white no-underline transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--violet)))",
                boxShadow: "0 4px 24px hsl(var(--primary)/0.25)",
              }}
            >
              <Monitor className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <div className="text-[10px] opacity-75 uppercase tracking-wider leading-none mb-0.5">Download for</div>
                <div className="text-base font-bold leading-none">Windows</div>
              </div>
              <Download className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity ml-1" />
            </a>
            <a
              href="/api/track-download?platform=mac"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl font-semibold no-underline text-foreground transition-all duration-300 hover:scale-[1.03] border hover:border-primary/50 hover:bg-card/80"
              style={{
                background: "hsl(var(--card)/0.8)",
                borderColor: "hsl(var(--border)/0.7)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Laptop className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="text-left">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Download for</div>
                <div className="text-base font-bold leading-none">macOS</div>
              </div>
              <Download className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity ml-1" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground/50 mt-5">
            Windows 10/11 · macOS 12+ · Free · v1.0.6
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grid-dot-bg opacity-25" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, hsl(var(--violet)/0.08) 0%, hsl(var(--primary)/0.05) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2
              className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold"
              style={{ letterSpacing: "-0.025em" }}
            >
              Ready to Create
              <br />
              <span className="gradient-text-aurora">Something Amazing?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators already using LOVIX to push the boundaries of what's possible with AI-generated content.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/auth?mode=signup" className="btn-gradient gap-2">
                <Sparkles className="w-4 h-4" />
                Get Started Free
              </Link>
              <Link to="/video-model" className="btn-hero-secondary gap-2">
                View Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
