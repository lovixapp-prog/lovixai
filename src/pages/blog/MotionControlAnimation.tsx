import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Twitter, Linkedin, Facebook, ArrowRight, Zap } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

const MotionControlAnimation = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Motion Control AI - Transfer Motion & Animate Images | LOVIX Blog"
        description="Discover LOVIX Motion Control: revolutionary AI technology that transfers motion between videos and animates static images. Learn how to create professional animations effortlessly."
        keywords="motion control AI, motion transfer technology, AI animation, image animation AI, video motion transfer, AI motion style, animate images AI, lip sync AI technology"
        canonicalPath="/blog/motion-control-animation"
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
              Product Updates
            </span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Introducing Motion Control: A New Era of AI Animation and Video Transfer
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              LOVIX Team
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              January 5, 2025
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              4 min read
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
            <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Motion Control Technology</p>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            We're thrilled to announce <strong>Motion Control</strong>, our revolutionary new feature that lets you transfer motion between videos and bring static images to life. This breakthrough in <strong>AI animation technology</strong> opens up creative possibilities that were previously impossible without expensive motion capture equipment.
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            What is Motion Control?
          </h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            <strong>Motion Control</strong> is an AI-powered feature that extracts motion patterns from reference videos and applies them to static images or other videos. Think of it as "motion transfer"—you provide a source of movement, and our AI intelligently applies that motion to your target content.
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            Key Capabilities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">🎬 Video-to-Video Transfer</h3>
              <p className="text-sm text-muted-foreground">Apply motion from one video to completely transform another</p>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">🖼️ Image Animation</h3>
              <p className="text-sm text-muted-foreground">Bring still photos and artwork to life with natural movement</p>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">🕺 Character Animation</h3>
              <p className="text-sm text-muted-foreground">Transfer human movements to animated characters</p>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">🎨 Style Preservation</h3>
              <p className="text-sm text-muted-foreground">Maintains the original visual style while adding motion</p>
            </div>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            How Motion Control Works
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Our <strong>AI motion extraction</strong> technology analyzes reference videos frame-by-frame to understand:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li><strong>Skeletal movement</strong> - Body poses and transitions</li>
            <li><strong>Camera motion</strong> - Pans, tilts, zooms, and tracking</li>
            <li><strong>Object dynamics</strong> - How objects move through space</li>
            <li><strong>Temporal patterns</strong> - Speed and rhythm of movements</li>
          </ul>

          <p className="text-muted-foreground leading-relaxed mb-6">
            This motion data is then intelligently mapped to your target image or video, creating seamless animation that respects the original content's composition and style.
          </p>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            Use Cases
          </h2>

          <h3 className="font-display text-xl font-bold text-foreground mt-8 mb-3">
            For Content Creators
          </h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li>Create dancing characters from profile photos</li>
            <li>Add cinematic camera movements to static shots</li>
            <li>Transform illustrations into animations</li>
          </ul>

          <h3 className="font-display text-xl font-bold text-foreground mt-8 mb-3">
            For Marketers
          </h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li>Animate product images for engaging ads</li>
            <li>Create dynamic social media content from static assets</li>
            <li>Produce eye-catching email marketing visuals</li>
          </ul>

          <h3 className="font-display text-xl font-bold text-foreground mt-8 mb-3">
            For Artists & Designers
          </h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li>Bring digital art to life</li>
            <li>Create animated NFTs and collectibles</li>
            <li>Prototype animations without complex software</li>
          </ul>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            Getting Started with Motion Control
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Using <strong>Motion Control</strong> is incredibly simple:
          </p>

          <ol className="list-decimal list-inside text-muted-foreground space-y-3 mb-6">
            <li><strong>Upload your reference video</strong> - This provides the motion pattern</li>
            <li><strong>Upload your target image or video</strong> - What you want to animate</li>
            <li><strong>Adjust settings</strong> - Fine-tune motion intensity and timing</li>
            <li><strong>Generate</strong> - Let our AI work its magic</li>
            <li><strong>Download</strong> - Get your animated video in seconds</li>
          </ol>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4">
            What's Next
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-6">
            We're continuously improving Motion Control with upcoming features including:
          </p>

          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
            <li>Multi-subject motion tracking</li>
            <li>Longer video support</li>
            <li>More precise motion keyframing</li>
            <li>Audio-synced motion generation</li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-primary/20 via-card to-primary/10 border border-border text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Try Motion Control Today
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Experience the future of AI animation. Upload a reference video and watch your static images come to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/motion-control">
                Try Motion Control
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/guide/motion">
                Read Motion Guide
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
            <Link to="/blog/creators-social-media" className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
              <span className="text-xs text-primary">Case Studies</span>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mt-1">How Creators Are Using LOVIX for Social Media</h4>
            </Link>
          </div>
        </div>
      </article>
    </PageLayout>
  );
};

export default MotionControlAnimation;
