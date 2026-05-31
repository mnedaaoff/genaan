-- Run in Supabase Dashboard → SQL Editor
-- Fixes category insert/update/delete for admin users
--
-- Root cause: is_admin() used COALESCE — if profiles.is_admin = false,
-- it never checked JWT metadata or user_roles (admin login still worked via metadata).

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND lower(r.name) IN ('admin', 'administrator')
    )
    OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
    OR COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false)
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;

-- categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
DROP POLICY IF EXISTS "categories_select" ON public.categories;
DROP POLICY IF EXISTS "categories_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_update" ON public.categories;
DROP POLICY IF EXISTS "categories_delete" ON public.categories;

CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories_insert" ON public.categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "categories_update" ON public.categories
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "categories_delete" ON public.categories
  FOR DELETE USING (is_admin());

-- categories storage bucket (skip if bucket does not exist yet)
DROP POLICY IF EXISTS "Public read categories bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload categories" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to categories bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow update in categories bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete from categories bucket" ON storage.objects;

CREATE POLICY "Public read categories bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'categories');

CREATE POLICY "Allow upload to categories bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'categories' AND is_admin());

CREATE POLICY "Allow update in categories bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'categories' AND is_admin());

CREATE POLICY "Allow delete from categories bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'categories' AND is_admin());

-- ── Verify your admin account ───────────────────────────────────────────────
-- Replace the email, then run separately if insert still fails:
--
-- UPDATE public.profiles
-- SET is_admin = true, updated_at = now()
-- WHERE email = 'your-admin@email.com';
--
-- Or grant admin role:
-- INSERT INTO public.user_roles (user_id, role_id)
-- SELECT p.id, r.id
-- FROM public.profiles p
-- CROSS JOIN public.roles r
-- WHERE p.email = 'your-admin@email.com'
--   AND lower(r.name) = 'admin'
-- ON CONFLICT DO NOTHING;

SELECT is_admin() AS you_are_admin_in_sql_editor;
