import { Link } from "react-router-dom";
import { Sparkles, MapPin, Clock, ArrowRight, Heart, Zap, Users, Globe } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const benefits = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Health & Wellness",
    description: "Comprehensive health, dental, and vision coverage for you and your family."
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Flexible Work",
    description: "Remote-first culture with flexible hours. Work from anywhere in the world."
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Team Events",
    description: "Regular team retreats, virtual events, and opportunities to connect."
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Learning Budget",
    description: "Annual budget for courses, conferences, and professional development."
  },
];

const openPositions = [
  {
    title: "Senior ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Work on cutting-edge AI models for video and image generation."
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Shape the future of creative AI tools with intuitive, beautiful interfaces."
  },
  {
    title: "Full Stack Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build scalable infrastructure to power millions of AI generations."
  },
  {
    title: "Developer Advocate",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Help creators get the most out of LOVIX through content and community."
  },
  {
    title: "Customer Success Manager",
    department: "Operations",
    location: "Remote",
    type: "Full-time",
    description: "Ensure our enterprise clients achieve their creative goals with LOVIX."
  },
];

const Careers = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Careers at LOVIX - Join the AI Creative Revolution"
        description="Join LOVIX and shape the future of AI content creation. Remote-first culture, competitive benefits, and cutting-edge AI technology. View open positions."
        keywords="LOVIX careers, AI jobs, remote AI jobs, ML engineer jobs, creative AI company jobs"
        canonicalPath="/careers"
      />
      <div className="container mx-auto px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Join Our Team
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Build the Future of{" "}
            <span className="gradient-text">Creative AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Join a team of passionate innovators shaping how the world creates content. 
            We're remote-first, diverse, and driven by impact.
          </p>
        </div>

        {/* Benefits */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Why Work at LOVIX?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We take care of our team so they can focus on what matters most.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-medium text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find your next opportunity and help us empower creators worldwide.
            </p>
          </div>
          <div className="space-y-4">
            {openPositions.map((position, index) => (
              <div 
                key={index} 
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {position.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {position.department}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {position.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* No Match */}
        <section className="text-center">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 border border-border">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              Don't See the Right Role?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              We're always looking for exceptional talent. Send us your resume and let us know 
              how you'd like to contribute.
            </p>
            <a 
              href="mailto:careers@lovix.ai"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Careers;