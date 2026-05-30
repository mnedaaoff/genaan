-- ═══════════════════════════════════════════════════════════════
-- Spaces + Likes tables for Genaan
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Spaces (managed from admin dashboard)
CREATE TABLE IF NOT EXISTS public.spaces (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  room TEXT,
  description TEXT,
  cover_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Space images (gallery for each space)
CREATE TABLE IF NOT EXISTS public.space_images (
  id SERIAL PRIMARY KEY,
  space_id INT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Space likes (one like per user per image)
CREATE TABLE IF NOT EXISTS public.space_likes (
  id SERIAL PRIMARY KEY,
  space_image_id INT NOT NULL REFERENCES public.space_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_image_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_likes ENABLE ROW LEVEL SECURITY;

-- Spaces: everyone reads, admin writes
DROP POLICY IF EXISTS "spaces_read" ON public.spaces;
CREATE POLICY "spaces_read" ON public.spaces FOR SELECT USING (true);
DROP POLICY IF EXISTS "spaces_admin_write" ON public.spaces;
CREATE POLICY "spaces_admin_write" ON public.spaces FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Space images: everyone reads, admin writes
DROP POLICY IF EXISTS "space_images_read" ON public.space_images;
CREATE POLICY "space_images_read" ON public.space_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "space_images_admin_write" ON public.space_images;
CREATE POLICY "space_images_admin_write" ON public.space_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Space likes: everyone reads, authenticated users can insert/delete their own
DROP POLICY IF EXISTS "space_likes_read" ON public.space_likes;
CREATE POLICY "space_likes_read" ON public.space_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "space_likes_insert" ON public.space_likes;
CREATE POLICY "space_likes_insert" ON public.space_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "space_likes_delete" ON public.space_likes;
CREATE POLICY "space_likes_delete" ON public.space_likes FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Settings & FAQ tables (if not exist yet)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  type TEXT DEFAULT 'string',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id SERIAL PRIMARY KEY,
  question TEXT,
  answer TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_read" ON public.settings;
CREATE POLICY "settings_read" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "settings_admin_write" ON public.settings;
CREATE POLICY "settings_admin_write" ON public.settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "faqs_read" ON public.faqs;
CREATE POLICY "faqs_read" ON public.faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS "faqs_admin_write" ON public.faqs;
CREATE POLICY "faqs_admin_write" ON public.faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ═══════════════════════════════════════════════════════════════
-- Function to toggle like (increment/decrement likes_count)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.toggle_space_like(p_image_id INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.space_likes
    WHERE space_image_id = p_image_id AND user_id = v_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.space_likes WHERE space_image_id = p_image_id AND user_id = v_user_id;
    UPDATE public.space_images SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_image_id;
    RETURN jsonb_build_object('liked', false);
  ELSE
    INSERT INTO public.space_likes (space_image_id, user_id) VALUES (p_image_id, v_user_id);
    UPDATE public.space_images SET likes_count = likes_count + 1 WHERE id = p_image_id;
    RETURN jsonb_build_object('liked', true);
  END IF;
END;
$$;
