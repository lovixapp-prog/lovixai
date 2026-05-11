import { Link } from "react-router-dom";
import { ArrowRight, Play, Upload, Sparkles, Download, Zap, Clock, CreditCard, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const FreeVideo = () => {
  // Set SEO meta tags on mount
  useEffect(() => {
    document.title = "Free AI Video Generator - Create Your First Video Free | LOVIX";
    
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const description = "Create your first AI video completely free. No credit card required. Generate viral videos for TikTok, YouTube Shorts & Instagram Reels in minutes. Start now!";
    const keywords = "free AI video, AI video generator free, free text to video, create video free, AI video no credit card, free video maker AI, TikTok video free, viral video creator free";
    
    setMetaTag("description", description);
    setMetaTag("keywords", keywords);
    setMetaTag("og:title", "Free AI Video Generator - Create Your First Video Free | LOVIX", true);
    setMetaTag("og:description", description, true);
    setMetaTag("twitter:title", "Free AI Video Generator - Create Your First Video Free | LOVIX");
    setMetaTag("twitter:description", description);
  }, []);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is it really free?",
      answer: "Yes! Your first AI video is completely free. No credit card required, no hidden fees. Just sign up and start creating."
    },
    {
      question: "Do I need editing skills?",
      answer: "Not at all. Our AI handles everything. Just describe what you want, and we'll generate a ready-to-post video in minutes."
    },
    {
      question: "Can I upgrade later?",
      answer: "Absolutely. After your free video, you can choose from flexible plans that fit your creative needs. No pressure, upgrade when you're ready."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal Header with Glass Effect */}
      <header className="fixed top-0 left-0 right-0 z-[60] py-4 px-6 glass-strong">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold text-white">
            LOVIX<span className="text-primary">.</span>
          </Link>
          <Link 
            to="/auth?mode=signup" 
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/videos/showcase-video.mp4" type="video/mp4" />
          </video>
          {/* Light overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[150px] opacity-40 z-[1]" />

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Video Creation</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-xl">
              Create viral AI videos
              <br />
              <span className="gradient-text drop-shadow-lg">in minutes</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white max-w-xl mx-auto drop-shadow-lg">
              Generate your first AI video for free. 
              <span className="font-semibold"> No credit card required.</span>
            </p>

            {/* Primary CTA */}
            <div className="pt-4">
              <Link 
                to="/auth?mode=signup" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,107,0,0.4)]"
              >
                <Play className="w-5 h-5" />
                Create your free video
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* AI Badge */}
            <div className="pt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-white">This video was generated with AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <p className="text-white/50 text-sm uppercase tracking-widest">Built for</p>
            <div className="flex items-center justify-center gap-8 sm:gap-12">
              {/* TikTok */}
              <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                <span className="text-xs text-white/60">TikTok</span>
              </div>
              {/* YouTube */}
              <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-xs text-white/60">Shorts</span>
              </div>
              {/* Instagram */}
              <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span className="text-xs text-white/60">Reels</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-white/60">Three simple steps to viral content</p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div className="text-sm font-medium text-primary">Step 1</div>
              <h3 className="font-display text-xl font-semibold text-white">Upload</h3>
              <p className="text-white/60 text-sm">Describe your idea or upload a reference image</p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div className="text-sm font-medium text-primary">Step 2</div>
              <h3 className="font-display text-xl font-semibold text-white">AI generates</h3>
              <p className="text-white/60 text-sm">Our AI creates your video in minutes</p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Download className="w-7 h-7 text-primary" />
              </div>
              <div className="text-sm font-medium text-primary">Step 3</div>
              <h3 className="font-display text-xl font-semibold text-white">Download & post</h3>
              <p className="text-white/60 text-sm">Export and share directly to social</p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-primary/30 transition-colors">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold text-white mb-2">Motion-ready AI videos</h3>
              <p className="text-white/60 text-sm">Smooth, cinematic motion that looks professionally made</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-primary/30 transition-colors">
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold text-white mb-2">No editing required</h3>
              <p className="text-white/60 text-sm">Get publish-ready videos without learning complex tools</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-primary/30 transition-colors">
              <Play className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold text-white mb-2">Built for viral content</h3>
              <p className="text-white/60 text-sm">Optimized formats for TikTok, Shorts, and Reels</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Creation Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Limited Time</span>
                </div>
                
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Your first AI video is free
                </h2>

                <ul className="space-y-3 text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-3 text-white/80">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Play className="w-3 h-3 text-primary" />
                    </div>
                    <span>1 free generation</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-3 h-3 text-primary" />
                    </div>
                    <span>No credit card required</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 text-primary" />
                    </div>
                    <span>Takes less than 1 minute</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <Link 
                    to="/auth?mode=signup" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-all duration-300 hover:scale-105"
                  >
                    Start for free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-12">
              Questions? Answers.
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-white">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-white/60 transition-transform duration-300 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      openFaq === index ? 'pb-5 max-h-40' : 'max-h-0'
                    }`}
                  >
                    <p className="text-white/60">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Ready to create your first AI video?
            </h2>
            <Link 
              to="/auth?mode=signup" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,107,0,0.5)]"
            >
              <Play className="w-6 h-6" />
              Create your free video
            </Link>
            <p className="text-white/50 text-sm">No credit card required • Free to start</p>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <div className="font-display font-bold text-white/60">LOVIX</div>
            <div>© 2025 LOVIX. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FreeVideo;
