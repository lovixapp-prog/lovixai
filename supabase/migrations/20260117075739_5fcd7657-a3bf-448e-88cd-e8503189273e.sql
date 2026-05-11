-- Create a table for influencer poses/images
CREATE TABLE public.influencer_poses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  is_original BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.influencer_poses ENABLE ROW LEVEL SECURITY;

-- RLS policies for user access only
CREATE POLICY "Users can view their own influencer poses"
ON public.influencer_poses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own influencer poses"
ON public.influencer_poses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own influencer poses"
ON public.influencer_poses
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_influencer_poses_influencer_id ON public.influencer_poses(influencer_id);
CREATE INDEX idx_influencer_poses_user_id ON public.influencer_poses(user_id);