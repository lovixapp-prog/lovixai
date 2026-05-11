import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
  MessageSquare, Coins, LogOut,
  Menu, Crown, Settings,
  X, Monitor, Download, Laptop, ChevronRight,
  ChevronLeft, PanelLeft, Plus, Trash2, ChevronDown, Paperclip,
  Sun, Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedIconify from '@/components/ui/animated-iconify';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { callAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { redirectToExternal } from '@/lib/externalRedirect';
import { useChat } from '@/hooks/useChat';
import { useChatHistory } from '@/hooks/useChatHistory';
import { ChatInterface } from '@/components/chat/ChatInterface';
import VideoGenerator from '@/components/dashboard/VideoGenerator';
import ImageGenerator from '@/components/dashboard/ImageGenerator';
import MotionControl from '@/components/dashboard/MotionControl';
import GenerationProgress from '@/components/dashboard/GenerationProgress';
import MyCreations from '@/components/dashboard/MyCreations';
import AssetsPage from '@/components/dashboard/AssetsPage';
import AIInfluencer from '@/components/dashboard/AIInfluencer';
import UGCVideoGenerator from '@/components/dashboard/UGCVideoGenerator';
import { subscriptionPlans } from './Pricing';
import styleArtistic from '@/assets/style-artistic.jpg';

type ActiveTab = 'home' | 'chat' | 'video' | 'image' | 'influencer' | 'motion' | 'ugc' | 'connectors' | 'creations' | 'files' | 'credits';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
}

const TOOL_ITEMS = [
  {
    icon: 'solar:videocamera-record-bold-duotone',
    navIcon: 'line-md:play',
    label: 'Video',
    id: 'video' as ActiveTab,
    color: 'text-violet-400',
    accent: 'from-violet-500/25 to-primary/10',
    navAccent: 'from-violet-500/35 via-fuchsia-500/12 to-primary/10',
    preview: '/videos/hero-video.mp4',
    description: 'Generate cinematic social videos from prompts or reference images.',
    exampleTitle: 'Cinematic product launch',
    examplePrompt: 'Create a 9:16 launch video with neon product reveal, fast cuts, premium lighting, and a final CTA frame.',
    workflow: ['Prompt', 'Scene direction', 'HD render'],
  },
  {
    icon: 'solar:gallery-wide-bold-duotone',
    navIcon: 'line-md:image-twotone',
    label: 'Image',
    id: 'image' as ActiveTab,
    color: 'text-cyan-400',
    accent: 'from-cyan-500/25 to-primary/10',
    navAccent: 'from-cyan-500/35 via-sky-500/12 to-primary/10',
    preview: styleArtistic,
    description: 'Create product shots, ad visuals, portraits, and campaign artwork.',
    exampleTitle: 'Campaign hero image',
    examplePrompt: 'Generate a colorful artistic campaign visual with sharp subject focus, rich texture, and social-ready composition.',
    workflow: ['Style', 'Reference', 'Image output'],
  },
  {
    icon: 'solar:user-id-bold-duotone',
    navIcon: 'line-md:account',
    label: 'Influencer',
    id: 'influencer' as ActiveTab,
    badge: 'NEW',
    color: 'text-pink-400',
    accent: 'from-pink-500/25 to-primary/10',
    navAccent: 'from-pink-500/35 via-rose-500/12 to-primary/10',
    preview: '/videos/showcase-video.mp4',
    description: 'Build AI personas, generate poses, and keep content visually consistent.',
    exampleTitle: 'Reusable creator persona',
    examplePrompt: 'Build a fashion creator with editorial look, consistent face, pose library, and branded social content direction.',
    workflow: ['Persona', 'Pose set', 'Content'],
  },
  {
    icon: 'solar:magic-stick-3-bold-duotone',
    navIcon: 'line-md:loading-twotone-loop',
    label: 'Motion',
    id: 'motion' as ActiveTab,
    color: 'text-emerald-400',
    accent: 'from-emerald-500/25 to-primary/10',
    navAccent: 'from-emerald-500/35 via-teal-500/12 to-primary/10',
    preview: '/videos/motion-preview.mp4',
    description: 'Animate images, apply motion transfer, and create lip-sync clips.',
    exampleTitle: 'Animate a static visual',
    examplePrompt: 'Animate this portrait with subtle head movement, cinematic camera push, natural expression, and smooth motion.',
    workflow: ['Upload', 'Motion style', 'Animate'],
  },
  {
    icon: 'solar:shop-bold-duotone',
    navIcon: 'line-md:lightbulb',
    label: 'UGC Ads',
    id: 'ugc' as ActiveTab,
    badge: 'NEW',
    color: 'text-amber-400',
    accent: 'from-amber-500/25 to-primary/10',
    navAccent: 'from-amber-500/35 via-orange-500/12 to-primary/10',
    preview: '/videos/video-model-preview.mp4',
    description: 'Turn products into short-form creator ads for paid social.',
    exampleTitle: 'UGC ad from product URL',
    examplePrompt: 'Create a TikTok UGC ad from my product URL with hook, creator script, proof scene, and clear shop-now CTA.',
    workflow: ['Brief', 'Influencer', 'Ad render'],
  },
];

