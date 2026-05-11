-- Update default credits for new users to 150
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 150;