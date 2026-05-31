-- Run in Supabase Dashboard → SQL Editor
-- Adds bilingual category names (English + Arabic)

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_ar text;

-- Copy existing single name into both columns where missing
UPDATE public.categories
SET
  name_en = COALESCE(name_en, name),
  name_ar = COALESCE(name_ar, name)
WHERE name IS NOT NULL;
