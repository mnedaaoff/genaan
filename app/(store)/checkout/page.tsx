"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { useI18n } from "../../lib/i18n-context";

const STEPS = ["Delivery", "Payment", "Review"] as const;
type Step = typeof STEPS[number];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("Delivery");
  const [placed, setPlaced] = useState(false);

  // Egypt is the primary market. KSA and UAE are optional.
  const [address, setAddress] = useState({ line1: "", city: "", postcode: "", country: "EG" });
  const [payment, setPayment] = useState({ method: "card", cardNum: "", expiry: "", cvc: "" });

  const shipping = address.country === "EG" ? 0 : 75; // Free shipping in Egypt, 75 EGP for KSA/UAE
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    setTimeout(() => {
      clearCart();
      setPlaced(true);
    }, 1500);
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
          <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-3">Order Confirmed!</h1>
          <p className="text-[#5f786c] text-sm leading-6 mb-8">
            Thank you for your purchase. Your digital greenhouse is expanding. We have sent a confirmation email to {user?.email || "your email"}.
          </p>
          <div className="p-4 bg-[#f4f5f1] rounded-xl text-left text-sm text-[#0d3a24] mb-8">
            <p className="text-xs font-bold text-[#8aab99] uppercase tracking-wider mb-2">Order Details</p>
            <p><strong>Total:</strong> {total.toFixed(2)} EGP</p>
            <p><strong>Shipping Country:</strong> {address.country === "EG" ? "Egypt" : address.country === "SA" ? "Saudi Arabia" : "UAE"}</p>
          </div>
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
            const isPast = STEPS.indexOf(step) > i;
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
            {step === "Delivery" && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">Delivery Address</h2>
                <div className="space-y-4">
                  {/* Delivery target countries prioritising Egypt */}
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">{t.auth.country || "Country"}</label>
                    <select value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a] bg-white">
                      <option value="EG">Egypt (Primary)</option>
                      <option value="SA">Saudi Arabia (KSA)</option>
                      <option value="AE">United Arab Emirates (UAE)</option>
                    </select>
                  </div>
                  {["line1", "city", "postcode"].map(field => {
                    let placeholder = field === "line1" ? "123 Green Street" : field === "city" ? "Cairo" : "12345";
                    return (
                      <div key={field}>
                        <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5 capitalize">{field.replace("line1", "Address")}</label>
                        <input
                          type="text"
                          placeholder={placeholder}
                          value={address[field as keyof typeof address]}
                          onChange={e => setAddress(a => ({ ...a, [field]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                        />
                      </div>
                    )
                  })}
                </div>
                <button onClick={() => setStep("Payment")} disabled={!address.line1 || !address.city || !address.postcode}
                  className="mt-8 w-full py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue to Payment
                </button>
              </div>
            )}

            {step === "Payment" && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">Payment Method</h2>
                <div className="flex gap-3 mb-6">
                  {["card", "paypal"].map(m => (
                    <button key={m} onClick={() => setPayment(p => ({ ...p, method: m }))}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-colors flex items-center justify-center gap-2 ${payment.method === m ? "border-[#17583a] bg-[#e8f3ec] text-[#17583a]" : "border-[#d4ded7] text-[#5f786c]"}`}>
                      {m === "card" ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Credit Card</> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg> PayPal</>}
                    </button>
                  ))}
                </div>
                {payment.method === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Card Number</label>
                      <input placeholder="4242 4242 4242 4242" value={payment.cardNum} onChange={e => setPayment(p => ({ ...p, cardNum: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Expiry</label>
                        <input placeholder="MM / YY" value={payment.expiry} onChange={e => setPayment(p => ({ ...p, expiry: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"/>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">CVC</label>
                        <input type="password" placeholder="123" value={payment.cvc} onChange={e => setPayment(p => ({ ...p, cvc: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"/>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep("Delivery")} className="flex-1 py-3.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:border-[#17583a] transition-colors">Back</button>
                  <button onClick={() => setStep("Review")} className="flex-1 py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors">Review Order</button>
                </div>
              </div>
            )}

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
                      <span className="text-sm font-bold text-[#17583a] shrink-0">EGP {((item.product.price ?? 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#f4f5f1] rounded-xl text-xs text-[#5f786c] mb-4 space-y-1">
                  <p><strong className="text-[#0d3a24]">Delivering to:</strong> {address.line1}, {address.city}, {address.postcode}, {address.country}</p>
                  <p><strong className="text-[#0d3a24]">Payment:</strong> {payment.method === "card" ? `Card ending in ${payment.cardNum.slice(-4) || "****"}` : "PayPal"}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("Payment")} className="flex-1 py-3.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:border-[#17583a] transition-colors">Back</button>
                  <button onClick={handlePlaceOrder} className="flex-1 py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors">Place Order</button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-24">
            <h3 className="font-heading font-bold text-[#0d3a24] mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-[#5f786c] gap-2">
                  <span className="truncate flex-1">{item.product.name} x {item.quantity}</span>
                  <span className="font-medium text-[#0d3a24] shrink-0 ltr-num">EGP {((item.product.price ?? 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#e4ece7] flex justify-between text-[#5f786c]">
                <span>Shipping</span><span className="ltr-num">{shipping === 0 ? "Free" : `EGP ${shipping.toFixed(2)}`}</span>
              </div>
              <div className="pt-2 border-t border-[#e4ece7] flex justify-between font-bold text-[#0d3a24] text-base">
                <span>Total</span><span className="ltr-num">EGP {total.toFixed(2)}</span>
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
