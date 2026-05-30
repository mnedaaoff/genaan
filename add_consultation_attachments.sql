-- ═══════════════════════════════════════════════════════════════
-- Storage policies for consultation attachments in bucket 'spaces'
-- Run this in your Supabase SQL Editor if you get upload errors!
-- ═══════════════════════════════════════════════════════════════

-- 1. Ensure 'spaces' storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('spaces', 'spaces', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anyone to upload attachments to 'spaces' bucket (required for guests on contact form)
DROP POLICY IF EXISTS "Public upload spaces" ON storage.objects;
CREATE POLICY "Public upload spaces" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'spaces'
);

-- 3. Allow public read of objects in 'spaces' bucket
DROP POLICY IF EXISTS "Public read spaces bucket" ON storage.objects;
CREATE POLICY "Public read spaces bucket" ON storage.objects
FOR SELECT USING (
  bucket_id = 'spaces'
);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
