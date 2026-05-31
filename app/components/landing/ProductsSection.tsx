"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useI18n } from "../../lib/i18n-context";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { productName } from "../../lib/product-label";
import { computeListingPrice, formatListingPrice } from "../../lib/variant-pricing";

interface Product {
  id: number;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  price: number;
  compare_at_price?: number;
  type?: string;
  product_images?: { url: string; is_primary: boolean }[];
  inventory?: { quantity: number; reserved: number }[];
  product_variants?: { price: number }[];
  display_price?: number;
  price_from?: boolean;
}

export function ProductsSection() {
  const { addItem } = useCart();
  const { t, lang, isRTL } = useI18n();
  const [added, setAdded] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data: bestRows } = await supabase
          .from("homepage_best_sellers")
          .select("product_id, sort_order")
          .order("sort_order");

        const bestIds = (bestRows ?? []).map(r => r.product_id);

        if (bestIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select(`
          id,
          name,
          name_en,
          name_ar,
          description,
          description_en,
          description_ar,
          price,
          compare_at_price,
          type,
          is_active,
          product_images (url, is_primary),
          inventory (quantity, reserved),
          product_variants (price)
        `)
          .in("id", bestIds)
          .eq("is_active", true);

        if (error) {
          console.warn("Products fetch error:", error.message);
          setProducts([]);
        } else {
          const byId = new Map(
            (data ?? []).map(row => {
              const listing = computeListingPrice(Number(row.price), row.product_variants ?? []);
              return [row.id, {
                ...row,
                name: productName(row, lang),
                display_price: listing.amount,
                price_from: listing.fromPrice,
                price: listing.amount,
              }];
            })
          );
          const ordered = bestIds.map(id => byId.get(id)).filter(Boolean) as Product[];
          setProducts(ordered);
        }
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [lang]);

  const handleAdd = (p: Product) => {
    const imgUrl = p.product_images?.find(i => i.is_primary)?.url ?? p.product_images?.[0]?.url ?? null;
    const stock = p.inventory?.[0] ? (p.inventory[0].quantity - p.inventory[0].reserved) : 99;

    addItem({
      id: p.id as any,
      name: p.name,
      price: p.display_price ?? p.price,
      images: imgUrl ? [{ url: imgUrl }] : [],
      stock: stock,
      type: p.type ?? "plant",
    } as any);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  if (loading) {
    return (
      <section className="py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] font-bold text-[#6a8377] uppercase mb-2">{t.products_section.subtitle}</p>
            <h2 className="text-3xl font-heading font-black text-[#0d3a24]">{t.products_section.heading}</h2>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
              <div className="h-52 bg-[#e4ece7]" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-[#e4ece7] rounded w-1/3" />
                <div className="h-4 bg-[#e4ece7] rounded w-2/3" />
                <div className="h-3 bg-[#e4ece7] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-14" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] font-bold text-[#6a8377] uppercase mb-2">{t.products_section.subtitle}</p>
          <h2 className="text-3xl font-heading font-black text-[#0d3a24]">{t.products_section.heading}</h2>
        </div>
        <Link
          href="/shop"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#17583a] hover:underline"
        >
          {t.products_section.view_all}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d={isRTL ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
          </svg>
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map(p => {
          const imgUrl = p.product_images?.find(i => i.is_primary)?.url ?? p.product_images?.[0]?.url ?? null;
          const displayPrice = p.display_price ?? p.price;
          const description = lang === "ar"
            ? (p.description_ar || p.description_en || p.description)
            : (p.description_en || p.description_ar || p.description);
          return (
            <article key={p.id} className="group rounded-2xl bg-white shadow-sm overflow-hidden card-hover flex flex-col hover:shadow-md transition-shadow duration-300">
              <Link href={`/shop/${p.id}`} className="relative h-52 overflow-hidden bg-[#f0f2ee] block">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8aab99] text-sm">
                    <span className="text-4xl">🌿</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {p.compare_at_price && p.compare_at_price > displayPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {Math.round((1 - displayPrice / p.compare_at_price) * 100)}% {lang === "ar" ? "خصم" : "OFF"}
                  </div>
                )}
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6a8377] mb-1">{p.type || "Plant"}</p>
                <h3 className="font-heading font-bold text-[#0d3a24] leading-tight">{p.name}</h3>
                <p className="text-xs text-[#8aab99] mt-1 flex-1 line-clamp-2">{description || ""}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black font-heading text-[#17583a]">
                      {formatListingPrice(displayPrice, !!p.price_from, lang)}
                    </span>
                    {p.compare_at_price && p.compare_at_price > displayPrice && (
                      <span className="text-xs text-[#8aab99] line-through ms-2">EGP {Number(p.compare_at_price).toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAdd(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${added === p.id
                        ? "bg-[#e8f3ec] text-[#17583a] border border-[#17583a]"
                        : "bg-[#17583a] text-white hover:bg-[#195b36]"
                      }`}
                  >
                    {added === p.id ? (
                      <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg> {t.product.added}</>
                    ) : (
                      <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg> {t.shop.add_to_cart}</>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#d4ded7] text-sm font-semibold text-[#245640] hover:border-[#17583a] hover:text-[#17583a] transition-colors">
          {t.products_section.view_all}
        </Link>
      </div>
    </section>
  );
}
