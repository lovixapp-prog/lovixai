import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Image as ImageIcon, Palette, Wand2, Sparkles, Layers } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

import styleCinematic from "@/assets/style-cinematic.jpg";
import styleArtistic from "@/assets/style-artistic.jpg";
import styleCommercial from "@/assets/style-commercial.jpg";
import styleCreative from "@/assets/style-creative.jpg";

const features = [
  { icon: <Sparkles className="w-5 h-5" />, text: "Ultra-Realistic Photography" },
  { icon: <Palette className="w-5 h-5" />, text: "Stylized Illustrations" },
  { icon: <Wand2 className="w-5 h-5" />, text: "Concept Art Generation" },
  { icon: <Layers className="w-5 h-5" />, text: "Product Shot Creation" },
  { icon: <ImageIcon className="w-5 h-5" />, text: "High-Resolution Output" },
];

const imageExamples = [
  { title: "Cinematic", style: "Cinematic", image: styleCinematic },
  { title: "Artistic", style: "Artistic", image: styleArtistic },
  { title: "Commercial", style: "Commercial", image: styleCommercial },
  { title: "Creative", style: "Creative", image: styleCreative },
];

const galleryExamples = [
  { title: "Cyberpunk City", style: "Cinematic", color: "from-cyan-500/20 to-purple-500/20" },
  { title: "Fantasy Portrait", style: "Artistic", color: "from-pink-500/20 to-orange-500/20" },
  { title: "Product Render", style: "Commercial", color: "from-blue-500/20 to-green-500/20" },
  { title: "Abstract Art", style: "Creative", color: "from-yellow-500/20 to-red-500/20" },
  { title: "Nature Scene", style: "Photorealistic", color: "from-green-500/20 to-teal-500/20" },
  { title: "Sci-Fi Character", style: "Concept", color: "from-indigo-500/20 to-pink-500/20" },
];

const ImageModel = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <PageLayout>
      <SEOHead
        title="AI Image Generator - Create Photorealistic & Artistic Images | LOVIX"
        description="Generate stunning 8K AI images from text. Ultra-realistic photography, stylized illustrations, concept art, and product shots. Best AI image generator for professionals and creators."
        keywords="AI image generator, text to image AI, AI art generator, photorealistic AI images, 8K image generation, AI illustration, concept art AI, product shot AI, Midjourney alternative, DALL-E alternative"
        canonicalPath="/image-model"
      />
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                <ImageIcon className="w-4 h-4" />
                Image Generation AI
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                LOVIX
                <br />
                <span className="gradient-text">Image Model</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Create stunning, high-resolution images from text descriptions. 
                From photorealistic renders to artistic illustrations, our AI 
                understands your vision and brings it to life with unprecedented 
                detail and accuracy.
              </p>

              {/* Features List */}
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                      {feature.icon}
                    </div>
                    <span className="text-foreground font-medium flex-1">{feature.text}</span>
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  </li>
                ))}
              </ul>

              <Link to="/dashboard">
                <button className="btn-hero-primary">
                  Try Image Generation
                </button>
              </Link>
            </div>

            {/* Image Grid Preview */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {imageExamples.map((example, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-2xl overflow-hidden border border-border/50 transition-all duration-500 cursor-pointer ${
                      hoveredIndex === index ? "scale-105 z-10 glow-soft" : ""
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <img 
                      src={example.image} 
                      alt={example.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                      <span className="font-display font-semibold text-white text-lg">{example.title}</span>
                      <span className="block text-xs text-white/70 mt-1">{example.style} Style</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 px-6 py-3 rounded-xl glass-strong">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">8K Resolution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Style Gallery
            </h2>
            <p className="text-muted-foreground">
              Explore the diverse range of styles and possibilities with LOVIX Image Model.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryExamples.map((example, index) => (
              <div
                key={index}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 transition-all duration-500 hover:border-primary/50 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${example.color}`} />
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm group-hover:bg-card/40 transition-colors" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{example.title}</h3>
                  <span className="text-sm text-muted-foreground">{example.style} Style</span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ImageModel;
