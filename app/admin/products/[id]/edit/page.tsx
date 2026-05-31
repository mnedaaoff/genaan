"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { ProductVariantsEditor } from "../../../../components/admin/ProductVariantsEditor";
import { ProductSectionsPicker } from "../../../../components/admin/ProductSectionsPicker";
import { CareGuideEditor, careGuidePayload } from "../../../../components/admin/CareGuideEditor";
import { saveProductSections, type HomepageSectionOption } from "../../../../lib/product-sections";
import { POT_SIZE_LABELS, type PotSize } from "../../../../lib/pot-utils";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageId, setExistingImageId] = useState<number | null>(null);
  const [shopSections, setShopSections] = useState<HomepageSectionOption[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

  const [form, setForm] = useState({
    name_en: "", name_ar: "",
    description_en: "", description_ar: "",
    scientific_name: "",
    price: "", compare_at_price: "",
    type: "plant", stock: "", is_active: true,
    pot_size: "medium" as PotSize,
    watering_days: "", light_level: "", humidity_level: "",
    care_notes_en: "", care_notes_ar: "",
  });

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);

    async function loadSections() {
      const { data } = await supabase
        .from("homepage_sections")
        .select("id, slug, name_en, name_ar, is_active")
        .order("sort_order");
      if (data) setShopSections(data as HomepageSectionOption[]);
    }
    loadSections();
  }, []);

  useEffect(() => {
    if (!productId) return;
    async function load() {
      // Load product
      const { data: p, error: pErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (pErr || !p) { setError("Product not found"); setLoading(false); return; }

      setForm({
        name_en: p.name_en ?? p.name ?? "",
        name_ar: p.name_ar ?? p.name ?? "",
        description_en: p.description_en ?? p.description ?? "",
        description_ar: p.description_ar ?? p.description ?? "",
        scientific_name: p.scientific_name ?? "",
        price: String(p.price ?? ""),
        compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
        type: p.type ?? "plant",
        stock: "",
        is_active: p.is_active ?? true,
        pot_size: (p.pot_size as PotSize) || "medium",
        watering_days: p.watering_days != null ? String(p.watering_days) : "",
        light_level: p.light_level ?? "",
        humidity_level: p.humidity_level ?? "",
        care_notes_en: p.care_notes_en ?? "",
        care_notes_ar: p.care_notes_ar ?? "",
      });

      // Load primary image
      const { data: imgs } = await supabase
        .from("product_images")
        .select("id, url, is_primary")
        .eq("product_id", productId)
        .order("sort_order");

      const primary = imgs?.find(i => i.is_primary) ?? imgs?.[0];
      if (primary) { setImagePreview(primary.url); setExistingImageId(primary.id); }

      // Load inventory
      const { data: inv } = await supabase
        .from("inventory")
        .select("quantity")
        .eq("product_id", productId)
        .single();

      if (inv) setForm(f => ({ ...f, stock: String(inv.quantity) }));

      const { data: secLinks } = await supabase
        .from("homepage_section_products")
        .select("section_id")
        .eq("product_id", productId);
      setSelectedSectionIds((secLinks ?? []).map(r => r.section_id));

      setLoading(false);
    }
    load();
  }, [productId]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Upload via server API route — handles both storage upload AND product_images DB update
  // server-side using the service role key (bypasses RLS on both storage and the table)
  const uploadViaApi = async (
    file: File,
    productId: string,
    existingImgId: number | null
  ): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "products");
    fd.append("product_id", productId);
    if (existingImgId) fd.append("existing_image_id", String(existingImgId));
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name_en.trim() || !form.name_ar.trim()) {
      setError(isRTL ? "الاسم بالإنجليزية والعربية مطلوب" : "English and Arabic names are required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError(isRTL ? "السعر مطلوب (أو احفظ التركيبات أولاً لتحديث أقل سعر)" : "Price is required (or save variants first to set lowest price)");
      return;
    }

    setSaving(true);
    try {
      const updatePayload: Record<string, unknown> = {
          name: form.name_en.trim(),
          name_en: form.name_en.trim(),
          name_ar: form.name_ar.trim(),
          description: form.description_en.trim() || form.description_ar.trim() || null,
          description_en: form.description_en.trim() || null,
          description_ar: form.description_ar.trim() || null,
          scientific_name: form.scientific_name.trim() || null,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          type: form.type,
          category_id: null,
          pot_size: form.type === "plant" ? form.pot_size : null,
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        };

      if (form.type === "plant") {
        Object.assign(updatePayload, careGuidePayload(form));
      } else {
        updatePayload.watering_days = null;
        updatePayload.light_level = null;
        updatePayload.humidity_level = null;
        updatePayload.care_notes_en = null;
        updatePayload.care_notes_ar = null;
      }

      const { error: updateErr } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", productId);

      if (updateErr) throw new Error(updateErr.message);

      // 2. Upload image + update product_images — all server-side via API route
      if (imageFile) {
        await uploadViaApi(imageFile, productId, existingImageId);
      }

      // 3. Update inventory
      if (form.stock) {
        const { data: inv, error: selectInvErr } = await supabase.from("inventory").select("id").eq("product_id", productId).maybeSingle();
        if (selectInvErr) throw new Error(isRTL ? `فشل قراءة المخزون: ${selectInvErr.message}` : `Failed to read inventory: ${selectInvErr.message}`);

        if (inv) {
          const { error: invErr } = await supabase.from("inventory").update({ quantity: Number(form.stock) }).eq("id", inv.id);
          if (invErr) throw new Error(isRTL ? `فشل تحديث المخزون: ${invErr.message}` : `Failed to update inventory: ${invErr.message}`);
        } else {
          const { error: invErr } = await supabase.from("inventory").insert({ product_id: Number(productId), quantity: Number(form.stock), reserved: 0 });
          if (invErr) throw new Error(isRTL ? `فشل إضافة المخزون: ${invErr.message}` : `Failed to insert inventory: ${invErr.message}`);
        }
      }

      await saveProductSections(Number(productId), selectedSectionIds);

      router.replace("/admin/products");
    } catch (err: any) {
      setError(err.message ?? "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const cls = "w-full px-4 py-2.5 rounded-xl border border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#0d3a24] placeholder-[#8aab99] focus:outline-none focus:ring-2 focus:ring-[#17583a] transition-all";
  const lbl = "block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide";

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#e4ece7] border-t-[#17583a] rounded-full animate-spin"/>
    </div>
  );

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#e8f3ec] transition-colors text-[#17583a]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d={isRTL ? "M5 12h14M12 5l7 7-7 7" : "M19 12H5M12 19l-7-7 7-7"}/>
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "تعديل المنتج" : "Edit Product"}</h1>
          <p className="text-xs text-[#8aab99] font-mono mt-0.5">ID: {productId}</p>
        </div>
      </div>

      {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5">
            <p className={lbl}>{isRTL ? "صورة المنتج" : "Product Image"}</p>
            <label htmlFor="img" className="cursor-pointer block">
              <div className={`rounded-xl border-2 border-dashed overflow-hidden h-52 ${imagePreview ? "border-[#17583a]" : "border-[#d4ded7] hover:border-[#17583a]"}`}>
                {imagePreview
                  ? <img src={imagePreview} alt="" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8aab99]">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <p className="text-xs">{isRTL ? "اضغط لتغيير الصورة" : "Click to change image"}</p>
                    </div>}
              </div>
              <input id="img" type="file" accept="image/*" className="hidden" onChange={handleImage}/>
            </label>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 space-y-4">
            <p className={lbl}>{isRTL ? "إعدادات" : "Settings"}</p>
            <div>
              <label className={lbl}>{isRTL ? "نوع المنتج (سلوك)" : "Product kind"}</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className={cls}>
                <option value="plant">{isRTL ? "نبات" : "Plant"}</option>
                <option value="pot">{isRTL ? "قصيص" : "Pot"}</option>
                <option value="accessory">{isRTL ? "إكسسوار" : "Accessory"}</option>
                <option value="soil">{isRTL ? "تربة" : "Soil"}</option>
                <option value="vitamin">{isRTL ? "فيتامين" : "Vitamin"}</option>
              </select>
              <p className="text-[10px] text-[#8aab99] mt-1">
                {isRTL ? "يحدد خيارات الشراء (أحجام، قصيص، دليل العناية)" : "Controls purchase options (sizes, pot, care guide)"}
              </p>
            </div>
            {form.type === "plant" && (
              <div>
                <label className={lbl}>{isRTL ? "حجم القصيص المناسب" : "Required pot size"}</label>
                <select value={form.pot_size} onChange={e => set("pot_size", e.target.value)} className={cls}>
                  {(Object.keys(POT_SIZE_LABELS) as PotSize[]).map(s => (
                    <option key={s} value={s}>{POT_SIZE_LABELS[s][lang]}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={lbl}>{isRTL ? "أقسام المتجر" : "Shop sections"}</label>
              <ProductSectionsPicker
                sections={shopSections}
                selectedIds={selectedSectionIds}
                onChange={setSelectedSectionIds}
                lang={lang}
              />
            </div>
            <div>
              <label className={lbl}>{isRTL ? "المخزون" : "Stock"}</label>
              <input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" className={cls}/>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#0d3a24] font-semibold">{isRTL ? "نشط" : "Active"}</span>
              <button type="button" onClick={() => set("is_active", !form.is_active)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? "bg-[#17583a]" : "bg-[#d4ded7]"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? "start-5" : "start-0.5"}`}/>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 space-y-4">
            <p className={lbl}>{isRTL ? "بيانات المنتج" : "Product Info"}</p>
            <div>
              <label className={lbl}>{isRTL ? "الاسم (إنجليزي) *" : "Name (English) *"}</label>
              <input type="text" required dir="ltr" value={form.name_en} onChange={e => set("name_en", e.target.value)} className={cls}/>
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الاسم (عربي) *" : "Name (Arabic) *"}</label>
              <input type="text" required dir="rtl" value={form.name_ar} onChange={e => set("name_ar", e.target.value)} className={cls}/>
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الاسم العلمي" : "Scientific Name"}</label>
              <input type="text" value={form.scientific_name} onChange={e => set("scientific_name", e.target.value)} className={cls}/>
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الوصف (إنجليزي)" : "Description (English)"}</label>
              <textarea rows={3} dir="ltr" value={form.description_en} onChange={e => set("description_en", e.target.value)} className={`${cls} resize-none`}/>
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الوصف (عربي)" : "Description (Arabic)"}</label>
              <textarea rows={3} dir="rtl" value={form.description_ar} onChange={e => set("description_ar", e.target.value)} className={`${cls} resize-none`}/>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 space-y-4">
            <p className={lbl}>{isRTL ? "التسعير" : "Pricing"}</p>
            <p className="text-xs text-[#5f786c]">
              {isRTL
                ? "لو المنتج فيه تركيبات، احفظها بالأسفل — أقل سعر يتحدّث تلقائياً ويظهر «من» على الكارت."
                : "If this product has variants, save them below — lowest price updates automatically and shows as “From” on cards."}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{isRTL ? "السعر (EGP)" : "Price (EGP)"}</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" className={cls}/>
              </div>
              <div>
                <label className={lbl}>{isRTL ? "السعر قبل الخصم" : "Compare Price"}</label>
                <input type="number" min="0" step="0.01" value={form.compare_at_price} onChange={e => set("compare_at_price", e.target.value)} placeholder="Strikethrough" className={cls}/>
              </div>
            </div>
            {form.price && form.compare_at_price && Number(form.compare_at_price) > Number(form.price) && (
              <div className="bg-[#e8f3ec] rounded-xl px-4 py-2 text-xs text-[#17583a] font-semibold">
                💰 {isRTL ? "الخصم:" : "Discount:"} {Math.round((1 - Number(form.price) / Number(form.compare_at_price)) * 100)}%
              </div>
            )}
          </div>

          {(form.type === "plant" || form.type === "pot" || form.type === "accessory") && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-[#17583a]/25 p-5 ring-1 ring-[#17583a]/10">
              <ProductVariantsEditor
                productId={Number(productId)}
                basePrice={Number(form.price) || 0}
                lang={lang}
                productType={form.type as "plant" | "pot" | "accessory"}
                onSaved={min => setForm(f => ({ ...f, price: String(min) }))}
              />
            </div>
          )}

          {form.type === "plant" && (
            <CareGuideEditor form={form} set={set} lang={lang} cls={cls} lbl={lbl} />
          )}

          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-[#d4ded7] text-sm font-semibold text-[#5f786c] hover:border-[#0d3a24] transition-colors">
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" disabled={saving}
              className="px-8 py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-bold hover:bg-[#17583a] transition-colors disabled:opacity-50 shadow-sm">
              {saving ? (isRTL ? "جارٍ الحفظ..." : "Saving…") : (isRTL ? "✓ حفظ التعديلات" : "✓ Save Changes")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
