-- Run in Supabase SQL Editor
-- Pot variants (color + size) and plant pot-size for auto-matching

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pot_size text
  CHECK (pot_size IS NULL OR pot_size IN ('small', 'medium', 'large'));

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS size text
  CHECK (size IS NULL OR size IN ('small', 'medium', 'large'));

-- RLS for product_variants (if not already present)
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_variants_select" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_admin" ON public.product_variants;

CREATE POLICY "product_variants_select" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "product_variants_insert" ON public.product_variants
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "product_variants_update" ON public.product_variants
  FOR UPDATE USING (is_admin());

CREATE POLICY "product_variants_delete" ON public.product_variants
  FOR DELETE USING (is_admin());
