import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar, ArrowRight, User } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const blogPosts = [
  {
    title: "The Future of AI Video Generation",
    excerpt: "Explore how AI is revolutionizing video creation and what it means for content creators worldwide.",
    category: "Industry Insights",
    date: "Jan 10, 2025",
    author: "LOVIX Team",
    readTime: "5 min read",
    featured: true,
    href: "/blog/future-ai-video"
  },
  {
    title: "10 Tips for Better AI Video Prompts",
    excerpt: "Master the art of prompt engineering to get consistently stunning results from AI video generation.",
    category: "Tutorials",
    date: "Jan 8, 2025",
    author: "LOVIX Team",
    readTime: "8 min read",
    featured: false,
    href: "/blog/ai-video-prompts"
  },
  {
    title: "Introducing Motion Control: A New Era of Animation",
    excerpt: "Learn about our latest feature that lets you transfer motion between videos and images seamlessly.",
    category: "Product Updates",
    date: "Jan 5, 2025",
    author: "LOVIX Team",
    readTime: "4 min read",
    featured: false,
    href: "/blog/motion-control-animation"
  },
  {
    title: "How Creators Are Using LOVIX for Social Media",
    excerpt: "Real stories from content creators who have transformed their workflow with AI-powered tools.",
    category: "Case Studies",
    date: "Jan 3, 2025",
    author: "LOVIX Team",
    readTime: "6 min read",
    featured: false,
    href: "/blog/creators-social-media"
  },
  {
    title: "Understanding AI Image Generation Models",
    excerpt: "A deep dive into how AI image generation works and why quality matters for your projects.",
    category: "Technology",
    date: "Dec 28, 2024",
    author: "LOVIX Team",
    readTime: "10 min read",
    featured: false,
    href: "/blog/ai-image-models"
  },
  {
    title: "Best Practices for Commercial AI Content",
    excerpt: "Guidelines and considerations for using AI-generated content in commercial projects.",
    category: "Best Practices",
    date: "Dec 22, 2024",
    author: "LOVIX Team",
    readTime: "7 min read",
    featured: false,
    href: "/blog/commercial-ai-content"
  },
];

const Blog = () => {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <PageLayout>
      <SEOHead
        title="LOVIX Blog - AI Video Generation Tips, Tutorials & Industry Insights"
        description="Expert guides on AI video creation, prompt engineering, motion control, and content strategy. Learn how to create viral videos with AI. Tips for TikTok, YouTube Shorts, and Instagram Reels."
        keywords="AI video blog, AI generation tips, video prompts guide, AI content creation blog, motion control tutorial, AI video tips 2025, how to create AI videos, AI video best practices"
        canonicalPath="/blog"
        ogType="website"
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
            <BookOpen className="w-4 h-4" />
            Blog
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Insights & Updates
          </h1>
          <p className="text-lg text-muted-foreground">
            Stories, tutorials, and news from the world of AI-powered creativity.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12 sm:mb-16">
            <Link to={featuredPost.href} className="block p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-primary/10 border border-border hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                  Featured
                </span>
                <span className="text-xs text-muted-foreground">{featuredPost.category}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {featuredPost.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-2xl">
                {featuredPost.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {featuredPost.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {featuredPost.date}
                </span>
                <span>{featuredPost.readTime}</span>
              </div>
            </Link>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16">
          {regularPosts.map((post, index) => (
            <Link 
              key={index}
              to={post.href}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {post.category}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className="p-8 sm:p-12 rounded-2xl bg-card border border-border text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Subscribe to our newsletter for the latest updates, tutorials, and AI insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input 
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Blog;