const CONNECTOR_ITEMS = [
  { name: 'Facebook', icon: 'logos:facebook', status: 'Soon', tone: 'bg-blue-500/10 border-blue-400/20' },
  { name: 'Instagram', icon: 'skill-icons:instagram', status: 'Soon', tone: 'bg-pink-500/10 border-pink-400/20' },
  { name: 'TikTok', icon: 'logos:tiktok-icon', status: 'Available', tone: 'bg-cyan-500/10 border-cyan-400/20' },
  { name: 'Shopify', icon: 'logos:shopify', status: 'Soon', tone: 'bg-emerald-500/10 border-emerald-400/20' },
  { name: 'Make', icon: 'simple-icons:make', status: 'Soon', tone: 'bg-violet-500/10 border-violet-400/20' },
  { name: 'Google Drive', icon: 'logos:google-drive', status: 'Soon', tone: 'bg-green-500/10 border-green-400/20' },
  { name: 'YouTube', icon: 'logos:youtube-icon', status: 'Soon', tone: 'bg-red-500/10 border-red-400/20' },
  { name: 'Stripe', icon: 'logos:stripe', status: 'Connected', tone: 'bg-indigo-500/10 border-indigo-400/20' },
  { name: 'Zapier', icon: 'logos:zapier-icon', status: 'Soon', tone: 'bg-orange-500/10 border-orange-400/20' },
];

const MAIN_NAV_ITEMS = [
  { icon: 'solar:home-smile-angle-bold-duotone', label: 'Home', id: 'home' as ActiveTab },
  { icon: 'solar:chat-round-dots-bold-duotone', label: 'Chat', id: 'chat' as ActiveTab },
];

const WORKSPACE_ITEMS = [
  { icon: 'solar:gallery-favourite-bold-duotone', label: 'Creations', id: 'creations' as ActiveTab, color: 'text-fuchsia-400', accent: 'from-fuchsia-500/25 to-pink-500/10', ring: 'border-fuchsia-400/25' },
  { icon: 'solar:plug-circle-bold-duotone', label: 'Connectors', id: 'connectors' as ActiveTab, color: 'text-sky-400', accent: 'from-sky-500/25 to-cyan-500/10', ring: 'border-sky-400/25' },
  { icon: 'solar:bolt-circle-bold-duotone', label: 'Credits', id: 'credits' as ActiveTab, color: 'text-amber-400', accent: 'from-amber-500/25 to-orange-500/10', ring: 'border-amber-400/25' },
];

const isToolTab = (tab: ActiveTab) => TOOL_ITEMS.some(item => item.id === tab);
const isWorkspaceTab = (tab: ActiveTab) => WORKSPACE_ITEMS.some(item => item.id === tab);

const isDesktopApp = typeof window !== 'undefined' && !!(window as any).__lovixDesktop;

const MagicStar = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z" />
  </svg>
);

const AnimatedIcon = ({ icon, className = 'w-4 h-4' }: { icon: string; className?: string }) => (
  <AnimatedIconify icon={icon} className={className} />
);

