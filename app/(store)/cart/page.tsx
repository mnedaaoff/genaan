"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useI18n } from "../../lib/i18n-context";

export default function CartPage() {
  const { items, subtotal, incrementItem, decrementItem, removeItem, clearCart } = useCart();
  const { t } = useI18n();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f4f5f1] px-5 text-center">
        <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8aab99" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <h1 className="text-2xl font-heading font-bold text-[#0d3a24] mb-2">{t.cart.empty}</h1>
        <p className="text-[#5f786c] text-sm mb-8 max-w-xs">{t.cart.empty_subtitle}</p>
        <Link href="/shop" className="px-8 py-3.5 bg-[#17583a] text-white font-semibold rounded-full hover:bg-[#195b36] transition-colors">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= 2000 ? 0 : 75;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#f4f5f1] py-10">
      <div className="mx-auto max-w-[1000px] px-5">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-black text-[#0d3a24]">{t.cart.your_cart}</h1>
          <button onClick={clearCart} className="text-xs text-[#8aab99] hover:text-red-500 transition-colors">
            Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Items */}
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm animate-fade-in">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#f0f2ee] flex-shrink-0">
                  {item.product.images?.[0]?.url && (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#0d3a24] leading-tight line-clamp-1">{item.product.name}</h3>
                      <p className="text-xs text-[#8aab99] capitalize font-medium mt-0.5">{item.variant?.name ?? "Product"}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-[#c4d5cc] hover:text-red-500 transition-colors shrink-0"
                      title={t.cart.remove}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-[#e4ece7] rounded-lg overflow-hidden">
                      <button onClick={() => decrementItem(item.product.id)} className="w-8 h-8 flex items-center justify-center text-[#5f786c] hover:bg-[#f4f5f1] transition-colors text-lg leading-none">-</button>
                      <span className="w-8 text-center text-sm font-semibold text-[#0d3a24] ltr-num">{item.quantity}</span>
                      <button onClick={() => incrementItem(item.product.id)} className="w-8 h-8 flex items-center justify-center text-[#5f786c] hover:bg-[#f4f5f1] transition-colors text-lg leading-none">+</button>
                    </div>
                    <span className="font-bold text-[#17583a] ltr-num">EGP {((item.product.price ?? 0) * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-heading font-bold text-[#0d3a24] mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-[#5f786c]">
                  <span className="truncate flex-1">{item.product.name} x {item.quantity}</span>
                  <span className="ltr-num ml-3 shrink-0">EGP {((item.product.price ?? 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-[#e4ece7] pt-3 flex justify-between text-[#5f786c]">
                <span>Shipping</span>
                <span className="ltr-num">{shipping === 0 ? "Free" : `EGP ${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-[#8aab99]">Free shipping on orders over EGP 2,000</p>
              )}
              <div className="border-t border-[#e4ece7] pt-3 flex justify-between font-bold text-[#0d3a24] text-base">
                <span>Total</span>
                <span className="ltr-num">EGP {total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full py-4 bg-[#17583a] text-white text-center font-semibold rounded-xl hover:bg-[#195b36] transition-colors"
            >
              {t.cart.checkout}
            </Link>
            <Link
              href="/shop"
              className="block w-full py-3 mt-3 border border-[#d4ded7] text-center text-sm font-semibold text-[#5f786c] rounded-xl hover:border-[#17583a] transition-colors"
            >
              {t.cart.continue_shopping}
            </Link>
            <div className="flex items-center justify-center gap-2 mt-5 text-xs text-[#8aab99]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secure checkout - SSL encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
