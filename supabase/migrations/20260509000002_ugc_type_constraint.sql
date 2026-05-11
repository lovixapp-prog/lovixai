ALTER TABLE public.generations DROP CONSTRAINT generations_type_check;

ALTER TABLE public.generations ADD CONSTRAINT generations_type_check
CHECK (type = ANY (ARRAY[
  'video'::text,
  'image'::text,
  'motion'::text,
  'influencer-video'::text,
  'influencer-motion'::text,
  'influencer-lipsync'::text,
  'influencer-pose'::text,
  'ugc'::text,
  'ugc-final'::text
]));
