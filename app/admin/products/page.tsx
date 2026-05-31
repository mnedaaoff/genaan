"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { homepageSectionLabel } from "../../lib/homepage-section-label";
import { getAdminAuthHeaders } from "../../lib/admin-auth";
import type { HomepageSectionOption } from "../../lib/product-sections";

interface Product {
  id: number;
  name: string;
  price: number;
  compare_at_price: number | null;
  type: string;
  is_active: boolean;
  created_at: string;
  product_images: { url: string; is_primary: boolean }[];
  inventory: { quantity: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopSections, setShopSections] = useState<HomepageSectionOption[]>([]);
  const [productSectionIds, setProductSectionIds] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<"" | "section" | "inactive" | "delete">("");
  const [bulkSectionId, setBulkSectionId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState("");

  const loadSectionMap = useCallback(async () => {
    const { data: links } = await supabase
      .from("homepage_section_products")
      .select("product_id, section_id");
    const map: Record<number, number[]> = {};
    for (const link of links ?? []) {
      if (!map[link.product_id]) map[link.product_id] = [];
      map[link.product_id].push(link.section_id);
    }
    setProductSectionIds(map);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("genaan_lang");
    if (stored === "ar" || stored === "en") setLang(stored);

    supabase
      .from("homepage_sections")
      .select("id, slug, name_en, name_ar, is_active")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setShopSections(data as HomepageSectionOption[]);
      });

    loadSectionMap();
  }, [loadSectionMap]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setSelected(new Set());
      let q = supabase
        .from("products")
        .select("id,name,price,compare_at_price,type,is_active,created_at,product_images(url,is_primary),inventory(quantity)")
        .order("created_at", { ascending: false });
      if (search) q = q.ilike("name", `%${search}%`);
      const { data, error } = await q;
      if (error) console.warn("Products load error:", error.message);
      setProducts((data ?? []) as unknown as Product[]);
      setLoading(false);
    }
    load();
  }, [search]);

  const displayed = products.filter(p => {
    const ids = productSectionIds[p.id] ?? [];
    if (sectionFilter === "all") return true;
    if (sectionFilter === "none") return ids.length === 0;
    return ids.includes(Number(sectionFilter));
  });

  const getImg = (p: Product) => p.product_images?.find(i => i.is_primary)?.url ?? p.product_images?.[0]?.url;
  const getStock = (p: Product) => p.inventory?.[0]?.quantity ?? 0;

  const getSectionNames = (productId: number) => {
    const ids = productSectionIds[productId] ?? [];
    if (ids.length === 0) return "—";
    return ids
      .map(id => {
        const sec = shopSections.find(s => s.id === id);
        return sec ? homepageSectionLabel(sec, lang) : null;
      })
      .filter(Boolean)
      .join(" · ");
  };

  const displayedIds = displayed.map(p => p.id);
  const allSelected = displayedIds.length > 0 && displayedIds.every(id => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev);
        displayedIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelected(prev => new Set([...prev, ...displayedIds]));
    }
  };

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteProduct = async (id: number) => {
    if (!confirm(isRTL ? "هل تريد حذف هذا المنتج؟" : "Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setProductSectionIds(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelected(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const toggleActive = async (id: number, current: boolean) => {
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, is_active: !current } : p)));
  };

  const applyBulk = async () => {
    if (!bulkAction || selected.size === 0) return;
    const ids = Array.from(selected);
    setBulkLoading(true);
    setBulkSuccess("");

    try {
      if (bulkAction === "section") {
        const headers = await getAdminAuthHeaders();
        if (bulkSectionId === "__none__") {
          const res = await fetch("/api/admin/homepage", {
            method: "PATCH",
            headers,
            body: JSON.stringify({ action: "bulk_clear_sections", product_ids: ids }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Failed");
          setProductSectionIds(prev => {
            const next = { ...prev };
            ids.forEach(id => { next[id] = []; });
            return next;
          });
          setBulkSuccess(
            isRTL ? `✓ تم إزالة الأقسام من ${ids.length} منتج` : `✓ Cleared sections for ${ids.length} products`
          );
        } else {
          const sectionId = Number(bulkSectionId);
          if (!Number.isFinite(sectionId)) {
            setBulkLoading(false);
            return;
          }
          const res = await fetch("/api/admin/homepage", {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              action: "bulk_add_to_section",
              section_id: sectionId,
              product_ids: ids,
            }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Failed");
          setProductSectionIds(prev => {
            const next = { ...prev };
            ids.forEach(id => {
              const cur = next[id] ?? [];
              if (!cur.includes(sectionId)) next[id] = [...cur, sectionId];
            });
            return next;
          });
          const sec = shopSections.find(s => s.id === sectionId);
          const secName = sec ? homepageSectionLabel(sec, lang) : "";
          setBulkSuccess(
            isRTL
              ? `✓ تم إضافة ${ids.length} منتج لقسم «${secName}»`
              : `✓ Added ${ids.length} products to «${secName}»`
          );
        }
      } else if (bulkAction === "inactive") {
        await supabase.from("products").update({ is_active: false }).in("id", ids);
        setProducts(prev => prev.map(p => (ids.includes(p.id) ? { ...p, is_active: false } : p)));
        setBulkSuccess(isRTL ? `✓ تم إيقاف ${ids.length} منتج` : `✓ ${ids.length} products set to inactive`);
      } else if (bulkAction === "delete") {
        if (!confirm(isRTL ? `هل تريد حذف ${ids.length} منتج؟` : `Delete ${ids.length} products?`)) {
          setBulkLoading(false);
          return;
        }
        await supabase.from("products").delete().in("id", ids);
        setProducts(prev => prev.filter(p => !ids.includes(p.id)));
        setBulkSuccess(isRTL ? `✓ تم حذف ${ids.length} منتج` : `✓ ${ids.length} products deleted`);
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setSelected(new Set());
      setBulkAction("");
      setBulkSectionId("");
      setBulkLoading(false);
      await loadSectionMap();
    }
  };

  const selectCls =
    "px-3 py-2 rounded-xl border border-[#d4ded7] bg-white text-sm text-[#0d3a24] focus:outline-none focus:ring-2 focus:ring-[#17583a] cursor-pointer";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "المنتجات" : "Products"}</h1>
          <p className="text-sm text-[#5f786c] mt-0.5">
            {isRTL ? "نفس أقسام الصفحة الرئيسية والمتجر" : "Same sections as homepage & shop"}
          </p>
        </div>
        <a
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-semibold hover:bg-[#17583a] transition-colors shadow-sm"
        >
          ➕ {isRTL ? "إضافة منتج" : "Add Product"}
        </a>
      </div>

      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg
            className="absolute top-1/2 -translate-y-1/2 start-3.5 text-[#8aab99]"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث عن منتج..." : "Search products..."}
            className="w-full ps-10 pe-4 py-2 rounded-xl border border-[#d4ded7] bg-white text-sm text-[#0d3a24] placeholder-[#8aab99] focus:outline-none focus:ring-2 focus:ring-[#17583a]"
          />
        </div>

        <select
          value={sectionFilter}
          onChange={e => {
            setSectionFilter(e.target.value);
            setSelected(new Set());
          }}
          className={selectCls}
        >
          <option value="all">{isRTL ? "كل الأقسام" : "All sections"}</option>
          <option value="none">{isRTL ? "— بدون قسم —" : "— No section —"}</option>
          {shopSections.map(s => (
            <option key={s.id} value={String(s.id)}>
              {homepageSectionLabel(s, lang)}
            </option>
          ))}
        </select>

        <span className="text-xs text-[#8aab99] font-medium">
          {displayed.length} {isRTL ? "منتج" : "products"}
        </span>
      </div>

      {someSelected && (
        <div className="mb-4 bg-[#0d3a24] rounded-2xl px-5 py-3 shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-white shrink-0">
              {isRTL ? `${selected.size} منتج محدد` : `${selected.size} selected`}
            </span>

            <select
              value={bulkAction}
              onChange={e => {
                setBulkAction(e.target.value as "" | "section" | "inactive" | "delete");
                setBulkSectionId("");
                setBulkSuccess("");
              }}
              className="px-3 py-1.5 rounded-lg bg-white text-sm text-[#0d3a24] font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
            >
              <option value="">{isRTL ? "— اختر إجراء —" : "— Choose action —"}</option>
              <option value="section">{isRTL ? "تعيين لقسم" : "Assign to section"}</option>
              <option value="inactive">{isRTL ? "تعيين كغير متاح" : "Set Inactive"}</option>
              <option value="delete">{isRTL ? "حذف" : "Delete"}</option>
            </select>

            {bulkAction === "section" && (
              <select
                value={bulkSectionId}
                onChange={e => setBulkSectionId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white text-sm text-[#0d3a24] font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
              >
                <option value="">{isRTL ? "— اختر قسم —" : "— Pick section —"}</option>
                <option value="__none__">{isRTL ? "— إزالة من كل الأقسام —" : "— Remove from all sections —"}</option>
                {shopSections.map(s => (
                  <option key={s.id} value={String(s.id)}>
                    {homepageSectionLabel(s, lang)}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={applyBulk}
              disabled={bulkLoading || !bulkAction || (bulkAction === "section" && !bulkSectionId)}
              className="px-4 py-1.5 bg-[#a8d5b5] text-[#0d3a24] rounded-lg text-sm font-bold hover:bg-[#8ec9a0] transition-colors disabled:opacity-40"
            >
              {bulkLoading ? "..." : isRTL ? "تطبيق" : "Apply"}
            </button>

            <button
              onClick={() => {
                setSelected(new Set());
                setBulkAction("");
                setBulkSuccess("");
              }}
              className="ms-auto text-white/50 hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {bulkSuccess && <p className="mt-2 text-xs text-green-300 font-semibold">{bulkSuccess}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-12 bg-[#f0f2ee] rounded animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🌿</p>
            <p className="text-[#8aab99] text-sm">{isRTL ? "لا توجد منتجات" : "No products found"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2ee] bg-[#fafbf9]">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-[#d4ded7] accent-[#17583a] cursor-pointer"
                    />
                  </th>
                  {[
                    isRTL ? "المنتج" : "Product",
                    isRTL ? "الأقسام" : "Sections",
                    isRTL ? "المخزون" : "Stock",
                    isRTL ? "السعر" : "Price",
                    isRTL ? "الحالة" : "Status",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-start text-xs font-semibold text-[#5f786c] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f5f1]">
                {displayed.map(p => {
                  const img = getImg(p);
                  const stock = getStock(p);
                  const isSelected = selected.has(p.id);
                  const sectionText = getSectionNames(p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => toggleOne(p.id)}
                      className={`transition-colors cursor-pointer select-none ${isSelected ? "bg-[#e8f3ec]" : "hover:bg-[#fafbf9]"}`}
                    >
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(p.id)}
                          className="w-4 h-4 rounded border-[#d4ded7] accent-[#17583a] cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f0f2ee] flex-shrink-0">
                            {img ? (
                              <img src={img} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                            )}
                          </div>
                          <span className="font-semibold text-[#0d3a24] line-clamp-1 max-w-[220px]">{p.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[200px]">
                        <span className="text-xs font-semibold text-[#17583a] leading-relaxed">{sectionText}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold ${stock < 5 ? "text-red-500" : "text-[#5f786c]"}`}>
                          {stock}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-[#17583a]">
                        EGP {Number(p.price || 0).toLocaleString()}
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <span className="text-xs text-[#8aab99] line-through ms-2">
                            EGP {Number(p.compare_at_price).toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleActive(p.id, p.is_active)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            p.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {p.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "متوقف" : "Off")}
                        </button>
                      </td>

                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <a
                            href={`/admin/products/${p.id}/edit`}
                            className="text-xs text-[#17583a] font-semibold hover:underline"
                          >
                            {isRTL ? "تعديل" : "Edit"}
                          </a>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="text-xs text-red-500 font-semibold hover:underline"
                          >
                            {isRTL ? "حذف" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
