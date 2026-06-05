"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  ProductVariantRows,
  saveProductVariants,
  type VariantRow,
} from "../../../components/admin/ProductVariantsEditor";
import { ProductSectionsPicker } from "../../../components/admin/ProductSectionsPicker";
import { CareGuideEditor, careGuidePayload } from "../../../components/admin/CareGuideEditor";
import { minVariantPrice, variantPrices } from "../../../lib/variant-pricing";
import { saveProductSections, type HomepageSectionOption } from "../../../lib/product-sections";
import { getAdminUploadHeaders } from "../../../lib/admin-auth";

export default function NewProductPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [shopSections, setShopSections] = useState<HomepageSectionOption[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

  const [form, setForm] = useState({
    name_en: "", name_ar: "",
    description_en: "", description_ar: "",
    scientific_name: "",
    price: "", compare_at_price: "",
    type: "plant", stock: "",
    is_active: true,
    pot_size: "medium" as "small" | "medium" | "large",
    watering_days: "", light_level: "", humidity_level: "",
    care_notes_en: "", care_notes_ar: "",
  });

  const hasVariantPricing = variantPrices(variantRows).length > 0;
  const previewListingPrice = hasVariantPricing
    ? minVariantPrice(variantRows)
    : Number(form.price) || 0;

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);

    async function loadSections() {
      const { data } = await supabase
        .from("homepage_sections")
        .select("id, slug, name_en, name_ar, is_active")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setShopSections(data as HomepageSectionOption[]);
    }
    loadSections();
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
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: await getAdminUploadHeaders(),
      body: fd,
    });
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
    const finalPrice = hasVariantPricing
      ? minVariantPrice(variantRows)
      : Number(form.price);

    if (!hasVariantPricing && (!form.price || finalPrice <= 0)) {
      setError(isRTL ? "أضف سعراً أساسياً أو تركيبات بأسعار" : "Add a base price or variant prices");
      return;
    }
    if (hasVariantPricing && finalPrice <= 0) {
      setError(isRTL ? "أضف سعراً لكل تركيبة" : "Add a price for each variant row");
      return;
    }

    setSaving(true);
    try {
      const insertPayload: Record<string, unknown> = {
          name: form.name_en.trim(),
          name_en: form.name_en.trim(),
          name_ar: form.name_ar.trim(),
          description: form.description_en.trim() || form.description_ar.trim() || null,
          description_en: form.description_en.trim() || null,
          description_ar: form.description_ar.trim() || null,
          scientific_name: form.scientific_name.trim() || null,
          price: finalPrice,
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          type: form.type,
          category_id: null,
          pot_size: form.type === "plant" ? form.pot_size : null,
          is_active: form.is_active,
          slug: form.name_en.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now(),
        };

      if (form.type === "plant") {
        Object.assign(insertPayload, careGuidePayload(form));
      }

      const { data: product, error: productErr } = await supabase
        .from("products")
        .insert(insertPayload)
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

      const hasVariants = variantRows.some(r => r.color.trim() || r.size.trim());
      if (hasVariants) {
        await saveProductVariants(productId, variantRows, finalPrice);
      }

      if (selectedSectionIds.length) {
        await saveProductSections(productId, selectedSectionIds);
      }

      router.replace(`/admin/products/${productId}/edit`);
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
                  <option value="small">{isRTL ? "صغير" : "Small"}</option>
                  <option value="medium">{isRTL ? "متوسط" : "Medium"}</option>
                  <option value="large">{isRTL ? "كبير" : "Large"}</option>
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
              <label className={lbl}>{isRTL ? "الاسم (إنجليزي) *" : "Name (English) *"}</label>
              <input type="text" required dir="ltr" value={form.name_en} onChange={e => set("name_en", e.target.value)}
                placeholder="Peace Lily" className={cls} />
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الاسم (عربي) *" : "Name (Arabic) *"}</label>
              <input type="text" required dir="rtl" value={form.name_ar} onChange={e => set("name_ar", e.target.value)}
                placeholder="زهرة السلام" className={cls} />
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الاسم العلمي (اختياري)" : "Scientific Name (optional)"}</label>
              <input type="text" value={form.scientific_name} onChange={e => set("scientific_name", e.target.value)}
                placeholder="e.g. Ficus benjamina" className={cls} />
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الوصف (إنجليزي)" : "Description (English)"}</label>
              <textarea rows={3} dir="ltr" value={form.description_en} onChange={e => set("description_en", e.target.value)}
                placeholder="Describe the product..." className={`${cls} resize-none`} />
            </div>
            <div>
              <label className={lbl}>{isRTL ? "الوصف (عربي)" : "Description (Arabic)"}</label>
              <textarea rows={3} dir="rtl" value={form.description_ar} onChange={e => set("description_ar", e.target.value)}
                placeholder="وصف المنتج..." className={`${cls} resize-none`} />
            </div>
          </div>

          {(form.type === "plant" || form.type === "pot" || form.type === "accessory") && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-[#17583a]/20 p-5 space-y-3">
              <div>
                <p className={lbl}>
                  {form.type === "plant"
                    ? (isRTL ? "أحجام النبتة (اختياري)" : "Plant sizes (optional)")
                    : form.type === "pot"
                      ? (isRTL ? "ألوان وأحجام القصيص" : "Pot colors & sizes")
                      : (isRTL ? "ألوان وأحجام الإكسسوار" : "Accessory colors & sizes")}
                </p>
                <p className="text-xs text-[#5f786c] mt-1">
                  {isRTL
                    ? "لو أضفت أحجام/ألوان بأسعار مختلفة، السعر الأساسي يبقى اختياري — أقل سعر يظهر على الكارت."
                    : "If you add sizes/colors with different prices, base price is optional — lowest price shows on the card."}
                </p>
              </div>
              <ProductVariantRows
                rows={variantRows}
                setRows={setVariantRows}
                lang={lang}
                productType={form.type as "plant" | "pot" | "accessory"}
                basePrice={Number(form.price) || previewListingPrice || 0}
              />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 space-y-4">
            <p className={lbl}>{isRTL ? "التسعير" : "Pricing"}</p>
            {hasVariantPricing && (
              <div className="bg-[#e8f3ec] rounded-xl px-4 py-2 text-xs text-[#17583a] font-semibold">
                {isRTL
                  ? `سيظهر على الكارت: من EGP ${previewListingPrice.toFixed(2)} (أقل سعر من التركيبات)`
                  : `Card will show: From EGP ${previewListingPrice.toFixed(2)} (lowest variant price)`}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>
                  {hasVariantPricing
                    ? (isRTL ? "سعر أساسي (اختياري)" : "Base price (optional)")
                    : (isRTL ? "السعر (EGP) *" : "Price (EGP) *")}
                </label>
                <input type="number" min="0" step="0.01" value={form.price}
                  onChange={e => set("price", e.target.value)} placeholder="0.00" className={cls}
                  required={!hasVariantPricing} />
              </div>
              <div>
                <label className={lbl}>{isRTL ? "السعر قبل الخصم" : "Compare Price"}</label>
                <input type="number" min="0" step="0.01" value={form.compare_at_price}
                  onChange={e => set("compare_at_price", e.target.value)}
                  placeholder={isRTL ? "مشطوب" : "Strikethrough"} className={cls} />
              </div>
            </div>
            {previewListingPrice > 0 && form.compare_at_price && Number(form.compare_at_price) > previewListingPrice && (
              <div className="bg-[#e8f3ec] rounded-xl px-4 py-2 text-xs text-[#17583a] font-semibold">
                💰 {isRTL ? "الخصم:" : "Discount:"} {Math.round((1 - previewListingPrice / Number(form.compare_at_price)) * 100)}%
              </div>
            )}
          </div>

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
              {saving ? (isRTL ? "جارٍ الحفظ..." : "Saving…") : (isRTL ? "✓ حفظ المنتج" : "✓ Save Product")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
