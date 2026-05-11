-- Create dedicated bucket for video references (used for Sora API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-references', 'video-references', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: users can upload to their own folder
CREATE POLICY "Users can upload video references"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video-references' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: users can read their own files
CREATE POLICY "Users can read own video references"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'video-references' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: users can delete their own files
CREATE POLICY "Users can delete own video references"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'video-references' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);