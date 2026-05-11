import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Check,
  User,
  PawPrint,
  Wand2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const MagicStar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Influencer } from "./AIInfluencer";

export type InfluencerType = "human" | "animal" | "custom";

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDERS = ["Female", "Male", "Non-binary"];
const AGE_RANGES = ["18-25", "26-35", "36-45", "46+"];

const BODY_TYPES = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "muscular", label: "Muscular" },
  { value: "curvy", label: "Curvy" },
  { value: "plus-size", label: "Plus Size" },
];

const ETHNICITIES = [
  "Light skin",
  "Medium skin",
  "Olive skin",
  "Brown skin",
  "Dark skin",
];

const HAIR_STYLES = [
  "Long straight black",
  "Long wavy brown",
  "Short curly blonde",
  "Medium straight red",
  "Pixie cut brunette",
  "Long braids black",
  "Bob cut auburn",
  "Afro natural",
  "Long straight blonde",
  "Medium wavy black",
];

const FASHION_STYLES = [
  "Casual chic",
  "Streetwear",
  "Elegant luxury",
  "Sporty athletic",
  "Bohemian creative",
  "Minimalist modern",
  "Glamorous",
];

const PERSONALITY_TAGS = [
  "Confident",
  "Friendly",
  "Mysterious",
  "Energetic",
  "Sophisticated",
  "Playful",
  "Inspiring",
  "Authentic",
];

const ANIMAL_SPECIES = [
  { value: "tiger", label: "Tiger", emoji: "🐯" },
  { value: "lion", label: "Lion", emoji: "🦁" },
  { value: "elephant", label: "Elephant", emoji: "🐘" },
  { value: "cheetah", label: "Cheetah", emoji: "🐆" },
  { value: "leopard", label: "Leopard", emoji: "🐆" },
  { value: "wolf", label: "Wolf", emoji: "🐺" },
  { value: "bear", label: "Bear", emoji: "🐻" },
  { value: "fox", label: "Fox", emoji: "🦊" },
  { value: "gorilla", label: "Gorilla", emoji: "🦍" },
  { value: "panther", label: "Panther", emoji: "🐈‍⬛" },
  { value: "deer", label: "Deer", emoji: "🦌" },
  { value: "beetle", label: "Beetle", emoji: "🪲" },
];

const ANIMAL_BODY_TYPES = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "muscular", label: "Muscular" },
  { value: "heavy", label: "Heavy" },
];

