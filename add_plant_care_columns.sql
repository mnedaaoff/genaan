-- Run in Supabase SQL Editor
-- Plant care guide fields on products (editable from admin)

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS watering_days integer,
  ADD COLUMN IF NOT EXISTS light_level text
    CHECK (light_level IS NULL OR light_level IN ('low', 'medium', 'bright', 'direct')),
  ADD COLUMN IF NOT EXISTS humidity_level text
    CHECK (humidity_level IS NULL OR humidity_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS care_notes_en text,
  ADD COLUMN IF NOT EXISTS care_notes_ar text;
