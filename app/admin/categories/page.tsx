"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Category {
  id: number;
  name: string | null;
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
  const [form, setForm] = useState({ name: "", parent_id: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("id");
    setCats((data ?? []) as Category[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError(isRTL ? "الاسم مطلوب" : "Name is required"); return; }
    setSaving(true);
    try {
      const { data: cat, error: insertErr } = await supabase
        .from("categories")
        .insert({ name: form.name.trim(), parent_id: form.parent_id ? Number(form.parent_id) : null })
        .select("id").single();
      if (insertErr) throw new Error(insertErr.message);

      // Upload image
      if (imageFile && cat) {
        const ext = imageFile.name.split(".").pop();
        const path = `categories/${cat.id}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("categories").upload(path, imageFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("categories").getPublicUrl(path);
          await supabase.from("categories").update({ image: urlData.publicUrl }).eq("id", cat.id);
        }
      }

      setForm({ name: "", parent_id: "" });
      setImageFile(null);
      setImagePreview("");
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm(isRTL ? "حذف هذه الفئة؟" : "Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
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
        {/* Create form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6">
            <h2 className="font-bold text-[#0d3a24] mb-4 text-sm">➕ {isRTL ? "فئة جديدة" : "New Category"}</h2>
            {error && <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "الاسم *" : "Name *"}</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={isRTL ? "اسم الفئة" : "Category name"} className={inp}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "الفئة الأم (اختياري)" : "Parent Category"}</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className={inp}>
                  <option value="">{isRTL ? "— بدون فئة أم —" : "— None (top level) —"}</option>
                  {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

        {/* List */}
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
                        <p className="font-semibold text-sm text-[#0d3a24]">{cat.name}</p>
                        {parent && <p className="text-xs text-[#8aab99]">{isRTL ? "ضمن:" : "Under:"} {parent.name}</p>}
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
