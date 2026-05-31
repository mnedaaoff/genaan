"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { categoryLabelBoth } from "../../lib/category-label";

interface Category {
  id: number;
  name: string | null;
  name_en: string | null;
  name_ar: string | null;
  image: string | null;
  parent_id: number | null;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [cats, setCats]       = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [lang, setLang]       = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";
  const [form, setForm] = useState({ name_en: "", name_ar: "", parent_id: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("id, name, name_en, name_ar, image, parent_id, created_at")
      .order("id");
    setCats((data ?? []) as Category[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};
  }

  const uploadViaApi = async (file: File, categoryId: number): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "categories");
    fd.append("path", `categories/${categoryId}-${Date.now()}.${file.name.split(".").pop()}`);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const nameEn = form.name_en.trim();
    const nameAr = form.name_ar.trim();
    if (!nameEn || !nameAr) {
      setError(isRTL ? "الاسم بالإنجليزية والعربية مطلوب" : "English and Arabic names are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          name_en: nameEn,
          name_ar: nameAr,
          parent_id: form.parent_id ? Number(form.parent_id) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create category");
      const cat = json.data as { id: number };

      if (imageFile && cat) {
        const publicUrl = await uploadViaApi(imageFile, cat.id);
        const patchRes = await fetch("/api/admin/categories", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(await authHeaders()),
          },
          body: JSON.stringify({ id: cat.id, image: publicUrl }),
        });
        const patchJson = await patchRes.json();
        if (!patchRes.ok) throw new Error(patchJson.error ?? "Failed to save category image");
      }

      setForm({ name_en: "", name_ar: "", parent_id: "" });
      setImageFile(null);
      setImagePreview("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm(isRTL ? "حذف هذه الفئة؟" : "Delete this category?")) return;
    const res = await fetch(`/api/admin/categories?id=${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Failed to delete category");
      return;
    }
    setCats(prev => prev.filter(c => c.id !== id));
  };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#0d3a24] focus:outline-none focus:ring-2 focus:ring-[#17583a] placeholder-[#8aab99]";
  const parentCats = cats.filter(c => !c.parent_id);

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "الفئات" : "Categories"}</h1>
        <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "إدارة فئات المنتجات" : "Manage product categories"}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6">
            <h2 className="font-bold text-[#0d3a24] mb-4 text-sm">➕ {isRTL ? "فئة جديدة" : "New Category"}</h2>
            {error && <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">
                  {isRTL ? "الاسم (إنجليزي) *" : "Name (English) *"}
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={form.name_en}
                  onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                  placeholder="Indoor Plants"
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">
                  {isRTL ? "الاسم (عربي) *" : "Name (Arabic) *"}
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={form.name_ar}
                  onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                  placeholder="نباتات داخلية"
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "الفئة الأم (اختياري)" : "Parent Category"}</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className={inp}>
                  <option value="">{isRTL ? "— بدون فئة أم —" : "— None (top level) —"}</option>
                  {parentCats.map(c => (
                    <option key={c.id} value={c.id}>{categoryLabelBoth(c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "الصورة" : "Image"}</label>
                <label htmlFor="cat-img" className="cursor-pointer block">
                  <div className={`rounded-xl border-2 border-dashed h-28 overflow-hidden ${imagePreview ? "border-[#17583a]" : "border-[#d4ded7] hover:border-[#17583a]"}`}>
                    {imagePreview
                      ? <img src={imagePreview} alt="" className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-[#8aab99] text-xs">{isRTL ? "اضغط لرفع صورة" : "Click to upload"}</div>}
                  </div>
                  <input id="cat-img" type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                  }}/>
                </label>
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-bold hover:bg-[#17583a] transition-colors disabled:opacity-50">
                {saving ? "…" : (isRTL ? "✓ إنشاء" : "✓ Create")}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0f2ee] flex items-center justify-between">
              <h2 className="font-bold text-[#0d3a24] text-sm">{isRTL ? "الفئات الحالية" : "All Categories"}</h2>
              <span className="text-xs text-[#8aab99]">{cats.length} {isRTL ? "فئة" : "categories"}</span>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-[#f0f2ee] rounded animate-pulse"/>)}</div>
            ) : cats.length === 0 ? (
              <div className="py-16 text-center"><p className="text-3xl mb-3">📂</p><p className="text-[#8aab99] text-sm">{isRTL ? "لا توجد فئات" : "No categories yet"}</p></div>
            ) : (
              <div className="divide-y divide-[#f4f5f1]">
                {cats.map(cat => {
                  const parent = cats.find(c => c.id === cat.parent_id);
                  return (
                    <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafbf9] transition-colors">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#f0f2ee] flex-shrink-0">
                        {cat.image
                          ? <img src={cat.image} alt="" className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-xl">📂</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#0d3a24]">{categoryLabelBoth(cat)}</p>
                        <p className="text-xs text-[#8aab99] mt-0.5" dir="ltr">{cat.name_en || cat.name || "—"}</p>
                        <p className="text-xs text-[#8aab99]" dir="rtl">{cat.name_ar || cat.name || "—"}</p>
                        {parent && (
                          <p className="text-xs text-[#8aab99] mt-1">
                            {isRTL ? "ضمن:" : "Under:"} {categoryLabelBoth(parent)}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8aab99]">#{cat.id}</span>
                      <button onClick={() => deleteCategory(cat.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold">
                        {isRTL ? "حذف" : "Delete"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
