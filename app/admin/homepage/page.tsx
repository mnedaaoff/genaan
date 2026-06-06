"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getAdminAuthHeaders, getAdminUploadHeaders } from "../../lib/admin-auth";
import { homepageSectionLabel } from "../../lib/homepage-section-label";
import { productName } from "../../lib/product-label";

interface SectionRow {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  image?: string | null;
  sort_order: number;
  is_active: boolean;
  homepage_section_products?: { product_id: number; sort_order: number }[];
}

interface ProductOption {
  id: number;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  is_active?: boolean;
}

export default function AdminHomepagePage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";
  const [tab, setTab] = useState<"sections" | "bestsellers">("sections");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [bestSellerIds, setBestSellerIds] = useState<number[]>([]);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [sectionProductMap, setSectionProductMap] = useState<Record<number, number[]>>({});
  const [newSection, setNewSection] = useState({
    name_en: "", name_ar: "", description_en: "", description_ar: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingSectionId, setUploadingSectionId] = useState<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch("/api/admin/homepage", { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");

      const secs = (json.sections ?? []) as SectionRow[];
      setSections(secs);
      setAllProducts(json.all_products ?? []);
      setBestSellerIds((json.best_sellers ?? []).map((r: { product_id: number }) => r.product_id));

      const map: Record<number, number[]> = {};
      for (const sec of secs) {
        map[sec.id] = (sec.homepage_section_products ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(p => p.product_id);
      }
      setSectionProductMap(map);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function apiPatch(body: Record<string, unknown>) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setSuccess(isRTL ? "تم الحفظ" : "Saved");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function uploadSectionImage(
    sectionId: number,
    file: File,
    input?: HTMLInputElement | null,
  ) {
    setUploadingSectionId(sectionId);
    setError("");
    setSuccess("");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "products");
      fd.append("path", `homepage/section-${sectionId}-${Date.now()}.${ext}`);

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: await getAdminUploadHeaders(),
        body: fd,
      });
      
      const uploadText = await uploadRes.text();
      let uploadError = "";
      let imageUrl = "";

      try {
        const uploadJson = JSON.parse(uploadText);
        if (uploadRes.ok) {
          imageUrl = typeof uploadJson.url === "string" ? uploadJson.url : "";
        } else {
          uploadError = uploadJson.error ?? (isRTL ? "فشل رفع الملف" : "Upload failed");
        }
      } catch {
        if (uploadRes.status === 413) {
          uploadError = isRTL
            ? "حجم الملف كبير جداً للرفع على السيرفر. الحد الأقصى هو 4 ميجابايت."
            : "The file is too large to upload. The maximum limit is 4MB.";
        } else {
          uploadError = uploadText || `Server error (${uploadRes.status})`;
        }
      }

      if (uploadError) {
        throw new Error(uploadError);
      }
      if (!imageUrl) {
        throw new Error(isRTL ? "لم يُرجع السيرفر رابط الصورة" : "Server did not return image URL");
      }

      const headers = await getAdminAuthHeaders();
      const patchRes = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ action: "update_section", id: sectionId, image: imageUrl }),
      });
      const patchJson = await patchRes.json();
      if (!patchRes.ok) {
        throw new Error(patchJson.error ?? (isRTL ? "فشل حفظ الصورة" : "Failed to save image"));
      }

      setSections(prev =>
        prev.map(s => (s.id === sectionId ? { ...s, image: imageUrl } : s)),
      );
      setSuccess(isRTL ? "تم رفع الصورة" : "Image uploaded");
      if (input) input.value = "";
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : (isRTL ? "فشل الرفع" : "Upload failed"));
    } finally {
      setUploadingSectionId(null);
    }
  }

  const cls = "w-full px-3 py-2 rounded-lg border border-[#d4ded7] bg-[#f4f5f1] text-sm";
  const lbl = "block text-[10px] font-bold text-[#0d3a24] mb-1 uppercase tracking-wide";

  const productLabel = (p: ProductOption) => productName(p, lang);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#e4ece7] border-t-[#17583a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0d3a24]">
          {isRTL ? "الصفحة الرئيسية" : "Homepage"}
        </h1>
        <p className="text-sm text-[#5f786c] mt-1">
          {isRTL ? "تحكم في أقسام المتجر ومنتجات الأكثر مبيعاً" : "Manage shop departments and best sellers"}
        </p>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">⚠️ {error}</div>}
      {success && <div className="mb-4 px-4 py-3 bg-[#e8f3ec] border border-[#b4d9c5] rounded-xl text-sm text-[#17583a] font-medium">✓ {success}</div>}

      <div className="flex gap-2 mb-6">
        {(["sections", "bestsellers"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === t ? "bg-[#17583a] text-white" : "bg-white border border-[#d4ded7] text-[#5f786c]"
            }`}
          >
            {t === "sections"
              ? (isRTL ? "أقسام المتجر" : "Shop Sections")
              : (isRTL ? "الأكثر مبيعاً" : "Best Sellers")}
          </button>
        ))}
      </div>

      {tab === "sections" && (
        <div className="space-y-4">
          <div className="bg-[#e8f3ec] border border-[#b4d9c5] rounded-xl px-4 py-3 text-sm text-[#17583a]">
            {isRTL
              ? "هذه الأقسام تظهر في الصفحة الرئيسية وصفحة المتجر. عيّن المنتجات لكل قسم من هنا أو من صفحة تعديل المنتج."
              : "These sections appear on the homepage and shop. Assign products here or from each product edit page."}
          </div>
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#17583a]/30 p-5">
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 text-sm font-bold text-[#17583a] hover:bg-[#e8f3ec] rounded-xl transition-colors"
              >
                + {isRTL ? "إضافة قسم جديد" : "Add new section"}
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-black text-[#0d3a24]">
                  {isRTL ? "قسم جديد" : "New section"}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>{isRTL ? "الاسم (إنجليزي) *" : "Name (English) *"}</label>
                    <input className={cls} dir="ltr" value={newSection.name_en}
                      onChange={e => setNewSection(s => ({ ...s, name_en: e.target.value }))} />
                  </div>
                  <div>
                    <label className={lbl}>{isRTL ? "الاسم (عربي) *" : "Name (Arabic) *"}</label>
                    <input className={cls} dir="rtl" value={newSection.name_ar}
                      onChange={e => setNewSection(s => ({ ...s, name_ar: e.target.value }))} />
                  </div>
                  <div>
                    <label className={lbl}>{isRTL ? "وصف (إنجليزي)" : "Description (English)"}</label>
                    <input className={cls} value={newSection.description_en}
                      onChange={e => setNewSection(s => ({ ...s, description_en: e.target.value }))} />
                  </div>
                  <div>
                    <label className={lbl}>{isRTL ? "وصف (عربي)" : "Description (Arabic)"}</label>
                    <input className={cls} dir="rtl" value={newSection.description_ar}
                      onChange={e => setNewSection(s => ({ ...s, description_ar: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={saving || !newSection.name_en.trim() || !newSection.name_ar.trim()}
                    onClick={async () => {
                      await apiPatch({
                        action: "create_section",
                        name_en: newSection.name_en,
                        name_ar: newSection.name_ar,
                        description_en: newSection.description_en,
                        description_ar: newSection.description_ar,
                      });
                      setNewSection({ name_en: "", name_ar: "", description_en: "", description_ar: "" });
                      setShowAddForm(false);
                    }}
                    className="px-5 py-2 bg-[#17583a] text-white text-sm font-bold rounded-xl disabled:opacity-50"
                  >
                    {isRTL ? "حفظ القسم" : "Save section"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setNewSection({ name_en: "", name_ar: "", description_en: "", description_ar: "" }); }}
                    className="px-5 py-2 border border-[#d4ded7] text-sm font-semibold rounded-xl text-[#5f786c]"
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {sections.map(sec => (
            <div key={sec.id} className="bg-white rounded-2xl border border-[#f0f2ee] p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-mono text-[#8aab99]">{sec.slug}</p>
                  <h2 className="text-lg font-black text-[#0d3a24]">{homepageSectionLabel(sec, lang)}</h2>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#0d3a24]">
                  <input
                    type="checkbox"
                    checked={sec.is_active}
                    onChange={e => apiPatch({ action: "update_section", id: sec.id, is_active: e.target.checked })}
                  />
                  {isRTL ? "نشط" : "Active"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(isRTL ? "حذف هذا القسم؟" : "Delete this section?")) {
                      apiPatch({ action: "delete_section", id: sec.id });
                    }
                  }}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  {isRTL ? "حذف" : "Delete"}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={lbl}>{isRTL ? "الاسم (إنجليزي)" : "Name (English)"}</label>
                  <input className={cls} defaultValue={sec.name_en}
                    onBlur={e => e.target.value !== sec.name_en && apiPatch({ action: "update_section", id: sec.id, name_en: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>{isRTL ? "الاسم (عربي)" : "Name (Arabic)"}</label>
                  <input className={cls} dir="rtl" defaultValue={sec.name_ar}
                    onBlur={e => e.target.value !== sec.name_ar && apiPatch({ action: "update_section", id: sec.id, name_ar: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>{isRTL ? "وصف (إنجليزي)" : "Description (English)"}</label>
                  <input className={cls} defaultValue={sec.description_en ?? ""}
                    onBlur={e => apiPatch({ action: "update_section", id: sec.id, description_en: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>{isRTL ? "وصف (عربي)" : "Description (Arabic)"}</label>
                  <input className={cls} dir="rtl" defaultValue={sec.description_ar ?? ""}
                    onBlur={e => apiPatch({ action: "update_section", id: sec.id, description_ar: e.target.value })} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                {sec.image && (
                  <img src={sec.image} alt="" className="w-24 h-16 object-cover rounded-lg border border-[#e4ece7]" />
                )}
                <label
                  className={`cursor-pointer px-4 py-2 bg-[#f4f5f1] border border-[#d4ded7] rounded-lg text-xs font-bold text-[#17583a] hover:bg-[#e8f3ec] ${
                    uploadingSectionId === sec.id ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  {uploadingSectionId === sec.id
                    ? (isRTL ? "جاري الرفع…" : "Uploading…")
                    : (isRTL ? "رفع صورة" : "Upload image")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingSectionId === sec.id}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 4.2 * 1024 * 1024) {
                        setError(isRTL ? "حجم الصورة كبير جداً. الحد الأقصى 4 ميجابايت." : "Image file too large. Max limit is 4MB.");
                        e.target.value = "";
                        return;
                      }
                      setError("");
                      void uploadSectionImage(sec.id, f, e.target);
                    }}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}
                className="text-sm font-bold text-[#17583a] hover:underline"
              >
                {isRTL ? "منتجات القسم" : "Section products"} ({sectionProductMap[sec.id]?.length ?? 0})
              </button>

              {expandedSection === sec.id && (
                <div className="mt-4 p-4 bg-[#f4f5f1] rounded-xl space-y-3">
                  <p className="text-xs text-[#5f786c]">
                    {isRTL
                      ? "اختر المنتجات اللي تظهر لما العميل يدخل على القسم من المتجر."
                      : "Pick products shown when customers open this section in the shop."}
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-[#e4ece7] rounded-lg bg-white p-2">
                    {allProducts.map(p => {
                      const selected = (sectionProductMap[sec.id] ?? []).includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-[#f4f5f1] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={e => {
                              setSectionProductMap(prev => {
                                const cur = prev[sec.id] ?? [];
                                const next = e.target.checked
                                  ? [...cur, p.id]
                                  : cur.filter(id => id !== p.id);
                                return { ...prev, [sec.id]: next };
                              });
                            }}
                          />
                          <span>{productLabel(p)}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => apiPatch({
                      action: "sync_section_products",
                      section_id: sec.id,
                      product_ids: sectionProductMap[sec.id] ?? [],
                    })}
                    className="px-4 py-2 bg-[#0d3a24] text-white text-xs font-bold rounded-lg disabled:opacity-50"
                  >
                    {isRTL ? "حفظ منتجات القسم" : "Save section products"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "bestsellers" && (
        <div className="bg-white rounded-2xl border border-[#f0f2ee] p-5 shadow-sm space-y-4">
          <p className="text-sm text-[#5f786c]">
            {isRTL
              ? "اختر المنتجات اللي تظهر في قسم «الأكثر مبيعاً» في الصفحة الرئيسية."
              : "Choose products shown in the Best Sellers section on the homepage."}
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <p className={lbl}>{isRTL ? "إضافة منتج" : "Add product"}</p>
              <div className="max-h-72 overflow-y-auto border border-[#e4ece7] rounded-xl bg-[#f4f5f1] p-2 space-y-1">
                {allProducts.filter(p => !bestSellerIds.includes(p.id)).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBestSellerIds(ids => [...ids, p.id])}
                    className="w-full text-start px-3 py-2 rounded-lg text-sm hover:bg-white transition-colors"
                  >
                    + {productLabel(p)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className={lbl}>{isRTL ? "الترتيب (يظهر في الصفحة الرئيسية)" : "Order (shown on homepage)"}</p>
              <div className="space-y-2 min-h-[12rem]">
                {bestSellerIds.length === 0 && (
                  <p className="text-sm text-[#8aab99] py-8 text-center">
                    {isRTL ? "لم تُضف منتجات بعد" : "No products selected yet"}
                  </p>
                )}
                {bestSellerIds.map((id, idx) => {
                  const p = allProducts.find(x => x.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 p-2 bg-[#f4f5f1] rounded-lg">
                      <span className="text-xs font-bold text-[#8aab99] w-5">{idx + 1}</span>
                      <span className="flex-1 text-sm font-semibold text-[#0d3a24]">{productLabel(p)}</span>
                      <button type="button" disabled={idx === 0} onClick={() => {
                        setBestSellerIds(ids => {
                          const n = [...ids];
                          [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
                          return n;
                        });
                      }} className="text-xs px-2 py-1 rounded border disabled:opacity-30">↑</button>
                      <button type="button" disabled={idx === bestSellerIds.length - 1} onClick={() => {
                        setBestSellerIds(ids => {
                          const n = [...ids];
                          [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
                          return n;
                        });
                      }} className="text-xs px-2 py-1 rounded border disabled:opacity-30">↓</button>
                      <button type="button" onClick={() => setBestSellerIds(ids => ids.filter(x => x !== id))}
                        className="text-xs text-red-500 font-bold px-2">×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => apiPatch({ action: "sync_best_sellers", product_ids: bestSellerIds })}
            className="px-6 py-2.5 bg-[#0d3a24] text-white text-sm font-bold rounded-xl disabled:opacity-50"
          >
            {saving ? "…" : (isRTL ? "حفظ الأكثر مبيعاً" : "Save Best Sellers")}
          </button>
        </div>
      )}
    </div>
  );
}
