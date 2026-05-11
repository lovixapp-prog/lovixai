import { Link } from "react-router-dom";
import { ArrowLeft, Book, Video, Image, Wand2, Zap, Settings, CreditCard, ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const sections = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Getting Started",
    description: "Learn the basics of using LOVIX and create your first AI content.",
    links: [
      { title: "Quick Start Guide", href: "/guide/video" },
      { title: "Account Setup", href: "/settings" },
      { title: "Understanding Credits", href: "/pricing" },
    ]
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Video Generation",
    description: "Master AI video creation with prompts, settings, and best practices.",
    links: [
      { title: "Video Prompting Guide", href: "/guide/video" },
      { title: "Duration & Quality Settings", href: "/guide/video" },
      { title: "Using Reference Images", href: "/guide/video" },
    ]
  },
  {
    icon: <Image className="w-6 h-6" />,
    title: "Image Generation",
    description: "Create stunning images and learn advanced editing techniques.",
    links: [
      { title: "Image Prompting Guide", href: "/guide/image" },
      { title: "Style Presets", href: "/guide/image" },
      { title: "Image Editing", href: "/guide/image" },
    ]
  },
  {
    icon: <Wand2 className="w-6 h-6" />,
    title: "Motion Control",
    description: "Transfer motion and sync audio with our advanced motion tools.",
    links: [
      { title: "Motion Transfer Guide", href: "/guide/motion" },
      { title: "Lip Sync Tutorial", href: "/guide/motion" },
      { title: "Format Requirements", href: "/guide/motion" },
    ]
  },
];

const quickLinks = [
  { icon: <Video className="w-5 h-5" />, title: "Video Guide", href: "/guide/video", color: "text-blue-400" },
  { icon: <Image className="w-5 h-5" />, title: "Image Guide", href: "/guide/image", color: "text-green-400" },
  { icon: <Wand2 className="w-5 h-5" />, title: "Motion Guide", href: "/guide/motion", color: "text-purple-400" },
  { icon: <CreditCard className="w-5 h-5" />, title: "Pricing", href: "/pricing", color: "text-amber-400" },
  { icon: <Settings className="w-5 h-5" />, title: "Settings", href: "/settings", color: "text-pink-400" },
];

const Documentation = () => {
  return (
    <PageLayout>
      <SEOHead
        title="LOVIX Documentation - Guides for AI Video, Image & Motion Creation"
        description="Comprehensive documentation for LOVIX AI platform. Learn video generation, image creation, motion control, and AI influencer features. Step-by-step guides for all skill levels."
        keywords="LOVIX documentation, AI video guide, AI image documentation, motion control docs, AI platform help, video generation help, AI tutorial docs, LOVIX help center"
        canonicalPath="/docs"
      />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            <Book className="w-4 h-4" />
            Documentation
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Learn to Create with LOVIX
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive guides and tutorials to help you master AI content creation.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-12 sm:mb-16">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
            Quick Links
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <span className={link.color}>{link.icon}</span>
                <span className="text-sm text-foreground">{link.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 sm:mb-16">
          {sections.map((section, index) => (
            <div key={index} className="p-6 sm:p-8 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                {section.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {section.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.href}
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ArrowRight className="w-3 h-3" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 border border-border text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
            Need Help?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Can't find what you're looking for? Our support team is here to help you 
            get the most out of LOVIX.
          </p>
          <a 
            href="mailto:support@lovix.ai"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </PageLayout>
  );
};

export default Documentation;