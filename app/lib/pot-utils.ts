import type { Lang } from "./translations";

export type PotSize = "small" | "medium" | "large";

export interface PotVariantRow {
  id: number;
  product_id: number;
  name: string;
  color: string | null;
  size: string | null;
  price: number | null;
  stock: number | null;
}

export interface PotProductOption {
  id: number;
  name: string;
  slug: string;
  price: number;
  product_images?: { url: string; is_primary?: boolean }[];
  product_variants: PotVariantRow[];
}

export const POT_SIZE_LABELS: Record<PotSize, { en: string; ar: string }> = {
  small:  { en: "Small",  ar: "صغير" },
  medium: { en: "Medium", ar: "متوسط" },
  large:  { en: "Large",  ar: "كبير" },
};

export function potSizeLabel(size: string | null | undefined, lang: Lang): string {
  if (!size) return "";
  const key = size as PotSize;
  return POT_SIZE_LABELS[key]?.[lang] ?? size;
}

export function getVariantColors(variants: PotVariantRow[]): string[] {
  return [...new Set(variants.map(v => v.color).filter(Boolean) as string[])];
}

export function getVariantSizes(variants: PotVariantRow[], color?: string): string[] {
  const filtered = color
    ? variants.filter(v => !v.color || v.color === color)
    : variants;
  return [...new Set(filtered.map(v => v.size).filter(Boolean) as string[])];
}

export function variantHasColors(variants: PotVariantRow[]): boolean {
  return variants.some(v => v.color);
}

export function variantHasSizes(variants: PotVariantRow[]): boolean {
  return variants.some(v => v.size);
}

export function findPotVariant(
  variants: PotVariantRow[],
  color: string,
  size: string,
): PotVariantRow | undefined {
  return variants.find(v => {
    const colorOk = !v.color || (color && v.color === color);
    const sizeOk = !v.size || (size && v.size === size);
    if (v.color && !color) return false;
    if (v.size && !size) return false;
    return colorOk && sizeOk;
  });
}

export function findVariantBySelection(
  variants: PotVariantRow[],
  selected: { color: string; size: string },
): PotVariantRow | undefined {
  if (!variants.length) return undefined;
  return findPotVariant(variants, selected.color, selected.size);
}

export function variantDisplayName(v: PotVariantRow, lang: Lang): string {
  const parts = [v.color, v.size ? potSizeLabel(v.size, lang) : null].filter(Boolean);
  return parts.join(" · ") || v.name;
}

export function resolvePlantPotSize(
  potSize: string | null | undefined,
  fallback: PotSize = "medium",
): PotSize {
  if (potSize === "small" || potSize === "medium" || potSize === "large") return potSize;
  return fallback;
}
