-- Update default credits for new users to 2
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 2;

-- Give existing users with 0 credits the trial credits
UPDATE public.profiles SET credits = 2 WHERE credits = 0;