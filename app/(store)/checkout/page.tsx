"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { useI18n } from "../../lib/i18n-context";
import { orders, addresses as addressApi, coupons as couponsApi } from "../../lib/api";

const STEPS = ["Delivery", "Payment", "Review"] as const;
type Step = typeof STEPS[number];

function toNum(v: unknown): number {
  const n = parseFloat(String(v ?? 0));
  return isNaN(n) ? 0 : n;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();

  const [step, setStep]               = useState<Step>("Delivery");
  const [placed, setPlaced]           = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [placeError, setPlaceError]   = useState("");
  const [placing, setPlacing]         = useState(false);
  const [payPhone, setPayPhone]       = useState("");

  // Address state
  const [savedAddressId, setSavedAddressId] = useState<number | null>(null);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [editingAddress, setEditingAddress]   = useState(false);
  const [address, setAddress] = useState({
    line1: "", city: "", postcode: "", country: "EG", phone: "", full_name: "",
  });

  // Coupon state
  const [couponCode, setCouponCode]   = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponApplied, setCouponApplied]   = useState(false);

  const [payment, setPayment] = useState({ method: "card" });

  // Fetch saved addresses on mount if logged in
  useEffect(() => {
    if (!user) return;
    addressApi.list().then((res: any[]) => {
      if (res && res.length > 0) {
        const def = res.find((a: any) => a.is_default) || res[0];
        setSavedAddressId(def.id);
        setHasSavedAddress(true);
        setAddress({
          line1:     def.street    || "",
          city:      def.city      || "",
          postcode:  def.postcode  || "",
          country:   def.country   || "EG",
          phone:     def.phone     || "",
          full_name: def.full_name || "",
        });
        setPayPhone(prev => prev || def.phone || "");
      } else {
        // No saved address → show form immediately
        setEditingAddress(true);
      }
    }).catch(() => setEditingAddress(true));
  }, [user]);

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponApplying(true);
    setCouponError("");
    try {
      const res: any = await couponsApi.apply(couponCode.trim(), subtotal);
      setCouponDiscount(toNum(res?.discount ?? 0));
      setCouponApplied(true);
      setCouponError("");
    } catch (err: any) {
      setCouponError(err.message ?? "Invalid coupon");
      setCouponDiscount(0);
      setCouponApplied(false);
    } finally {
      setCouponApplying(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError("");
  };

  const shipping = address.country === "EG" ? 0 : 75;
  const total    = Math.max(0, subtotal + shipping - couponDiscount);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPlaceError("");
    try {
      // 1. If user filled a new address and wants to save it
      if (user && editingAddress && address.line1 && address.city) {
        try {
          const saved: any = await addressApi.create({
            full_name:  address.full_name,
            phone:      address.phone,
            city:       address.city,
            postcode:   address.postcode,
            country:    address.country,
            street:     address.line1,
            is_default: !hasSavedAddress,
          });
          setSavedAddressId(saved?.id ?? null);
        } catch { /* non-fatal */ }
      }

      // 2. Create order
      const orderPayload = {
        items: items.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id ?? null,
          quantity:   item.quantity,
          unit_price: toNum(item.variant?.price ?? item.product.price),
        })),
        shipping_address: address,
        payment_method:   payment.method,
        coupon_code:      couponApplied ? couponCode : undefined,
        note: "",
      };
      const createdOrder = await orders.create(orderPayload as any);
      const orderId = (createdOrder as any)?.id;
      if (!orderId) throw new Error("Order creation failed — no ID returned.");
      setPlacedOrderId(orderId);

      // 3. Auth check
      if (!user) {
        localStorage.setItem("genaan_pending_order", String(orderId));
        clearCart();
        window.location.href = `/login?redirect=/checkout&pending_order=${orderId}`;
        return;
      }

      // 4. Initiate Paymob payment
      const payResult = await orders.pay(orderId, {
        payment_method: payment.method as "card" | "wallet",
        phone: payment.method === "wallet" ? payPhone : undefined,
        billing: {
          first_name: user?.name?.split(" ")[0] || "Guest",
          last_name:  user?.name?.split(" ").slice(1).join(" ") || "User",
          email:      user?.email || "guest@genaan.com",
          phone:      address.phone || payPhone || "01000000000",
          city:       address.city || "Cairo",
          street:     address.line1 || "NA",
        },
      });

      clearCart();

      if (payResult.client_secret && payResult.public_key) {
        const returnUrl = encodeURIComponent(`${window.location.origin}/checkout/complete`);
        window.location.href = `https://accept.paymob.com/unifiedcheckout/?publicKey=${payResult.public_key}&clientSecret=${payResult.client_secret}&returnUrl=${returnUrl}`;
        return;
      }

      setPlaced(true);
    } catch (err: any) {
      setPlaceError(err.message ?? "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && !placed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f4f5f1] px-5">
        <div className="w-16 h-16 rounded-full bg-[#e8f3ec] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          </svg>
        </div>
        <p className="text-[#0d3a24] font-semibold text-lg">{t.cart.empty}</p>
        <p className="text-[#5f786c] text-sm mt-1 mb-6">{t.cart.empty_subtitle}</p>
        <Link href="/shop" className="px-6 py-3 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36]">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f4f5f1] px-5 py-10">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg animate-fade-in">
          <div className="w-20 h-20 bg-[#e8f3ec] rounded-full flex items-center justify-center mx-auto mb-6 text-[#17583a]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-3">Order Placed!</h1>
          <p className="text-[#5f786c] text-sm leading-6 mb-8">
            Your order #{placedOrderId} has been placed. You will receive a confirmation shortly.
          </p>
          <Link href="/shop" className="block w-full py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36]">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f1] py-10">
      <div className="mx-auto max-w-[1000px] px-5">
        <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const isActive = step === s;
            const isPast   = STEPS.indexOf(step) > i;
            return (
              <div key={s} className="flex items-center gap-2 text-sm font-semibold shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isActive ? "bg-[#17583a] text-white" : isPast ? "bg-[#e8f3ec] text-[#17583a]" : "bg-white border-2 border-[#d4ded7] text-[#8aab99]"}`}>
                  {isPast ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg> : i + 1}
                </div>
                <span className={isActive ? "text-[#0d3a24]" : "text-[#8aab99]"}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-[#d4ded7] mx-2"/>}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Main content */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">

            {/* ── STEP 1: Delivery ── */}
            {step === "Delivery" && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">Delivery Address</h2>

                {/* Saved address banner */}
                {hasSavedAddress && !editingAddress ? (
                  <div className="mb-6 p-4 rounded-xl bg-[#e8f3ec] border border-[#c4ddd0] flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0d3a24]">{address.full_name}</p>
                      <p className="text-xs text-[#5f786c] mt-0.5">{address.line1}, {address.city}, {address.postcode}</p>
                      <p className="text-xs text-[#5f786c]">{address.phone}</p>
                    </div>
                    <button
                      onClick={() => setEditingAddress(true)}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#17583a] hover:underline"
                      title="Change address"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hasSavedAddress && editingAddress && (
                      <button
                        onClick={() => setEditingAddress(false)}
                        className="text-xs font-semibold text-[#17583a] hover:underline flex items-center gap-1 mb-2"
                      >
                        ← Use saved address
                      </button>
                    )}
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">{t.auth.country || "Country"}</label>
                      <select
                        value={address.country}
                        onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a] bg-white"
                      >
                        <option value="EG">Egypt (Primary)</option>
                        <option value="SA">Saudi Arabia (KSA)</option>
                        <option value="AE">United Arab Emirates (UAE)</option>
                      </select>
                    </div>
                    {(["full_name", "phone", "line1", "city", "postcode"] as const).map(field => {
                      const placeholders: Record<string, string> = {
                        full_name: "John Doe", phone: "01xxxxxxxxx",
                        line1: "123 Green Street", city: "Cairo", postcode: "12345",
                      };
                      const labels: Record<string, string> = {
                        full_name: "Full Name", phone: "Phone", line1: "Address", city: "City", postcode: "Postcode",
                      };
                      return (
                        <div key={field}>
                          <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">{labels[field]}</label>
                          <input
                            type={field === "phone" ? "tel" : "text"}
                            placeholder={placeholders[field]}
                            value={address[field]}
                            onChange={e => setAddress(a => ({ ...a, [field]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => setStep("Payment")}
                  disabled={!address.line1 || !address.city}
                  className="mt-8 w-full py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === "Payment" && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">Payment Method</h2>
                <div className="flex gap-3 mb-6">
                  {[
                    { id: "card",   label: "Credit / Debit Card", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                    { id: "wallet", label: "Mobile Wallet",       icon: <span className="text-base">📱</span> },
                  ].map(m => (
                    <button key={m.id} onClick={() => setPayment(p => ({ ...p, method: m.id }))}
                      className={`flex-1 py-3.5 rounded-xl border-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${payment.method === m.id ? "border-[#17583a] bg-[#e8f3ec] text-[#17583a]" : "border-[#d4ded7] text-[#5f786c]"}`}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>

                {payment.method === "card" && (
                  <div className="p-4 bg-[#e8f3ec] rounded-xl text-sm text-[#17583a] flex items-center gap-2 mb-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    You&apos;ll enter card details securely on the next step via Paymob.
                  </div>
                )}

                {payment.method === "wallet" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 flex items-start gap-2 mb-2">
                      <span>📱</span>
                      <span>Supports Vodafone Cash, Orange Money, Etisalat Cash &amp; WE Pay.</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Wallet Phone Number *</label>
                      <input
                        type="tel" placeholder="01xxxxxxxxx" value={payPhone}
                        onChange={e => setPayPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep("Delivery")} className="flex-1 py-3.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:border-[#17583a] transition-colors">Back</button>
                  <button
                    onClick={() => setStep("Review")}
                    disabled={payment.method === "wallet" && !payPhone}
                    className="flex-1 py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step === "Review" && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">Review Your Order</h2>
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#f0f2ee] flex-shrink-0">
                        {item.product.images?.[0]?.url && <Image src={item.product.images[0].url} alt={item.product.name} fill sizes="48px" className="object-cover"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0d3a24] truncate">{item.product.name}</p>
                        <p className="text-xs text-[#8aab99]">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-[#17583a] shrink-0">EGP {(toNum(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon section */}
                <div className="mb-4">
                  {couponApplied ? (
                    <div className="flex items-center justify-between p-3 bg-[#e8f3ec] rounded-xl border border-[#c4ddd0]">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        <span className="text-sm font-semibold text-[#17583a]">{couponCode} — EGP {couponDiscount.toFixed(2)} off</span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-[#8aab99] hover:text-red-500">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value); setCouponError(""); }}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponApplying || !couponCode.trim()}
                        className="px-4 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-lg hover:bg-[#195b36] transition-colors disabled:opacity-40"
                      >
                        {couponApplying ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                </div>

                <div className="p-4 bg-[#f4f5f1] rounded-xl text-xs text-[#5f786c] mb-4 space-y-1">
                  <p><strong className="text-[#0d3a24]">Delivering to:</strong> {address.line1}, {address.city}, {address.postcode}</p>
                  <p><strong className="text-[#0d3a24]">Payment:</strong> {payment.method === "card" ? "Credit / Debit Card" : "Mobile Wallet"}</p>
                </div>

                <div className="flex flex-col gap-3">
                  {placeError && <p className="text-xs text-red-500 px-4 py-2 bg-red-50 rounded-xl">{placeError}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep("Payment")} className="flex-1 py-3.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:border-[#17583a] transition-colors">Back</button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="flex-1 py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {placing
                        ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Placing...</>
                        : "Place Order"
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary sidebar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-24">
            <h3 className="font-heading font-bold text-[#0d3a24] mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-[#5f786c] gap-2">
                  <span className="truncate flex-1">{item.product.name} x {item.quantity}</span>
                  <span className="font-medium text-[#0d3a24] shrink-0 ltr-num">EGP {(toNum(item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#e4ece7] flex justify-between text-[#5f786c]">
                <span>Shipping</span>
                <span className="ltr-num">{shipping === 0 ? "Free" : `EGP ${shipping.toFixed(2)}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon ({couponCode})</span>
                  <span className="ltr-num">-EGP {couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#e4ece7] flex justify-between font-bold text-[#0d3a24] text-base">
                <span>Total</span>
                <span className="ltr-num">EGP {total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#8aab99]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secure checkout - SSL encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
