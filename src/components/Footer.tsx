import { Link } from "react-router-dom";
import { Monitor, Laptop, Download } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);

const SocialBtn = ({
  href,
  children,
  label,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-9 h-9 rounded-full flex items-center justify-center border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200 hover:bg-primary/8"
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border/30">
      {/* Aurora bg */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--violet)/0.06) 0%, hsl(var(--primary)/0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative container mx-auto px-4 lg:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand col */}
          <div className="lg:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <span className="flex items-center gap-2">
                <img src="/logo.svg" alt="LOVIX logo" width="34" height="34" className="h-8 w-8 flex-shrink-0 object-contain" />
                <span className="font-display text-lg font-extrabold text-primary">Lovix AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px]">
              Next-generation AI creative platform for video, image, and motion generation.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <SocialBtn href="https://www.youtube.com/@Lovix-ai" label="YouTube">
                <YoutubeIcon className="w-4 h-4" />
              </SocialBtn>
              <SocialBtn href="https://www.instagram.com/lovix_ai/" label="Instagram">
                <InstagramIcon className="w-4 h-4" />
              </SocialBtn>
              <SocialBtn href="https://www.tiktok.com/@lovixvideo" label="TikTok">
                <TikTokIcon className="w-4 h-4" />
              </SocialBtn>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-foreground tracking-wide">Products</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/video-model">Video Generation</FooterLink>
              <FooterLink to="/image-model">Image Generation</FooterLink>
              <FooterLink to="/motion-control">Motion Control</FooterLink>
              <FooterLink to="/ai-influencer">AI Influencer</FooterLink>
              <FooterLink to="/ugc-marketing">UGC Video Ads</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-foreground tracking-wide">Resources</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/documentation">Documentation</FooterLink>
              <FooterLink to="/api">API Reference</FooterLink>
              <FooterLink to="/tutorials">Tutorials</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
            </ul>
          </div>

          {/* Guides */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-foreground tracking-wide">Guides</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/guide/video">Video Guide</FooterLink>
              <FooterLink to="/guide/image">Image Guide</FooterLink>
              <FooterLink to="/guide/motion">Motion Guide</FooterLink>
              <FooterLink to="/guide/ugc">UGC Ads Guide</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-foreground tracking-wide">Company</h4>
            <ul className="space-y-2.5">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/careers">Careers</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
            <div className="pt-2 space-y-2">
              <h4 className="font-display text-sm font-semibold text-foreground tracking-wide">Desktop App</h4>
              <a
                href="/api/track-download?platform=win"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Windows</span>
                <Download className="w-3 h-3 ml-auto opacity-50" />
              </a>
              <a
                href="/api/track-download?platform=mac"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>macOS</span>
                <Download className="w-3 h-3 ml-auto opacity-50" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 relative">
          {/* Gradient separator */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--border)/0.6) 20%, hsl(var(--border)/0.6) 80%, transparent)",
            }}
          />
          <div
            className="absolute top-0 left-1/4 right-1/4 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--violet)/0.35), hsl(var(--primary)/0.3), hsl(var(--cyan)/0.25), transparent)",
              filter: "blur(1px)",
            }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/70">
            <span>© 2026 LOVIX. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "hsl(var(--primary))", boxShadow: "0 0 6px hsl(var(--primary)/0.6)" }}
              />
              <span>Powered by Lovix AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
