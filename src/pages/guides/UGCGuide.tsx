import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Mic2, UserCircle, Video, Zap, Check, Copy, Globe, Layers } from "lucide-react";
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const exampleScripts = [
  {
    title: "Product Review",
    script: "Okay I need to talk about this [product name] because it completely changed my routine. I was skeptical at first but after using it for two weeks I can honestly say it's worth every penny. The [key feature] is incredible and it actually works. I recommend this to everyone.",
    explanation: "Conversational tone, personal story, specific feature mention",
  },
  {
    title: "Problem-Solution",
    script: "If you're struggling with [problem], you need to hear this. I tried everything — nothing worked. Then I found [product name] and within [timeframe] the results were insane. It [solves problem] without [common pain point]. This is the one.",
    explanation: "Problem-agitate-solve format, strong hook, transformation story",
  },
  {
    title: "Quick Demo",
    script: "Watch this. [product name] does [action] in literally [time]. I use this every single day. You just [step 1], then [step 2], and done. It's that simple. Link in bio if you want one.",
    explanation: "Short, demo-focused, social proof via daily use, strong CTA",
  },
  {
    title: "Unboxing",
    script: "Just got my [product name] and the packaging alone had me impressed. Look at this quality. [Feature 1], [feature 2], and it even comes with [bonus]. For the price point this is honestly unbeatable. Already recommended it to three friends.",
    explanation: "Builds anticipation, mentions value, social proof via recommendations",
  },
];

