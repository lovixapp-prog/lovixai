-- Create influencers table for AI Influencer tool
CREATE TABLE public.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  avatar_image TEXT NOT NULL,
  gender TEXT NOT NULL,
  age_range TEXT NOT NULL,
  ethnicity TEXT,
  hair_style TEXT,
  fashion_style TEXT,
  personality_tags TEXT[],
  voice_profile TEXT DEFAULT 'neutral',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own influencers"
  ON public.influencers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own influencers"
  ON public.influencers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own influencers"
  ON public.influencers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own influencers"
  ON public.influencers FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_influencers_updated_at
  BEFORE UPDATE ON public.influencers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();