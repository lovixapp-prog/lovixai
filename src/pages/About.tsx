import { Link } from "react-router-dom";
import { Sparkles, Users, Target, Lightbulb, Globe, Award } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const values = [
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Innovation First",
    description: "We push the boundaries of what's possible with AI, constantly exploring new technologies and creative approaches."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Creator-Centric",
    description: "Every feature we build starts with creators in mind. Your success is our success."
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Quality Obsessed",
    description: "We never compromise on quality. From output resolution to user experience, excellence is our standard."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Globally Accessible",
    description: "We believe powerful creative tools should be accessible to everyone, everywhere."
  },
];

const stats = [
  { value: "10M+", label: "Creations Generated" },
  { value: "500K+", label: "Active Creators" },
  { value: "150+", label: "Countries Served" },
  { value: "99.9%", label: "Uptime" },
];

const About = () => {
  return (
    <PageLayout>
      <SEOHead
        title="About LOVIX - Leading AI Video & Image Generation Platform"
        description="LOVIX empowers 500K+ creators worldwide with cutting-edge AI technology. Create professional 4K videos, stunning images, and dynamic animations. Learn about our mission to democratize content creation."
        keywords="about LOVIX, AI company, AI video platform, content creation AI, AI technology company, creative AI tools, video generation company, AI startup"
        canonicalPath="/about"
      />
      <div className="container mx-auto px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            About LOVIX
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Empowering Creators with{" "}
            <span className="gradient-text">Next-Gen AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            We're building the future of creative content generation, making professional-quality 
            video, image, and motion creation accessible to everyone.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16 sm:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-4">
                At LOVIX, we believe that creative expression shouldn't be limited by technical skills 
                or expensive tools. Our mission is to democratize content creation by harnessing the 
                power of artificial intelligence.
              </p>
              <p className="text-muted-foreground mb-4">
                We're building AI tools that understand creative intent and translate ideas into 
                stunning visual content. Whether you're a professional filmmaker, a social media 
                creator, or someone with a story to tell, LOVIX gives you the power to bring your 
                vision to life.
              </p>
              <p className="text-muted-foreground">
                Our platform combines cutting-edge AI models with intuitive interfaces, making 
                advanced creative technology accessible to everyone.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 sm:w-24 sm:h-24 text-primary mx-auto mb-4" />
                    <span className="font-display text-2xl sm:text-3xl font-bold gradient-text">LOVIX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16 sm:mb-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="p-6 sm:p-8 rounded-2xl bg-card border border-border text-center">
                <div className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at LOVIX.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="p-6 sm:p-8 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {value.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Built by Creators, for Creators
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our team combines expertise in AI, creative technology, and user experience design. 
              We're passionate about building tools that inspire creativity and push boundaries.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 border border-border text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Join Our Journey
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              We're always looking for talented individuals who share our passion for AI and creativity.
            </p>
            <Link 
              to="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              View Open Positions
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Create?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join millions of creators using LOVIX to bring their ideas to life.
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Start Creating
          </Link>
        </section>
      </div>
    </PageLayout>
  );
};

export default About;