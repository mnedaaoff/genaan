"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useI18n } from "../../lib/i18n-context";

export function CartDrawer() {
  const { isCartOpen, closeCart, items, subtotal, incrementItem, decrementItem, removeItem } = useCart();
  const { t, isRTL } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!mounted) return null;

  // RTL-aware transform classes
  const openClass = "translate-x-0";
  const closeClass = isRTL ? "translate-x-full" : "translate-x-full";

  return createPortal(
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0d3a24]/30 backdrop-blur-sm" onClick={closeCart} />

      {/* Drawer */}
      <div
        className={`absolute top-0 bottom-0 ${isRTL ? "left-0" : "right-0"} w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isCartOpen ? openClass : closeClass}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e4ece7]">
          <h2 className="text-xl font-heading font-black text-[#0d3a24]">{t.cart.title}</h2>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f4f5f1] text-[#0d3a24] hover:bg-[#e4ece7] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f4f5f1]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8aab99" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <p className="font-semibold text-[#0d3a24] text-lg">{t.cart.empty}</p>
              <p className="text-[#5f786c] text-sm mt-2 max-w-[200px]">{t.cart.empty_subtitle}</p>
              <button
                onClick={closeCart}
                className="mt-8 px-8 py-3.5 bg-white text-[#17583a] text-sm font-semibold rounded-full border-2 border-[#17583a] hover:bg-[#17583a] hover:text-white transition-colors"
              >
                {t.cart.browse}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm animate-fade-in group">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#f4f5f1] flex-shrink-0">
                    {item.product.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#8aab99]">No img</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-[#0d3a24] text-sm leading-tight line-clamp-2 pr-4">{item.product.name}</h3>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-[#8aab99] hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 -mr-2 -mt-2"
                        title="Remove item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-[#f4f5f1] rounded-lg border border-[#e4ece7]">
                        <button
                          onClick={() => decrementItem(item.product.id)}
                          className="w-8 h-8 flex items-center justify-center text-[#5f786c] hover:bg-white hover:text-[#0d3a24] rounded-l-lg transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-[#0d3a24] ltr-num">{item.quantity}</span>
                        <button
                          onClick={() => incrementItem(item.product.id)}
                          className="w-8 h-8 flex items-center justify-center text-[#5f786c] hover:bg-white hover:text-[#0d3a24] rounded-r-lg transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-[#17583a] ltr-num">
                        EGP {((item.product.price ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#e4ece7]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#5f786c] font-medium">{t.cart.subtotal}</span>
              <span className="text-xl font-heading font-black text-[#0d3a24] ltr-num">
                EGP {subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-[#8aab99] mb-6 block text-center bg-[#f4f5f1] py-2 rounded-lg">
              {t.cart.shipping_note}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeCart}
                className="flex-1 py-4 border-2 border-[#17583a] text-[#17583a] font-semibold text-sm rounded-xl hover:bg-[#f4f5f1] transition-colors"
              >
                {t.cart.continue_shopping}
              </button>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex-[1.5] flex items-center justify-center py-4 bg-[#17583a] text-white font-semibold text-sm rounded-xl hover:bg-[#195b36] transition-colors"
              >
                {t.cart.checkout}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