const ChatDashboard = () => {
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<'create' | 'workspace' | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, loading, signOut, subscription, subscriptionLoading, checkSubscription } = useAuth();
  const { toast } = useToast();

  const credits = profile?.credits ?? 0;
  const hasSubscription = subscription.subscribed;

  useEffect(() => { if (!loading && !user) navigate('/auth'); }, [user, loading, navigate]);
  useEffect(() => { if (user) fetchProfile(); }, [user]);
  useEffect(() => { checkSubscription(); }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!error && data) setProfile(data);
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  /* ─── Chat history (localStorage) ─────────── */
  const {
    chats, activeChatId, activeChat,
    createNewChat, loadChat, updateMessages, deleteChat, ensureChat,
  } = useChatHistory(user?.id);

  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab as ActiveTab);
  }, []);

  const { messages, isThinking, sendMessage, retryGeneration, confirmAgentRequest, cancelAgentRequest, confirmAgentPlan, cancelAgentPlan } = useChat({
    userId: user?.id,
    chatId: activeChatId,
    initialMessages: activeChat?.messages ?? [],
    onCreditsUpdate: fetchProfile,
    onNavigate: handleNavigate,
    onMessagesChange: useCallback((msgs: typeof messages) => {
      const cid = activeChatId ?? ensureChat();
      updateMessages(cid, msgs);
    }, [activeChatId, ensureChat, updateMessages]),
  });

  const handleNewChat = useCallback(() => {
    createNewChat();
    setActiveTab('chat');
    setMobileSidebarOpen(false);
    setMobileMenu(null);
  }, [createNewChat]);

  const handleLoadChat = useCallback((chatId: string) => {
    loadChat(chatId);
    setActiveTab('chat');
    setMobileSidebarOpen(false);
    setMobileMenu(null);
  }, [loadChat]);

  const handleSendMessage = useCallback(async (text: string, file?: File | null) => {
    if (!activeChatId) ensureChat();
    await sendMessage(text, file);
  }, [activeChatId, ensureChat, sendMessage]);

  /* ─── Payments ──────────────────────────────── */
  const handlePurchase = async (priceId: string) => {
    setLoadingId(priceId);
    try {
      await supabase.auth.refreshSession();
      const data = await callAPI<{ url?: string; error?: string }>('create-checkout', { priceId, mode: 'subscription' });
      if (data?.error) throw new Error(data.error);
      if (data?.url) redirectToExternal(data.url);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    } finally { setLoadingId(null); }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await supabase.auth.refreshSession();
      const data = await callAPI<{ url?: string; error?: string }>('customer-portal', {});
      if (data?.error) throw new Error(data.error);
      if (data?.url) redirectToExternal(data.url);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    } finally { setPortalLoading(false); }
  };

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const handleTabChange = (id: ActiveTab) => {
    setActiveTab(id);
    setMobileSidebarOpen(false);
    setMobileMenu(null);
  };

  /* ─── Sidebar Content (shared desktop/mobile) ─ */
  const SidebarContent = ({ collapsed = false, mobile = false }: { collapsed?: boolean; mobile?: boolean }) => {
    const show = mobile || !collapsed;
    const recentChats = chats.slice(0, 6);

    const openMainNav = (id: ActiveTab) => {
      if (id === 'chat' && activeChatId) loadChat(activeChatId);
      handleTabChange(id);
    };

    return (
      <div className={`flex flex-col flex-1 min-h-0 ${show ? 'overflow-y-auto scrollbar-none' : 'overflow-hidden'}`}>
        <div className={`pt-3 ${show ? 'px-3' : 'px-2'}`}>
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center gap-2 rounded-xl transition-all duration-150 font-semibold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_22px_hsl(var(--primary)/0.22)] ${show ? 'px-3 py-2.5' : 'p-2.5 justify-center'}`}
            title={!show ? 'New project' : undefined}
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            {show && 'New project'}
          </button>
        </div>

        {!show ? (
          <nav className="px-2 pt-3 space-y-1">
            {[
              ...MAIN_NAV_ITEMS,
              { icon: 'solar:widget-5-bold-duotone', label: 'Tools', id: (isToolTab(activeTab) ? activeTab : 'home') as ActiveTab },
              { icon: 'solar:bolt-circle-bold-duotone', label: 'Credits', id: 'credits' as ActiveTab },
            ].map(item => {
              const isActive = activeTab === item.id || (item.label === 'Tools' && isToolTab(activeTab));
              return (
                <button
                  key={`${item.label}-${item.id}`}
                  onClick={() => openMainNav(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-150 ${
                    isActive ? 'bg-primary/15 text-primary shadow-[0_0_16px_hsl(var(--primary)/0.18)]' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                  }`}
                >
                  <AnimatedIconify icon={item.icon} className={`w-4 h-4 ${item.label === 'Tools' ? 'text-violet-400' : item.label === 'Credits' ? 'text-amber-400' : ''}`} />
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="px-3 pt-4 pb-3 space-y-5">
            <section>
              <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 block mb-1.5">Navigate</span>
              <nav className="space-y-1">
                {MAIN_NAV_ITEMS.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => openMainNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-xs font-medium ${
                        isActive ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                      }`}
                    >
                      <AnimatedIconify icon={item.icon} className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </section>

            <section>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Create</span>
                <button onClick={() => handleTabChange('home')} className="text-[10px] font-semibold text-primary/80 hover:text-primary">All</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TOOL_ITEMS.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`group relative min-h-[76px] overflow-hidden rounded-2xl border px-2.5 py-2.5 text-left transition-all duration-200 ${
                        isActive
                          ? `border-primary/35 bg-gradient-to-br ${item.navAccent} text-foreground shadow-[0_0_22px_hsl(var(--primary)/0.2)]`
                          : `border-sidebar-border/70 bg-gradient-to-br ${item.navAccent} text-foreground/85 hover:border-primary/25 hover:-translate-y-0.5 hover:shadow-[0_0_18px_hsl(var(--primary)/0.14)]`
                      }`}
                    >
                      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                      <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-background/35 ring-1 ring-white/10 ${item.color}`}>
                        <AnimatedIconify icon={item.navIcon} className="w-5 h-5" />
                      </span>
                      <span className="block text-[11px] font-bold leading-tight">{item.label}</span>
                      {item.badge && (
                        <span className="absolute right-1.5 top-1.5 text-[8px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 block mb-1.5">Workspace</span>
              <nav className="space-y-1">
                {WORKSPACE_ITEMS.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-xs font-medium ${
                        isActive ? `border ${item.ring} bg-gradient-to-r ${item.accent} text-foreground` : `border border-transparent bg-gradient-to-r ${item.accent} text-foreground/80 hover:border-primary/20 hover:text-foreground`
                      }`}
                    >
                      <AnimatedIconify icon={item.icon} className={`w-4 h-4 ${item.color}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.id === 'credits' && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          hasSubscription ? 'bg-primary/15 text-primary' : credits > 0 ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'
                        }`}>{hasSubscription ? '∞' : credits}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </section>

            {recentChats.length > 0 && activeTab === 'chat' && (
              <section>
                <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 block mb-1.5">Recent</span>
                <nav className="space-y-1">
                  {recentChats.slice(0, 3).map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => handleLoadChat(chat.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-150 ${
                        chat.id === activeChatId ? 'bg-sidebar-accent text-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                      }`}
                    >
                      <AnimatedIconify icon="solar:chat-line-bold-duotone" className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                      <span className="text-xs truncate leading-tight">{chat.title}</span>
                    </button>
                  ))}
                </nav>
              </section>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* New Chat button */}
        <div className={`pt-2 pb-1 ${show ? 'px-3' : 'px-2'}`}>
          <button
            onClick={() => handleTabChange('home')}
            className={`group mb-1 w-full flex items-center gap-2 rounded-xl transition-all duration-150 font-medium text-xs ${
              activeTab === 'home'
                ? 'bg-sidebar-accent text-primary'
                : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
            } ${show ? 'px-3 py-2' : 'p-2.5 justify-center'}`}
            title={!show ? 'Home' : undefined}
          >
            <AnimatedIcon icon="solar:home-smile-angle-bold-duotone" className="w-3.5 h-3.5" />
            {show && 'Home'}
          </button>
          <button
            onClick={handleNewChat}
            className={`
              w-full flex items-center gap-2 rounded-xl transition-all duration-150 font-medium text-xs
              bg-primary/10 border border-primary/20 text-primary hover:bg-primary/18 hover:border-primary/35
              ${show ? 'px-3 py-2' : 'p-2.5 justify-center'}
            `}
            title={!show ? 'New Chat' : undefined}
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            {show && 'New Chat'}
          </button>
        </div>

        {/* Chat history list */}
        <div className={`flex-1 overflow-y-auto scrollbar-none ${show ? 'px-3' : 'px-2'}`}>
          {show && chats.length > 0 && (
            <div className="mb-1">
              <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 block mb-1">Conversations</span>
              <nav className="space-y-0.5">
                {chats.slice(0, 20).map(chat => {
                  const isActive = chat.id === activeChatId && activeTab === 'chat';
                  return (
                    <div
                      key={chat.id}
                      className={`group relative flex items-center rounded-xl transition-all duration-150 ${
                        isActive ? 'bg-sidebar-accent text-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                      }`}
                      onMouseEnter={() => setHoveredChatId(chat.id)}
                      onMouseLeave={() => setHoveredChatId(null)}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.7)]" />
                      )}
                      <button
                        onClick={() => handleLoadChat(chat.id)}
                        className="flex-1 flex items-center gap-2 px-3 py-2 min-w-0 text-left"
                      >
                        <MessageSquare className="w-3 h-3 flex-shrink-0 opacity-60" />
                        <span className="text-xs truncate leading-tight">{chat.title}</span>
                      </button>
                      {hoveredChatId === chat.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                          className="flex-shrink-0 p-1.5 mr-1 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Collapsed — chat icon */}
          {!show && (
            <nav className="space-y-0.5">
              <button
                onClick={() => { setActiveTab('chat'); if (activeChatId) loadChat(activeChatId); }}
                className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-150 ${
                  activeTab === 'chat' ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                }`}
                title="Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </nav>
          )}

          <div className={`border-t border-sidebar-border/50 my-2 ${show ? '' : ''}`} />

          {/* Tools section */}
          {show ? (
            <div className="mb-1">
              <button
                onClick={() => setToolsExpanded(p => !p)}
                className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-1"
              >
                <span className="text-[9px] font-semibold uppercase tracking-widest flex-1 text-left">Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${toolsExpanded ? 'rotate-180' : ''}`} />
              </button>
              {toolsExpanded && (
                <nav className="space-y-0.5">
                  {TOOL_ITEMS.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-150 text-xs font-medium ${
                          isActive ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                        }`}
                      >
                        <span className={isActive ? item.color : ''}><AnimatedIcon icon={item.icon} className="w-3.5 h-3.5" /></span>
                        <span>{item.label}</span>
                        {item.badge && !isActive && (
                          <span className="ml-auto text-[8px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">{item.badge}</span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          ) : (
            <nav className="space-y-0.5">
              {TOOL_ITEMS.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    title={item.label}
                    className={`relative w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-150 ${
                      isActive ? `bg-sidebar-accent ${item.color}` : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                    }`}
                  >
                    <AnimatedIcon icon={item.icon} className="w-4 h-4" />
                    {item.badge && !isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          <div className={`border-t border-sidebar-border/50 my-2`} />

          {/* Library section */}
          {show ? (
            <div>
              <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 block mb-1">Library</span>
              <nav className="space-y-0.5">
                {[
                  { icon: <AnimatedIconify icon="solar:plug-circle-bold-duotone" className="w-3.5 h-3.5" />, label: 'Connectors', id: 'connectors' as ActiveTab },
                  { icon: <AnimatedIconify icon="solar:gallery-favourite-bold-duotone" className="w-3.5 h-3.5" />, label: 'My Creations', id: 'creations' as ActiveTab },
                  { icon: <AnimatedIconify icon="solar:file-text-bold-duotone" className="w-3.5 h-3.5" />, label: 'Files', id: 'files' as ActiveTab },
                  { icon: <AnimatedIconify icon="solar:bolt-circle-bold-duotone" className="w-3.5 h-3.5" />, label: 'Credits', id: 'credits' as ActiveTab },
                ].map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-150 text-xs font-medium ${
                        isActive ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.id === 'credits' && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          hasSubscription ? 'bg-primary/15 text-primary' : credits > 0 ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'
                        }`}>{hasSubscription ? '∞' : credits}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ) : (
            <nav className="space-y-0.5">
              {[
                { icon: <AnimatedIconify icon="solar:plug-circle-bold-duotone" className="w-4 h-4" />, label: 'Connectors', id: 'connectors' as ActiveTab },
                { icon: <AnimatedIconify icon="solar:gallery-favourite-bold-duotone" className="w-4 h-4" />, label: 'Creations', id: 'creations' as ActiveTab },
                { icon: <AnimatedIconify icon="solar:file-text-bold-duotone" className="w-4 h-4" />, label: 'Files', id: 'files' as ActiveTab },
                { icon: <AnimatedIconify icon="solar:bolt-circle-bold-duotone" className="w-4 h-4" />, label: 'Credits', id: 'credits' as ActiveTab },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-150 ${
                    activeTab === item.id ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'
                  }`}
                >
                  {item.icon}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    );
  };

  /* ─── Content ──────────────────────────────── */
  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <DashboardHome
          userName={profile?.full_name}
          credits={credits}
          hasSubscription={hasSubscription}
          onOpen={handleTabChange}
        />
      );
    }
    if (activeTab === 'chat') {
      return (
        <ChatInterface
          messages={messages}
          isThinking={isThinking}
          onSend={handleSendMessage}
          onRetry={retryGeneration}
          onConfirmAgentRequest={confirmAgentRequest}
          onCancelAgentRequest={cancelAgentRequest}
          onConfirmAgentPlan={confirmAgentPlan}
          onCancelAgentPlan={cancelAgentPlan}
          onUseForVideo={() => handleTabChange('video')}
          userName={profile?.full_name}
        />
      );
    }
    if (activeTab === 'video') return <VideoGenerator onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasSubscription} onUpgradeClick={() => handleTabChange('credits')} />;
    if (activeTab === 'image') return <ImageGenerator onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasSubscription} onUpgradeClick={() => handleTabChange('credits')} />;
    if (activeTab === 'motion') return <MotionControl onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasSubscription} onUpgradeClick={() => handleTabChange('credits')} />;
    if (activeTab === 'influencer') return <AIInfluencer onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasSubscription} onUpgrade={() => handleTabChange('credits')} />;
    if (activeTab === 'ugc') return <UGCVideoGenerator onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasSubscription} />;
    if (activeTab === 'connectors') return <ConnectorsTab />;
    if (activeTab === 'creations') return user ? <MyCreations userId={user.id} /> : null;
    if (activeTab === 'files') return user ? <AssetsPage userId={user.id} /> : null;
    if (activeTab === 'credits') return (
      <CreditsTab
        hasSubscription={hasSubscription}
        subscription={subscription}
        subscriptionLoading={subscriptionLoading}
        credits={credits}
        loadingId={loadingId}
        portalLoading={portalLoading}
        onPurchase={handlePurchase}
        onManage={handleManageSubscription}
        onRefresh={checkSubscription}
      />
    );
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="star-icon star-icon-xl animate-pulse"><MagicStar className="w-10 h-10" /></div>
      </div>
    );
  }

  const collapsed = !sidebarPinned;

  return (
    <div className="h-dvh bg-background flex overflow-hidden">

      {/* ── Desktop Sidebar ────────────────────────────────────────── */}
      <aside className={`
        hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-40
        transition-all duration-300 ease-in-out overflow-hidden
        bg-sidebar border-r border-sidebar-border
        ${sidebarPinned ? 'w-64' : 'w-[60px]'}
      `}>

        {/* Header */}
        <div className={`flex items-center border-b border-sidebar-border flex-shrink-0 ${sidebarPinned ? 'px-3 h-13 gap-2' : 'px-0 h-13 justify-center'}`}
          style={{ height: 52 }}>
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img src="/logo.svg" alt="LOVIX" width="28" height="28" className="w-7 h-7 flex-shrink-0 transition-transform duration-300 group-hover:scale-105" />
            {sidebarPinned && (
              <span className="font-display text-sm font-bold gradient-text-aurora whitespace-nowrap">LOVIX AI</span>
            )}
          </Link>
          {sidebarPinned && (
            <button onClick={() => setSidebarPinned(false)} className="ml-auto p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Subscription badge */}
        {hasSubscription && (
          <div className={`pt-2 pb-0 ${sidebarPinned ? 'px-3' : 'px-2'}`}>
            {sidebarPinned ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <Crown className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-primary font-semibold text-xs truncate">{subscription.plan}</span>
                <span className="ml-auto text-primary text-[10px] font-mono font-bold">∞</span>
              </div>
            ) : (
              <div className="flex items-center justify-center p-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <Crown className="w-3 h-3 text-primary" />
              </div>
            )}
          </div>
        )}

        <SidebarContent collapsed={collapsed} />

        {/* Expand button when collapsed */}
        {!sidebarPinned && (
          <div className="px-2 pb-1">
            <button onClick={() => setSidebarPinned(true)} className="w-full flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors" title="Expand">
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Desktop App (only expanded) */}
        {!isDesktopApp && sidebarPinned && (
          <div className="px-3 pb-2 space-y-0.5">
            <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest px-2 block mb-1">Desktop App</span>
            <a href="/api/track-download?platform=win" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors group">
              <Monitor className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" />
              <span className="flex-1">Windows</span>
              <Download className="w-2.5 h-2.5 opacity-30 group-hover:opacity-60 transition-opacity" />
            </a>
            <a href="/api/track-download?platform=mac" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors group">
              <Laptop className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" />
              <span className="flex-1">macOS</span>
              <Download className="w-2.5 h-2.5 opacity-30 group-hover:opacity-60 transition-opacity" />
            </a>
          </div>
        )}

        {/* User */}
        <div className={`border-t border-sidebar-border ${sidebarPinned ? 'p-3' : 'p-2'}`}>
          {sidebarPinned ? (
            <>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center flex-shrink-0">
                  <span className="text-foreground font-semibold text-[10px]">{getInitials()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-xs truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-0.5">
                <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors">
                  <Settings className="w-3 h-3" />Settings
                </button>
                <button onClick={toggleTheme} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors">
                  {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-3 h-3" />Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center" title={profile?.full_name || user?.email || ''}>
                <span className="text-foreground font-semibold text-[9px]">{getInitials()}</span>
              </div>
              <button onClick={() => navigate('/settings')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors" title="Settings">
                <Settings className="w-3 h-3" />
              </button>
              <button onClick={toggleTheme} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors" title={isDark ? 'Light Mode' : 'Dark Mode'}>
                {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              </button>
              <button onClick={handleSignOut} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Sign Out">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Sidebar ──────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-10 w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex items-center justify-between px-4 h-13 border-b border-sidebar-border" style={{ height: 52 }}>
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.svg" alt="LOVIX" width="26" height="26" className="w-[26px] h-[26px]" />
                <span className="font-display text-sm font-bold gradient-text-aurora">LOVIX AI</span>
              </Link>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {hasSubscription && (
              <div className="px-3 pt-2 pb-0.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Crown className="w-3 h-3 text-primary" />
                  <span className="text-primary font-semibold text-xs">{subscription.plan}</span>
                  <span className="ml-auto text-primary text-[10px] font-mono font-bold">∞</span>
                </div>
              </div>
            )}
            <SidebarContent mobile />
            <div className="p-3 border-t border-sidebar-border space-y-0.5 mt-auto">
              <button onClick={() => { navigate('/settings'); setMobileSidebarOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors">
                <Settings className="w-3.5 h-3.5" />Settings
              </button>
              <button onClick={toggleTheme}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors">
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="w-3.5 h-3.5" />Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-2.5 border-b border-border bg-sidebar/80 backdrop-blur-sm sticky top-0 z-30" style={{ height: 52 }}>
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="star-icon" style={{ width: 12, height: 12 }}><MagicStar className="w-3 h-3" /></div>
            <span className="font-display font-bold text-sm gradient-text-aurora">LOVIX AI</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${
            hasSubscription ? 'bg-primary/15 text-primary' : credits > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
          }`}>
            <Coins className="w-3 h-3" />{hasSubscription ? '∞' : credits}
          </div>
        </header>

        {/* Content */}
        <div className={`flex-1 min-h-0 ${activeTab === 'chat' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto pb-20 lg:pb-8'}`}>
          {activeTab !== 'chat' ? (
            <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${['home', 'connectors', 'influencer', 'ugc'].includes(activeTab) ? 'max-w-7xl' : 'max-w-4xl'}`}>
              {renderContent()}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">{renderContent()}</div>
          )}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────── */}
      <nav className="mobile-bottom-nav">
        <div className="flex items-stretch">
          <button onClick={() => handleTabChange('home')} className={`mobile-nav-item ${activeTab === 'home' ? 'mobile-nav-item-active' : 'text-muted-foreground'}`}>
            <AnimatedIconify icon="solar:home-smile-angle-bold-duotone" className={`w-5 h-5 ${activeTab === 'home' ? 'scale-110 text-primary' : ''}`} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => handleTabChange('chat')} className={`mobile-nav-item ${activeTab === 'chat' ? 'mobile-nav-item-active' : 'text-muted-foreground'}`}>
            <AnimatedIconify icon="solar:chat-round-dots-bold-duotone" className={`w-5 h-5 ${activeTab === 'chat' ? 'scale-110 text-primary' : ''}`} />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
          <button onClick={() => setMobileMenu(mobileMenu === 'create' ? null : 'create')} className={`mobile-nav-item ${isToolTab(activeTab) || mobileMenu === 'create' ? 'mobile-nav-item-active' : 'text-muted-foreground'}`}>
            <span className={`rounded-xl p-1 transition-all duration-200 ${isToolTab(activeTab) || mobileMenu === 'create' ? 'bg-violet-500/20 shadow-[0_0_14px_rgba(168,85,247,0.28)]' : 'bg-violet-500/10'}`}>
              <AnimatedIconify icon="solar:widget-5-bold-duotone" className={`w-4 h-4 ${isToolTab(activeTab) || mobileMenu === 'create' ? 'scale-110 text-violet-400' : 'text-violet-300'}`} />
            </span>
            <span className="text-[10px] font-medium">Create</span>
          </button>
          <button onClick={() => setMobileMenu(mobileMenu === 'workspace' ? null : 'workspace')} className={`mobile-nav-item ${isWorkspaceTab(activeTab) || mobileMenu === 'workspace' ? 'mobile-nav-item-active' : 'text-muted-foreground'}`}>
            <span className={`rounded-xl p-1 transition-all duration-200 ${isWorkspaceTab(activeTab) || mobileMenu === 'workspace' ? 'bg-amber-500/20 shadow-[0_0_14px_rgba(245,158,11,0.26)]' : 'bg-amber-500/10'}`}>
              <AnimatedIconify icon="solar:case-round-minimalistic-bold-duotone" className={`w-4 h-4 ${isWorkspaceTab(activeTab) || mobileMenu === 'workspace' ? 'scale-110 text-amber-400' : 'text-amber-300'}`} />
            </span>
            <span className="text-[10px] font-medium">Workspace</span>
          </button>
        </div>
      </nav>

      {/* Mobile quick menu */}
      {mobileMenu && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenu(null)} />
          <div className="fixed bottom-16 left-0 right-0 z-50 lg:hidden mx-4 mb-2 rounded-2xl bg-sidebar border border-sidebar-border shadow-2xl overflow-hidden">
            <div className="border-b border-sidebar-border/70 px-4 py-3">
              <p className="text-xs font-semibold text-foreground">{mobileMenu === 'create' ? 'Create tools' : 'Workspace'}</p>
              <p className="text-[11px] text-muted-foreground">{mobileMenu === 'create' ? 'Choose the generator you need.' : 'Manage assets, connectors, and credits.'}</p>
            </div>
            <div className={`p-3 ${mobileMenu === 'create' ? 'grid grid-cols-2 gap-2.5' : 'space-y-1'}`}>
              {(mobileMenu === 'create' ? TOOL_ITEMS : WORKSPACE_ITEMS).map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => handleTabChange(item.id)}
                    className={`${mobileMenu === 'create' ? 'min-h-[96px] flex-col items-start justify-between rounded-2xl' : 'w-full rounded-xl'} group relative overflow-hidden flex gap-3 px-4 py-3 transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? `border ${'ring' in item ? item.ring : 'border-primary/25'} bg-gradient-to-br ${'navAccent' in item ? item.navAccent : item.accent} text-foreground shadow-[0_0_20px_hsl(var(--primary)/0.16)]`
                        : `border border-sidebar-border/70 bg-gradient-to-br ${'navAccent' in item ? item.navAccent : item.accent} text-sidebar-foreground hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_0_16px_hsl(var(--primary)/0.12)]`
                    }`}>
                    {mobileMenu === 'create' && <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />}
                    <span className={`${mobileMenu === 'create' ? 'h-10 w-10 rounded-2xl bg-background/35 ring-1 ring-white/10' : 'h-7 w-7 rounded-xl bg-background/25'} flex items-center justify-center ${'color' in item ? item.color : ''}`}>
                      <AnimatedIconify icon={'navIcon' in item ? item.navIcon : item.icon} className={mobileMenu === 'create' ? 'w-6 h-6' : 'w-4 h-4'} />
                    </span>
                    <span className={mobileMenu === 'create' ? 'text-[13px] font-bold' : ''}>{item.label}</span>
                    {'badge' in item && item.badge && <span className="ml-auto text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">{item.badge as string}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {user && <GenerationProgress userId={user.id} onComplete={fetchProfile} />}
    </div>
  );
};

function DashboardHome({
  userName,
  credits,
  hasSubscription,
  onOpen,
}: {
  userName?: string | null;
  credits: number;
  hasSubscription: boolean;
  onOpen: (id: ActiveTab) => void;
}) {
  const firstName = userName?.split(' ')[0] || 'Creator';

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_86%_18%,hsl(var(--cyan)/0.12),transparent_30%)]" />
        <div className="relative z-10 p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <AnimatedIconify icon="solar:stars-bold-duotone" className="h-4 w-4" />
                LOVIX dashboard
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Pick a creative tool, connect a channel, or jump back into chat. Everything is arranged for quick mobile creation first.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <button onClick={() => onOpen('chat')} className="group rounded-2xl border border-border/70 bg-background/45 px-4 py-3 text-left transition-all hover:border-primary/35 hover:bg-primary/5">
                <AnimatedIconify icon="solar:chat-round-dots-bold-duotone" className="mb-2 h-6 w-6 text-primary" />
                <p className="text-xs text-muted-foreground">AI chat</p>
                <p className="text-sm font-semibold">Create by prompt</p>
              </button>
              <button onClick={() => onOpen('credits')} className="group rounded-2xl border border-border/70 bg-background/45 px-4 py-3 text-left transition-all hover:border-primary/35 hover:bg-primary/5">
                <AnimatedIconify icon="solar:bolt-circle-bold-duotone" className="mb-2 h-6 w-6 text-amber-400" />
                <p className="text-xs text-muted-foreground">Credits</p>
                <p className="text-sm font-semibold">{hasSubscription ? 'Unlimited' : credits}</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">Creative Tools</h2>
            <p className="text-sm text-muted-foreground">Tap a card to open the full workflow.</p>
          </div>
          <button onClick={() => onOpen('connectors')} className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex">
            Connectors
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {TOOL_ITEMS.map((tool, index) => {
            const isVideoPreview = tool.preview.endsWith('.mp4');
            return (
              <button
                key={tool.id}
                onClick={() => onOpen(tool.id)}
                className="group overflow-hidden rounded-xl border border-border/70 bg-card text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_12px_36px_hsl(var(--primary)/0.12)]"
              >
                <div className={`relative aspect-video overflow-hidden bg-gradient-to-br ${tool.accent}`}>
                  {isVideoPreview ? (
                    <video src={tool.preview} className="h-full w-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-105" autoPlay muted loop playsInline />
                  ) : (
                    <img src={tool.preview} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                  <div className={`absolute left-2.5 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-background/70 backdrop-blur ${tool.color}`}>
                    <AnimatedIcon icon={tool.icon} className="h-5 w-5" />
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 rounded-full border border-white/10 bg-background/70 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 backdrop-blur">
                    Tool {index + 1}
                  </div>
                </div>
                <div className="p-3 sm:p-3.5">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <h3 className="font-display text-sm font-bold sm:text-base">{tool.label}</h3>
                    {tool.badge && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{tool.badge}</span>}
                  </div>
                  <p className="line-clamp-2 min-h-[34px] text-xs leading-[17px] text-muted-foreground sm:min-h-[38px] sm:text-[13px] sm:leading-[19px]">{tool.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    Open tool <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl font-bold sm:text-2xl">Tool intros</h2>
          <p className="text-sm text-muted-foreground">Ogni tool parte da un esempio pratico, pronto da aprire e adattare.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {TOOL_ITEMS.map(tool => {
            const isVideoPreview = tool.preview.endsWith('.mp4');
            return (
              <article key={`intro-${tool.id}`} className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-[0_16px_48px_hsl(var(--primary)/0.10)]">
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <button onClick={() => onOpen(tool.id)} className="relative aspect-video overflow-hidden bg-muted text-left sm:aspect-auto sm:min-h-[220px]">
                    {isVideoPreview ? (
                      <video src={tool.preview} className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" autoPlay muted loop playsInline />
                    ) : (
                      <img src={tool.preview} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/15 to-transparent sm:bg-gradient-to-r" />
                    <div className={`absolute left-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-background/75 backdrop-blur ${tool.color}`}>
                      <AnimatedIconify icon={tool.icon} className="h-6 w-6" pulse />
                    </div>
                  </button>

                  <div className="flex min-h-[220px] flex-col p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">{tool.label}</p>
                        <h3 className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">{tool.exampleTitle}</h3>
                      </div>
                      {tool.badge && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{tool.badge}</span>}
                    </div>

                    <div className={`mt-4 rounded-2xl border border-border/60 bg-gradient-to-br ${tool.accent} p-3`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Example prompt</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/90">{tool.examplePrompt}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {tool.workflow.map(step => (
                        <div key={step} className="rounded-xl border border-border/55 bg-background/45 px-2 py-2 text-center">
                          <p className="truncate text-[11px] font-semibold text-muted-foreground">{step}</p>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => onOpen(tool.id)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98] sm:mt-auto">
                      <AnimatedIconify icon={tool.icon} className="h-4 w-4" />
                      Open {tool.label}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Connectors</h2>
            <p className="text-sm text-muted-foreground">Publish and automate across platforms.</p>
          </div>
          <button onClick={() => onOpen('connectors')} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            View all
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
          {CONNECTOR_ITEMS.slice(0, 9).map(connector => (
            <div key={connector.name} className="group flex aspect-square flex-col items-center justify-center rounded-2xl border border-border/60 bg-background/45 p-2 transition-all hover:border-primary/35 hover:bg-primary/5">
              <AnimatedIconify icon={connector.icon} className="h-7 w-7" />
              <span className="mt-2 max-w-full truncate text-[11px] font-semibold">{connector.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ConnectorsTab() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Icon icon="solar:plug-circle-bold-duotone" className="h-4 w-4" />
              Platform connectors
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Connect your creative stack</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Prepare publishing, commerce, automations, storage, and social distribution from one dashboard surface.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONNECTOR_ITEMS.map(connector => (
          <div key={connector.name} className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_hsl(var(--primary)/0.10)] ${connector.tone}`}>
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white/5 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-background/75 backdrop-blur">
                <Icon icon={connector.icon} className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold">{connector.name}</h3>
                <p className="text-sm text-muted-foreground">Connector status</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                connector.status === 'Available' || connector.status === 'Connected'
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {connector.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Credits Tab ─────────────────────────────────────────────── */
function CreditsTab({ hasSubscription, subscription, subscriptionLoading, credits, loadingId, portalLoading, onPurchase, onManage, onRefresh }: {
  hasSubscription: boolean;
  subscription: { subscribed: boolean; plan: string | null; priceId: string | null; subscriptionEnd: string | null };
  subscriptionLoading: boolean;
  credits: number;
  loadingId: string | null;
  portalLoading: boolean;
  onPurchase: (id: string) => void;
  onManage: () => void;
  onRefresh: () => void;
}) {
  const MS = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10" aria-hidden="true">
      <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z" />
    </svg>
  );
  return (
    <div className="space-y-8">
      <div className="tool-hero-sm rounded-2xl overflow-hidden">
        <div className="tool-hero-bg" /><div className="tool-hero-grid" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="star-icon star-icon-xl"><MS /></div>
          <h2 className="tool-hero-title">Credits &amp; Plans</h2>
          <p className="tool-hero-subtitle">Power your creativity. Generate more, create more.</p>
        </div>
      </div>
      <div className={`rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${hasSubscription ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Current Status</p>
            {subscriptionLoading ? <div className="flex items-center gap-2"><AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-5 h-5 text-primary" spin /><span>Checking...</span></div>
              : hasSubscription ? <p className="font-display text-2xl font-bold flex items-center gap-2"><AnimatedIconify icon="solar:crown-star-bold-duotone" className="w-6 h-6 text-primary" />{subscription.plan}</p>
              : <p className="font-display text-2xl font-bold">No Active Subscription</p>}
          </div>
          <div className="text-right">
            <p className="text-muted-foreground mb-1 text-sm">Credits</p>
            <p className="font-display text-4xl font-bold">{hasSubscription ? '∞' : credits}</p>
          </div>
        </div>
        {hasSubscription && (
          <Button variant="outline" onClick={onManage} disabled={portalLoading} className="mt-4">
            {portalLoading ? <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4 mr-2" spin /> : <AnimatedIconify icon="solar:settings-bold-duotone" className="w-4 h-4 mr-2" />}
            Manage Subscription
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold flex items-center gap-2"><AnimatedIconify icon="solar:crown-star-bold-duotone" className="w-5 h-5 text-primary" />Subscription Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subscriptionPlans.map(plan => {
            const isCurrent = subscription.priceId === plan.priceId;
            return (
              <div key={plan.priceId} className={`relative rounded-2xl border p-5 sm:p-6 transition-all ${isCurrent ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/25'}`}>
                {isCurrent && <div className="absolute -top-3 left-4"><span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Your Plan</span></div>}
                {plan.badge && !isCurrent && <div className="absolute -top-3 left-4"><span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">{plan.badge}</span></div>}
                <h4 className="font-display text-lg font-semibold mb-1">{plan.name}</h4>
                <div className="mb-1">
                  <span className="text-sm text-muted-foreground line-through mr-2">${plan.originalPrice}</span>
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-primary font-semibold mb-4">{plan.credits.toLocaleString()} credits/month</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 4).map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm"><AnimatedIconify icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-primary flex-shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button className="w-full" variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                  onClick={() => isCurrent ? onManage() : onPurchase(plan.priceId)} disabled={loadingId === plan.priceId || portalLoading}>
                  {loadingId === plan.priceId ? <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4" spin /> : isCurrent ? 'Manage' : 'Subscribe'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="ghost" className="flex-1"><Link to="/pricing">All Plans</Link></Button>
        <Button variant="ghost" onClick={onRefresh} disabled={subscriptionLoading} className="flex-1">
          {subscriptionLoading && <AnimatedIconify icon="solar:refresh-circle-bold-duotone" className="w-4 h-4 mr-2" spin />}Refresh
        </Button>
      </div>
    </div>
  );
}

export default ChatDashboard;
