import { supabase } from "./supabase";

export interface CouponValidationResult {
  discount: number;
  code: string;
}

function toNum(v: unknown): number {
  const n = parseFloat(String(v ?? 0));
  return Number.isNaN(n) ? 0 : n;
}

/** Validate a coupon against Supabase (parameterized queries only). */
export async function validateCouponCode(
  rawCode: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) throw new Error("Invalid coupon code");

  const now = new Date().toISOString();
  const { data: coupon, error: qErr } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (qErr || !coupon) throw new Error("Invalid coupon code");

  if (coupon.expires_at && coupon.expires_at < now) {
    throw new Error("This coupon has expired");
  }

  const usageLimit = coupon.usage_limit ?? coupon.max_uses ?? null;
  if (usageLimit && coupon.used_count >= usageLimit) {
    throw new Error("This coupon has reached its usage limit");
  }

  const minOrder = coupon.minimum_order_amount ?? coupon.min_order ?? 0;
  if (minOrder && subtotal < minOrder) {
    throw new Error(`Minimum order of EGP ${minOrder} required`);
  }

  let discount = 0;
  const discType = coupon.type ?? coupon.discount_type ?? "percent";
  const discValue = toNum(coupon.value ?? coupon.discount_value);
  const isPercent = discType === "percent" || discType === "percentage";

  if (isPercent) {
    discount = (subtotal * discValue) / 100;
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, toNum(coupon.max_discount_amount));
    }
  } else {
    discount = discValue;
  }

  discount = Math.min(discount, subtotal);

  return { discount, code };
}

/** Safe server-side increment via SECURITY DEFINER RPC (no raw SQL). */
export async function incrementCouponUsage(rawCode: string): Promise<void> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return;

  const { error } = await supabase.rpc("increment_coupon_usage", { coupon_code: code });
  if (error) {
    console.warn("Coupon usage increment failed:", error.message);
  }
}
