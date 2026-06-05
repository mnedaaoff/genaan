import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Lazy singleton ──────────────────────────────────────────────────────────
// We do NOT throw at module-load time so that Next.js static prerendering
// (/_not-found, etc.) can complete even without the env vars in the build
// environment. The error will be raised the first time the client is actually
// *used* at request time, where the variables ARE required.
let _supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) must be set."
    );
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Export a Proxy so all existing code (`supabase.from(...)`, `supabase.auth`, …)
// keeps working without any changes, but the real client is only created on
// first actual access — not at module-evaluation time.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ─── Database helpers ─────────────────────────────────────────────

export const db = {
  products: () => supabase.from("products"),
  orders: () => supabase.from("orders"),
  order_items: () => supabase.from("order_items"),
  profiles: () => supabase.from("profiles"),
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

// ─── Auth helpers ────────────────────────────────────────────────

export const getSupabaseAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ─── Storage upload ──────────────────────────────────────────────

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