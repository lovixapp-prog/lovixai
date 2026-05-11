-- Add columns for video-optimized image versions
ALTER TABLE public.influencer_poses 
ADD COLUMN IF NOT EXISTS image_url_16_9 text,
ADD COLUMN IF NOT EXISTS image_url_9_16 text;

COMMENT ON COLUMN public.influencer_poses.image_url_16_9 IS 'Resized version 1280x720 for 16:9 video';
COMMENT ON COLUMN public.influencer_poses.image_url_9_16 IS 'Resized version 720x1280 for 9:16 video';