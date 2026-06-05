import { unstable_cache } from "next/cache";
import { createServerSupabase } from "../supabase-server";
import { CACHE_TAGS } from "./tags";

const REVALIDATE_HOMEPAGE = 300;
const REVALIDATE_PRODUCTS = 60;
const REVALIDATE_SETTINGS = 600;
const REVALIDATE_POSTS = 300;

export type HomepageSectionRow = {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  image?: string | null;
  sort_order: number;
};

export type CatalogProductRow = {
  id: number;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  type: string;
  category_id: number | null;
  is_active: boolean;
  rating_avg: number;
  product_images: { url: string; is_primary: boolean }[];
  inventory: { quantity: number; reserved: number }[];
  product_variants: { price: number }[];
};

export const getCachedHomepageSections = unstable_cache(
  async (): Promise<HomepageSectionRow[]> => {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("homepage_sections")
      .select("id, slug, name_en, name_ar, description_en, description_ar, image, sort_order")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      console.error("getCachedHomepageSections:", error.message);
      return [];
    }
    return (data ?? []) as HomepageSectionRow[];
  },
  ["homepage-sections"],
  { revalidate: REVALIDATE_HOMEPAGE, tags: [CACHE_TAGS.homepage] },
);

export const getCachedBestSellerIds = unstable_cache(
  async (): Promise<number[]> => {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("homepage_best_sellers")
      .select("product_id, sort_order")
      .order("sort_order");
    if (error) {
      console.error("getCachedBestSellerIds:", error.message);
      return [];
    }
    return (data ?? []).map(r => r.product_id);
  },
  ["homepage-best-seller-ids"],
  { revalidate: REVALIDATE_HOMEPAGE, tags: [CACHE_TAGS.homepage] },
);

export async function getCachedProductsByIds(ids: number[]): Promise<CatalogProductRow[]> {
  const sorted = [...ids].sort((a, b) => a - b);
  if (!sorted.length) return [];

  return unstable_cache(
    async () => {
      const sb = createServerSupabase();
      const { data, error } = await sb
        .from("products")
        .select(`
          id, name, name_en, name_ar, description, price, compare_at_price, type, category_id, is_active, rating_avg,
          product_images (url, is_primary),
          inventory (quantity, reserved),
          product_variants (price)
        `)
        .in("id", sorted)
        .eq("is_active", true);
      if (error) {
        console.error("getCachedProductsByIds:", error.message);
        return [];
      }
      const byId = new Map((data ?? []).map(p => [p.id, p as CatalogProductRow]));
      return sorted.map(id => byId.get(id)).filter(Boolean) as CatalogProductRow[];
    },
    ["products-by-ids", sorted.join(",")],
    { revalidate: REVALIDATE_PRODUCTS, tags: [CACHE_TAGS.products] },
  )();
}

export async function getCachedBestSellerProducts(): Promise<CatalogProductRow[]> {
  const ids = await getCachedBestSellerIds();
  return getCachedProductsByIds(ids);
}

export type ShopCatalog = {
  sections: { id: number; slug: string; name_en: string; name_ar: string; sort_order: number }[];
  sectionLinks: { product_id: number; section_id: number }[];
  products: CatalogProductRow[];
  sectionsWithProducts: ShopSectionWithProducts[];
};

export type ShopSectionWithProducts = {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  sort_order: number;
  homepage_section_products: { product_id: number; sort_order: number }[];
};

export const getCachedShopCatalog = unstable_cache(
  async () => {
    const sb = createServerSupabase();
    const [sectionsRes, linksRes, productsRes, sectionsFullRes] = await Promise.all([
      sb
        .from("homepage_sections")
        .select("id, slug, name_en, name_ar, sort_order")
        .eq("is_active", true)
        .order("sort_order"),
      sb.from("homepage_section_products").select("product_id, section_id"),
      sb
        .from("products")
        .select(`
          id, name, name_en, name_ar, description, price, compare_at_price, type, category_id, is_active, rating_avg,
          product_images (url, is_primary),
          inventory (quantity, reserved),
          product_variants (price)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      sb
        .from("homepage_sections")
        .select(`
          id, slug, name_en, name_ar, sort_order,
          homepage_section_products (product_id, sort_order)
        `)
        .eq("is_active", true)
        .order("sort_order"),
    ]);

    return {
      sections: (sectionsRes.data ?? []) as ShopCatalog["sections"],
      sectionLinks: (linksRes.data ?? []) as ShopCatalog["sectionLinks"],
      products: (productsRes.data ?? []) as CatalogProductRow[],
      sectionsWithProducts: (sectionsFullRes.data ?? []) as ShopSectionWithProducts[],
    } satisfies ShopCatalog;
  },
  ["shop-catalog"],
  { revalidate: REVALIDATE_PRODUCTS, tags: [CACHE_TAGS.products, CACHE_TAGS.homepage] },
);

const PUBLIC_SETTING_KEYS = [
  "privacy_policy",
  "social_instagram",
  "social_facebook",
  "contact_whatsapp",
  "social_telegram",
  "our_story_title_en",
  "our_story_title_ar",
  "our_story_body_en",
  "our_story_body_ar",
  "our_story_image",
] as const;

export const getCachedPublicSettings = unstable_cache(
  async (keys: readonly string[] = PUBLIC_SETTING_KEYS) => {
    const sb = createServerSupabase();
    const { data, error } = await sb.from("settings").select("key, value").in("key", [...keys]);
    if (error) {
      console.error("getCachedPublicSettings:", error.message);
      return {} as Record<string, string>;
    }
    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      if (row.value) map[row.key] = row.value;
    }
    return map;
  },
  ["public-settings"],
  { revalidate: REVALIDATE_SETTINGS, tags: [CACHE_TAGS.settings] },
);

export const getCachedPosts = unstable_cache(
  async () => {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("posts")
      .select("id, title, content, image, slug, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("getCachedPosts:", error.message);
      return [];
    }
    return data ?? [];
  },
  ["journal-posts"],
  { revalidate: REVALIDATE_POSTS, tags: [CACHE_TAGS.posts] },
);

export const getCachedFaqs = unstable_cache(
  async () => {
    const sb = createServerSupabase();
    const { data, error } = await sb
      .from("faqs")
      .select("id, question, answer, category, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      console.error("getCachedFaqs:", error.message);
      return [];
    }
    return data ?? [];
  },
  ["public-faqs"],
  { revalidate: REVALIDATE_SETTINGS, tags: [CACHE_TAGS.settings] },
);
