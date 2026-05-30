"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";


export default function NewProductPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  const [form, setForm] = useState({
    name: "", description: "", scientific_name: "",
    price: "", compare_at_price: "",
    type: "plant", category_id: "", stock: "",
    is_active: true,
  });

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);

    async function loadCats() {
      const { data } = await supabase.from("categories").select("id, name").order("id");
      if (data) setCategories(data);
    }
    loadCats();
  }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Upload via server API route (bypasses RLS using service role key)
  const uploadViaApi = async (file: File, productId: string | number): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "products");
    fd.append("path", `products/${productId}-${Date.now()}.${file.name.split(".").pop()}`);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError(isRTL ? "اسم المنتج مطلوب" : "Product name is required"); return; }
    if (!form.price || Number(form.price) <= 0) { setError(isRTL ? "السعر مطلوب" : "Price is required"); return; }

    setSaving(true);
    try {
      // 1. Insert product
      const { data: product, error: productErr } = await supabase
        .from("products")
        .insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          scientific_name: form.scientific_name.trim() || null,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          type: form.type,
          category_id: form.category_id ? Number(form.category_id) : null,
          is_active: form.is_active,
          slug: form.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now(),
        })
        .select("id")
        .single();

      if (productErr) throw new Error(productErr.message);
      const productId = product.id;

      // 2. Upload image via server API (bypasses storage RLS)
      if (imageFile) {
        const publicUrl = await uploadViaApi(imageFile, productId);
        const { error: imgErr } = await supabase.from("product_images").insert({
          product_id: productId,
          url: publicUrl,
          is_primary: true,
          sort_order: 0
        });
        if (imgErr) throw new Error(isRTL ? `فشل إضافة الصورة لجدول الصور: ${imgErr.message}` : `Failed to insert image: ${imgErr.message}`);
      }

      // 3. Create inventory record
      if (form.stock) {
        const { error: invErr } = await supabase.from("inventory").insert({
          product_id: productId,
          quantity: Number(form.stock),
          reserved: 0
        });
        if (invErr) throw new Error(isRTL ? `فشل إضافة المخزون: ${invErr.message}` : `Failed to insert inventory: ${invErr.message}`);
      }

      router.replace("/admin/products");
    } catch (err: any) {
      setError(err.message ?? "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const cls = "w-full px-4 py-2.5 rounded-xl border border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#0d3a24] placeholder-[#8aab99] focus:outline-none focus:ring-2 focus:ring-[#17583a] transition-all";
  const lbl = "block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#e8f3ec] transition-colors text-[#17583a]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d={isRTL ? "M5 12h14M12 5l7 7-7 7" : "M19 12H5M12 19l-7-7 7-7"} />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "إضافة منتج جديد" : "Add New Product"}</h1>
          <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "أدخل بيانات المنتج" : "Fill in product details"}</p>
        </div>
      </div>

      {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">

        {/* Image + Settings */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5">
            <p className={lbl}>{isRTL ? "صورة المنتج" : "Product Image"}</p>
            <label htmlFor="img" className="cursor-pointer block">
              <div className={`rounded-xl border-2 border-dashed overflow-hidden h-52 ${imagePreview ? "border-[#17583a]" : "border-[#d4ded7] hover:border-[#17583a]"}`}>
                {imagePreview
                  ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8aab99]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                    </svg>
                    <p className="text-xs">{isRTL ? "اضغط لرفع صورة" : "Click to upload"}</p>
                  </div>}
              </div>
              <input id="img" type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 space-y-4">
            <p className={lbl}>{isRTL ? "إعدادات" : "Settings"}</p>
            <div>
              <label className={lbl}>{isRTL ? "الفئة" : "Category"}</label>
              <select value={form.category_id} onChange={e => set("category_id", e.target.value)} className={cls}>
                <option value="">{isRTL ? "— بدون فئة —" : "— No Category —"}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>{isRTL ? "المخزون" : "Stock"}</label>
              <input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" className={cls} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#0d3a24] font-semibold">{isRTL ? "نشط" : "Active"}</span>
              <button type="button" onClick={() => set("is_active", !form.is_active)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? "bg-[#17583a]" : "bg-[#d4ded7]"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? "start-5" : "start-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 space-y-4">
            <p className={lbl}>{isRTL ? "بيانات المنتج" : "Product Info"}</p>
            <div>
              <label className={lbl}>{isRTL ? "اسم المنتج *" : "Product Name *"}</label>
              <input type="text" required value={form.name} onChange={e => set("name", e.target.value)}
                placeholder={isRTL ? "مثال: فيكس بنجامينا" : "e.g. Peace Lily"} className={cls} />
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الاسم العلمي (اختياري)" : "Scientific Name (optional)"}</label>
              <input type="text" value={form.scientific_name} onChange={e => set("scientific_name", e.target.value)}
                placeholder="e.g. Ficus benjamina" className={cls} />
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الوصف" : "Description"}</label>
              <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)}
                placeholder={isRTL ? "وصف المنتج..." : "Describe the product..."}
                className={`${cls} resize-none`} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 space-y-4">
            <p className={lbl}>{isRTL ? "التسعير" : "Pricing"}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{isRTL ? "السعر الحالي (EGP) *" : "Price (EGP) *"}</label>
                <input type="number" required min="0" step="0.01" value={form.price}
                  onChange={e => set("price", e.target.value)} placeholder="0.00" className={cls} />
              </div>
              <div>
                <label className={lbl}>{isRTL ? "السعر قبل الخصم" : "Compare Price"}</label>
                <input type="number" min="0" step="0.01" value={form.compare_at_price}
                  onChange={e => set("compare_at_price", e.target.value)}
                  placeholder={isRTL ? "مشطوب" : "Strikethrough"} className={cls} />
              </div>
            </div>
            {form.price && form.compare_at_price && Number(form.compare_at_price) > Number(form.price) && (
              <div className="bg-[#e8f3ec] rounded-xl px-4 py-2 text-xs text-[#17583a] font-semibold">
                💰 {isRTL ? "الخصم:" : "Discount:"} {Math.round((1 - Number(form.price) / Number(form.compare_at_price)) * 100)}%
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-[#d4ded7] text-sm font-semibold text-[#5f786c] hover:border-[#0d3a24] transition-colors">
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" disabled={saving}
              className="px-8 py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-bold hover:bg-[#17583a] transition-colors disabled:opacity-50 shadow-sm">
              {saving ? (isRTL ? "جارٍ الحفظ..." : "Saving…") : (isRTL ? "✓ حفظ المنتج" : "✓ Save Product")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
