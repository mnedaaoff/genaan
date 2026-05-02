"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useI18n } from "../../lib/i18n-context";
import { products as productsApi } from "../../lib/api";
import type { Product } from "../../lib/types";

const CATEGORIES = ["all", "plant", "pot", "soil", "vitamin", "accessory"] as const;
type Category = typeof CATEGORIES[number];

/** Safely convert any value to a float — avoids "toFixed is not a function" */
function toNum(v: unknown): number {
  const n = parseFloat(String(v ?? 0));
  return isNaN(n) ? 0 : n;
}

export default function ShopPage() {
  const { addItem, isCartOpen, openCart } = useCart();
  const { t } = useI18n();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await productsApi.list();
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = category === "all" || p.type === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-[#f4f5f1] min-h-screen">
      {/* Header */}
      <div className="bg-[#17583a] py-16 px-5 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 animate-fade-in">{t.shop.title}</h1>
        <p className="text-[#a8c7b6] max-w-lg mx-auto text-sm animate-fade-in">{t.shop.subtitle}</p>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                  category === c ? "bg-[#17583a] text-white" : "bg-white text-[#5f786c] hover:bg-[#e4ece7]"
                }`}
              >
                {t.shop.categories?.[c] || c}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64 shrink-0">
            <input
              type="text"
              placeholder={t.shop.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border-none shadow-sm focus:ring-2 focus:ring-[#17583a] text-sm"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8aab99]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-4.35-4.35" />
              <circle cx="11" cy="11" r="7" />
            </svg>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-4 shadow-sm h-[320px]">
                <div className="w-full h-48 bg-[#e4ece7] rounded-xl mb-4"/>
                <div className="h-4 bg-[#e4ece7] rounded-full w-3/4 mb-2"/>
                <div className="h-4 bg-[#e4ece7] rounded-full w-1/4"/>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
            {filteredProducts.map(product => (
              <div key={product.id} className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
                <Link href={`/shop/${product.id}`} className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#f0f2ee] mb-4">
                  {product.images?.[0]?.url && (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                  {product.inventory && product.inventory.available < 5 && (
                    <span className="absolute top-2 left-2 bg-[#ffeed9] text-[#c16e00] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  )}
                </Link>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-semibold text-[#0d3a24] line-clamp-1 flex-1">
                      <Link href={`/shop/${product.id}`} className="hover:text-[#17583a] transition-colors">{product.name}</Link>
                    </h3>
                  </div>
                  <p className="text-xs text-[#8aab99] capitalize mb-3 font-semibold tracking-wider">{t.shop.categories?.[product.type as Category] || product.type}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-[#17583a] ltr-num">EGP {toNum(product.price).toFixed(2)}</span>
                    <button
                      onClick={() => {
                        addItem(product);
                        if (!isCartOpen) openCart();
                      }}
                      className="w-8 h-8 rounded-full bg-[#f4f5f1] flex items-center justify-center text-[#17583a] hover:bg-[#17583a] hover:text-white transition-colors"
                      title={t.shop.add_to_cart || "Add to Cart"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-[#f4f5f1] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8aab99" strokeWidth="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <p className="font-semibold text-[#0d3a24] mb-1">{t.shop.no_results}</p>
            <p className="text-[#5f786c] text-sm">{t.shop.try_another}</p>
          </div>
        )}
      </div>
    </div>
  );
}
