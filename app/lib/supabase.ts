<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser / client-side singleton (anon key — respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Database table helpers ───────────────────────────────────────────────────

/** Products table */
export const db = {
  products: () => supabase.from("products"),
  orders: () => supabase.from("orders"),
  order_items: () => supabase.from("order_items"),
  customers: () => supabase.from("users"),
  categories: () => supabase.from("categories"),
  coupons: () => supabase.from("coupons"),
  posts: () => supabase.from("posts"),
  reviews: () => supabase.from("reviews"),
  settings: () => supabase.from("settings"),
  faqs: () => supabase.from("faqs"),
  contact_messages: () => supabase.from("contact_messages"),
  plant_care_requests: () => supabase.from("plant_care_requests"),
  spaces: () => supabase.from("spaces"),
};

/** Upload a file to Supabase Storage */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
=======
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function for authenticated requests
export const getSupabaseAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
>>>>>>> 42e8b631b2c91874fea74466edfce58713965eca