const UGCGuide = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyScript = async (script: string, index: number) => {
    await navigator.clipboard.writeText(script);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PageLayout>
      <SEOHead
        title="UGC Video Ads Guide - How to Create Product Ads | LOVIX"
        description="Complete guide to creating authentic UGC product video ads with LOVIX. Learn script writing, avatar setup, voice options, styles, and pro tips for high-converting ads."
        keywords="UGC ads guide, product video tutorial, UGC script writing, AI product ad guide, UGC creator tips, TikTok ad guide"
        canonicalPath="/guide/ugc"
      />

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
            <ShoppingBag className="w-3.5 h-3.5" />
            UGC Video Ads Guide
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How to Create High-Converting UGC Ads
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to know to create authentic product video ads with LOVIX — from script writing to voice setup to video styles.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Video className="w-5 h-5 text-primary" />, label: "Video", value: "5s or 10s" },
            { icon: <Globe className="w-5 h-5 text-cyan-400" />, label: "Languages", value: "10" },
            { icon: <Layers className="w-5 h-5 text-purple-400" />, label: "Styles", value: "4" },
            { icon: <Mic2 className="w-5 h-5 text-green-400" />, label: "Voices", value: "6 (Pro+)" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <div className="font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Section: Getting Started */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            Getting Started
          </h2>

          <div className="space-y-4">
            {[
              { n: 1, title: "Add Your Product", desc: "Click \"Add Product\" in the product panel. Enter the name, description, and optionally a website URL. Products are saved to your library — reuse across unlimited campaigns without re-entering details." },
              { n: 2, title: "Choose or Upload an Avatar", desc: "For best results, upload a photo of a real person (model, yourself, stock photo). The AI animates this image into a speaking video. Without an avatar, LOVIX generates a UGC-style video from text alone." },
              { n: 3, title: "Write Your Script", desc: "Keep it under 100 words for a 5s video, 200 words for 10s. Write naturally — conversational language works better than formal copy for UGC style." },
              { n: 4, title: "Configure Settings", desc: "Pick style, format, duration. Enable voice on Pro+ plans to get AI speech with lip-sync. Choose language and voice model. Hit Generate." },
            ].map((step) => (
              <div key={step.n} className="flex gap-4 p-5 rounded-xl bg-card border border-border">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Video Styles */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            Video Styles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "Authentic", color: "border-amber-500/30 bg-amber-500/5", badge: "bg-amber-500/20 text-amber-400", desc: "Natural handheld camera, real-person feel. Best for reviews, testimonials, and trust-building content. Highest conversion for cold audiences." },
              { name: "Cinematic", color: "border-purple-500/30 bg-purple-500/5", badge: "bg-purple-500/20 text-purple-400", desc: "Professional lighting and smooth movement. Use for premium products, luxury brands, or retargeting warm audiences who already know your brand." },
              { name: "Social", color: "border-pink-500/30 bg-pink-500/5", badge: "bg-pink-500/20 text-pink-400", desc: "Fast-paced, vibrant, TikTok-native aesthetic. Best for impulse-buy products, trending items, and younger demographics." },
              { name: "Storytelling", color: "border-blue-500/30 bg-blue-500/5", badge: "bg-blue-500/20 text-blue-400", desc: "Personal narrative with problem-solution arc. Great for wellness, beauty, lifestyle products where the transformation story drives purchases." },
            ].map((s) => (
              <div key={s.name} className={`p-5 rounded-xl border ${s.color}`}>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-3 ${s.badge}`}>{s.name}</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Script Templates */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
            </div>
            Script Templates
          </h2>
          <p className="text-muted-foreground mb-6">Copy these templates and replace the bracketed placeholders with your product details.</p>

          <div className="space-y-4">
            {exampleScripts.map((ex, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
                  <span className="font-semibold text-foreground text-sm">{ex.title}</span>
                  <button
                    onClick={() => copyScript(ex.script, i)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === i ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-foreground font-mono leading-relaxed bg-background/50 rounded-lg p-3 mb-3 border border-border/30">
                    "{ex.script}"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-primary font-semibold">Why it works:</span> {ex.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Voice & Lip-Sync */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Mic2 className="w-4 h-4 text-green-400" />
            </div>
            Voice & Lip-Sync (Pro+)
          </h2>

          <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20 mb-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enabling voice generates AI speech from your script, then applies Lovix AI lip-sync to make the avatar's mouth move in perfect sync. Requires <span className="text-green-400 font-semibold">Pro plan or higher</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-card border border-border">
              <h4 className="font-semibold text-foreground mb-3">Available Voices</h4>
              <div className="space-y-2">
                {[
                  { name: "Nova", desc: "Warm, friendly female" },
                  { name: "Alloy", desc: "Neutral, professional" },
                  { name: "Echo", desc: "Smooth male" },
                  { name: "Onyx", desc: "Deep, authoritative male" },
                  { name: "Shimmer", desc: "Bright, energetic female" },
                  { name: "Fable", desc: "Expressive, storytelling" },
                ].map((v) => (
                  <div key={v.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{v.name}</span>
                    <span className="text-muted-foreground">{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border">
              <h4 className="font-semibold text-foreground mb-3">Languages</h4>
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                {["English", "Italian", "Spanish", "French", "German", "Portuguese", "Japanese", "Korean", "Chinese", "Arabic"].map((l) => (
                  <div key={l} className="flex items-center gap-1.5 text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border">
            <h4 className="font-semibold text-foreground mb-3">Credit Cost with Voice</h4>
            <div className="space-y-2 text-sm">
              {[
                { label: "5s video + voice", credits: "225 + 150 = 375 credits" },
                { label: "10s video + voice", credits: "450 + 200 = 650 credits" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-semibold text-foreground">{r.credits}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Pro Tips */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            Pro Tips for Better Conversions
          </h2>

          <div className="space-y-3">
            {[
              { tip: "Use real photos for avatars", detail: "Uploading a clear face photo produces far more realistic and trustworthy-looking video than text-to-video alone." },
              { tip: "Hook in the first 2 seconds", detail: "Start scripts with a bold statement, question, or problem. Viewers decide in 2s whether to keep watching." },
              { tip: "Keep scripts short and punchy", detail: "Under 80 words for 5s video. Longer scripts get cut off or rushed. Tight copy converts better." },
              { tip: "Match style to product type", detail: "Authentic = consumables & wellness. Cinematic = tech & luxury. Social = fashion & impulse buys. Storytelling = transformation products." },
              { tip: "Test multiple voices", detail: "Nova works for most products. For male-skewing audiences, try Echo or Onyx. For energetic products, Shimmer stands out." },
              { tip: "Save your best products", detail: "Build your product library early. Saved products speed up campaign creation from 5 minutes to under 1 minute." },
            ].map((t, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">{t.tip} — </span>
                  <span className="text-sm text-muted-foreground">{t.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">FAQ</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: "Do I need an avatar image to use UGC Ads?", a: "No. Without an avatar, Lovix AI generates a UGC-style video from text alone. Adding an avatar photo gives more realistic, face-forward results but is optional." },
              { q: "What image format works best for avatars?", a: "JPG or PNG, at least 512×512px. Clear face photo with good lighting, looking straight or slightly toward camera. Avoid sunglasses or heavy occlusion." },
              { q: "Can I use voice without a subscription?", a: "No. Voice (AI speech + lip-sync) requires a Pro plan or higher. The video itself can be generated with free credits, but voice adds the subscription gate." },
              { q: "How long does generation take?", a: "5s video: approximately 2–4 minutes. 10s video: 4–8 minutes. With voice lip-sync, add another 2–3 minutes for the second processing stage." },
              { q: "Can I save multiple products?", a: "Yes. Products are saved to your account in Supabase. You can add, edit, or delete them from the product panel. No limit on saved products." },
              { q: "What aspect ratio should I use for TikTok?", a: "9:16 vertical for TikTok, Reels, and YouTube Shorts. 1:1 for Instagram feed. 16:9 for YouTube ads and Facebook video." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-5 bg-card">
                <AccordionTrigger className="font-semibold text-foreground text-sm py-4 hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center border"
          style={{
            background: "linear-gradient(135deg, hsl(var(--cyan)/0.08), hsl(var(--card)), hsl(var(--primary)/0.05))",
            borderColor: "hsl(var(--cyan)/0.2)",
          }}
        >
          <ShoppingBag className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Ready to Create Your First UGC Ad?</h3>
          <p className="text-muted-foreground mb-6">Open the dashboard and go to the UGC Ads tab to get started.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, hsl(var(--cyan)), hsl(var(--primary)))" }}
          >
            Open UGC Ads
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default UGCGuide;
