import type { Lang } from "./translations";

export interface CategoryNames {
  name?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
}

export function categoryLabel(cat: CategoryNames, lang: Lang): string {
  const en = cat.name_en?.trim() || cat.name?.trim() || "";
  const ar = cat.name_ar?.trim() || cat.name?.trim() || "";
  if (lang === "ar") return ar || en;
  return en || ar;
}

export function categoryLabelBoth(cat: CategoryNames): string {
  const en = cat.name_en?.trim() || cat.name?.trim();
  const ar = cat.name_ar?.trim();
  if (en && ar && en !== ar) return `${en} / ${ar}`;
  return en || ar || "—";
}
