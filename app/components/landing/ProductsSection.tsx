"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useI18n } from "../../lib/i18n-context";
import { useState } from "react";
import type { LandingProduct } from "./types";

interface Props { products: LandingProduct[] }

export function ProductsSection({ products }: Props) {
  const { addItem } = useCart();
  const { t } = useI18n();
  const [added, setAdded] = useState<number | null>(null);

  const handleAdd = (p: LandingProduct) => {
    // Build a minimal Product-compatible object for the cart
    addItem({
      id: p.id, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"),
      type: "plant", price: parseFloat(p.price.replace(/[^0-9.]/g, "")),
      images: [{ id: p.id, product_id: p.id, url: p.image, sort_order: 0 }],
      created_at: "", updated_at: "",
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <section className="py-14">
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map(p => (
          <article key={p.id} className="group rounded-2xl bg-white shadow-sm overflow-hidden card-hover flex flex-col">
            <div className="relative h-52 overflow-hidden bg-[#f0f2ee]">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6a8377] mb-1">Plant</p>
              <h3 className="font-heading font-bold text-[#0d3a24] leading-tight">{p.name}</h3>
              <p className="text-xs text-[#8aab99] mt-1 flex-1">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-base font-black font-heading text-[#17583a]">{p.price}</span>
                <button
                  onClick={() => handleAdd(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    added === p.id
                      ? "bg-[#e8f3ec] text-[#17583a] border border-[#17583a]"
                      : "bg-[#17583a] text-white hover:bg-[#195b36]"
                  }`}
                >
                  {added === p.id ? (
                    <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg> Added</>
                  ) : (
                    <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> {t.shop.add_to_cart}</>
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#d4ded7] text-sm font-semibold text-[#245640] hover:border-[#17583a] hover:text-[#17583a] transition-colors">
          {t.products_section.view_all}
        </Link>
      </div>
    </section>
  );
}
