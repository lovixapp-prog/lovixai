import { Link } from "react-router-dom";
import { ArrowLeft, PlayCircle, Clock, ArrowRight, Video, Image, Wand2, Sparkles } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const tutorials = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    category: "Getting Started",
    title: "Your First AI Video in 5 Minutes",
    description: "Learn the basics of LOVIX and create your first AI-generated video from a simple text prompt.",
    duration: "5 min",
    difficulty: "Beginner",
    href: "/guide/video"
  },
  {
    icon: <Video className="w-5 h-5" />,
    category: "Video",
    title: "Mastering Video Prompts",
    description: "Deep dive into crafting effective prompts for cinematic, professional-quality video results.",
    duration: "12 min",
    difficulty: "Intermediate",
    href: "/guide/video"
  },
  {
    icon: <Video className="w-5 h-5" />,
    category: "Video",
    title: "Using Reference Images for Video",
    description: "Learn how to use reference images to guide AI video generation for consistent results.",
    duration: "8 min",
    difficulty: "Intermediate",
    href: "/guide/video"
  },
  {
    icon: <Image className="w-5 h-5" />,
    category: "Image",
    title: "Image Generation Fundamentals",
    description: "Everything you need to know about generating stunning images with AI.",
    duration: "10 min",
    difficulty: "Beginner",
    href: "/guide/image"
  },
  {
    icon: <Image className="w-5 h-5" />,
    category: "Image",
    title: "Advanced Image Editing",
    description: "Master the art of AI-powered image editing for professional-level results.",
    duration: "15 min",
    difficulty: "Advanced",
    href: "/guide/image"
  },
  {
    icon: <Wand2 className="w-5 h-5" />,
    category: "Motion",
    title: "Motion Transfer Basics",
    description: "Learn how to transfer motion from videos to static images for dynamic content.",
    duration: "10 min",
    difficulty: "Intermediate",
    href: "/guide/motion"
  },
  {
    icon: <Wand2 className="w-5 h-5" />,
    category: "Motion",
    title: "Creating Lip Sync Videos",
    description: "Step-by-step guide to synchronizing character lip movements with audio.",
    duration: "12 min",
    difficulty: "Intermediate",
    href: "/guide/motion"
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    category: "Pro Tips",
    title: "Optimizing for Social Media",
    description: "Best practices for creating AI content optimized for different social platforms.",
    duration: "8 min",
    difficulty: "All Levels",
    href: "/guide/video"
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner": return "text-green-400 bg-green-400/10";
    case "Intermediate": return "text-amber-400 bg-amber-400/10";
    case "Advanced": return "text-red-400 bg-red-400/10";
    default: return "text-blue-400 bg-blue-400/10";
  }
};

const Tutorials = () => {
  return (
    <PageLayout>
      <SEOHead
        title="LOVIX Tutorials - Learn AI Video, Image & Motion Generation"
        description="Step-by-step tutorials to master AI video generation, image creation, and motion control. From beginner to advanced, learn to create professional AI content in minutes."
        keywords="AI video tutorial, how to use AI video generator, AI image tutorial, motion control guide, AI prompting tutorial, learn AI video creation, video generation guide, AI content tutorial"
        canonicalPath="/tutorials"
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
            <PlayCircle className="w-4 h-4" />
            Tutorials
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Learn by Doing
          </h1>
          <p className="text-lg text-muted-foreground">
            Step-by-step tutorials to help you master every feature of LOVIX.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12">
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            All
          </button>
          <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Getting Started
          </button>
          <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Video
          </button>
          <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Image
          </button>
          <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Motion
          </button>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16">
          {tutorials.map((tutorial, index) => (
            <Link 
              key={index}
              to={tutorial.href}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {tutorial.icon}
                </div>
                <span className="text-xs text-muted-foreground">{tutorial.category}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {tutorial.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {tutorial.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {tutorial.duration}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                    {tutorial.difficulty}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 border border-border text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Put your new skills to practice and create stunning AI content.
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default Tutorials;