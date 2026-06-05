"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useI18n } from "../../lib/i18n-context";
import { supabase } from "../../lib/supabase";
import { productName } from "../../lib/product-label";
import { computeListingPrice, formatListingPrice } from "../../lib/variant-pricing";
import { homepageSectionLabel } from "../../lib/homepage-section-label";
import type { ShopCatalog, ShopSectionWithProducts } from "../../lib/cache/public-data";

interface ShopSection {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  sort_order: number;
}

interface Product {
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
  product_variants?: { price: number }[];
  display_price?: number;
  price_from?: boolean;
}

type SortKey = "newest" | "price_asc" | "price_desc" | "rating";

function toNum(v: unknown): number {
  const n = parseFloat(String(v ?? 0));
  return isNaN(n) ? 0 : n;
}

export default function ShopClient({ initialCatalog }: { initialCatalog?: ShopCatalog }) {
  const { addItem, isCartOpen, openCart } = useCart();
  const { t, lang, isRTL } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [shopSections, setShopSections] = useState<ShopSection[]>([]);
  const [productSectionLabels, setProductSectionLabels] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(!initialCatalog);
  const [sectionsWithProducts] = useState<ShopSectionWithProducts[]>(
    () => initialCatalog?.sectionsWithProducts ?? [],
  );
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [sectionSlug, setSectionSlug] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string | null>(null);
  const [sectionProductIds, setSectionProductIds] = useState<number[] | null>(null);

  const hydrateCatalog = (catalog: ShopCatalog) => {
    setShopSections(catalog.sections as ShopSection[]);
    const labelMap: Record<number, string> = {};
    for (const link of catalog.sectionLinks) {
      if (labelMap[link.product_id]) continue;
      const sec = catalog.sections.find(s => s.id === link.section_id);
      if (sec) labelMap[link.product_id] = homepageSectionLabel(sec, lang);
    }
    setProductSectionLabels(labelMap);

    const prods = catalog.products.map((row: Product) => {
      const listing = computeListingPrice(toNum(row.price), row.product_variants ?? []);
      return {
        ...row,
        name: productName(row, lang),
        display_price: listing.amount,
        price_from: listing.fromPrice,
        price: listing.amount,
      };
    }) as Product[];
    setProducts(prods);
    const mp = Math.max(...prods.map(p => toNum(p.price)), 500);
    const rounded = Math.ceil(mp / 100) * 100;
    setMaxPrice(rounded);
    setPriceRange([0, rounded]);
    setLoading(false);
  };

  useEffect(() => {
    if (initialCatalog) {
      hydrateCatalog(initialCatalog);
      return;
    }
    async function loadData() {
      const { data: sections } = await supabase
        .from("homepage_sections")
        .select("id, slug, name_en, name_ar, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      setShopSections((sections ?? []) as ShopSection[]);

      const { data: links } = await supabase
        .from("homepage_section_products")
        .select("product_id, section_id");
      const labelMap: Record<number, string> = {};
      for (const link of links ?? []) {
        if (labelMap[link.product_id]) continue;
        const sec = (sections ?? []).find(s => s.id === link.section_id);
        if (sec) labelMap[link.product_id] = homepageSectionLabel(sec, lang);
      }
      setProductSectionLabels(labelMap);

      const { data: prodsData, error: prodsErr } = await supabase
        .from("products")
        .select(`
          id, name, name_en, name_ar, description, price, compare_at_price, type, category_id, is_active, rating_avg,
          product_images (url, is_primary),
          inventory (quantity, reserved),
          product_variants (price)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (prodsErr) {
        console.error("Failed to load products:", prodsErr.message);
      } else {
        const prods = (prodsData ?? []).map((row: Product) => {
          const listing = computeListingPrice(toNum(row.price), row.product_variants ?? []);
          return {
            ...row,
            name: productName(row, lang),
            display_price: listing.amount,
            price_from: listing.fromPrice,
            price: listing.amount,
          };
        }) as Product[];
        setProducts(prods);
        const mp = Math.max(...prods.map(p => toNum(p.price)), 500);
        setMaxPrice(Math.ceil(mp / 100) * 100);
        setPriceRange([0, Math.ceil(mp / 100) * 100]);
      }

      setLoading(false);
    }

    loadData();
  }, [initialCatalog, lang]);

  useEffect(() => {
    const urlSection = searchParams.get("section");
    if (!urlSection) {
      setSectionSlug(null);
      setSectionTitle(null);
      setSectionProductIds(null);
      return;
    }

    async function loadSection() {
      const cached = sectionsWithProducts.find(s => s.slug === urlSection);
      const sec = cached ?? (await supabase
        .from("homepage_sections")
        .select(`
          id, slug, name_en, name_ar,
          homepage_section_products (product_id, sort_order)
        `)
        .eq("slug", urlSection)
        .eq("is_active", true)
        .maybeSingle()).data;

      if (!sec) {
        setSectionSlug(urlSection);
        setSectionTitle(urlSection);
        setSectionProductIds([]);
        return;
      }

      setSectionSlug(urlSection);
      setSectionTitle(homepageSectionLabel(sec, lang));
      const ids = (sec.homepage_section_products ?? [])
        .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        .map((p: { product_id: number }) => p.product_id);
      setSectionProductIds(ids);
    }
    loadSection();
  }, [searchParams, lang, sectionsWithProducts]);

  useEffect(() => {
    const urlType = searchParams.get("type");
    if (urlType) setTypeFilter(urlType);
  }, [searchParams]);

  const handleSectionChange = (slug: string | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("type");
    if (slug === "all") {
      params.delete("section");
    } else {
      params.set("section", slug);
    }
    router.push(params.toString() ? `/shop?${params.toString()}` : "/shop");
  };

  const getImage = (p: Product) =>
    p.product_images?.find(i => i.is_primary)?.url ?? p.product_images?.[0]?.url ?? null;

  const getStock = (p: Product) => {
    const inv = p.inventory?.[0];
    if (!inv) return null;
    return inv.quantity - inv.reserved;
  };

  // Filter + sort
  const filtered = products
    .filter(p => {
      const matchType = typeFilter === "all" || p.type === typeFilter;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchPrice = toNum(p.display_price ?? p.price) >= priceRange[0] && toNum(p.display_price ?? p.price) <= priceRange[1];
      const stock = getStock(p);
      const matchStock = !inStockOnly || (stock === null || stock > 0);
      const matchSection = sectionProductIds === null || sectionProductIds.includes(p.id);
      return matchType && matchSearch && matchPrice && matchStock && matchSection;
    })
    .sort((a, b) => {
      if (sectionProductIds && sectionProductIds.length > 0) {
        return sectionProductIds.indexOf(a.id) - sectionProductIds.indexOf(b.id);
      }
      if (sort === "price_asc") return toNum(a.price) - toNum(b.price);
      if (sort === "price_desc") return toNum(b.price) - toNum(a.price);
      if (sort === "rating") return toNum(b.rating_avg) - toNum(a.rating_avg);
      return 0; // newest already sorted from DB
    });

  const TYPE_LABELS: Record<string, { en: string; ar: string }> = {
    all:       { en: "All",       ar: "الكل" },
    plant:     { en: "Plants",    ar: "نباتات" },
    pot:       { en: "Pots",      ar: "أحواض" },
    soil:      { en: "Soil",      ar: "تربة" },
    vitamin:   { en: "Vitamins",  ar: "فيتامينات" },
    accessory: { en: "Accessories", ar: "إكسسوارات" },
  };

  const SORT_LABELS: Record<SortKey, { en: string; ar: string }> = {
    newest:     { en: "Newest",         ar: "الأحدث" },
    price_asc:  { en: "Price: Low to High", ar: "السعر: من الأقل للأعلى" },
    price_desc: { en: "Price: High to Low", ar: "السعر: من الأعلى للأقل" },
    rating:     { en: "Top Rated",      ar: "الأعلى تقييماً" },
  };

  const activeFilters = (inStockOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) + (sectionSlug ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);

  return (
    <div className="bg-[#f4f5f1] min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* Compact Header */}
      <div className="bg-[#17583a] py-8 px-5">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-white">
            {sectionTitle ?? t.shop.title}
          </h1>
          <p className="text-[#a8c7b6] text-xs mt-1 max-w-sm">
            {sectionTitle
              ? (lang === "ar" ? "المنتجات في هذه المجموعة" : "Products in this collection")
              : t.shop.subtitle}
          </p>
          {sectionSlug && (
            <Link href="/shop" className="inline-block mt-3 text-xs font-semibold text-white/90 hover:text-white underline">
              {lang === "ar" ? "← كل المنتجات" : "← All products"}
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-6">
        {/* Controls row */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          {/* Type pills */}
          <div className="flex gap-1.5 overflow-x-auto flex-1 min-w-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => handleSectionChange("all")}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !sectionSlug ? "bg-[#17583a] text-white" : "bg-white text-[#5f786c] hover:bg-[#e4ece7]"
              }`}
            >
              {lang === "ar" ? "الكل" : "All"}
            </button>
            {shopSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => handleSectionChange(sec.slug)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  sectionSlug === sec.slug ? "bg-[#17583a] text-white" : "bg-white text-[#5f786c] hover:bg-[#e4ece7]"
                }`}
              >
                {homepageSectionLabel(sec, lang)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-52 shrink-0">
            <input
              type="text"
              placeholder={t.shop.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2 rounded-full border-none shadow-sm focus:ring-2 focus:ring-[#17583a] text-xs"
            />
            <svg className="absolute top-1/2 -translate-y-1/2 start-3 w-3.5 h-3.5 text-[#8aab99]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="px-3 py-2 rounded-full bg-white text-xs text-[#5f786c] font-medium border-none shadow-sm focus:ring-2 focus:ring-[#17583a] shrink-0 cursor-pointer"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
              <option key={k} value={k}>{SORT_LABELS[k][lang]}</option>
            ))}
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              showFilters || activeFilters > 0 ? "bg-[#17583a] text-white" : "bg-white text-[#5f786c] hover:bg-[#e4ece7]"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            {isRTL ? "الفلاتر" : "Filters"}
            {activeFilters > 0 && (
              <span className="bg-white/20 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>
            )}
          </button>
        </div>

        {/* Advanced filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 animate-fade-in flex flex-wrap gap-6 items-end">
            {/* Price range */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold text-[#0d3a24] mb-2 uppercase tracking-wider">
                {isRTL ? "نطاق السعر" : "Price Range"}: EGP {priceRange[0]} {lang === "ar" ? "إلى" : "to"} {priceRange[1]}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0} max={maxPrice} step={50}
                  value={priceRange[0]}
                  onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 50), priceRange[1]])}
                  className="flex-1 accent-[#17583a] h-1"
                />
                <input
                  type="range" min={0} max={maxPrice} step={50}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 50)])}
                  className="flex-1 accent-[#17583a] h-1"
                />
              </div>
            </div>

            {/* In stock */}
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox" checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-[#d4ded7] text-[#17583a] focus:ring-[#17583a]"
              />
              <span className="text-xs font-semibold text-[#0d3a24]">{isRTL ? "المتوفر في المخزن فقط" : "In Stock Only"}</span>
            </label>

            {/* Reset */}
            <button
              onClick={() => {
                setInStockOnly(false); setPriceRange([0, maxPrice]); setSearch(""); setSort("newest"); setTypeFilter("all");
                router.push("/shop");
              }}
              className="text-xs text-[#17583a] font-semibold hover:underline shrink-0"
            >
              {isRTL ? "مسح الكل" : "Clear All"}
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="text-xs text-[#8aab99] mb-4">
          {filtered.length} {isRTL ? "منتجات" : "products"}
          {search && (lang === "ar" ? ` لـ "${search}"` : ` for "${search}"`)}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm h-[320px]">
                <div className="w-full h-48 bg-[#e4ece7] rounded-xl mb-4" />
                <div className="h-4 bg-[#e4ece7] rounded-full w-3/4 mb-2" />
                <div className="h-4 bg-[#e4ece7] rounded-full w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map(product => {
              const imgUrl = getImage(product);
              const stock = getStock(product);
              const displayCategory = productSectionLabels[product.id]
                ?? (TYPE_LABELS[product.type]?.[lang] ?? product.type);

              return (
                <div key={product.id} className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <Link href={`/shop/${product.id}`} className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#f0f2ee] mb-4 block">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={product.name} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8aab99]">
                        <span className="text-4xl">🪴</span>
                      </div>
                    )}
                    {stock !== null && stock < 5 && stock > 0 && (
                      <span className="absolute top-2 start-2 bg-[#ffeed9] text-[#c16e00] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {lang === "ar" ? "كمية محدودة" : "Low Stock"}
                      </span>
                    )}
                    {stock === 0 && (
                      <span className="absolute top-2 start-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {lang === "ar" ? "غير متوفر" : "Out of Stock"}
                      </span>
                    )}
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="absolute top-2 end-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                      </span>
                    )}
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <p className="text-xs text-[#8aab99] capitalize mb-1 font-semibold tracking-wider">
                      {displayCategory}
                    </p>
                    <h3 className="font-semibold text-[#0d3a24] line-clamp-2 flex-1 mb-3 text-sm">
                      <Link href={`/shop/${product.id}`} className="hover:text-[#17583a] transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#17583a]">
                          {formatListingPrice(toNum(product.display_price ?? product.price), !!product.price_from, lang)}
                        </span>
                        {product.compare_at_price && product.compare_at_price > toNum(product.display_price ?? product.price) && (
                          <span className="text-xs text-[#8aab99] line-through ms-2">
                            EGP {toNum(product.compare_at_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          addItem({
                            id: product.id as any,
                            name: product.name,
                            price: product.price,
                            images: imgUrl ? [{ url: imgUrl }] : [],
                            stock: stock ?? 99,
                            type: product.type,
                          } as any);
                          if (!isCartOpen) openCart();
                        }}
                        className="w-8 h-8 rounded-full bg-[#f4f5f1] flex items-center justify-center text-[#17583a] hover:bg-[#17583a] hover:text-white transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <p className="text-4xl mb-4">🪴</p>
            <p className="font-semibold text-[#0d3a24] mb-1">
              {sectionSlug && sectionProductIds?.length === 0
                ? (lang === "ar" ? "لا توجد منتجات في هذا القسم بعد" : "No products in this section yet")
                : t.shop.no_results}
            </p>
            <p className="text-[#5f786c] text-sm">
              {sectionSlug && sectionProductIds?.length === 0
                ? (lang === "ar" ? "قم بتعيين المنتجات لهذا القسم من لوحة التحكم." : "Assign products to this section from the dashboard.")
                : t.shop.try_another}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
