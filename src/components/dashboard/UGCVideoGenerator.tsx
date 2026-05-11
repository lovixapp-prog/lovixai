import { useState, useEffect, useRef } from "react";

const MagicStar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import AnimatedIconify from "@/components/ui/animated-iconify";

// ── Types ────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  price?: string;
  currency?: string;
  category?: string;
  website_url?: string;
}

interface InfluencerAvatar {
  id: string;
  result_url: string;
  created_at: string;
  settings?: Record<string, unknown>;
}

interface UGCGeneration {
  id: string;
  type: string;
  status: string;
  result_url?: string;
  settings?: Record<string, unknown>;
  created_at: string;
}

type Stage = 'idle' | 'uploading' | 'generating' | 'applying-voice' | 'complete' | 'failed';
type ProductTab = 'list' | 'add' | 'url';
type AvatarSource = 'none' | 'upload' | 'influencer';

// ── Constants ────────────────────────────────────────────────────────
const STYLES = [
  { id: 'authentic', label: 'Authentic', icon: 'solar:user-id-bold-duotone', color: 'text-emerald-400', active: 'border-emerald-500/60 bg-emerald-500/10' },
  { id: 'social', label: 'Social', icon: 'solar:graph-up-bold-duotone', color: 'text-pink-400', active: 'border-pink-500/60 bg-pink-500/10' },
  { id: 'cinematic', label: 'Cinematic', icon: 'solar:clapperboard-play-bold-duotone', color: 'text-violet-400', active: 'border-violet-500/60 bg-violet-500/10' },
  { id: 'storytelling', label: 'Story', icon: 'solar:notebook-bookmark-bold-duotone', color: 'text-amber-400', active: 'border-amber-500/60 bg-amber-500/10' },
];

const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16', sub: 'Vertical' },
  { id: '1:1', label: '1:1', sub: 'Square' },
  { id: '16:9', label: '16:9', sub: 'Wide' },
];