const TYPE_TABS = [
  {
    value: "human" as InfluencerType,
    label: "Human",
    Icon: User,
    desc: "Realistic human influencer",
  },
  {
    value: "animal" as InfluencerType,
    label: "Animal",
    Icon: PawPrint,
    desc: "Anthropomorphic animal character",
  },
  {
    value: "custom" as InfluencerType,
    label: "Custom",
    Icon: Wand2,
    desc: "Fully custom from prompt",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface InfluencerWizardProps {
  onComplete: (influencer: Influencer) => void;
  onBack?: () => void;
  availableCredits: number;
  onCreditsUpdate: () => void;
  hasSubscription: boolean;
  onUpgrade: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PillSelector({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
            value === o.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function GenderPills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={cn(
            "flex-1 min-w-[80px] py-2 rounded-lg text-sm font-medium border transition-all",
            value === g
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

// ─── Preview panel ────────────────────────────────────────────────────────────

function PreviewPanel({
  isGenerating,
  generatedImage,
  name,
  canGenerate,
  hasEnoughCredits,
  onGenerate,
  onRegenerate,
  onAccept,
  onUpgrade,
  influencerType,
}: {
  isGenerating: boolean;
  generatedImage: string | null;
  name: string;
  canGenerate: boolean;
  hasEnoughCredits: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onAccept: () => void;
  onUpgrade: () => void;
  influencerType: InfluencerType;
}) {
  const PlaceholderIcon = TYPE_TABS.find((t) => t.value === influencerType)?.Icon ?? User;

  return (
    <div className="space-y-4">
      <div className="aspect-[3/4] bg-muted/30 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center overflow-hidden">
        {isGenerating ? (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground text-sm">Creating your influencer...</p>
          </div>
        ) : generatedImage ? (
          <img
            src={generatedImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center space-y-3 p-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <PlaceholderIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Your AI influencer will appear here</p>
          </div>
        )}
      </div>

      {generatedImage ? (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex-1 gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
            Regenerate
          </Button>
          <Button onClick={onAccept} className="flex-1 gap-2">
            <Check className="w-4 h-4" />
            Accept
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Sparkles className="w-4 h-4" />
              <span>FREE — First influencer!</span>
            </div>
            <Button
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating || !hasEnoughCredits}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
          {!hasEnoughCredits && (
            <Button variant="outline" className="w-full" onClick={onUpgrade}>
              Upgrade for more credits
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const InfluencerWizard = ({
  onComplete,
  onBack,
  availableCredits,
  onCreditsUpdate,
  hasSubscription,
  onUpgrade,
}: InfluencerWizardProps) => {
  const { user } = useAuth();
  const [influencerType, setInfluencerType] = useState<InfluencerType>("human");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Shared
  const [name, setName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Human
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [hairStyle, setHairStyle] = useState("");
  const [fashionStyle, setFashionStyle] = useState("");

  // Animal
  const [animalSpecies, setAnimalSpecies] = useState("");
  const [animalGender, setAnimalGender] = useState("");
  const [animalBodyType, setAnimalBodyType] = useState("");
  const [animalFashionStyle, setAnimalFashionStyle] = useState("");

  // Custom
  const [customPrompt, setCustomPrompt] = useState("");

  const hasEnoughCredits = availableCredits >= 0 || hasSubscription;

  const canGenerate =
    influencerType === "human"
      ? !!(name && gender && ageRange && ethnicity && hairStyle && fashionStyle)
      : influencerType === "animal"
      ? !!(name && animalSpecies && animalGender)
      : !!(name && customPrompt.trim().length > 10);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 3
        ? [...prev, tag]
        : prev
    );
  };

  const switchType = (t: InfluencerType) => {
    setInfluencerType(t);
    setGeneratedImage(null);
    setSelectedTags([]);
  };

  const buildPrompt = (): string => {
    const personality =
      selectedTags.length > 0 ? selectedTags.join(", ") + " personality" : "confident and stylish personality";

    if (influencerType === "human") {
      const physique = bodyType ? `, ${bodyType} physique` : "";
      return `Ultra-realistic social media influencer portrait photo, ${gender.toLowerCase()}, ${ageRange} years old${physique}, ${ethnicity}, ${hairStyle} hair, wearing ${fashionStyle.toLowerCase()} style clothing, ${personality}, professional studio lighting, 4K quality, Instagram-ready, high detail skin texture, natural makeup, looking at camera, confident expression, clean background, fashion photography style`;
    }

    if (influencerType === "animal") {
      const physique = animalBodyType ? `${animalBodyType} build` : "athletic build";
      const style = animalFashionStyle
        ? `wearing ${animalFashionStyle.toLowerCase()} style clothing`
        : "wearing stylish modern clothing";
      return `Ultra-realistic anthropomorphic ${animalSpecies} influencer portrait, ${animalGender.toLowerCase()} ${animalSpecies}, ${physique}, ${style}, ${personality}, upright humanoid stance, professional studio portrait lighting, looking directly at camera, 4K quality, Instagram-ready, highly detailed realistic ${animalSpecies} features and fur texture, clean gradient background, fashion photography style`;
    }

    return customPrompt;
  };

  const handleGenerate = async () => {
    if (!canGenerate || !user) return;
    if (!hasEnoughCredits) {
      toast.error("Not enough credits");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await callAPI<{ imageUrl?: string; error?: string }>(
        "generate-image",
        { prompt: buildPrompt(), style: "photorealistic" }
      );

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        onCreditsUpdate();
        toast.success("Influencer image generated!");
      } else {
        throw new Error("No image returned");
      }
    } catch (error: any) {
      toast.error("Failed to generate influencer", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = async () => {
    if (!generatedImage || !user) return;

    try {
      const insertData: Record<string, unknown> = {
        user_id: user.id,
        name,
        avatar_image: generatedImage,
        influencer_type: influencerType,
        personality_tags: selectedTags.length > 0 ? selectedTags : null,
        voice_profile: "neutral",
      };

      if (influencerType === "human") {
        insertData.gender = gender;
        insertData.age_range = ageRange;
        insertData.ethnicity = ethnicity;
        insertData.hair_style = hairStyle;
        insertData.fashion_style = fashionStyle;
        insertData.body_type = bodyType || null;
      } else if (influencerType === "animal") {
        insertData.gender = animalGender;
        insertData.age_range = "N/A";
        insertData.ethnicity = animalSpecies;
        insertData.fashion_style = animalFashionStyle || null;
        insertData.body_type = animalBodyType || null;
      } else {
        insertData.gender = "N/A";
        insertData.age_range = "N/A";
      }

      const { data, error } = await supabase
        .from("influencers")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Influencer created!", {
        description: `${name} is ready to create videos.`,
      });
      onComplete(data as unknown as Influencer);
    } catch (error: any) {
      toast.error("Failed to save influencer", { description: error.message });
    }
  };

  const PlaceholderIcon = TYPE_TABS.find((t) => t.value === influencerType)?.Icon ?? User;

  return (
    <div className="py-2 space-y-0">

      {/* ── Cinematic Hero ─────────────────────────────────── */}
      <div className="tool-hero-sm rounded-2xl mb-4">
        <div className="tool-hero-bg" />
        <div className="tool-hero-grid" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="star-icon star-icon-lg"><MagicStar className="w-7 h-7" /></div>
            <span className="badge-aurora text-xs">AI Influencer Studio</span>
          </div>
          <h1 className="tool-hero-title text-2xl sm:text-3xl">Design Your AI Creator</h1>
          <p className="tool-hero-subtitle text-sm">Build a unique AI influencer with custom personality, style and appearance.</p>
        </div>
      </div>

      {/* ── Type selector ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {TYPE_TABS.map(({ value, label, Icon, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => switchType(value)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all text-center",
              influencerType === value
                ? "border-primary bg-primary/8 shadow-[0_0_20px_hsl(var(--primary)/0.1)]"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              influencerType === value ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]" : "bg-muted text-muted-foreground"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className={cn("font-semibold text-sm", influencerType === value && "text-primary")}>{label}</p>
              <p className="text-[10px] text-muted-foreground hidden sm:block">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Studio Layout: canvas + builder ─────────────────── */}
      <div className="flex flex-col lg:flex-row gap-0 rounded-2xl overflow-hidden border border-border min-h-[520px]">

        {/* Canvas / Preview */}
        <div className="flex-1 bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6 relative"
          style={{ backgroundImage: 'radial-gradient(hsl(var(--border)/0.25) 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
          <div className="w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border border-border/60 shadow-2xl relative bg-card">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card">
                <div className="star-icon star-icon-xl animate-pulse"><MagicStar className="w-10 h-10" /></div>
                <p className="text-sm text-muted-foreground font-medium">Creating your influencer…</p>
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-[shimmer-sweep_1.5s_infinite]" style={{ width: '60%' }} />
                </div>
              </div>
            ) : generatedImage ? (
              <img src={generatedImage} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <PlaceholderIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Your AI influencer will appear here</p>
              </div>
            )}
          </div>

          {/* Action buttons below canvas */}
          <div className="mt-5 flex flex-col items-center gap-2 w-full max-w-[280px]">
            {!generatedImage ? (
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating || !hasEnoughCredits}
                className="btn-generate w-full justify-center text-sm py-3"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating…</span></>
                ) : !hasEnoughCredits ? (
                  <span>Get Credits</span>
                ) : (
                  <><div className="star-icon star-icon-sm"><MagicStar className="w-4 h-4" /></div><span>Generate Influencer</span></>
                )}
              </button>
            ) : (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => { setGeneratedImage(null); handleGenerate(); }}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 btn-generate justify-center text-sm py-2.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Creator</span>
                </button>
              </div>
            )}
            {!canGenerate && (
              <p className="text-xs text-muted-foreground text-center">Fill all required fields to generate</p>
            )}
          </div>
        </div>

        {/* Builder right panel */}
        <div className="w-full lg:w-[300px] xl:w-[320px] bg-sidebar border-t lg:border-t-0 lg:border-l border-sidebar-border overflow-y-auto flex-shrink-0">
          <div className="px-4 py-3 border-b border-sidebar-border sticky top-0 bg-sidebar z-10 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Builder</span>
            {onBack && (
              <button onClick={onBack} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="p-4 space-y-5">
        {/* ── Left: form ── */}
        <div className="space-y-5">
          {/* Name — always shown */}
          <div className="space-y-2">
            <Label htmlFor="name">Influencer Name</Label>
            <Input
              id="name"
              placeholder={
                influencerType === "animal"
                  ? "e.g., Leo the Bold"
                  : influencerType === "custom"
                  ? "e.g., Neon Ghost"
                  : "e.g., Sophia Rose"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* ── Human form ── */}
          {influencerType === "human" && (
            <>
              <div className="space-y-2">
                <Label>Gender</Label>
                <GenderPills options={GENDERS} value={gender} onChange={setGender} />
              </div>

              <div className="space-y-2">
                <Label>Age Range</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAgeRange(a)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                        ageRange === a
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Body Type</Label>
                <PillSelector options={BODY_TYPES} value={bodyType} onChange={setBodyType} />
              </div>

              <div className="space-y-2">
                <Label>Skin Tone</Label>
                <Select value={ethnicity} onValueChange={setEthnicity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skin tone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ETHNICITIES.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hair Style & Color</Label>
                <Select value={hairStyle} onValueChange={setHairStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hair style..." />
                  </SelectTrigger>
                  <SelectContent>
                    {HAIR_STYLES.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fashion Style</Label>
                <Select value={fashionStyle} onValueChange={setFashionStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fashion style..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FASHION_STYLES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Personality <span className="text-muted-foreground text-xs">(up to 3)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITY_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-primary/10"
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Animal form ── */}
          {influencerType === "animal" && (
            <>
              <div className="space-y-2">
                <Label>Species</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ANIMAL_SPECIES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setAnimalSpecies(s.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all",
                        animalSpecies === s.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30 hover:border-primary/40"
                      )}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <span className={cn("text-xs font-medium", animalSpecies === s.value && "text-primary")}>
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <GenderPills options={["Male", "Female"]} value={animalGender} onChange={setAnimalGender} />
              </div>

              <div className="space-y-2">
                <Label>Body Type</Label>
                <PillSelector options={ANIMAL_BODY_TYPES} value={animalBodyType} onChange={setAnimalBodyType} />
              </div>

              <div className="space-y-2">
                <Label>Fashion Style <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select value={animalFashionStyle} onValueChange={setAnimalFashionStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fashion style..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FASHION_STYLES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Personality <span className="text-muted-foreground text-xs">(up to 3)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITY_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-primary/10"
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Custom form ── */}
          {influencerType === "custom" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">
                  Custom Prompt
                  <span className="text-muted-foreground text-xs ml-2">({customPrompt.length} chars)</span>
                </Label>
                <Textarea
                  id="custom-prompt"
                  placeholder={`Describe your influencer in detail...\n\nExamples:\n• A cyberpunk robot influencer with neon blue eyes, metallic silver skin, wearing futuristic streetwear, studio portrait, 4K\n• A mythical elf queen with silver hair, emerald eyes, wearing ethereal fantasy armor, magical aura, professional lighting`}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[180px] resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific: describe appearance, style, lighting, background, mood.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Personality <span className="text-muted-foreground text-xs">(optional, up to 3)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITY_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-primary/10"
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
          </div>{/* end p-4 */}
        </div>{/* end builder panel */}
      </div>{/* end studio layout */}
    </div>
  );
};

export default InfluencerWizard;
