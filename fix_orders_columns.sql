-- ═══════════════════════════════════════════════════════════════
-- Fix orders table — add missing columns that the checkout uses
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add coupon_code column if missing
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code text;

-- Add subtotal if missing
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) DEFAULT 0;

-- Add shipping_name / shipping_phone / shipping_city / shipping_country if missing
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_name    text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_phone   text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city    text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_country text DEFAULT 'Egypt';

-- Refresh PostgREST schema cache (run this after ALTER)
NOTIFY pgrst, 'reload schema';
