-- Email campaigns tracking
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  preview_text text DEFAULT '',
  template_type text DEFAULT 'custom',
  audience text DEFAULT 'all',
  recipient_count int DEFAULT 0,
  sent_count int DEFAULT 0,
  failed_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Email events (opens, clicks, bounces via Resend webhooks)
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  event_type text NOT NULL, -- 'open' | 'click' | 'bounce' | 'unsubscribe'
  email text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Unsubscribes
CREATE TABLE IF NOT EXISTS public.email_unsubscribes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  source text DEFAULT 'link', -- 'link' | 'complaint' | 'manual'
  created_at timestamptz DEFAULT now()
);

-- Track welcome email sent per user
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false;

-- RLS (service_role only — no user access needed)
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON public.email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON public.email_events(email);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created ON public.email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON public.email_unsubscribes(email);
