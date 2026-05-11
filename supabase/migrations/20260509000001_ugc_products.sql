-- UGC Products: user-saved products for video ads generation
CREATE TABLE IF NOT EXISTS public.ugc_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image_url text,
  price text,
  currency text DEFAULT 'USD',
  website_url text,
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ugc_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own products" ON public.ugc_products
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_ugc_products_user ON public.ugc_products(user_id);
CREATE INDEX IF NOT EXISTS idx_ugc_products_created ON public.ugc_products(created_at DESC);
