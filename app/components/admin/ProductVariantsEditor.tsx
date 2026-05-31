"use client";

import { useEffect, useState } from "react";
import { getAdminAuthHeaders } from "../../lib/admin-auth";
import { minVariantPrice } from "../../lib/variant-pricing";
import { POT_SIZE_LABELS, type PotSize } from "../../lib/pot-utils";
import type { ProductType } from "../../lib/types";

export interface VariantRow {
  id?: number;
  color: string;
  size: string;
  price: string;
  stock: string;
}

interface ProductVariantsEditorProps {
  productId: number;
  basePrice: number;
  lang: "en" | "ar";
  productType: ProductType;
  onSaved?: (minPrice: number) => void;
}

function titleForType(productType: ProductType, isRTL: boolean): string {
  if (productType === "plant") {
    return isRTL ? "أحجام النبتة (اختياري)" : "Plant sizes (optional)";
  }
  if (productType === "accessory") {
    return isRTL ? "ألوان وأحجام الإكسسوار (اختياري)" : "Accessory colors & sizes (optional)";
  }
  return isRTL ? "ألوان وأحجام القصيص (اختياري)" : "Pot colors & sizes (optional)";
}

export function ProductVariantRows({
  rows,
  setRows,
  lang,
  productType,
  basePrice,
  onAdd,
}: {
  rows: VariantRow[];
  setRows: React.Dispatch<React.SetStateAction<VariantRow[]>>;
  lang: "en" | "ar";
  productType: ProductType;
  basePrice: number;
  onAdd?: () => void;
}) {
  const isRTL = lang === "ar";
  const inp = "w-full px-3 py-2 rounded-lg border border-[#d4ded7] bg-white text-sm";
  const showColor = productType !== "plant";

  const addRow = () => {
    setRows(r => [...r, { color: "", size: "", price: String(basePrice || ""), stock: "0" }]);
    onAdd?.();
  };

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-[#17583a]/30 bg-[#e8f3ec]/40 p-5 text-center">
          <p className="text-sm font-semibold text-[#0d3a24]">
            {isRTL
              ? "لا توجد تركيبات بعد — أضف لوناً أو حجماً أو كلاهما بسعر مختلف"
              : "No variants yet — add a color, size, or both with its own price"}
          </p>
          <button
            type="button"
            onClick={addRow}
            className="mt-3 px-5 py-2.5 bg-[#17583a] text-white text-sm font-bold rounded-xl hover:bg-[#0d3a24] transition-colors"
          >
            + {isRTL ? "إضافة أول تركيبة" : "Add first variant"}
          </button>
        </div>
      )}

      {rows.map((row, idx) => (
        <div
          key={row.id ?? `new-${idx}`}
          className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end p-3 bg-[#f4f5f1] rounded-xl border border-[#e4ece7]"
        >
          {showColor && (
            <div>
              <label className="text-[10px] font-bold text-[#8aab99]">{isRTL ? "لون" : "Color"}</label>
              <input
                className={inp}
                value={row.color}
                onChange={e =>
                  setRows(r => r.map((x, i) => (i === idx ? { ...x, color: e.target.value } : x)))
                }
                placeholder={isRTL ? "مثال: أبيض" : "e.g. White"}
              />
            </div>
          )}
          <div className={showColor ? "" : "sm:col-span-2"}>
            <label className="text-[10px] font-bold text-[#8aab99]">{isRTL ? "حجم" : "Size"}</label>
            <select
              className={inp}
              value={row.size}
              onChange={e =>
                setRows(r => r.map((x, i) => (i === idx ? { ...x, size: e.target.value } : x)))
              }
            >
              <option value="">{isRTL ? "— اختر —" : "— Select —"}</option>
              {(Object.keys(POT_SIZE_LABELS) as PotSize[]).map(s => (
                <option key={s} value={s}>
                  {POT_SIZE_LABELS[s][lang]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#8aab99]">{isRTL ? "سعر (EGP)" : "Price (EGP)"}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inp}
              value={row.price}
              onChange={e =>
                setRows(r => r.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x)))
              }
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#8aab99]">{isRTL ? "مخزون" : "Stock"}</label>
            <input
              type="number"
              min="0"
              className={inp}
              value={row.stock}
              onChange={e =>
                setRows(r => r.map((x, i) => (i === idx ? { ...x, stock: e.target.value } : x)))
              }
            />
          </div>
          <button
            type="button"
            onClick={() => setRows(r => r.filter((_, i) => i !== idx))}
            className="text-xs text-red-500 font-semibold py-2"
          >
            {isRTL ? "حذف" : "Remove"}
          </button>
        </div>
      ))}

      {rows.length > 0 && (
        <button type="button" onClick={addRow} className="text-xs font-bold text-[#17583a] hover:underline">
          + {isRTL ? "إضافة تركيبة أخرى" : "Add another variant"}
        </button>
      )}
    </div>
  );
}

export function ProductVariantsEditor({
  productId,
  basePrice,
  lang,
  productType,
  onSaved,
}: ProductVariantsEditorProps) {
  const isRTL = lang === "ar";
  const [rows, setRows] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMsg("");
      try {
        const headers = await getAdminAuthHeaders();
        const res = await fetch(`/api/admin/product-variants?product_id=${productId}`, { headers });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load variants");
        setRows(
          (json.data ?? []).map((v: { id: number; color: string | null; size: string | null; price: number | null; stock: number | null }) => ({
            id: v.id,
            color: v.color ?? "",
            size: v.size ?? "",
            price: v.price != null ? String(v.price) : "",
            stock: v.stock != null ? String(v.stock) : "0",
          }))
        );
      } catch (e: unknown) {
        setIsError(true);
        setMsg(e instanceof Error ? e.message : "Error loading variants");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  const save = async () => {
    setSaving(true);
    setMsg("");
    setIsError(false);
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch("/api/admin/product-variants", {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_id: productId,
          base_price: basePrice,
          variants: rows,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save variants");

      setRows(
        (json.data ?? []).map((v: { id: number; color: string | null; size: string | null; price: number | null; stock: number | null }) => ({
          id: v.id,
          color: v.color ?? "",
          size: v.size ?? "",
          price: v.price != null ? String(v.price) : "",
          stock: v.stock != null ? String(v.stock) : "0",
        }))
      );
      const savedMin = minVariantPrice(json.data ?? []);
      if (savedMin > 0) onSaved?.(savedMin);
      setMsg(isRTL ? "✓ تم حفظ التركيبات" : "✓ Variants saved");
    } catch (e: unknown) {
      setIsError(true);
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#8aab99]">
        <div className="w-4 h-4 border-2 border-[#e4ece7] border-t-[#17583a] rounded-full animate-spin" />
        {isRTL ? "جاري تحميل التركيبات…" : "Loading variants…"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e4ece7]">
        <div>
          <p className="text-sm font-black text-[#0d3a24]">{titleForType(productType, isRTL)}</p>
          <p className="text-xs text-[#5f786c] mt-1">
            {isRTL
              ? "كل صف = تركيبة مختلفة (لون و/أو حجم) بسعر ومخزون خاص. اضغط «حفظ التركيبات» بعد الإضافة."
              : "Each row = a different combo (color and/or size) with its own price & stock. Click Save variants when done."}
          </p>
        </div>
      </div>

      <ProductVariantRows
        rows={rows}
        setRows={setRows}
        lang={lang}
        productType={productType}
        basePrice={basePrice}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-5 py-2.5 bg-[#0d3a24] text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:bg-[#17583a] transition-colors"
        >
          {saving ? (isRTL ? "جارٍ الحفظ…" : "Saving…") : (isRTL ? "حفظ التركيبات" : "Save variants")}
        </button>
        {msg && (
          <p className={`text-xs font-semibold ${isError ? "text-red-600" : "text-[#17583a]"}`}>{msg}</p>
        )}
      </div>
    </div>
  );
}

export async function saveProductVariants(
  productId: number,
  rows: VariantRow[],
  basePrice: number
): Promise<void> {
  const headers = await getAdminAuthHeaders();
  const res = await fetch("/api/admin/product-variants", {
    method: "POST",
    headers,
    body: JSON.stringify({ product_id: productId, base_price: basePrice, variants: rows }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to save variants");
}
