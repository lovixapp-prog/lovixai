import { Link } from "react-router-dom";
import { ArrowLeft, Image, Palette, Wand2, Layers, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const generationPrompts = [
  {
    title: "Photorealistic Portrait",
    prompt: "A professional headshot of a confident businesswoman in her 30s, soft studio lighting, shallow depth of field, neutral gray background, high-end fashion magazine style, 8K quality",
    style: "Photo"
  },
  {
    title: "Fantasy Landscape",
    prompt: "An enchanted forest at twilight with glowing mushrooms, floating fireflies, ancient twisted trees, mystical fog, vibrant purple and teal color palette, digital painting style, highly detailed",
    style: "Artistic"
  },
  {
    title: "Anime Character",
    prompt: "A young anime hero with spiky blue hair, determined expression, wearing futuristic armor, dynamic action pose, energy effects around hands, vibrant colors, detailed shading, anime key visual style",
    style: "Anime"
  },
  {
    title: "Product Render",
    prompt: "A premium wireless headphone floating in space, sleek matte black finish with rose gold accents, dramatic rim lighting, reflective surface below, professional product photography, ultra detailed",
    style: "3D"
  },
];

const editingPrompts = [
  {
    title: "Style Change",
    prompt: "Transform this into a watercolor painting style with soft edges and flowing colors",
    explanation: "Changes the artistic style while preserving composition"
  },
  {
    title: "Add Elements",
    prompt: "Add a golden sunset sky in the background with dramatic clouds",
    explanation: "Adds new elements to existing image"
  },
  {
    title: "Color Adjustment",
    prompt: "Make the overall mood warmer with orange and amber tones, increase contrast",
    explanation: "Adjusts color grading and atmosphere"
  },
  {
    title: "Remove & Replace",
    prompt: "Remove the background and replace with a minimalist studio setting",
    explanation: "Replaces specific parts of the image"
  },
];

const styleDescriptions = [
  {
    id: "none",
    name: "Default",
    description: "Natural AI interpretation without style bias. Best for when you want full control through your prompt.",
    bestFor: "Custom styles, mixed approaches, experimental creations"
  },
  {
    id: "photorealistic",
    name: "Photo",
    description: "Ultra-realistic photography style with natural lighting, proper depth of field, and photographic qualities.",
    bestFor: "Portraits, products, architecture, nature photography"
  },
  {
    id: "artistic",
    name: "Artistic",
    description: "Painterly and expressive style with visible brushstrokes, creative interpretation, and artistic flair.",
    bestFor: "Illustrations, concept art, fine art, book covers"
  },
  {
    id: "anime",
    name: "Anime",
    description: "Japanese animation style with characteristic features, vibrant colors, and cel-shaded look.",
    bestFor: "Characters, scenes, manga-style art, visual novels"
  },
  {
    id: "3d",
    name: "3D",
    description: "Cinematic CGI quality with professional lighting, realistic materials, and depth.",
    bestFor: "Products, characters, environments, game assets"
  },
];

const ImageGuide = () => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyPrompt = async (prompt: string, id: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PageLayout>
      <SEOHead
        title="AI Image Generation Guide - Create Stunning Images | LOVIX"
        description="Complete guide to AI image generation. Learn prompt techniques, style presets, and editing features for creating photorealistic portraits, fantasy art, and product renders."
        keywords="AI image guide, image generation tutorial, AI art prompts, photorealistic AI, style presets guide, AI image editing"
        canonicalPath="/guide/image"
      />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        {/* Hero */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            <Image className="w-4 h-4" />
            Image Generation Guide
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Create & Edit AI Images
          </h1>
          <p className="text-lg text-muted-foreground">
            Master the art of prompt writing and image editing to create stunning visuals with AI.
          </p>
        </div>

        {/* Two Modes */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Two Modes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-lg mb-2">Generate Mode</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create new images from scratch using text prompts. Describe what you want to see and the AI will generate it.
              </p>
              <span className="text-xs text-primary">Just write a prompt and generate</span>
            </div>
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-lg mb-2">Edit Mode</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Upload an existing image and describe how you want to modify it. The AI will apply your changes.
              </p>
              <span className="text-xs text-primary">Upload image + describe edits</span>
            </div>
          </div>
        </section>

        {/* Prompt Structure */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Prompt Structure</h2>
          <p className="text-muted-foreground mb-6">
            Build effective prompts by combining these elements:
          </p>
          
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="subject" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">1</span>
                  </div>
                  <span className="font-medium">Subject (Who/What)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">The main focus of your image</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>"A majestic white wolf"</li>
                  <li>"An elderly man with a warm smile"</li>
                  <li>"A futuristic city skyline"</li>
                  <li>"A bouquet of wildflowers"</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="details" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">2</span>
                  </div>
                  <span className="font-medium">Details & Context</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Add specifics about the subject and setting</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>"standing in a snowy forest"</li>
                  <li>"wearing traditional clothing"</li>
                  <li>"at sunset with flying cars"</li>
                  <li>"in a vintage ceramic vase"</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="style" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Style & Medium</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Specify the artistic style or medium</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["oil painting", "digital art", "watercolor", "photograph", "pencil sketch", "3D render", "vector illustration", "impressionist", "minimalist"].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="quality" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">4</span>
                  </div>
                  <span className="font-medium">Quality & Technical</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Add quality boosters and technical details</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["highly detailed", "8K resolution", "sharp focus", "professional lighting", "studio quality", "masterpiece", "award-winning", "ultra HD"].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lighting" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">5</span>
                  </div>
                  <span className="font-medium">Lighting & Mood</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-11">
                <p className="text-muted-foreground mb-2">Set the atmosphere and lighting</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["golden hour", "dramatic lighting", "soft natural light", "neon glow", "candlelight", "backlit", "moody shadows", "bright and airy"].map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Style Presets */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Style Presets Explained</h2>
          <div className="space-y-3">
            {styleDescriptions.map((style) => (
              <div key={style.id} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-foreground">{style.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">{style.id}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{style.description}</p>
                <p className="text-xs text-primary">Best for: {style.bestFor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Generation Examples */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Generation Examples</h2>
          <div className="space-y-3">
            {generationPrompts.map((example, index) => (
              <div key={index} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{example.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{example.style}</span>
                  </div>
                  <button 
                    onClick={() => copyPrompt(example.prompt, `gen-${index}`)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title="Copy prompt"
                  >
                    {copiedIndex === `gen-${index}` ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg font-mono">
                  {example.prompt}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Editing Examples */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Editing Examples</h2>
          <p className="text-muted-foreground mb-4">When editing images, be specific about the changes you want:</p>
          <div className="space-y-3">
            {editingPrompts.map((example, index) => (
              <div key={index} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-foreground">{example.title}</h3>
                  <button 
                    onClick={() => copyPrompt(example.prompt, `edit-${index}`)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title="Copy prompt"
                  >
                    {copiedIndex === `edit-${index}` ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg font-mono mb-2">
                  {example.prompt}
                </p>
                <p className="text-xs text-muted-foreground">💡 {example.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Pro Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <h3 className="font-medium text-green-400 mb-2">✓ Do</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Be descriptive and specific</li>
                <li>• Include style and quality keywords</li>
                <li>• Mention lighting and mood</li>
                <li>• Use reference styles (e.g., "in the style of...")</li>
                <li>• Iterate on successful prompts</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <h3 className="font-medium text-red-400 mb-2">✗ Avoid</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Vague one-word prompts</li>
                <li>• Contradicting styles together</li>
                <li>• Requesting exact text in images</li>
                <li>• Copyrighted characters</li>
                <li>• Overly complex multi-subject scenes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cost */}
        <section className="mb-10 sm:mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">Credit Cost</h2>
          <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Image Generation / Edit</h3>
                <p className="text-sm text-muted-foreground">Per image generated or edited</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">50</span>
                <span className="text-muted-foreground ml-1">credits</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Image className="w-5 h-5" />
            Start Creating Images
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default ImageGuide;