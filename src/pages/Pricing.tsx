import { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Loader2, Star, Video, Image, Wand2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';
import SEOHead from '@/components/SEOHead';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { callAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { redirectToExternal } from '@/lib/externalRedirect';

const includedTools = [
  { icon: Video, name: "Video Generation", description: "4K AI Videos" },
  { icon: Image, name: "Image Generation", description: "Photorealistic Images" },
  { icon: Wand2, name: "Motion Control", description: "Advanced Animation" },
  { icon: UserCircle, name: "AI Influencer", description: "Virtual Creators", isNew: true },
];

export const subscriptionPlans = [
  {
    name: 'Standard',
    credits: 660,
    price: 8.99,
    originalPrice: 10.99,
    priceId: 'price_1TUAtjHOyxlmJSTGu6g7oSwR',
    icon: Zap,
    popular: false,
    badge: null,
    features: [
      'Queue unlimited tasks',
      'Fast-track generation',
      'High-quality video generation',
      'Image upscaling',
      'Brand watermark removal',
    ],
  },
  {
    name: 'Pro',
    credits: 3000,
    price: 31.99,
    originalPrice: 39.99,
    priceId: 'price_1TUAtkHOyxlmJSTGnGPrzPA0',
    icon: Sparkles,
    popular: true,
    badge: 'Most Popular',
    features: [
      'Queue unlimited tasks',
      'Fast-track generation',
      'High-quality video generation',
      'Image upscaling',
      'Brand watermark removal',
      'Priority processing',
    ],
  },
  {
    name: 'Premier',
    credits: 8000,
    price: 79.99,
    originalPrice: 99.99,
    priceId: 'price_1TUAtkHOyxlmJSTGlTi8J4Wv',
    icon: Crown,
    popular: false,
    badge: null,
    features: [
      'Queue unlimited tasks',
      'Fast-track generation',
      'High-quality video generation',
      'Image upscaling',
      'Brand watermark removal',
      'Priority processing',
      'API access',
    ],
  },
  {
    name: 'Ultra',
    credits: 26000,
    price: 154.99,
    originalPrice: 199.99,
    priceId: 'price_1TUAtlHOyxlmJSTGrSzfZpzp',
    icon: Star,
    popular: false,
    badge: 'NEW',
    features: [
      'Queue unlimited tasks',
      'Fast-track generation',
      'High-quality video generation',
      'Image upscaling',
      'Brand watermark removal',
      'Priority processing',
      'API access',
      'Dedicated support',
    ],
  },
];

export default function Pricing() {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePurchase = async (priceId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoadingId(priceId);
    try {
      // Refresh session before making the call to ensure valid token on mobile
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        const { data: currentSession } = await supabase.auth.getSession();
        if (!currentSession.session) {
          toast({
            title: 'Session Expired',
            description: 'Please log in again to continue.',
            variant: 'destructive',
          });
          navigate('/auth');
          return;
        }
      }

      const data = await callAPI<{ url?: string; error?: string }>('create-checkout', { priceId, mode: 'subscription' });

      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        redirectToExternal(data.url);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get checkout URL',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const getCostPer100Credits = (price: number, credits: number) => {
    return ((price / credits) * 100).toFixed(2);
  };

  return (
    <PageLayout>
      <SEOHead
        title="LOVIX Pricing - Affordable AI Video & Image Generation Plans"
        description="Choose the perfect AI video generation plan. From free credits to unlimited creation. Generate 4K videos, images, and animations. Start free with 150 credits, no credit card required."
        keywords="AI video pricing, AI generator subscription, video AI cost, AI content creation pricing, affordable AI video, video generation plans, AI credits, LOVIX pricing, AI subscription plans"
        canonicalPath="/pricing"
      />
      <div className="min-h-screen py-12 sm:py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
              <span className="gradient-text">Choose Your Plan</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Unlock your creative potential with our flexible subscription plans.
            </p>
            {/* Free credits banner */}
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">
                New users get 150 free credits — No credit card required!
              </span>
            </div>
          </div>

          {/* Included Tools Section */}
          <div className="mb-12 sm:mb-16">
            <h3 className="text-center text-lg font-semibold text-foreground mb-6">All Plans Include Access To:</h3>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
              {includedTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div 
                    key={tool.name}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                    {tool.isNew && (
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                        NEW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subscription Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = subscription.priceId === plan.priceId;
              
              return (
                <Card
                  key={plan.priceId}
                  className={`relative flex flex-col transition-all duration-300 hover:border-primary/50 ${
                    plan.popular ? 'border-primary glow-soft' : ''
                  } ${isCurrentPlan ? 'border-primary ring-2 ring-primary' : ''}`}
                >
                  {/* Badge */}
                  {(plan.badge || isCurrentPlan) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                        isCurrentPlan 
                          ? 'bg-primary text-primary-foreground'
                          : plan.badge === 'NEW'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {isCurrentPlan ? 'Your Plan' : plan.badge}
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2 pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-grow pt-2">
                    {/* Pricing */}
                    <div className="text-center mb-4">
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground line-through">
                          ${plan.originalPrice}
                        </span>
                        <span className="text-3xl sm:text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-primary font-semibold text-sm">
                        {plan.credits.toLocaleString()} credits/month
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        As low as ${getCostPer100Credits(plan.price, plan.credits)} per 100 credits
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className="w-full mt-auto"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handlePurchase(plan.priceId)}
                      disabled={loadingId === plan.priceId || isCurrentPlan}
                    >
                      {loadingId === plan.priceId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        'Subscribe Now'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12 sm:mt-16 space-y-3 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Start free with 150 credits — Try before you subscribe!
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              All plans include automatic monthly renewal. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
