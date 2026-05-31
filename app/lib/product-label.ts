import type { Lang } from "./translations";

export interface ProductLabels {
  name?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
}

export function productName(p: ProductLabels, lang: Lang): string {
  const en = p.name_en?.trim() || p.name?.trim() || "";
  const ar = p.name_ar?.trim() || p.name?.trim() || "";
  if (lang === "ar") return ar || en;
  return en || ar;
}

export function productDescription(p: ProductLabels, lang: Lang): string {
  const en = p.description_en?.trim() || p.description?.trim() || "";
  const ar = p.description_ar?.trim() || p.description?.trim() || "";
  if (lang === "ar") return ar || en;
  return en || ar;
}

export function productNameBoth(p: ProductLabels): string {
  const en = p.name_en?.trim() || p.name?.trim();
  const ar = p.name_ar?.trim();
  if (en && ar && en !== ar) return `${en} / ${ar}`;
  return en || ar || "—";
}
