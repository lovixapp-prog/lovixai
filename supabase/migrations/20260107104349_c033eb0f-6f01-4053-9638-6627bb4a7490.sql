-- Update default credits for new users to 0
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 0;