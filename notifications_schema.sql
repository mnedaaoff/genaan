-- ═══════════════════════════════════════════════════════════════
-- Notifications & Consultations Updates for Genaan
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Ensure user_id column exists on consultations table
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Check using custom helper is_admin() if it exists, otherwise fallback to profiles lookup
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    COALESCE(
      (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
      false
    )
  );

DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE USING (
    COALESCE(
      (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
      false
    )
  );

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
