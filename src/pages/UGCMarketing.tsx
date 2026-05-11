import { Link } from "react-router-dom";
import {
  ArrowRight, Play, ShoppingBag, Video, Sparkles, Check, Zap,
  Users, TrendingUp, Mic2, UserCircle, Film, Star, Globe, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const UGCMarketing = () => {
  return (
    <PageLayout>
      <SEOHead
        title="UGC Video Ads Generator - Create Product Video Ads with AI | LOVIX"
        description="Create authentic UGC-style product video ads with AI avatars. Add your product, choose voice and style, get a scroll-stopping ad in minutes. Lovix AI + AI voiceover."
        keywords="UGC video ads, AI product video, UGC ad generator, user generated content AI, product video ad maker, AI UGC creator, TikTok product ads, Instagram reels ads"
        canonicalPath="/ugc-marketing"
      />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, hsl(var(--cyan)/0.15), hsl(var(--primary)/0.08) 40%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 grid-line-bg opacity-30"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 backdrop-blur-sm">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 font-semibold text-sm">AI-Powered Product Ads</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-foreground">Turn Products Into</span>
              <br />
              <span className="gradient-text-aurora">Viral UGC Ads</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Authentic user-generated content style video ads — created in minutes with AI avatars, real voices, and your product at center stage.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  <Play className="w-5 h-5" />
                  Create Your First Ad
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                  Open Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">UGC</div>
                <div className="text-muted-foreground text-sm">Authentic Style</div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">10</div>
                <div className="text-muted-foreground text-sm">Languages</div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">4</div>
                <div className="text-muted-foreground text-sm">Video Styles</div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">9:16</div>
                <div className="text-muted-foreground text-sm">Social-First</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is UGC Ads */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6">
                <ShoppingBag className="w-4 h-4" />
                What is UGC Video Ads?
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                The Ad Style That<br />
                <span className="gradient-text">Actually Converts</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                UGC (User Generated Content) style ads outperform polished commercials on social media because they feel real and authentic. LOVIX lets you create that exact look — without hiring creators or filming anything.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Real-Looking Avatar</h4>
                    <p className="text-sm text-muted-foreground">Upload your own model photo or generate from text — looks like a genuine testimonial</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Mic2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">AI Voiceover + Lip-Sync</h4>
                    <p className="text-sm text-muted-foreground">Natural speech in 10 languages with perfect lip synchronization (Pro+ plans)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Product Library</h4>
                    <p className="text-sm text-muted-foreground">Save your products once, reuse them across unlimited video campaigns</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div
                className="relative rounded-2xl overflow-hidden border p-7 shadow-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--cyan)/0.08), hsl(var(--card)), hsl(var(--violet)/0.06))",
                  borderColor: "hsl(var(--cyan)/0.25)",
                  boxShadow: "0 0 60px hsl(var(--cyan)/0.08)",
                }}
              >
                <div className="space-y-3">
                  {[
                    { label: "Product", value: "Wireless Headphones" },
                    { label: "Style", value: "Authentic UGC" },
                    { label: "Voice", value: "Nova · EN" },
                    { label: "Format", value: "9:16 · 5s" },
                    { label: "Credits", value: "375 (video + voice)" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/40 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium text-foreground">{row.value}</span>
                    </div>
                  ))}
                  <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                    <span className="text-primary font-semibold text-sm">✓ Ready to post on TikTok & Reels</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-cyan-500/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/15 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Simple 4-Step Process
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ad Ready in<br />
              <span className="gradient-text">Under 5 Minutes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                n: "1",
                color: "from-cyan-500 to-cyan-500/50",
                shadow: "shadow-cyan-500/30",
                title: "Add Your Product",
                desc: "Enter product name, description, and optionally an image. Save it to your library for reuse.",
              },
              {
                n: "2",
                color: "from-primary to-primary/50",
                shadow: "shadow-primary/30",
                title: "Choose Avatar & Style",
                desc: "Upload a model photo or skip for text-to-video. Pick from 4 UGC styles: authentic, cinematic, social, storytelling.",
              },
              {
                n: "3",
                color: "from-purple-500 to-purple-500/50",
                shadow: "shadow-purple-500/30",
                title: "Write Your Script",
                desc: "Type the script your avatar will say. Choose voice, language, and enable lip-sync (Pro+).",
              },
              {
                n: "4",
                color: "from-green-500 to-green-500/50",
                shadow: "shadow-green-500/30",
                title: "Generate & Download",
                desc: "Lovix AI generates the video and applies voice lip-sync automatically. Ready to post.",
              },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg ${step.shadow}`}>
                  <span className="font-display text-2xl font-bold text-white">{step.n}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Styles */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-cyan-500/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6">
              <Layers className="w-4 h-4" />
              4 Video Styles
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Every Product,<br />
              <span className="text-cyan-400">Every Audience</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {[
              {
                color: "bg-amber-500/15 border-amber-500/30 text-amber-400",
                icon: <UserCircle className="w-7 h-7 text-amber-400" />,
                title: "Authentic",
                desc: "Natural handheld look, phone camera feel. Best for testimonials and honest reviews.",
              },
              {
                color: "bg-purple-500/15 border-purple-500/30 text-purple-400",
                icon: <Film className="w-7 h-7 text-purple-400" />,
                title: "Cinematic",
                desc: "Professional lighting, smooth camera. Premium feel for high-end brands.",
              },
              {
                color: "bg-pink-500/15 border-pink-500/30 text-pink-400",
                icon: <TrendingUp className="w-7 h-7 text-pink-400" />,
                title: "Social",
                desc: "Fast-paced, vibrant colors. TikTok & Reels aesthetic for maximum engagement.",
              },
              {
                color: "bg-blue-500/15 border-blue-500/30 text-blue-400",
                icon: <Star className="w-7 h-7 text-blue-400" />,
                title: "Storytelling",
                desc: "Personal narrative, problem-solution arc. Builds emotional connection with viewers.",
              },
            ].map((style) => (
              <div key={style.title} className={`group p-6 rounded-2xl bg-card border ${style.color.split(' ')[1]} hover:shadow-lg transition-all`}>
                <div className={`w-14 h-14 rounded-xl ${style.color.split(' ')[0]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {style.icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{style.title}</h3>
                <p className="text-sm text-muted-foreground">{style.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Perfect For
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Who Uses<br />
              <span className="gradient-text">UGC Ads</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: <ShoppingBag className="w-7 h-7 text-cyan-400" />, bg: "bg-cyan-500/15", title: "eCommerce Sellers", desc: "Amazon, Shopify, Etsy sellers who need product videos that convert browsers into buyers." },
              { icon: <TrendingUp className="w-7 h-7 text-green-400" />, bg: "bg-green-500/15", title: "Digital Marketers", desc: "Run paid social campaigns on TikTok, Meta, and YouTube with authentic-looking creatives." },
              { icon: <Globe className="w-7 h-7 text-purple-400" />, bg: "bg-purple-500/15", title: "Agencies", desc: "Produce UGC-style ads for multiple clients simultaneously — scale without hiring creators." },
              { icon: <Users className="w-7 h-7 text-blue-400" />, bg: "bg-blue-500/15", title: "D2C Brands", desc: "Build brand awareness with relatable content that feels real, not like a commercial." },
              { icon: <Star className="w-7 h-7 text-amber-400" />, bg: "bg-amber-500/15", title: "Dropshippers", desc: "Test new products quickly with fast video ads before investing in real production." },
              { icon: <Video className="w-7 h-7 text-pink-400" />, bg: "bg-pink-500/15", title: "Content Creators", desc: "Monetize your audience with sponsored-style product reviews and recommendations." },
            ].map((uc) => (
              <div key={uc.title} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className={`w-14 h-14 rounded-xl ${uc.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {uc.icon}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{uc.title}</h3>
                <p className="text-sm text-muted-foreground">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-6">
                <Check className="w-4 h-4" />
                Why UGC Ads with LOVIX
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
                All the Conversion Power,<br />
                <span className="text-green-400">None of the Overhead</span>
              </h2>

              <div className="space-y-3">
                {[
                  "No UGC creator sourcing or negotiation",
                  "No product shipping to creators",
                  "No revision cycles or missed deadlines",
                  "Consistent output quality every time",
                  "Multiple languages from a single script",
                  "Test unlimited creative angles fast",
                  "Save products once, create forever",
                  "Fraction of agency pricing",
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-foreground">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h4 className="font-display text-lg font-bold text-foreground mb-4">Credit Costs</h4>
                <div className="space-y-3">
                  {[
                    { label: "5s video (no voice)", credits: "225", color: "text-primary" },
                    { label: "10s video (no voice)", credits: "450", color: "text-primary" },
                    { label: "5s video + voice lip-sync", credits: "375", color: "text-cyan-400" },
                    { label: "10s video + voice lip-sync", credits: "650", color: "text-cyan-400" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className={`font-bold text-sm ${row.color}`}>{row.credits} cr</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">Voice requires Pro plan or higher</p>
              </div>

              <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-semibold text-foreground">10 Languages Supported</h4>
                </div>
                <p className="text-sm text-muted-foreground">English, Italian, Spanish, French, German, Portuguese, Japanese, Korean, Chinese, Arabic</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Start Creating Today
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Create Your<br />
              <span className="gradient-text">First UGC Ad?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join creators and brands using LOVIX to produce authentic product video ads at scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  <Play className="w-5 h-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/guide/ugc">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                  Read the Guide
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              150 free credits included · No credit card required
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default UGCMarketing;