const ENVIRONMENTS = [
  { id: 'studio', label: 'Studio', emoji: '🎬' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { id: 'bathroom', label: 'Bathroom', emoji: '🚿' },
  { id: 'living_room', label: 'Living Room', emoji: '🛋️' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌿' },
  { id: 'luxury', label: 'Luxury', emoji: '✨' },
];

const MOODS = [
  { id: 'energetic', label: 'Energetic' },
  { id: 'happy', label: 'Happy' },
  { id: 'calm', label: 'Calm' },
  { id: 'serious', label: 'Serious' },
  { id: 'fun', label: 'Fun' },
  { id: 'luxurious', label: 'Luxurious' },
];

const LANGUAGES = [
  { id: 'english', label: 'English', flag: '🇬🇧' },
  { id: 'spanish', label: 'Spanish', flag: '🇪🇸' },
  { id: 'french', label: 'French', flag: '🇫🇷' },
  { id: 'italian', label: 'Italian', flag: '🇮🇹' },
  { id: 'german', label: 'German', flag: '🇩🇪' },
  { id: 'portuguese', label: 'Portuguese', flag: '🇵🇹' },
];

function calcCredits(duration: number) {
  return duration >= 8 ? 450 : 225;
}

// ── Sub-components ───────────────────────────────────────────────────
function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">{n}</span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-primary/15 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function UGCVideoGenerator({
  onCreditsUpdate, availableCredits, hasSubscription, onUpgradeClick,
}: {
  onCreditsUpdate: () => void;
  availableCredits: number;
  hasSubscription: boolean;
  onUpgradeClick?: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  // ── Products state ─────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productTab, setProductTab] = useState<ProductTab>('list');
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', currency: 'USD', category: '', image_url: '', website_url: '' });
  const [addingProduct, setAddingProduct] = useState(false);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);

  // ── Avatar state ───────────────────────────────────────────────────
  const [avatarSource, setAvatarSource] = useState<AvatarSource>('none');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [influencerAvatars, setInfluencerAvatars] = useState<InfluencerAvatar[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerAvatar | null>(null);

  // ── Script & settings ──────────────────────────────────────────────
  const [script, setScript] = useState('');
  const [optimizingScript, setOptimizingScript] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [duration, setDuration] = useState(5);
  const [style, setStyle] = useState('authentic');
  const [environment, setEnvironment] = useState('studio');
  const [mood, setMood] = useState('energetic');
  const [language, setLanguage] = useState('english');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // ── Generation state ───────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>('idle');
  const [stageMessage, setStageMessage] = useState('');
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [history, setHistory] = useState<UGCGeneration[]>([]);

  const credits = calcCredits(duration);
  const canGenerate = !!(selectedProduct && script.trim() && stage === 'idle' && availableCredits >= credits);

  useEffect(() => {
    if (user) { loadProducts(); loadHistory(); loadInfluencerAvatars(); }
  }, [user]);
  useEffect(() => { return () => { if (pollInterval) clearInterval(pollInterval); }; }, [pollInterval]);

  async function loadProducts() {
    if (!user) return;
    const { data } = await supabase.from('ugc_products').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setProducts(data ?? []);
  }

  async function loadHistory() {
    if (!user) return;
    const { data } = await supabase.from('generations').select('id,type,status,result_url,settings,created_at')
      .eq('user_id', user.id).in('type', ['ugc', 'ugc-final']).order('created_at', { ascending: false }).limit(8);
    setHistory(data ?? []);
  }

  async function loadInfluencerAvatars() {
    if (!user) return;
    const { data } = await supabase.from('influencers').select('id,avatar_image,name,created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(12);
    setInfluencerAvatars((data ?? [])
      .filter((g: { avatar_image?: string | null }) => g.avatar_image)
      .map((g: { id: string; avatar_image: string; name?: string; created_at: string }) => ({
        id: g.id,
        result_url: g.avatar_image,
        created_at: g.created_at,
        settings: { name: g.name },
      }))
    );
  }

  // ── URL Scraping ───────────────────────────────────────────────────
  async function handleScrapeUrl() {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    try {
      const data = await callAPI<{ success: boolean; title?: string; description?: string; imageUrl?: string; price?: string; error?: string }>('scrape-product-url', { url: scrapeUrl.trim() });
      if (!data.success) throw new Error(data.error);
      setNewProduct(p => ({
        ...p,
        name: data.title || p.name,
        description: data.description || p.description,
        image_url: data.imageUrl || p.image_url,
        price: data.price || p.price,
        website_url: scrapeUrl.trim(),
      }));
      setProductTab('add');
      toast({ title: 'Product imported!', description: 'Review the details and save.' });
    } catch (err) {
      toast({ title: 'Import failed', description: err instanceof Error ? err.message : 'Could not scrape URL', variant: 'destructive' });
    } finally {
      setScraping(false);
    }
  }

  // ── Product CRUD ───────────────────────────────────────────────────
  async function handleAddProduct() {
    if (!newProduct.name.trim() || !user) return;
    setAddingProduct(true);
    try {
      const { data, error } = await supabase.from('ugc_products').insert({
        user_id: user.id,
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: newProduct.price || null,
        currency: newProduct.currency,
        category: newProduct.category.trim(),
        image_url: newProduct.image_url || null,
        website_url: newProduct.website_url || null,
      }).select().single();
      if (error) throw error;
      setProducts(p => [data, ...p]);
      setSelectedProduct(data);
      setProductTab('list');
      setNewProduct({ name: '', description: '', price: '', currency: 'USD', category: '', image_url: '', website_url: '' });
      toast({ title: 'Product saved!' });
    } catch {
      toast({ title: 'Failed to save product', variant: 'destructive' });
    } finally {
      setAddingProduct(false);
    }
  }

  async function handleUpdateProduct() {
    if (!editingProduct) return;
    const { error } = await supabase.from('ugc_products').update({
      name: editingProduct.name,
      description: editingProduct.description,
      price: editingProduct.price,
      category: editingProduct.category,
    }).eq('id', editingProduct.id);
    if (!error) {
      setProducts(p => p.map(x => x.id === editingProduct.id ? editingProduct : x));
      if (selectedProduct?.id === editingProduct.id) setSelectedProduct(editingProduct);
      setEditingProduct(null);
      toast({ title: 'Product updated' });
    }
  }

  async function handleDeleteProduct(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await supabase.from('ugc_products').delete().eq('id', id);
    setProducts(p => p.filter(x => x.id !== id));
    if (selectedProduct?.id === id) setSelectedProduct(null);
  }

  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setProductImageUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${user.id}/ugc-products/${Date.now()}.${ext}`;
      await supabase.storage.from('generations').upload(filename, file, { contentType: file.type, upsert: false });
      const { data } = supabase.storage.from('generations').getPublicUrl(filename);
      setNewProduct(p => ({ ...p, image_url: data.publicUrl }));
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setProductImageUploading(false);
    }
  }

  // ── Avatar ─────────────────────────────────────────────────────────
  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUrl(null);
    setAvatarSource('upload');
    setSelectedInfluencer(null);
  }

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarFile || !user) return null;
    const ext = avatarFile.name.split('.').pop() || 'jpg';
    const filename = `${user.id}/ugc-avatars/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('generations').upload(filename, avatarFile, { contentType: avatarFile.type });
    if (error) throw new Error('Avatar upload failed: ' + error.message);
    const { data } = supabase.storage.from('generations').getPublicUrl(filename);
    return data.publicUrl;
  }

  // ── Generation ─────────────────────────────────────────────────────
  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); setPollInterval(null); }
  }

  async function handleOptimizeScript() {
    if (!selectedProduct) {
      toast({ title: 'Select a product first', variant: 'destructive' });
      return;
    }
    setOptimizingScript(true);
    try {
      const productInfo = `Product: ${selectedProduct.name}. ${selectedProduct.description || ''}${selectedProduct.price ? ` Price: ${selectedProduct.price}` : ''}${selectedProduct.category ? ` Category: ${selectedProduct.category}` : ''}`;
      const data = await callAPI<{ success: boolean; optimizedPrompt?: string; error?: string }>('optimize-prompt', {
        prompt: productInfo,
        type: 'ugc',
      });
      if (!data.success || !data.optimizedPrompt) throw new Error(data.error || 'Failed to generate script');
      setScript(data.optimizedPrompt);
      toast({ title: 'Script generated!', description: 'Review and customize if needed.' });
    } catch (err) {
      toast({ title: 'Script generation failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setOptimizingScript(false);
    }
  }

  function startPolling(genId: string) {
    const interval = setInterval(async () => {
      try {
        const data = await callAPI<{ status: string; resultUrl?: string; error?: string }>('check-video-status', { generationId: genId });
        if (data.status === 'completed' && data.resultUrl) {
          stopPolling();
          setResultUrl(data.resultUrl);
          setStage('complete');
          onCreditsUpdate();
          loadHistory();
        } else if (data.status === 'failed' || data.status === 'error') {
          stopPolling();
          setStage('failed');
          setStageMessage(data.error || 'Generation failed');
        }
      } catch { /* keep polling */ }
    }, 6000);
    setPollInterval(interval);
  }

  async function handleGenerate() {
    if (!canGenerate || !selectedProduct) return;
    stopPolling();
    setStage('uploading');
    setStageMessage('Preparing...');
    setResultUrl(null);
    setAudioUrl(null);
    setGenerationId(null);

    try {
      let influencerImageUrl: string | null = null;
      if (avatarSource === 'upload') {
        if (avatarFile && !avatarUrl) {
          influencerImageUrl = await uploadAvatar();
          setAvatarUrl(influencerImageUrl);
        } else {
          influencerImageUrl = avatarUrl;
        }
      } else if (avatarSource === 'influencer' && selectedInfluencer) {
        influencerImageUrl = selectedInfluencer.result_url;
      }

      setStage('generating');
      setStageMessage('Generating UGC video...');

      const data = await callAPI<{ success: boolean; generationId?: string; audioUrl?: string; error?: string }>('generate-ugc-video', {
        influencerImageUrl: influencerImageUrl || null,
        productImageUrl: selectedProduct.image_url || null,
        productName: selectedProduct.name,
        productDescription: selectedProduct.description,
        productId: selectedProduct.id,
        script,
        duration,
        aspectRatio,
        style,
        environment,
        mood,
        language,
      });

      if (!data.success || !data.generationId) throw new Error(data.error || 'Generation failed to start');
      setGenerationId(data.generationId);
      if (data.audioUrl) setAudioUrl(data.audioUrl);
      startPolling(data.generationId);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setStage('failed');
      setStageMessage(msg);
      toast({ title: 'Generation failed', description: msg, variant: 'destructive' });
    }
  }

  function handleReset() {
    stopPolling();
    setStage('idle');
    setStageMessage('');
    setResultUrl(null);
    setAudioUrl(null);
    setGenerationId(null);
  }

  const isGenerating = ['uploading', 'generating'].includes(stage);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 pb-24 lg:pb-10">

      {/* ── Cinematic Hero ─────────────────────────────────── */}
      <div className="tool-hero rounded-2xl"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary)/0.09) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 100%, hsl(43 95% 50%/0.06) 0%, transparent 60%)' }}>
        <div className="tool-hero-grid" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="star-icon star-icon-lg"><MagicStar className="w-7 h-7" /></div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 tracking-wider uppercase">UGC Studio</span>
          </div>
          <h1 className="tool-hero-title">Turn Any Product Into a Video Ad</h1>
          <p className="tool-hero-subtitle">AI-powered UGC videos with your influencer and product. Authentic, cinematic, scroll-stopping.</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AnimatedIconify icon="solar:clapperboard-play-bold-duotone" className="w-3.5 h-3.5 text-amber-400" />
              <span>Cinematic style</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AnimatedIconify icon="solar:graph-up-bold-duotone" className="w-3.5 h-3.5 text-emerald-400" />
              <span>Social-ready</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AnimatedIconify icon="solar:bolt-bold-duotone" className="w-3.5 h-3.5 text-violet-400" />
              <span>AI-generated script</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STEP 1 — PRODUCT ══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
          <StepLabel n={1} label="Product" />
          <div className="flex gap-1">
            <TabBtn active={productTab === 'list'} onClick={() => setProductTab('list')}>My Products</TabBtn>
            <TabBtn active={productTab === 'add'} onClick={() => setProductTab('add')}>
              <span className="flex items-center gap-1"><AnimatedIconify icon="solar:add-circle-bold-duotone" className="w-3 h-3 text-primary" />New</span>
            </TabBtn>
            <TabBtn active={productTab === 'url'} onClick={() => setProductTab('url')}>
              <span className="flex items-center gap-1"><AnimatedIconify icon="solar:link-round-angle-bold-duotone" className="w-3 h-3 text-cyan-400" />From URL</span>
            </TabBtn>
          </div>
        </div>

        <div className="p-4">
          {/* ── Tab: My Products ── */}
          {productTab === 'list' && (
            <>
              {products.length === 0 ? (
                <div className="text-center py-10">
                  <AnimatedIconify icon="solar:shop-bold-duotone" className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No products saved yet</p>
                  <Button size="sm" variant="outline" onClick={() => setProductTab('add')}>
                    <AnimatedIconify icon="solar:add-circle-bold-duotone" className="w-3.5 h-3.5 mr-1.5 text-primary" />Add your first product
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map(p => (
                    editingProduct?.id === p.id ? (
                      // Inline edit
                      <div key={p.id} className="border border-primary/40 bg-primary/5 rounded-xl p-3 space-y-2">
                        <Input value={editingProduct.name} onChange={e => setEditingProduct(x => x ? { ...x, name: e.target.value } : x)} className="h-8 text-sm bg-background border-border" placeholder="Name" />
                        <Input value={editingProduct.description} onChange={e => setEditingProduct(x => x ? { ...x, description: e.target.value } : x)} className="h-8 text-sm bg-background border-border" placeholder="Description" />
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={editingProduct.price ?? ''} onChange={e => setEditingProduct(x => x ? { ...x, price: e.target.value } : x)} className="h-8 text-sm bg-background border-border" placeholder="Price" />
                          <Input value={editingProduct.category ?? ''} onChange={e => setEditingProduct(x => x ? { ...x, category: e.target.value } : x)} className="h-8 text-sm bg-background border-border" placeholder="Category" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateProduct} className="flex-1 h-7 text-xs">
                            <AnimatedIconify icon="solar:check-circle-bold-duotone" className="w-3 h-3 mr-1 text-primary" />Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingProduct(null)} className="h-7 text-xs">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProduct(selectedProduct?.id === p.id ? null : p)}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                          selectedProduct?.id === p.id
                            ? 'border-primary/50 bg-primary/8 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]'
                            : 'border-border bg-background hover:border-primary/30 hover:bg-card'
                        }`}
                      >
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-border/50" />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <AnimatedIconify icon="solar:shop-bold-duotone" className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{p.description || p.category || 'No description'}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {p.price && <span className="text-xs font-semibold text-primary">{p.price}</span>}
                          {selectedProduct?.id === p.id && <AnimatedIconify icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-primary" pulse />}
                          <button
                            onClick={e => { e.stopPropagation(); setEditingProduct(p); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted transition-all"
                          >
                            <AnimatedIconify icon="solar:pen-new-square-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                          </button>
                          <button
                            onClick={e => handleDeleteProduct(p.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/15 transition-all"
                          >
                            <AnimatedIconify icon="solar:trash-bin-trash-bold-duotone" className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </button>
                    )
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Tab: Add New ── */}
          {productTab === 'add' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Product name *"
                  value={newProduct.name}
                  onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                  className="bg-background border-border h-10"
                />
                <Input
                  placeholder="Price (e.g. $29.99)"
                  value={newProduct.price}
                  onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                  className="bg-background border-border h-10"
                />
              </div>
              <Textarea
                placeholder="Product description — the more detail, the better the video"
                value={newProduct.description}
                onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                className="bg-background border-border resize-none min-h-[80px]"
                rows={3}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Category (skincare, tech, fitness...)"
                  value={newProduct.category}
                  onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                  className="bg-background border-border h-10"
                />
                <div className="flex gap-2">
                  <input type="file" ref={productImageInputRef} className="hidden" accept="image/*" onChange={handleProductImageUpload} />
                  <button
                    onClick={() => productImageInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 h-10 px-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                  >
                    {productImageUploading ? <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" spin /> : <AnimatedIconify icon="solar:camera-bold-duotone" className="w-4 h-4" />}
                    {newProduct.image_url ? <span className="text-emerald-400 font-medium">Image added ✓</span> : 'Add image'}
                  </button>
                </div>
              </div>
              {newProduct.image_url && (
                <img src={newProduct.image_url} alt="Product preview" className="w-20 h-20 rounded-xl object-cover border border-border" />
              )}
              <Button
                onClick={handleAddProduct}
                disabled={!newProduct.name.trim() || addingProduct}
                className="w-full h-10"
              >
                {addingProduct ? <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4 mr-2" spin /> : <AnimatedIconify icon="solar:add-circle-bold-duotone" className="w-4 h-4 mr-2" />}
                Save Product
              </Button>
            </div>
          )}

          {/* ── Tab: From URL ── */}
          {productTab === 'url' && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-3 text-xs text-muted-foreground flex items-start gap-2">
                <AnimatedIconify icon="solar:link-round-angle-bold-duotone" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                Paste a product page URL — we'll extract title, description, image and price automatically.
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://yourstore.com/product-page"
                  value={scrapeUrl}
                  onChange={e => setScrapeUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScrapeUrl()}
                  className="bg-background border-border h-10 flex-1"
                  type="url"
                />
                <Button onClick={handleScrapeUrl} disabled={!scrapeUrl.trim() || scraping} className="h-10 px-4 shrink-0">
                  {scraping ? <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" spin /> : 'Import'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Selected product banner */}
        {selectedProduct && (
          <div className="px-4 py-2.5 border-t border-border/60 bg-primary/5 flex items-center gap-2">
            <AnimatedIconify icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-primary flex-shrink-0" pulse />
            <span className="text-xs font-medium text-primary truncate">Selected: {selectedProduct.name}</span>
            <button onClick={() => setSelectedProduct(null)} className="ml-auto text-muted-foreground hover:text-foreground"><AnimatedIconify icon="solar:close-circle-bold-duotone" className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>

      {/* ═══ STEP 2 — AVATAR ═══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60">
          <StepLabel n={2} label="Avatar / Presenter" />
          <p className="text-xs text-muted-foreground -mt-1">Optional — upload a model or use an AI influencer. Without one, Lovix AI generates the presenter.</p>
        </div>
        <div className="p-4 space-y-4">

          {/* Source selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setAvatarSource('none'); setAvatarFile(null); setAvatarPreview(null); setAvatarUrl(null); setSelectedInfluencer(null); }}
              className={`py-3 rounded-xl border text-center transition-all ${
                avatarSource === 'none' ? 'border-primary/50 bg-primary/10' : 'border-border bg-background hover:border-border/80'
              }`}
            >
              <AnimatedIconify icon="solar:magic-stick-3-bold-duotone" className={`w-5 h-5 mx-auto mb-1 ${avatarSource === 'none' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-xs font-medium ${avatarSource === 'none' ? 'text-primary' : 'text-muted-foreground'}`}>AI Generate</p>
            </button>
            <button
              onClick={() => { setAvatarSource('upload'); setSelectedInfluencer(null); setTimeout(() => avatarInputRef.current?.click(), 50); }}
              className={`py-3 rounded-xl border text-center transition-all ${
                avatarSource === 'upload' ? 'border-primary/50 bg-primary/10' : 'border-border bg-background hover:border-border/80'
              }`}
            >
              <AnimatedIconify icon="solar:upload-square-bold-duotone" className={`w-5 h-5 mx-auto mb-1 ${avatarSource === 'upload' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-xs font-medium ${avatarSource === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>Upload Photo</p>
            </button>
            <button
              onClick={() => { setAvatarSource('influencer'); setAvatarFile(null); setAvatarPreview(null); setAvatarUrl(null); }}
              className={`py-3 rounded-xl border text-center transition-all ${
                avatarSource === 'influencer' ? 'border-primary/50 bg-primary/10' : 'border-border bg-background hover:border-border/80'
              }`}
            >
              <AnimatedIconify icon="solar:user-id-bold-duotone" className={`w-5 h-5 mx-auto mb-1 ${avatarSource === 'influencer' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-xs font-medium ${avatarSource === 'influencer' ? 'text-primary' : 'text-muted-foreground'}`}>My Influencers</p>
            </button>
          </div>

          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />

          {/* Upload preview */}
          {avatarSource === 'upload' && avatarPreview && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-xl object-cover border border-border" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Avatar ready</p>
                <p className="text-xs text-muted-foreground">Will be animated speaking your script</p>
              </div>
              <button
                onClick={() => { setAvatarFile(null); setAvatarPreview(null); setAvatarUrl(null); setAvatarSource('none'); }}
                className="p-1.5 rounded-lg hover:bg-destructive/15 transition-colors"
              >
                <AnimatedIconify icon="solar:close-circle-bold-duotone" className="w-4 h-4 text-destructive" />
              </button>
            </div>
          )}

          {avatarSource === 'upload' && !avatarPreview && (
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl py-6 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors group"
            >
              <AnimatedIconify icon="solar:upload-square-bold-duotone" className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
              <p className="text-sm text-muted-foreground">Click to select avatar photo</p>
              <p className="text-xs text-muted-foreground/60">JPG, PNG — clear face, good lighting</p>
            </button>
          )}

          {/* Influencer grid */}
          {avatarSource === 'influencer' && (
            <>
              {influencerAvatars.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl">
                  <AnimatedIconify icon="solar:user-id-bold-duotone" className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No AI influencer avatars yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Generate an influencer first in the Influencer tab</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {influencerAvatars.map(av => (
                    <button
                      key={av.id}
                      onClick={() => setSelectedInfluencer(selectedInfluencer?.id === av.id ? null : av)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        selectedInfluencer?.id === av.id ? 'border-primary shadow-glow-sm' : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img src={av.result_url} alt="Influencer" className="w-full aspect-square object-cover" />
                      {av.settings?.name && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1">
                          <p className="text-[9px] text-white font-medium truncate">{av.settings.name as string}</p>
                        </div>
                      )}
                      {selectedInfluencer?.id === av.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <AnimatedIconify icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-white" pulse />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ STEP 3 — SCRIPT ═══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
          <StepLabel n={3} label="Video Script" />
          <button
            onClick={handleOptimizeScript}
            disabled={!selectedProduct || optimizingScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {optimizingScript ? <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-3.5 h-3.5" spin /> : <AnimatedIconify icon="solar:bolt-bold-duotone" className="w-3.5 h-3.5" />}
            AI Generate Script
          </button>
        </div>
        <div className="p-4 space-y-3">
          <Textarea
            placeholder={`Describe the message/concept for your video...\n\nExample: "Show excitement about how this bag transforms any outfit — highlight the quality, the colors, and call to action to visit the shop."\n\nOr click "AI Generate Script" to auto-write from your product info.`}
            value={script}
            onChange={e => setScript(e.target.value)}
            className="border-0 bg-background border border-border rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-primary/50 text-sm min-h-[120px] p-4"
            rows={4}
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
            <span>{script.length} chars</span>
            <span>{script.length === 0 ? '💡 Use AI Generate Script above' : script.length < 30 ? '⚠ Add more detail' : '✓ Good'}</span>
          </div>
        </div>
      </div>

      {/* ═══ STEP 4 — SETTINGS ═════════════════════════════════════════ */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60">
          <StepLabel n={4} label="Settings" />
        </div>
        <div className="p-4 space-y-5">

          {/* Style — compact icon chips */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Style</p>
            <div className="flex gap-2 flex-wrap">
              {STYLES.map(s => {
                const isActive = style === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      isActive ? `${s.active} ${s.color}` : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
                    }`}
                  >
                    <AnimatedIconify icon={s.icon} className={`w-3.5 h-3.5 ${s.color}`} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format + Duration — inline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Format</p>
              <div className="flex gap-1.5">
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id)}
                    className={`flex-1 py-2.5 px-1 rounded-xl border text-center transition-all ${
                      aspectRatio === r.id ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-bold leading-none">
                      <AnimatedIconify icon={r.id === '9:16' ? 'solar:smartphone-bold-duotone' : r.id === '1:1' ? 'solar:crop-minimalistic-bold-duotone' : 'solar:monitor-bold-duotone'} className="w-3 h-3 text-primary" />
                      {r.label}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{r.sub}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Duration</p>
              <div className="flex gap-1.5">
                {[{ v: 5, cr: 225 }, { v: 10, cr: 450 }].map(d => (
                  <button
                    key={d.v}
                    onClick={() => setDuration(d.v)}
                    className={`flex-1 py-2.5 rounded-xl border text-center transition-all ${
                      duration === d.v ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-bold leading-none">
                      <AnimatedIconify icon="solar:clock-circle-bold-duotone" className="w-3 h-3 text-amber-400" />
                      {d.v}s
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{d.cr}cr</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Settings — collapsible */}
          <div className="pt-1">
            <button
              onClick={() => setShowAdvancedSettings(v => !v)}
              className="flex items-center gap-2 w-full text-left group"
            >
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Advanced</span>
              <AnimatedIconify icon="solar:alt-arrow-down-bold-duotone" className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${showAdvancedSettings ? 'rotate-180' : ''}`} />
              {!showAdvancedSettings && (
                <span className="ml-auto text-[10px] text-muted-foreground/60">
                  {ENVIRONMENTS.find(e => e.id === environment)?.emoji} {MOODS.find(m => m.id === mood)?.label} · {LANGUAGES.find(l => l.id === language)?.flag}
                </span>
              )}
            </button>

            {showAdvancedSettings && (
              <div className="mt-3 space-y-4 pt-3 border-t border-border/40">

                {/* Environment */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AnimatedIconify icon="solar:sun-2-bold-duotone" className="w-3 h-3 text-amber-400" />
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Environment</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ENVIRONMENTS.map(env => (
                      <button
                        key={env.id}
                        onClick={() => setEnvironment(env.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                          environment === env.id
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                            : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
                        }`}
                      >
                        <span>{env.emoji}</span>
                        <span className="truncate">{env.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AnimatedIconify icon="solar:emoji-funny-circle-bold-duotone" className="w-3 h-3 text-pink-400" />
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Mood</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMood(m.id)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          mood === m.id
                            ? 'border-pink-500/50 bg-pink-500/10 text-pink-400'
                            : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AnimatedIconify icon="solar:global-bold-duotone" className="w-3 h-3 text-cyan-400" />
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Language</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                          language === lang.id
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* ═══ GENERATE BUTTON ═══════════════════════════════════════════ */}
      <div className="space-y-3">
        {/* Validation hints */}
        {!selectedProduct && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-400">
            <AnimatedIconify icon="solar:danger-triangle-bold-duotone" className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" pulse />Select a product to continue
          </div>
        )}
        {selectedProduct && !script.trim() && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-400">
            <AnimatedIconify icon="solar:danger-triangle-bold-duotone" className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" pulse />Write a script for your presenter
          </div>
        )}

        {/* Reference image indicator */}
        {selectedProduct && (() => {
          const hasInfluencer = avatarSource !== 'none' && (avatarUrl || selectedInfluencer);
          const hasProductImg = !!(selectedProduct.image_url);
          const refImg = hasInfluencer ? (avatarPreview || selectedInfluencer?.result_url || avatarUrl) : (hasProductImg ? selectedProduct.image_url : null);
          return (
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs ${refImg ? 'border-primary/20 bg-primary/5 text-primary' : 'border-amber-500/20 bg-amber-500/5 text-amber-400'}`}>
              {refImg ? (
                <>
                  <img src={refImg} alt="ref" className="w-6 h-6 rounded-md object-cover flex-shrink-0 border border-border/50" />
                  <span className="font-medium">{hasInfluencer ? 'Influencer' : 'Product photo'} used as reference</span>
                </>
              ) : (
                <>
                  <AnimatedIconify icon="solar:danger-triangle-bold-duotone" className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" pulse />
                  <span>No reference image — add a product photo or influencer for better results</span>
                </>
              )}
            </div>
          );
        })()}

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border">
            <AnimatedIconify icon="solar:stars-bold-duotone" className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">{credits} credits</p>
              <p className="text-[10px] text-muted-foreground">{duration}s UGC video · Lovix AI</p>
            </div>
            {availableCredits < credits && (
              <span className="ml-auto text-xs text-destructive font-medium">Need {credits - availableCredits} more</span>
            )}
          </div>

          <Button
            onClick={isGenerating ? undefined : (stage === 'complete' || stage === 'failed' ? handleReset : handleGenerate)}
            disabled={stage === 'complete' || stage === 'failed' ? false : (!canGenerate || isGenerating)}
            className={`h-12 px-6 font-semibold rounded-2xl transition-all ${
              stage === 'complete' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
              stage === 'failed' ? 'bg-destructive/80 hover:bg-destructive text-white' :
              'bg-gradient-to-r from-primary to-violet-500 text-white hover:opacity-90 shadow-lg shadow-primary/20'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2"><AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" spin />Generating...</span>
            ) : stage === 'complete' ? (
              <span className="flex items-center gap-2"><AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" />New Video</span>
            ) : stage === 'failed' ? (
              <span className="flex items-center gap-2"><AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" />Try Again</span>
            ) : (
              <span className="flex items-center gap-2"><AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-4 h-4" />Generate Ad</span>
            )}
          </Button>
        </div>
      </div>

      {/* ═══ PROGRESS ════════════════════════════════════════════════════ */}
      {isGenerating && (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatedIconify icon="solar:videocamera-record-bold-duotone" className="w-4 h-4 text-primary" pulse />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {stage === 'uploading' ? 'Uploading avatar...' : 'Generating UGC video...'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stageMessage || 'This takes 2–5 minutes. You can navigate away.'}
              </p>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full animate-pulse"
              style={{ width: '45%', transition: 'width 1s ease' }}
            />
          </div>
        </div>
      )}

      {/* ═══ RESULT ══════════════════════════════════════════════════════ */}
      {stage === 'complete' && resultUrl && (
        <div className="rounded-2xl border border-emerald-500/30 bg-card overflow-hidden shadow-lg shadow-emerald-500/5">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
            <AnimatedIconify icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-emerald-400" pulse />
            <span className="text-sm font-semibold text-foreground">Your UGC Ad is ready!</span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {selectedProduct?.name} · {duration}s {aspectRatio}
            </span>
          </div>
          <div className={`relative bg-black flex items-center justify-center ${
            aspectRatio === '9:16' ? 'max-h-[70vh]' : aspectRatio === '1:1' ? 'max-h-[60vh]' : ''
          }`} style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
            <video src={resultUrl} controls playsInline autoPlay className="w-full h-full object-contain" />
          </div>
          {audioUrl && (
            <div className="px-3 pb-1">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Script Audio</p>
              <audio src={audioUrl} controls className="w-full h-9 rounded-lg" />
            </div>
          )}
          <div className="p-3 flex gap-2">
            <a href={resultUrl} download className="flex-1">
              <Button variant="outline" size="sm" className="w-full h-9">
                <AnimatedIconify icon="solar:download-square-bold-duotone" className="w-3.5 h-3.5 mr-2 text-primary" />Download Video
              </Button>
            </a>
            <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" size="sm" className="w-full h-9">
                <AnimatedIconify icon="solar:plain-2-bold-duotone" className="w-3.5 h-3.5 mr-2 text-cyan-400" />Open
              </Button>
            </a>
          </div>
        </div>
      )}

      {stage === 'failed' && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <AnimatedIconify icon="solar:danger-triangle-bold-duotone" className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" pulse />
          <div>
            <p className="text-sm font-semibold text-destructive">Generation failed</p>
            <p className="text-xs text-muted-foreground mt-1">{stageMessage}</p>
          </div>
        </div>
      )}

      {/* ═══ HISTORY ═════════════════════════════════════════════════════ */}
      {history.filter(g => g.result_url && g.status === 'completed').length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Recent Ads</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {history.filter(g => g.result_url && g.status === 'completed').slice(0, 4).map(g => (
              <div key={g.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/30 transition-colors">
                <video src={g.result_url!} className="w-full aspect-video object-cover bg-black" />
                <div className="p-2 flex items-center justify-between gap-1">
                  <p className="text-[10px] text-muted-foreground truncate">
                    {(g.settings?.productName as string) || 'UGC Ad'}
                  </p>
                  <a href={g.result_url!} download>
                    <AnimatedIconify icon="solar:download-square-bold-duotone" className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
