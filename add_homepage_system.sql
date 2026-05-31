-- Run in Supabase SQL Editor
-- Homepage department sections + curated best sellers

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id          serial PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  name_en     text NOT NULL,
  name_ar     text NOT NULL,
  description_en text,
  description_ar text,
  image       text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.homepage_section_products (
  id          serial PRIMARY KEY,
  section_id  integer NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  product_id  integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  UNIQUE(section_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.homepage_best_sellers (
  id          serial PRIMARY KEY,
  product_id  integer NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_section_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_best_sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "homepage_sections_select" ON public.homepage_sections;
DROP POLICY IF EXISTS "homepage_section_products_select" ON public.homepage_section_products;
DROP POLICY IF EXISTS "homepage_best_sellers_select" ON public.homepage_best_sellers;

CREATE POLICY "homepage_sections_select" ON public.homepage_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "homepage_section_products_select" ON public.homepage_section_products
  FOR SELECT USING (true);

CREATE POLICY "homepage_best_sellers_select" ON public.homepage_best_sellers
  FOR SELECT USING (true);

-- Admin policies (if is_admin() exists)
DROP POLICY IF EXISTS "homepage_sections_admin" ON public.homepage_sections;
DROP POLICY IF EXISTS "homepage_section_products_admin" ON public.homepage_section_products;
DROP POLICY IF EXISTS "homepage_best_sellers_admin" ON public.homepage_best_sellers;

CREATE POLICY "homepage_sections_admin" ON public.homepage_sections
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "homepage_section_products_admin" ON public.homepage_section_products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "homepage_best_sellers_admin" ON public.homepage_best_sellers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO public.homepage_sections (slug, name_en, name_ar, sort_order) VALUES
  ('plants',            'Plants',                  'نباتات',                 1),
  ('landscape',         'Landscape',               'لاندسكيب',               2),
  ('corporate_decor',   'Corporate Decor',         'ديكور شركات',            3),
  ('humidifier_plants', 'Plants with Humidifiers', 'نباتات بأجهزة ترطيب',    4),
  ('plant_decor',       'Plant Decor Products',    'منتجات ديكور نباتي',     5)
ON CONFLICT (slug) DO NOTHING;
