import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Video,
  Image,
  Wand2,
  FolderOpen,
  Coins,
  LogOut,
  Menu,
  Check,
  Crown,
  Settings,
  Database,
  UserCircle,
  Loader2,
  MoreHorizontal,
  X,
  Monitor,
  Download,
  Laptop,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { redirectToExternal } from "@/lib/externalRedirect";
import VideoGenerator from "@/components/dashboard/VideoGenerator";
import ImageGenerator from "@/components/dashboard/ImageGenerator";
import MotionControl from "@/components/dashboard/MotionControl";
import GenerationProgress from "@/components/dashboard/GenerationProgress";
import MyCreations from "@/components/dashboard/MyCreations";
import AssetsPage from "@/components/dashboard/AssetsPage";
import AIInfluencer from "@/components/dashboard/AIInfluencer";
import UGCVideoGenerator from "@/components/dashboard/UGCVideoGenerator";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  id: string;
  badge?: string;
  color?: string;
}

const toolItems: SidebarItem[] = [
  { icon: <Video className="w-5 h-5" />, label: "Video", sublabel: "Text · Image to Video", id: "video", color: "text-violet-400" },
  { icon: <Image className="w-5 h-5" />, label: "Image", sublabel: "Generate & Edit", id: "image", color: "text-cyan-400" },
  { icon: <UserCircle className="w-5 h-5" />, label: "Influencer", sublabel: "Create & Animate", id: "influencer", badge: "NEW", color: "text-pink-400" },
  { icon: <Wand2 className="w-5 h-5" />, label: "Motion", sublabel: "Transfer · Lip Sync", id: "motion", color: "text-emerald-400" },
  { icon: <Video className="w-5 h-5" />, label: "UGC Ads", sublabel: "Product Video Ads", id: "ugc", badge: "NEW", color: "text-amber-400" },
];

const utilityItems: SidebarItem[] = [
  { icon: <FolderOpen className="w-5 h-5" />, label: "Creations", id: "creations" },
  { icon: <Database className="w-5 h-5" />, label: "Assets", id: "assets" },
  { icon: <Coins className="w-5 h-5" />, label: "Credits", id: "credits" },
];

const allItems = [...toolItems, ...utilityItems];

import { subscriptionPlans } from './Pricing';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
}

const isDesktopApp = typeof window !== 'undefined' && !!(window as any).__lovixDesktop;

