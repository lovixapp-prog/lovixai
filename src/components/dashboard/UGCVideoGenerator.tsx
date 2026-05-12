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
import ToolHeroShowcase from "./ToolHeroShowcase";

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
    <div className="flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">{n}</span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
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
  const [openComposerPanel, setOpenComposerPanel] = useState<'add' | 'product' | 'avatar' | 'settings' | null>(null);

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

  const activeAvatarLabel =
    avatarSource === 'influencer' && selectedInfluencer
      ? ((selectedInfluencer.settings?.name as string) || 'Influencer')
      : avatarSource === 'upload' && avatarPreview
        ? 'Uploaded avatar'
        : 'Automatic';
  const activeAvatarImage = avatarSource === 'influencer' ? selectedInfluencer?.result_url : avatarPreview;

  return (
    <div className="space-y-5 max-w-5xl mx-auto py-3 pb-24 lg:pb-10">
      <ToolHeroShowcase variant="ugc" />
      <div className="hidden text-center px-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          <MagicStar className="h-3.5 w-3.5" />
          UGC Studio
        </span>
        <h1 className="mt-3 font-display text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          Turn any product into a video ad
        </h1>
      </div>

      <div className="chat-input-wrapper">
        <div className={`chat-composer ugc-project-composer ${isGenerating ? 'opacity-75' : ''}`}>
          {openComposerPanel === 'product' && (
            <div className="chat-popover ugc-composer-popover ugc-product-popover">
              <div className="chat-settings-head">
                <span>Product</span>
                <button type="button" onClick={() => setOpenComposerPanel(null)} aria-label="Close product">
                  <AnimatedIconify icon="solar:alt-arrow-down-bold" className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-1 rounded-2xl bg-muted/40 p-1">
                <TabBtn active={productTab === 'list'} onClick={() => setProductTab('list')}>Saved</TabBtn>
                <TabBtn active={productTab === 'url'} onClick={() => setProductTab('url')}>URL</TabBtn>
                <TabBtn active={productTab === 'add'} onClick={() => setProductTab('add')}>New</TabBtn>
              </div>
              {productTab === 'url' && (
                <div className="mt-3 space-y-2">
                  <Input
                    placeholder="https://product-service-or-app.com"
                    value={scrapeUrl}
                    onChange={e => setScrapeUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleScrapeUrl()}
                    className="h-10 rounded-2xl bg-background text-sm"
                    type="url"
                  />
                  <Button onClick={handleScrapeUrl} disabled={!scrapeUrl.trim() || scraping} className="btn-generate h-10 w-full rounded-2xl">
                    {scraping ? <AnimatedIconify icon="solar:refresh-circle-bold" className="mr-2 h-4 w-4" spin /> : <AnimatedIconify icon="solar:link-round-angle-bold" className="mr-2 h-4 w-4" />}
                    Import product
                  </Button>
                </div>
              )}
              {productTab === 'list' && (
                <div className="mt-3 max-h-[270px] space-y-2 overflow-auto pr-1">
                  {products.length === 0 ? (
                    <button type="button" onClick={() => setProductTab('url')} className="chat-popover-row justify-center">
                      <AnimatedIconify icon="solar:link-round-angle-bold" className="h-4 w-4" />
                      Add product URL
                    </button>
                  ) : products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedProduct(p); setOpenComposerPanel(null); }}
                      className={`flex w-full items-center gap-2 rounded-2xl border p-2 text-left transition-all ${selectedProduct?.id === p.id ? 'border-primary/55 bg-primary/10' : 'border-border bg-background/70 hover:border-primary/30'}`}
                    >
                      {p.image_url ? <img src={p.image_url} alt="" className="h-10 w-10 rounded-xl object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><AnimatedIconify icon="solar:bag-4-bold" className="h-5 w-5" /></span>}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-foreground">{p.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{p.website_url || p.description || 'Saved product'}</span>
                      </span>
                      {selectedProduct?.id === p.id && <AnimatedIconify icon="solar:check-circle-bold" className="h-4 w-4 text-primary" pulse />}
                    </button>
                  ))}
                </div>
              )}
              {productTab === 'add' && (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Name" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className="h-9 rounded-xl bg-background text-sm" />
                    <Input placeholder="Price" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} className="h-9 rounded-xl bg-background text-sm" />
                  </div>
                  <Textarea placeholder="Short product description" value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} className="min-h-[70px] resize-none rounded-xl bg-background text-sm" />
                  <div className="flex gap-2">
                    <input type="file" ref={productImageInputRef} className="hidden" accept="image/*" onChange={handleProductImageUpload} />
                    <button type="button" onClick={() => productImageInputRef.current?.click()} className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-foreground">
                      {productImageUploading ? <AnimatedIconify icon="solar:refresh-circle-bold" className="h-4 w-4" spin /> : <AnimatedIconify icon="solar:camera-bold" className="h-4 w-4" />}
                      {newProduct.image_url ? 'Image ready' : 'Image'}
                    </button>
                    <Button onClick={handleAddProduct} disabled={!newProduct.name.trim() || addingProduct} className="h-9 rounded-xl px-4">Save</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {openComposerPanel === 'avatar' && (
            <div className="chat-popover ugc-composer-popover ugc-avatar-popover">
              <div className="chat-settings-head">
                <span>Avatar</span>
                <button type="button" onClick={() => setOpenComposerPanel(null)} aria-label="Close avatar">
                  <AnimatedIconify icon="solar:alt-arrow-down-bold" className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => { setAvatarSource('none'); setAvatarFile(null); setAvatarPreview(null); setAvatarUrl(null); setSelectedInfluencer(null); setOpenComposerPanel(null); }} className={`rounded-2xl border p-3 text-center text-xs font-black ${avatarSource === 'none' ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}>
                  <AnimatedIconify icon="solar:magic-stick-3-bold" className="mx-auto mb-1 h-5 w-5" />
                  Auto
                </button>
                <button type="button" onClick={() => { setAvatarSource('upload'); setSelectedInfluencer(null); avatarInputRef.current?.click(); }} className={`rounded-2xl border p-3 text-center text-xs font-black ${avatarSource === 'upload' ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}>
                  <AnimatedIconify icon="solar:upload-square-bold" className="mx-auto mb-1 h-5 w-5" />
                  Upload
                </button>
                <button type="button" onClick={() => { setAvatarSource('influencer'); setAvatarFile(null); setAvatarPreview(null); setAvatarUrl(null); }} className={`rounded-2xl border p-3 text-center text-xs font-black ${avatarSource === 'influencer' ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}>
                  <AnimatedIconify icon="solar:user-id-bold" className="mx-auto mb-1 h-5 w-5" />
                  My avatars
                </button>
              </div>
              {avatarSource === 'influencer' && (
                <div className="mt-3 grid max-h-[260px] grid-cols-3 gap-2 overflow-auto pr-1 sm:grid-cols-4">
                  {influencerAvatars.length === 0 ? (
                    <p className="col-span-full rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No influencer avatars yet</p>
                  ) : influencerAvatars.map(av => (
                    <button key={av.id} type="button" onClick={() => { setSelectedInfluencer(av); setOpenComposerPanel(null); }} className={`relative overflow-hidden rounded-2xl border-2 ${selectedInfluencer?.id === av.id ? 'border-primary' : 'border-transparent'}`}>
                      <img src={av.result_url} alt="" className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {openComposerPanel === 'settings' && (
            <div className="chat-popover ugc-composer-popover ugc-settings-popover">
              <div className="chat-settings-head">
                <span>Settings</span>
                <button type="button" onClick={() => setOpenComposerPanel(null)} aria-label="Close settings">
                  <AnimatedIconify icon="solar:alt-arrow-down-bold" className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <button type="button" className="chat-settings-row">
                  <span className="chat-settings-row-main">
                    <AnimatedIconify icon="solar:clock-circle-bold" className="h-4 w-4" />
                    <span>Duration</span>
                  </span>
                  <span className="chat-settings-current">{duration}s</span>
                  <AnimatedIconify icon="solar:alt-arrow-right-bold" className="h-4 w-4" />
                </button>
                <div className="chat-settings-section">
                  <div className="chat-option-grid">
                    {[5, 10].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDuration(v)}
                        className={`chat-option-pill ${duration === v ? 'chat-option-pill-active' : ''}`}
                      >
                        <AnimatedIconify icon="solar:clock-circle-bold" className="h-3.5 w-3.5" />
                        <span>{v}s</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" className="chat-settings-row">
                  <span className="chat-settings-row-main">
                    <AnimatedIconify icon={aspectRatio === '9:16' ? 'solar:smartphone-bold' : aspectRatio === '16:9' ? 'solar:monitor-bold' : 'solar:crop-minimalistic-bold'} className="h-4 w-4" />
                    <span>Orientation</span>
                  </span>
                  <span className="chat-settings-current">{aspectRatio === '9:16' ? 'Vertical' : aspectRatio === '16:9' ? 'Horizontal' : 'Square'}</span>
                  <AnimatedIconify icon="solar:alt-arrow-right-bold" className="h-4 w-4" />
                </button>
                <div className="chat-settings-section">
                  <div className="chat-option-grid">
                    {ASPECT_RATIOS.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setAspectRatio(r.id)}
                        className={`chat-option-pill ${aspectRatio === r.id ? 'chat-option-pill-active' : ''}`}
                      >
                        <AnimatedIconify icon={r.id === '9:16' ? 'solar:smartphone-bold' : r.id === '16:9' ? 'solar:monitor-bold' : 'solar:crop-minimalistic-bold'} className="h-3.5 w-3.5" />
                        <span>{r.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" className="chat-settings-row">
                  <span className="chat-settings-row-main">
                    <AnimatedIconify icon={STYLES.find(s => s.id === style)?.icon || 'solar:magic-stick-3-bold'} className="h-4 w-4" />
                    <span>Style</span>
                  </span>
                  <span className="chat-settings-current">{STYLES.find(s => s.id === style)?.label}</span>
                  <AnimatedIconify icon="solar:alt-arrow-right-bold" className="h-4 w-4" />
                </button>
                <div className="chat-settings-section">
                  <div className="chat-option-grid">
                    {STYLES.slice(0, 3).map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStyle(s.id)}
                        className={`chat-option-pill ${style === s.id ? 'chat-option-pill-active' : ''}`}
                      >
                        <AnimatedIconify icon={s.icon} className="h-3.5 w-3.5" />
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="chat-composer-main mt-5">
            <Textarea
              placeholder="Describe your UGC video idea ..."
              value={script}
              onChange={e => setScript(e.target.value)}
              className="chat-composer-textarea min-h-[72px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              rows={3}
            />
          </div>

          <div className="chat-composer-actions">
            <div className="chat-action-group">
              <div className="relative">
                <button type="button" className={`chat-round-tool ${openComposerPanel === 'add' ? 'chat-round-tool-active' : ''}`} onClick={() => setOpenComposerPanel(openComposerPanel === 'add' ? null : 'add')} aria-label="Add">
                  <AnimatedIconify icon={openComposerPanel === 'add' ? 'solar:close-circle-bold' : 'solar:add-circle-bold'} className="h-5 w-5" />
                </button>
                {openComposerPanel === 'add' && (
                  <div className="chat-popover chat-add-popover">
                    <button type="button" onClick={() => { setProductTab('url'); setOpenComposerPanel('product'); }} className="chat-popover-row">
                      <AnimatedIconify icon="solar:link-round-angle-bold" className="h-4 w-4" />
                      <span>Product URL</span>
                    </button>
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="chat-popover-row">
                      <AnimatedIconify icon="solar:upload-square-bold" className="h-4 w-4" />
                      <span>Upload avatar</span>
                    </button>
                  </div>
                )}
              </div>
              <button type="button" className={`chat-icon-tool ${selectedProduct && !optimizingScript ? 'chat-icon-tool-active' : ''}`} aria-label="Optimize prompt" title="Optimize prompt" onClick={handleOptimizeScript} disabled={!selectedProduct || optimizingScript}>
                {optimizingScript ? <AnimatedIconify icon="solar:stars-line-duotone" className="h-5 w-5" spin /> : <AnimatedIconify icon="solar:lightbulb-bolt-bold" className="h-5 w-5" />}
              </button>
              <button type="button" className={`chat-icon-tool ${openComposerPanel === 'settings' ? 'chat-icon-tool-active' : ''}`} aria-label="Settings" onClick={() => setOpenComposerPanel(openComposerPanel === 'settings' ? null : 'settings')}>
                <AnimatedIconify icon="solar:tuning-2-bold" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setOpenComposerPanel(openComposerPanel === 'avatar' ? null : 'avatar')}
                className="chat-avatar-tool ugc-inline-chip"
                aria-label="Choose avatar"
              >
                <span className="chat-avatar-tool-media">
                  {activeAvatarImage ? <img src={activeAvatarImage} alt="" /> : <AnimatedIconify icon="solar:user-rounded-bold" className="h-4 w-4" />}
                </span>
                <span className="chat-avatar-tool-text">{activeAvatarLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => { setProductTab(selectedProduct ? 'list' : 'url'); setOpenComposerPanel(openComposerPanel === 'product' ? null : 'product'); }}
                className={`chat-avatar-tool ugc-inline-chip ${selectedProduct ? 'chat-icon-tool-active' : ''}`}
                aria-label="Choose product URL"
              >
                <span className="chat-avatar-tool-media">
                  {selectedProduct?.image_url ? <img src={selectedProduct.image_url} alt="" /> : <AnimatedIconify icon="solar:bag-4-bold" className="h-4 w-4" />}
                </span>
                <span className="chat-avatar-tool-text">{selectedProduct ? selectedProduct.name : 'Product URL'}</span>
              </button>
            </div>

            <div className="chat-action-group chat-action-group-right">
              <div className="hidden rounded-full bg-muted/50 px-3 py-2 text-xs font-black text-muted-foreground sm:block">{credits} credits</div>
              <button
                onClick={isGenerating ? undefined : (stage === 'complete' || stage === 'failed' ? handleReset : handleGenerate)}
                disabled={stage === 'complete' || stage === 'failed' ? false : (!canGenerate || isGenerating)}
                className={`chat-send-btn ${canGenerate || stage === 'complete' || stage === 'failed' ? 'chat-send-btn-active' : ''}`}
                type="button"
                aria-label="Generate UGC ad"
              >
                {isGenerating ? <AnimatedIconify icon="solar:refresh-circle-bold" className="h-5 w-5" spin /> : <AnimatedIconify icon={stage === 'complete' || stage === 'failed' ? 'solar:refresh-circle-bold' : 'solar:arrow-up-bold'} className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />
          {(!selectedProduct || !script.trim() || availableCredits < credits) && (
            <div className="ugc-requirements mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground">
              {!selectedProduct && <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-400">Add product URL</span>}
              {!script.trim() && <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-400">Write prompt</span>}
              {availableCredits < credits && <span className="rounded-full bg-destructive/10 px-2 py-1 text-destructive">Need {credits - availableCredits} credits</span>}
            </div>
          )}
        </div>
      </div>

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
              <p className="text-sm font-semibold text-foreground">{stage === 'uploading' ? 'Uploading avatar...' : 'Generating UGC video...'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stageMessage || 'This takes 2-5 minutes. You can navigate away.'}</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full animate-pulse" style={{ width: '45%', transition: 'width 1s ease' }} />
          </div>
        </div>
      )}

      {stage === 'complete' && resultUrl && (
        <div className="rounded-2xl border border-emerald-500/30 bg-card overflow-hidden shadow-lg shadow-emerald-500/5">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
            <AnimatedIconify icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-emerald-400" pulse />
            <span className="text-sm font-semibold text-foreground">Your UGC Ad is ready!</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{selectedProduct?.name} - {duration}s {aspectRatio}</span>
          </div>
          <div className={`relative bg-black flex items-center justify-center ${aspectRatio === '9:16' ? 'max-h-[70vh]' : aspectRatio === '1:1' ? 'max-h-[60vh]' : ''}`} style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
            <video src={`${resultUrl}#t=0.1`} controls playsInline autoPlay muted preload="auto" className="w-full h-full object-contain" />
          </div>
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

      {history.filter(g => g.result_url && g.status === 'completed').length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Recent Ads</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {history.filter(g => g.result_url && g.status === 'completed').slice(0, 8).map(g => (
              <div key={g.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/30 transition-colors">
                <video src={`${g.result_url!}#t=0.1`} controls playsInline muted preload="auto" className="ugc-history-video w-full aspect-video object-cover bg-black" />
                <div className="p-2 flex items-center justify-between gap-1">
                  <p className="text-[10px] text-muted-foreground truncate">{(g.settings?.productName as string) || 'UGC Ad'}</p>
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
