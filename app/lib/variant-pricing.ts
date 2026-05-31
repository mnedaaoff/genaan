export interface VariantPriceRow {
  price?: number | string | null;
  color?: string | null;
  size?: string | null;
}

export function variantRowIsValid(row: VariantPriceRow): boolean {
  const hasDim =
    (typeof row.color === "string" && row.color.trim()) ||
    (typeof row.size === "string" && row.size.trim());
  return !!hasDim;
}

export function variantPrices(rows: VariantPriceRow[]): number[] {
  return rows
    .filter(variantRowIsValid)
    .map(r => parseFloat(String(r.price ?? 0)))
    .filter(n => !isNaN(n) && n > 0);
}

export function minVariantPrice(rows: VariantPriceRow[], fallback = 0): number {
  const prices = variantPrices(rows);
  if (prices.length === 0) return fallback;
  return Math.min(...prices);
}

export function computeListingPrice(
  basePrice: number,
  variants: VariantPriceRow[]
): { amount: number; fromPrice: boolean } {
  const prices = variantPrices(variants);
  if (prices.length === 0) {
    return { amount: basePrice, fromPrice: false };
  }
  return { amount: Math.min(...prices), fromPrice: true };
}

export function formatListingPrice(
  amount: number,
  fromPrice: boolean,
  lang: "en" | "ar"
): string {
  const prefix = fromPrice ? (lang === "ar" ? "من " : "From ") : "";
  return `${prefix}EGP ${amount.toFixed(2)}`;
}