const MagicStar = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.4 6.5 13.8 10.2 17.5 12C13.8 13.8 12.4 17.5 12 22C11.6 17.5 10.2 13.8 6.5 12C10.2 10.2 11.6 6.5 12 2Z"/>
  </svg>
);

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("video");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut, subscription, subscriptionLoading, checkSubscription } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!error && data) setProfile(data);
  }, [user]);

  useEffect(() => { if (user) fetchProfile(); }, [user, fetchProfile]);
  useEffect(() => { checkSubscription(); }, [checkSubscription]);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const handlePurchase = async (priceId: string) => {
    setLoadingId(priceId);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) {
        const { data: currentSession } = await supabase.auth.getSession();
        if (!currentSession.session) {
          toast({ title: 'Session Expired', description: 'Please log in again.', variant: 'destructive' });
          navigate('/auth');
          return;
        }
      }
      const data = await callAPI<{ url?: string; error?: string }>('create-checkout', { priceId, mode: 'subscription' });
      if (data?.error) throw new Error(data.error);
      if (data?.url) redirectToExternal(data.url);
      else toast({ title: 'Error', description: 'Failed to get checkout URL', variant: 'destructive' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create checkout', variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await supabase.auth.refreshSession();
      const data = await callAPI<{ url?: string; error?: string }>('customer-portal', {});
      if (data?.error) throw new Error(data.error);
      if (data?.url) redirectToExternal(data.url);
      else toast({ title: 'Error', description: 'Failed to get portal URL', variant: 'destructive' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to open subscription management', variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  const credits = profile?.credits ?? 0;
  const hasActiveSubscription = subscription.subscribed;
  const canGenerate = hasActiveSubscription || credits > 0;

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const handleGenerateClick = () => {
    if (!canGenerate) {
      setActiveTab("credits");
      toast({ title: "Credits Required", description: "Purchase credits or subscribe to generate content." });
    }
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
    setShowMoreMenu(false);
  };

  const activeItem = allItems.find(i => i.id === activeTab);

  const SidebarNavItem = ({ item, collapsed }: { item: SidebarItem; collapsed: boolean }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleTabChange(item.id)}
        title={collapsed ? item.label : undefined}
        className={`
          group w-full flex items-center gap-3 rounded-xl transition-all duration-200 relative
          ${collapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3 py-2.5'}
          ${isActive
            ? 'bg-sidebar-accent text-primary shadow-[inset_0_0_24px_hsl(var(--primary)/0.1)]'
            : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'}
        `}
      >
        {isActive && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
        )}
        <span className={`flex-shrink-0 transition-transform duration-200 ${isActive ? item.color || 'text-primary' : 'group-hover:scale-110'}`}>
          {item.icon}
        </span>
        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <span className="block font-medium text-sm leading-tight">{item.label}</span>
            {item.sublabel && (
              <span className="block text-[10px] leading-tight mt-0.5 text-muted-foreground/70">{item.sublabel}</span>
            )}
          </div>
        )}
        {!collapsed && item.badge && !isActive && (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground">
            {item.badge}
          </span>
        )}
        {!collapsed && item.id === "credits" && (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-200 ${
            hasActiveSubscription ? "bg-primary/20 text-primary" : credits > 0 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
          }`}>
            {hasActiveSubscription ? "∞" : credits}
          </span>
        )}
        {collapsed && item.badge && !isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.8)]" />
        )}
      </button>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "video":
        return <VideoGenerator onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasActiveSubscription} onUpgradeClick={handleGenerateClick} />;
      case "image":
        return <ImageGenerator onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasActiveSubscription} onUpgradeClick={handleGenerateClick} />;
      case "motion":
        return <MotionControl onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasActiveSubscription} onUpgradeClick={handleGenerateClick} />;
      case "influencer":
        return <AIInfluencer onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasActiveSubscription} onUpgrade={handleGenerateClick} />;
      case "ugc":
        return <UGCVideoGenerator onCreditsUpdate={fetchProfile} availableCredits={credits} hasSubscription={hasActiveSubscription} />;
      case "creations":
        return user ? <MyCreations userId={user.id} /> : null;
      case "assets":
        return user ? <AssetsPage userId={user.id} /> : null;
      case "credits":
        return (
          <div className="space-y-8">
            {/* Hero */}
            <div className="tool-hero-sm rounded-2xl overflow-hidden">
              <div className="tool-hero-bg" />
              <div className="tool-hero-grid" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="star-icon star-icon-xl">
                  <MagicStar className="w-10 h-10" />
                </div>
                <h2 className="tool-hero-title">Credits & Plans</h2>
                <p className="tool-hero-subtitle">Power your creativity. Generate more, create more.</p>
              </div>
            </div>

            {/* Status card */}
            <div className={`rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${hasActiveSubscription ? 'border-primary/40 bg-primary/5 shadow-[0_0_40px_hsl(var(--primary)/0.08)]' : 'border-border bg-card'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Current Status</p>
                  {subscriptionLoading ? (
                    <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Checking...</span></div>
                  ) : hasActiveSubscription ? (
                    <>
                      <p className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                        <Crown className="w-6 h-6 text-primary" />{subscription.plan}
                      </p>
                      {subscription.subscriptionEnd && (
                        <p className="text-sm text-muted-foreground mt-1">Auto-renews: {new Date(subscription.subscriptionEnd).toLocaleDateString()}</p>
                      )}
                    </>
                  ) : (
                    <p className="font-display text-2xl font-bold text-foreground">No Active Subscription</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground mb-1 text-sm">Credits</p>
                  <p className="font-display text-4xl font-bold text-foreground">{hasActiveSubscription ? '∞' : credits}</p>
                </div>
              </div>
              {hasActiveSubscription && (
                <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading} className="mt-4">
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                  Manage Subscription
                </Button>
              )}
            </div>

            {/* Plans */}
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" /> Subscription Plans
              </h3>
              <p className="text-sm text-muted-foreground">Unlimited generation with an active plan. Cancel anytime.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subscriptionPlans.map((plan) => {
                  const isCurrentPlan = subscription.priceId === plan.priceId;
                  return (
                    <div key={plan.priceId} className={`relative rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
                      isCurrentPlan ? 'border-primary/50 bg-primary/5 shadow-[0_0_32px_hsl(var(--primary)/0.1)]'
                      : plan.popular ? 'border-primary/25 bg-card hover:border-primary/45 hover:shadow-premium-hover'
                      : 'border-border bg-card hover:border-primary/25 hover:shadow-premium-hover'
                    }`}>
                      {isCurrentPlan && (
                        <div className="absolute -top-3 left-4">
                          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg">Your Plan</span>
                        </div>
                      )}
                      {plan.badge && !isCurrentPlan && (
                        <div className="absolute -top-3 left-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${plan.badge === 'NEW' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}>
                            {plan.badge}
                          </span>
                        </div>
                      )}
                      <h4 className="font-display text-lg font-semibold text-foreground mb-1">{plan.name}</h4>
                      <div className="mb-1">
                        <span className="text-sm text-muted-foreground line-through mr-2">${plan.originalPrice}</span>
                        <span className="text-2xl sm:text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-sm text-primary font-semibold mb-4">{plan.credits.toLocaleString()} credits/month</p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.slice(0, 4).map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" /><span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                        onClick={() => isCurrentPlan ? handleManageSubscription() : handlePurchase(plan.priceId)}
                        disabled={loadingId === plan.priceId || portalLoading}>
                        {loadingId === plan.priceId || (isCurrentPlan && portalLoading) ? <Loader2 className="w-4 h-4 animate-spin" />
                          : isCurrentPlan ? 'Manage Plan' : hasActiveSubscription ? 'Switch Plan' : 'Subscribe Now'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="ghost" className="flex-1"><Link to="/pricing">View All Plans</Link></Button>
              <Button variant="ghost" onClick={checkSubscription} disabled={subscriptionLoading} className="flex-1">
                {subscriptionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Refresh Status
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="star-icon star-icon-xl animate-pulse">
            <MagicStar className="w-10 h-10" />
          </div>
          <div className="generating-spinner" />
        </div>
      </div>
    );
  }

  const isCollapsed = !sidebarPinned;

  return (
    <div className="min-h-dvh bg-background flex">

      {/* ── Sidebar — desktop ─────────────────────────────────────── */}
      <aside className={`
        hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-40
        transition-all duration-300 ease-in-out overflow-hidden
        bg-sidebar border-r border-sidebar-border
        ${sidebarPinned ? 'w-60' : 'w-[72px]'}
      `}>

        {/* Logo + pin toggle */}
        <div className={`flex items-center border-b border-sidebar-border flex-shrink-0 ${sidebarPinned ? 'px-4 h-16 gap-3' : 'px-0 h-16 justify-center'}`}>
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative flex-shrink-0">
              <img src="/logo.svg" alt="LOVIX" width="34" height="34" className="w-[34px] h-[34px] transition-transform duration-300 group-hover:scale-105" />
            </div>
            {sidebarPinned && (
              <span className="font-display text-lg font-bold gradient-text-aurora whitespace-nowrap">LOVIX</span>
            )}
          </Link>
          {sidebarPinned && (
            <button
              onClick={() => setSidebarPinned(false)}
              className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {!sidebarPinned && (
            <button
              onClick={() => setSidebarPinned(true)}
              className="absolute right-1 top-5 p-1 rounded-lg text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
            />
          )}
        </div>

        {/* Subscription badge */}
        {hasActiveSubscription && sidebarPinned && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
              <Crown className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-primary font-semibold text-xs truncate">{subscription.plan}</span>
              <span className="ml-auto text-primary text-xs font-mono font-bold">∞</span>
            </div>
          </div>
        )}
        {hasActiveSubscription && !sidebarPinned && (
          <div className="px-2.5 pt-3 pb-1">
            <div className="flex items-center justify-center p-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <Crown className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        )}

        {/* AI Tools */}
        <div className={`pt-4 pb-2 flex-1 overflow-y-auto ${sidebarPinned ? 'px-3' : 'px-2'}`}>
          {sidebarPinned && (
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <div className="star-icon star-icon-sm"><MagicStar className="w-3 h-3" /></div>
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">AI Tools</span>
            </div>
          )}
          <nav className="space-y-0.5">
            {toolItems.map(item => <SidebarNavItem key={item.id} item={item} collapsed={!sidebarPinned} />)}
          </nav>

          <div className={`my-3 border-t border-sidebar-border/50 ${sidebarPinned ? 'mx-2' : 'mx-0'}`} />

          {sidebarPinned && (
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Library</span>
            </div>
          )}
          <nav className="space-y-0.5">
            {utilityItems.map(item => <SidebarNavItem key={item.id} item={item} collapsed={!sidebarPinned} />)}
          </nav>
        </div>

        {/* Expand button when collapsed */}
        {!sidebarPinned && (
          <div className="px-2 pb-2">
            <button
              onClick={() => setSidebarPinned(true)}
              className="w-full flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Desktop App download */}
        {!isDesktopApp && sidebarPinned && (
          <div className="px-3 pb-3 space-y-0.5">
            <div className="px-2 mb-1">
              <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Desktop App</span>
            </div>
            <a href="/api/track-download?platform=win" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors group">
              <Monitor className="w-4 h-4 flex-shrink-0 text-primary/50 group-hover:text-primary transition-colors" />
              <span className="flex-1 font-medium">Windows</span>
              <Download className="w-3 h-3 opacity-40 group-hover:opacity-80 transition-opacity" />
            </a>
            <a href="/api/track-download?platform=mac" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors group">
              <Laptop className="w-4 h-4 flex-shrink-0 text-primary/50 group-hover:text-primary transition-colors" />
              <span className="flex-1 font-medium">macOS</span>
              <Download className="w-3 h-3 opacity-40 group-hover:opacity-80 transition-opacity" />
            </a>
          </div>
        )}

        {/* User */}
        <div className={`border-t border-sidebar-border ${sidebarPinned ? 'p-3' : 'p-2'}`}>
          {sidebarPinned ? (
            <>
              <div className="flex items-center gap-3 mb-2.5 px-1">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center flex-shrink-0">
                  <span className="text-foreground font-semibold text-xs">{getInitials()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-sm truncate leading-tight">{profile?.full_name || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-0.5">
                <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors">
                  <Settings className="w-3.5 h-3.5" />Settings
                </button>
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center" title={profile?.full_name || user?.email || ''}>
                <span className="text-foreground font-semibold text-xs">{getInitials()}</span>
              </div>
              <button onClick={() => navigate('/settings')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors" title="Settings">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleSignOut} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Sign Out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ─────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
              <Link to="/" className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="LOVIX" width="32" height="32" className="w-8 h-8" />
                <span className="font-display text-lg font-bold gradient-text-aurora">LOVIX</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {hasActiveSubscription && (
              <div className="px-4 pt-3 pb-1">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Crown className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary font-semibold text-xs">{subscription.plan}</span>
                  <span className="ml-auto text-primary text-xs font-mono font-bold">∞</span>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              <div className="flex items-center gap-1.5 px-2 mb-2">
                <div className="star-icon star-icon-sm"><MagicStar className="w-3 h-3" /></div>
                <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">AI Tools</span>
              </div>
              {toolItems.map(item => <SidebarNavItem key={item.id} item={item} collapsed={false} />)}
              <div className="my-3 border-t border-sidebar-border/50 mx-2" />
              <span className="block px-2 mb-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Library</span>
              {utilityItems.map(item => <SidebarNavItem key={item.id} item={item} collapsed={false} />)}
            </div>
            <div className="p-4 border-t border-sidebar-border space-y-1">
              <button onClick={() => { navigate('/settings'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors">
                <Settings className="w-4 h-4" />Settings
              </button>
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-dvh overflow-hidden">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar/80 backdrop-blur-sm sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Open menu">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className={`flex-shrink-0 ${activeItem?.color || 'text-primary'}`}>{activeItem?.icon}</span>
            <span className="font-display font-bold text-sm text-foreground">{activeItem?.label || 'LOVIX'}</span>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
            hasActiveSubscription ? "bg-primary/15 text-primary" : credits > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          }`}>
            <Coins className="w-3 h-3" />
            <span>{hasActiveSubscription ? "∞" : credits}</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${['influencer', 'ugc'].includes(activeTab) ? 'max-w-full' : 'max-w-4xl'}`}>
            {renderContent()}
          </div>
        </div>
      </main>

      {/* ── Mobile bottom nav ──────────────────────────────────────── */}
      <nav className="mobile-bottom-nav">
        <div className="flex items-stretch">
          {toolItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`mobile-nav-item ${isActive ? "mobile-nav-item-active" : "text-muted-foreground"}`}
                aria-label={item.label}
              >
                <span className={`transition-transform duration-200 ${isActive ? `scale-110 ${item.color}` : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="absolute top-1.5 right-1/2 translate-x-3 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`mobile-nav-item ${["creations", "assets", "credits"].includes(activeTab) ? "mobile-nav-item-active" : "text-muted-foreground"}`}
            aria-label="More"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
            {credits === 0 && !hasActiveSubscription && (
              <span className="absolute top-1.5 right-1/2 translate-x-3 w-1.5 h-1.5 rounded-full bg-destructive" />
            )}
          </button>
        </div>
      </nav>

      {/* More menu sheet (mobile) */}
      {showMoreMenu && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowMoreMenu(false)} />
          <div className="fixed bottom-16 left-0 right-0 z-50 lg:hidden mx-4 mb-2 rounded-2xl bg-sidebar border border-sidebar-border shadow-2xl overflow-hidden">
            <div className="p-3 space-y-0.5">
              {utilityItems.map(item => (
                <button key={item.id} onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                    activeTab === item.id ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}>
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id === "credits" && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                      hasActiveSubscription ? "bg-primary/20 text-primary" : credits > 0 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                    }`}>{hasActiveSubscription ? "∞" : credits}</span>
                  )}
                </button>
              ))}
              <div className="border-t border-sidebar-border pt-2 mt-2 space-y-0.5">
                <button onClick={() => { navigate('/settings'); setShowMoreMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
                  <Settings className="w-5 h-5" />Settings
                </button>
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-5 h-5" />Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Persistent Generation Progress */}
      {user && <GenerationProgress userId={user.id} onComplete={fetchProfile} />}
    </div>
  );
};

export default Dashboard;
