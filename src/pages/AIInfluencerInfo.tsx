import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Play, 
  UserCircle, 
  Video, 
  Sparkles, 
  Check, 
  Zap, 
  Users, 
  TrendingUp,
  Instagram,
  Clock,
  Palette,
  Mic,
  Film,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import influencerHero from "@/assets/ai-influencer-pink.jpg";
import influencerMarketing from "@/assets/influencer-marketing.jpg";
import influencerExample from "@/assets/ai-influencer-selfie.jpg";

const AIInfluencerInfo = () => {
  return (
    <PageLayout>
      <SEOHead
        title="AI Influencer Generator - Create Virtual Influencers for TikTok & Instagram | LOVIX"
        description="Create hyper-realistic AI influencers that generate viral content 24/7. 4K videos with lip-sync, custom personalities, perfect for brands and agencies. No drama, just results."
        keywords="AI influencer, virtual influencer creator, AI content creator, TikTok AI influencer, Instagram AI influencer, virtual brand ambassador, AI social media influencer, create AI influencer, digital influencer, synthetic influencer"
        canonicalPath="/ai-influencer"
      />
      {/* Hero Section */}
      <section className="relative -mt-16 min-h-screen overflow-hidden flex items-center justify-center lg:-mt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={influencerHero}
            alt="AI Influencer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/8 to-background/82" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/42 via-transparent to-black/24" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="influencer-hero-copy max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold text-sm">Revolutionary AI Technology</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-white">Create Your Own</span>
              <br />
              <span className="gradient-text">AI Influencer</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto">
              Generate ultra-realistic virtual influencers that create viral content for TikTok & Instagram — 24/7, without the drama.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  <UserCircle className="w-5 h-5" />
                  Create Your Influencer
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                  Try It Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-white">4K</div>
                <div className="text-white/70 text-sm">Video Quality</div>
              </div>
              <div className="w-px h-10 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-white">9:16</div>
                <div className="text-white/70 text-sm">Social Optimized</div>
              </div>
              <div className="w-px h-10 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-white">∞</div>
                <div className="text-white/70 text-sm">Content 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is AI Influencer */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-border">
                <img 
                  src={influencerMarketing}
                  alt="AI Influencer Marketing"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      AI POWERED
                    </div>
                    <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                      Social Ready
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
                <UserCircle className="w-4 h-4" />
                What is AI Influencer?
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Your Virtual Creator<br />
                <span className="gradient-text">That Never Sleeps</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                AI Influencer is a revolutionary tool that lets you create hyper-realistic virtual personas. Design their appearance, personality, and style — then generate unlimited video content for your social media channels.
              </p>
              
              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Fully Customizable</h4>
                    <p className="text-sm text-muted-foreground">Design every aspect — gender, age, style, personality</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">4K Video Generation</h4>
                    <p className="text-sm text-muted-foreground">Create professional vertical videos for TikTok & Reels</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Natural Voice & Lip-Sync</h4>
                    <p className="text-sm text-muted-foreground">AI-generated speech with perfect lip movements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Simple 3-Step Process
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Create Content in<br />
              <span className="text-accent">Minutes, Not Days</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              From concept to viral content — our AI handles everything.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                <span className="font-display text-3xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Design Your Influencer</h3>
              <p className="text-muted-foreground">
                Choose gender, age, ethnicity, style, and personality traits. Our AI generates a photorealistic avatar.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/30">
                <span className="font-display text-3xl font-bold text-accent-foreground">2</span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Write Your Script</h3>
              <p className="text-muted-foreground">
                Tell your influencer what to say or do. Our AI optimizes your prompt for maximum engagement.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent/50 to-green-500/50" />
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-500/50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <span className="font-display text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Generate & Post</h3>
              <p className="text-muted-foreground">
                Get your 4K vertical video in minutes. Download and post directly to TikTok, Instagram, or YouTube Shorts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Endless Possibilities
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Perfect For Every<br />
              <span className="gradient-text">Content Creator</span>
            </h2>
          </div>

          {/* Use Case Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Instagram className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Social Media Marketing</h3>
              <p className="text-sm text-muted-foreground">
                Create engaging content for brands without hiring real influencers.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Film className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Product Showcases</h3>
              <p className="text-sm text-muted-foreground">
                Demo products with a professional presenter — anytime you want.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Agency Campaigns</h3>
              <p className="text-sm text-muted-foreground">
                Scale influencer campaigns for multiple clients simultaneously.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Personal Branding</h3>
              <p className="text-sm text-muted-foreground">
                Build a consistent online presence without showing your face.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-6">
                <Check className="w-4 h-4" />
                Why Choose AI Influencer
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
                All the Benefits,<br />
                <span className="text-green-400">None of the Hassle</span>
              </h2>
              
              <div className="space-y-4">
                {[
                  "No scheduling conflicts or missed deadlines",
                  "Consistent quality every single time",
                  "Create content in any language instantly",
                  "No diva attitudes or contract negotiations",
                  "Available 24/7, 365 days a year",
                  "Fraction of the cost of real influencers",
                  "Full creative control over your content",
                  "Scale to unlimited influencers easily"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-green-500/20 border border-border">
                <img 
                  src={influencerExample}
                  alt="AI Influencer Example"
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">@ai_influencer</span>
                      <span className="text-green-400 text-sm">✓ Verified</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/70 text-sm">
                      <span>1.2M followers</span>
                      <span>•</span>
                      <span>24/7 Active</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Start Creating Today
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Build Your<br />
              <span className="gradient-text">Virtual Influencer Empire?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators and brands already using AI Influencer to dominate social media.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  <Play className="w-5 h-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                  View Pricing
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              150 free credits included • No credit card required
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default AIInfluencerInfo;
