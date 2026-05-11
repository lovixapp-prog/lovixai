import { Link } from "react-router-dom";
import { ArrowLeft, Video, Clock, Maximize2, Zap, Camera, Lightbulb, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const examplePrompts = [
  {
    title: "Cinematic Nature",
    prompt: "A majestic eagle soaring through misty mountain peaks at sunrise, cinematic slow motion, dramatic lighting, 4K quality, smooth camera tracking shot following the bird",
    explanation: "Combines subject, environment, style keywords, and camera movement"
  },
  {
    title: "Product Showcase",
    prompt: "A sleek smartphone rotating slowly on a reflective black surface, studio lighting, product commercial style, subtle reflections, professional photography",
    explanation: "Product-focused with studio lighting and commercial style"
  },
  {
    title: "Urban Atmosphere",
    prompt: "Busy Tokyo street at night, neon signs reflecting on wet pavement, people walking with umbrellas, timelapse effect, cyberpunk aesthetic, rain drops visible",
    explanation: "Scene description with mood, weather, and visual style"
  },
  {
    title: "Abstract Motion",
    prompt: "Colorful paint drops falling into milk in slow motion, macro photography, vibrant colors mixing organically, mesmerizing fluid dynamics, white background",
    explanation: "Abstract concept with technical style and visual effects"
  },
  {
    title: "Character Animation",
    prompt: "A fantasy wizard casting a spell, magical particles swirling around hands, dramatic cape flowing in wind, epic fantasy lighting, cinematic wide shot",
    explanation: "Character action with visual effects and camera framing"
  },
];

const VideoGuide = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyPrompt = async (prompt: string, index: number) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PageLayout>
      <SEOHead
        title="AI Video Generation Guide - Create Stunning Videos | LOVIX"
        description="Complete guide to AI video generation. Learn prompt engineering, video settings, duration options, and pro tips for creating cinematic 4K videos with AI. Step-by-step tutorials."
        keywords="AI video guide, video prompt tutorial, how to generate AI video, video AI tips, text to video guide, AI video settings, 4K video generation guide"
        canonicalPath="/guide/video"
      />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        {/* Hero */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            <Video className="w-4 h-4" />
            Video Generation Guide
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Create Stunning AI Videos
          </h1>
          <p className="text-lg text-muted-foreground">
            Learn how to craft effective prompts and use video generation settings to create professional-quality AI videos.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">Write Your Prompt</h3>
              <p className="text-sm text-muted-foreground">Describe your video with subject, action, style, and mood</p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">Choose Settings</h3>
              <p className="text-sm text-muted-foreground">Select duration, aspect ratio, and quality level</p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-medium text-foreground mb-1">Generate</h3>
              <p className="text-sm text-muted-foreground">Click generate and wait for your video to be created</p>
            </div>
          </div>
        </section>

        {/* Prompt Composition */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Prompt Composition</h2>
          <p className="text-muted-foreground mb-6">
            A well-structured prompt includes these key elements for best results:
          </p>
          
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="subject" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">1</span>
                  </div>
                  <span className="font-medium">Subject Description</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Start with WHO or WHAT is in the video</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>"A young woman with flowing red hair"</li>
                  <li>"A sleek sports car"</li>
                  <li>"An ancient dragon"</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="action" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">2</span>
                  </div>
                  <span className="font-medium">Action & Movement</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Describe what's happening in the scene</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>"walking slowly through a forest"</li>
                  <li>"drifting around a sharp corner"</li>
                  <li>"breathing fire into the night sky"</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="style" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">3</span>
                  </div>
                  <span className="font-medium">Style Keywords</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Add visual style and quality descriptors</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["cinematic", "realistic", "dramatic", "professional", "4K quality", "slow motion", "timelapse", "vintage", "noir", "vibrant colors"].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="camera" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Camera Movement</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Specify how the camera should move</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["tracking shot", "slow zoom in", "pan left to right", "dolly forward", "aerial view", "first-person POV", "orbit around subject", "static shot"].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lighting" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Lighting & Mood</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Set the atmosphere with lighting cues</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["golden hour", "dramatic shadows", "neon lights", "soft diffused light", "harsh sunlight", "moonlit", "studio lighting", "backlit silhouette"].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Settings Guide */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Settings Guide</h2>
          
          <div className="space-y-4">
            {/* Duration */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">Duration</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium text-foreground block mb-1">4 seconds</span>
                  <span className="text-sm text-muted-foreground">Best for: Short clips, social media, quick previews</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium text-foreground block mb-1">8 seconds</span>
                  <span className="text-sm text-muted-foreground">Best for: Story sequences, product demos, balanced content</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium text-foreground block mb-1">12 seconds</span>
                  <span className="text-sm text-muted-foreground">Best for: Cinematic shots, complex scenes, narrative clips</span>
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Maximize2 className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">Aspect Ratio</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium text-foreground block mb-1">1:1 Square</span>
                  <span className="text-sm text-muted-foreground">Instagram posts, profile content, thumbnails</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium text-foreground block mb-1">16:9 Landscape</span>
                  <span className="text-sm text-muted-foreground">YouTube, presentations, cinematic content</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium text-foreground block mb-1">9:16 Portrait</span>
                  <span className="text-sm text-muted-foreground">TikTok, Instagram Reels, YouTube Shorts</span>
                </div>
              </div>
            </div>

            {/* Quality */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">Quality</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium text-foreground block mb-1">HD (1080p)</span>
                  <span className="text-sm text-muted-foreground">Standard quality, faster generation, lower credit cost. Great for drafts and social media.</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium text-foreground block mb-1">4K (2160p)</span>
                  <span className="text-sm text-muted-foreground">Maximum quality, more detail, higher credit cost. Best for final renders and professional use.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Example Prompts */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Example Prompts</h2>
          <p className="text-muted-foreground mb-6">
            Copy and customize these prompts for inspiration:
          </p>
          
          <div className="space-y-3">
            {examplePrompts.map((example, index) => (
              <div key={index} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-foreground">{example.title}</h3>
                  <button 
                    onClick={() => copyPrompt(example.prompt, index)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title="Copy prompt"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg mb-2 font-mono">
                  {example.prompt}
                </p>
                <p className="text-xs text-muted-foreground">
                  💡 {example.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Credits Table */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Credit Costs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">HD</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">4K</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">4 seconds</td>
                  <td className="py-3 px-4 text-foreground">150 credits</td>
                  <td className="py-3 px-4 text-foreground">225 credits</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">8 seconds</td>
                  <td className="py-3 px-4 text-foreground">300 credits</td>
                  <td className="py-3 px-4 text-foreground">450 credits</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">12 seconds</td>
                  <td className="py-3 px-4 text-foreground">450 credits</td>
                  <td className="py-3 px-4 text-foreground">675 credits</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Pro Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <h3 className="font-medium text-green-400 mb-2">✓ Do</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Be specific about movement and action</li>
                <li>• Include style references</li>
                <li>• Mention lighting conditions</li>
                <li>• Specify camera movements</li>
                <li>• Use reference images when possible</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <h3 className="font-medium text-red-400 mb-2">✗ Avoid</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Vague descriptions like "a nice video"</li>
                <li>• Too many conflicting styles</li>
                <li>• Overly complex multi-scene narratives</li>
                <li>• Requesting specific text or logos</li>
                <li>• Copyrighted characters or brands</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Video className="w-5 h-5" />
            Start Creating Videos
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default VideoGuide;