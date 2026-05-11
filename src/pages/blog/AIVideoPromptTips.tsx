import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Twitter, Linkedin, Facebook, ArrowRight, Lightbulb } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

const AIVideoPromptTips = () => {
  return (
    <PageLayout>
      <SEOHead
        title="10 Tips for Better AI Video Prompts - Prompt Engineering Guide | LOVIX Blog"
        description="Master AI video prompt engineering with these 10 expert tips. Learn how to write prompts that generate stunning, cinematic videos every time. Improve your AI video results today."
        keywords="AI video prompts, prompt engineering tips, how to write AI prompts, video AI prompts guide, better AI prompts, AI prompt techniques, text to video prompts, Sora prompts"
        canonicalPath="/blog/ai-video-prompts"
        ogType="article"
      />
      <article className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Blog</span>
        </Link>

        {/* Article Header */}
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">
              Tutorials
            </span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            10 Tips for Better AI Video Prompts: Master the Art of Prompt Engineering
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              LOVIX Team
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              January 8, 2025
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Share:</span>
            <button className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors">
              <Twitter className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors">
              <Linkedin className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors">
              <Facebook className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative rounded-2xl overflow-hidden mb-8 sm:mb-12 aspect-video bg-gradient-to-br from-primary/20 via-card to-primary/10 flex items-center justify-center">
          <div className="text-center p-8">
            <Lightbulb className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Prompt Engineering Guide</p>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            The quality of your <strong>AI-generated videos</strong> depends heavily on how you write your prompts. <strong>Prompt engineering</strong> is both an art and a science—and mastering it can dramatically improve your results. In this comprehensive guide, we'll share 10 proven tips to help you write better <strong>video generation prompts</strong>.
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            1. Be Specific About Visual Elements
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-4">
            Vague prompts lead to unpredictable results. Instead of saying "a beautiful landscape," try:
          </p>

          <div className="p-4 rounded-xl bg-card border border-border mb-6">
            <p className="text-sm text-muted-foreground mb-2">❌ Bad prompt:</p>
            <p className="text-foreground mb-4">"A beautiful landscape"</p>
            <p className="text-sm text-muted-foreground mb-2">✅ Good prompt:</p>
            <p className="text-foreground">"A majestic mountain range at golden hour, with snow-capped peaks, pine forests in the foreground, and dramatic clouds catching the sunset light"</p>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            2. Describe Camera Movement
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong>Camera motion</strong> is crucial for dynamic videos. Include specific camera movements in your prompts:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li><strong>Tracking shot</strong> - Camera follows a subject</li>
            <li><strong>Dolly zoom</strong> - Dramatic perspective shift</li>
            <li><strong>Aerial drone shot</strong> - Sweeping overhead views</li>
            <li><strong>Slow push-in</strong> - Gradual approach to subject</li>
            <li><strong>Orbit shot</strong> - Camera circles around subject</li>
          </ul>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            3. Specify Lighting and Mood
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            <strong>Lighting descriptions</strong> dramatically affect the final output. Use terms like:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {["Golden hour", "Blue hour", "Dramatic shadows", "Soft diffused light", "Neon glow", "Cinematic lighting"].map((term) => (
              <div key={term} className="p-3 rounded-lg bg-muted text-sm text-center">{term}</div>
            ))}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            4. Reference Artistic Styles
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Mentioning specific <strong>visual styles</strong> or film references helps the AI understand your aesthetic vision:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li>"In the style of a Christopher Nolan film"</li>
            <li>"Wes Anderson symmetrical composition"</li>
            <li>"Blade Runner neo-noir aesthetic"</li>
            <li>"Studio Ghibli inspired animation"</li>
          </ul>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            5. Include Temporal Descriptions
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Describe what happens <strong>over time</strong> in your video:
          </p>

          <div className="p-4 rounded-xl bg-card border border-border mb-6">
            <p className="text-foreground">"Time-lapse of a flower blooming, starting from a tight bud and slowly opening its petals to reveal vibrant colors, with morning dew evaporating as sunlight intensifies"</p>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            6. Use Sensory Language
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Even though videos don't have sound or touch, <strong>sensory descriptions</strong> help create more immersive visuals:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li>"Gentle breeze rustling through leaves"</li>
            <li>"Heavy rain pelting against windows"</li>
            <li>"Dust particles floating in sunbeams"</li>
          </ul>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            7. Specify Resolution and Format
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Include technical specifications when they matter:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li><strong>Aspect ratio:</strong> "16:9 widescreen" or "9:16 vertical for TikTok"</li>
            <li><strong>Quality:</strong> "4K ultra HD" or "film grain texture"</li>
            <li><strong>Frame rate:</strong> "Slow motion 120fps" or "cinematic 24fps"</li>
          </ul>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            8. Layer Your Details
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Structure your prompt from general to specific:
          </p>

          <div className="p-4 rounded-xl bg-card border border-border mb-6">
            <ol className="list-decimal list-inside text-muted-foreground space-y-2">
              <li><strong>Subject:</strong> "A lone astronaut"</li>
              <li><strong>Action:</strong> "walking slowly"</li>
              <li><strong>Environment:</strong> "across a barren Martian landscape"</li>
              <li><strong>Atmosphere:</strong> "with dust storms visible on the horizon"</li>
              <li><strong>Technical:</strong> "cinematic wide shot, anamorphic lens flare"</li>
            </ol>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            9. Iterate and Refine
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Don't expect perfection on the first try. Use your initial results to <strong>refine your prompts</strong>:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li>Note what worked and what didn't</li>
            <li>Add more detail to elements that need improvement</li>
            <li>Remove terms that led to unwanted results</li>
            <li>Save successful prompts for future reference</li>
          </ul>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            10. Use Negative Prompts Wisely
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Tell the AI what you <strong>don't want</strong> to see:
          </p>

          <div className="p-4 rounded-xl bg-card border border-border mb-6">
            <p className="text-foreground">"Avoid: blurry, distorted faces, text, watermarks, low quality, oversaturated colors"</p>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            Conclusion
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Mastering <strong>AI video prompt engineering</strong> takes practice, but these tips will give you a significant head start. Remember: the more specific and descriptive your prompts, the better your results will be. Start experimenting with these techniques today and watch your AI-generated videos improve dramatically.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-primary/20 via-card to-primary/10 border border-border text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Put These Tips Into Practice
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Ready to test your prompt engineering skills? Try LOVIX's AI video generator and see the difference great prompts can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/dashboard">
                Try It Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/guide/video">
                Read Video Guide
              </Link>
            </Button>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12 sm:mt-16">
          <h3 className="font-display text-xl font-bold text-foreground mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/blog/future-ai-video" className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
              <span className="text-xs text-primary">Industry Insights</span>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mt-1">The Future of AI Video Generation</h4>
            </Link>
            <Link to="/blog/ai-image-models" className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
              <span className="text-xs text-primary">Technology</span>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mt-1">Understanding AI Image Generation Models</h4>
            </Link>
          </div>
        </div>
      </article>
    </PageLayout>
  );
};

export default AIVideoPromptTips;
