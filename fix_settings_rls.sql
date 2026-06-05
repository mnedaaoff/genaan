-- Public read for storefront settings keys only; admin manages all keys
-- Run after fix_rls_policies.sql (needs is_admin())

CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text,
  type text DEFAULT 'string',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select" ON public.settings;
DROP POLICY IF EXISTS "settings_insert" ON public.settings;
DROP POLICY IF EXISTS "settings_update" ON public.settings;
DROP POLICY IF EXISTS "settings_delete" ON public.settings;
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
DROP POLICY IF EXISTS "Admin manage settings" ON public.settings;

CREATE POLICY "settings_select" ON public.settings
  FOR SELECT USING (
    is_admin()
    OR key IN (
      'privacy_policy',
      'social_instagram',
      'social_facebook',
      'contact_whatsapp',
      'social_telegram',
      'our_story_title_en',
      'our_story_title_ar',
      'our_story_body_en',
      'our_story_body_ar',
      'our_story_image'
    )
  );

CREATE POLICY "settings_insert" ON public.settings
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "settings_update" ON public.settings
  FOR UPDATE USING (is_admin());

CREATE POLICY "settings_delete" ON public.settings
  FOR DELETE USING (is_admin());
