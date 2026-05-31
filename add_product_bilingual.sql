-- Run in Supabase SQL Editor
-- Bilingual product names & descriptions

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS description_ar text;

UPDATE public.products
SET
  name_en = COALESCE(name_en, name),
  name_ar = COALESCE(name_ar, name),
  description_en = COALESCE(description_en, description),
  description_ar = COALESCE(description_ar, description)
WHERE name IS NOT NULL;
