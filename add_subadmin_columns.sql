-- ============================================================
-- Migration: Add subadmin support to profiles table
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add role column (text, default 'user')
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 2. Add permissions column (jsonb array, stores list of permission keys)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. RLS: allow existing admin to read subadmin profiles (via service role in API – not needed)
-- The API already uses service_role key to bypass RLS, so no extra policies needed.

-- 5. Update existing admin accounts so their role = 'admin' (if is_admin = true)
UPDATE public.profiles
  SET role = 'admin'
  WHERE is_admin = true AND role = 'user';
