import { Link } from "react-router-dom";
import { ArrowLeft, Code, Zap, Lock, Globe, Terminal } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const ApiReference = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            <Code className="w-4 h-4" />
            Developers
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            API Reference
          </h1>
          <p className="text-lg text-muted-foreground">
            Integrate LOVIX's powerful AI generation capabilities into your applications.
          </p>
        </div>

        {/* Coming Soon Banner */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 text-center mb-12">
          <Terminal className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            API Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            We're working on a powerful API that will let you integrate LOVIX's AI generation 
            capabilities directly into your applications and workflows.
          </p>
          <a 
            href="mailto:api@lovix.ai"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Join the Waitlist
          </a>
        </div>

        {/* Planned Features */}
        <section className="mb-12">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">
            Planned Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-card border border-border">
              <Zap className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-2">Video Generation API</h3>
              <p className="text-sm text-muted-foreground">
                Generate videos programmatically from text prompts with full control over 
                duration, quality, and aspect ratio.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <Globe className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-2">Image Generation API</h3>
              <p className="text-sm text-muted-foreground">
                Create and edit images at scale with support for all style presets and 
                advanced editing capabilities.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <Lock className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-2">Secure Authentication</h3>
              <p className="text-sm text-muted-foreground">
                API keys with granular permissions, rate limiting, and usage analytics 
                for enterprise-grade security.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <Code className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-2">SDKs & Libraries</h3>
              <p className="text-sm text-muted-foreground">
                Official SDKs for Python, JavaScript, and other popular languages to 
                simplify integration.
              </p>
            </div>
          </div>
        </section>

        {/* Example Preview */}
        <section className="mb-12">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">
            API Preview
          </h2>
          <div className="rounded-xl bg-[#1a1a2e] border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#16162a] border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">example.js</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code className="text-muted-foreground">
{`import { Lovix } from '@lovix/sdk';

const client = new Lovix({ apiKey: 'your-api-key' });

// Generate a video
const video = await client.video.generate({
  prompt: 'A serene sunset over mountain peaks',
  duration: 8,
  quality: 'hd',
  aspectRatio: '16:9'
});

console.log(video.url);
// https://cdn.lovix.ai/videos/...`}
              </code>
            </pre>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
            Stay Updated
          </h2>
          <p className="text-muted-foreground mb-6">
            Be the first to know when our API launches.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="mailto:api@lovix.ai"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Request Early Access
            </a>
            <Link 
              to="/documentation"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default ApiReference;