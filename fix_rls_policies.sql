-- Run this entire file in Supabase SQL Editor
-- Fixes RLS policies to allow admins to write data

-- Step 1: Create admin checker function
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

-- Step 2: Products table
DROP POLICY IF EXISTS "products_select" ON public.products;
DROP POLICY IF EXISTS "products_insert" ON public.products;
DROP POLICY IF EXISTS "products_update" ON public.products;
DROP POLICY IF EXISTS "products_delete" ON public.products;
CREATE POLICY "products_select" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "products_update" ON public.products FOR UPDATE USING (is_admin());
CREATE POLICY "products_delete" ON public.products FOR DELETE USING (is_admin());

-- Step 3: product_images table
DROP POLICY IF EXISTS "product_images_select" ON public.product_images;
DROP POLICY IF EXISTS "product_images_insert" ON public.product_images;
DROP POLICY IF EXISTS "product_images_delete" ON public.product_images;
CREATE POLICY "product_images_select" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images_insert" ON public.product_images FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "product_images_delete" ON public.product_images FOR DELETE USING (is_admin());

-- Step 4: inventory table
DROP POLICY IF EXISTS "inventory_select" ON public.inventory;
DROP POLICY IF EXISTS "inventory_insert" ON public.inventory;
DROP POLICY IF EXISTS "inventory_update" ON public.inventory;
CREATE POLICY "inventory_select" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "inventory_insert" ON public.inventory FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "inventory_update" ON public.inventory FOR UPDATE USING (is_admin());

-- Step 5: coupons table
DROP POLICY IF EXISTS "coupons_select" ON public.coupons;
DROP POLICY IF EXISTS "coupons_insert" ON public.coupons;
DROP POLICY IF EXISTS "coupons_update" ON public.coupons;
DROP POLICY IF EXISTS "coupons_delete" ON public.coupons;
CREATE POLICY "coupons_select" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "coupons_insert" ON public.coupons FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "coupons_update" ON public.coupons FOR UPDATE USING (is_admin());
CREATE POLICY "coupons_delete" ON public.coupons FOR DELETE USING (is_admin());

-- Step 6: posts table
DROP POLICY IF EXISTS "posts_select" ON public.posts;
DROP POLICY IF EXISTS "posts_insert" ON public.posts;
DROP POLICY IF EXISTS "posts_update" ON public.posts;
DROP POLICY IF EXISTS "posts_delete" ON public.posts;
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "posts_update" ON public.posts FOR UPDATE USING (is_admin());
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (is_admin());

-- Step 7: profiles table
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Step 8: orders table
DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
CREATE POLICY "orders_select" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());
CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE USING (is_admin());

-- Step 9: order_items table
DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Step 10: consultations table
DROP POLICY IF EXISTS "consultations_select" ON public.consultations;
DROP POLICY IF EXISTS "consultations_insert" ON public.consultations;
DROP POLICY IF EXISTS "consultations_update" ON public.consultations;
CREATE POLICY "consultations_select" ON public.consultations
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "consultations_insert" ON public.consultations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "consultations_update" ON public.consultations
  FOR UPDATE USING (is_admin());

-- Step 11: categories table
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
DROP POLICY IF EXISTS "categories_select" ON public.categories;
DROP POLICY IF EXISTS "categories_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_update" ON public.categories;
DROP POLICY IF EXISTS "categories_delete" ON public.categories;
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories_update" ON public.categories FOR UPDATE USING (is_admin());
CREATE POLICY "categories_delete" ON public.categories FOR DELETE USING (is_admin());

-- Step 12: categories storage bucket
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

-- Done!
SELECT 'RLS policies applied successfully' as status;
