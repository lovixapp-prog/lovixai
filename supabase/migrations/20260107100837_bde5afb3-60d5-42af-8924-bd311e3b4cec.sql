-- Allow users to delete their own generations
CREATE POLICY "Users can delete their own generations"
ON public.generations
FOR DELETE
USING (auth.uid() = user_id);