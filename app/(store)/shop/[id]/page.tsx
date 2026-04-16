"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { products as productsApi } from "../../../lib/api";
import type { Product } from "../../../lib/types";
import { useCart } from "../../../lib/cart-context";
import { useI18n } from "../../../lib/i18n-context";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem } = useCart();
  const { t } = useI18n();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "care" | "reviews">("description");
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    productsApi.get(Number(id))
      .then(p => { setProduct(p); setLoading(false); })
      .catch(() => { setError("Product not found."); setLoading(false); });
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, undefined, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const LIGHT_LABELS: Record<string, string> = { low: "Low", medium: "Medium", bright: "Bright", direct: "Direct Sun" };
  const HUM_LABELS:   Record<string, string> = { low: "Low", medium: "Medium", high: "High" };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f1]">
      <div className="w-10 h-10 border-4 border-[#17583a] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f1]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#e8f3ec] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        </div>
        <p className="text-[#5f786c] mb-4">{error || "Product not found."}</p>
        <Link href="/shop" className="text-sm text-[#17583a] hover:underline">{t.product.back}</Link>
      </div>
    </div>
  );

  const images = product.images ?? [];
  const isOutOfStock = product.inventory?.available === 0;

  return (
    <div className="min-h-screen bg-[#f4f5f1]">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8aab99] mb-6">
          <Link href="/shop" className="hover:text-[#17583a]">{t.nav.shop}</Link>
          <span>/</span>
          <span className="text-[#0d3a24] font-medium capitalize">{product.type}</span>
          <span>/</span>
          <span className="text-[#0d3a24]">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm aspect-square">
              {images[activeImg]?.url && (
                <Image
                  src={images[activeImg].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                  <span className="px-4 py-2 bg-[#0d3a24] text-white text-sm font-bold rounded-full">{t.product.out_of_stock}</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? "border-[#17583a]" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="64px"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#6a8377] uppercase mb-2 capitalize">{product.type}</p>
              <h1 className="text-3xl font-heading font-black text-[#0d3a24] leading-tight">{product.name}</h1>
              {product.scientific_name && (
                <p className="text-sm italic text-[#8aab99] mt-1">{product.scientific_name}</p>
              )}
              {/* Rating */}
              {product.avg_rating && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(product.avg_rating!) ? "#17583a" : "none"} stroke="#17583a" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-[#0d3a24]">{product.avg_rating}</span>
                  <span className="text-xs text-[#8aab99]">({product.review_count} {t.product.reviews})</span>
                </div>
              )}
            </div>

            <p className="text-3xl font-heading font-black text-[#17583a]">EGP {product.price.toFixed(2)}</p>

            {/* Stock */}
            {product.inventory && (
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-red-400" : product.inventory.available <= 5 ? "bg-amber-400" : "bg-[#17583a]"}`}/>
                <span className="text-sm text-[#5f786c]">
                  {isOutOfStock
                    ? t.product.out_of_stock
                    : product.inventory.available <= 5
                      ? `${t.product.low_stock} — ${product.inventory.available} left`
                      : `${t.product.in_stock} (${product.inventory.available})`}
                </span>
              </div>
            )}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#d4ded7] rounded-lg overflow-hidden bg-white">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-[#5f786c] hover:bg-[#f4f5f1] text-lg font-bold transition-colors" disabled={qty <= 1}>−</button>
                <span className="px-4 py-3 text-sm font-bold text-[#0d3a24] min-w-[44px] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 text-[#5f786c] hover:bg-[#f4f5f1] text-lg font-bold transition-colors">+</button>
              </div>
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  added
                    ? "bg-[#e8f3ec] text-[#17583a] border-2 border-[#17583a]"
                    : "bg-[#17583a] text-white hover:bg-[#195b36] shadow-sm"
                } disabled:opacity-40`}
              >
                {added ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg> {t.product.added}</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> {t.product.addToCart}</>
                )}
              </button>
            </div>

            {/* Tabs */}
            <div className="border-t border-[#e4ece7] pt-5">
              <div className="flex gap-1 mb-4">
                {(["description", "care", "reviews"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      activeTab === tab ? "bg-[#17583a] text-white" : "text-[#5f786c] hover:bg-[#f0f2ee]"
                    }`}
                  >
                    {tab === "description" ? t.product.description : tab === "care" ? t.product.care_guide : t.product.reviews}
                  </button>
                ))}
              </div>

              {activeTab === "description" && (
                <p className="text-sm text-[#5f786c] leading-7">{product.description || "No description available."}</p>
              )}

              {activeTab === "care" && product.plant_care && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t.product.watering, value: `${product.plant_care.watering_days} ${t.product.days}`, icon: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" },
                    { label: t.product.light,    value: LIGHT_LABELS[product.plant_care.light_level] || product.plant_care.light_level, icon: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 100 12 6 6 0 000-12z" },
                    { label: t.product.humidity, value: HUM_LABELS[product.plant_care.humidity_level] || product.plant_care.humidity_level, icon: "M12 2C6 2 4 8 4 12a8 8 0 0016 0c0-4-2-10-8-10z" },
                  ].map(item => (
                    <div key={item.label} className="bg-[#f4f5f1] rounded-xl p-4 text-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="1.8" className="mx-auto mb-2"><path d={item.icon}/></svg>
                      <p className="text-xs font-semibold text-[#8aab99] mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-[#0d3a24]">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "care" && !product.plant_care && (
                <p className="text-sm text-[#8aab99]">No care guide available for this product.</p>
              )}

              {activeTab === "reviews" && (
                <div>
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {product.reviews.map(r => (
                        <div key={r.id} className="bg-[#fafafa] rounded-xl p-4 border border-[#f0f2ee]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-[#17583a] text-white text-xs font-bold flex items-center justify-center">
                              {r.user?.name?.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-[#0d3a24]">{r.user?.name}</span>
                            <div className="flex ms-auto">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < r.rating ? "#17583a" : "none"} stroke="#17583a" strokeWidth="1.5">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-[#5f786c]">{r.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#8aab99]">{t.product.be_first}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-[#e4ece7]">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[#5f786c] hover:text-[#17583a] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            {t.product.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
