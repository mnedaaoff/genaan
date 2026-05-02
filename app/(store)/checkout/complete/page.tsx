"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutCompleteContent() {
  const searchParams  = useSearchParams();
  const successParam  = searchParams.get("success");
  const success       = successParam === "1" || successParam === "true";
  const transactionId = searchParams.get("transaction_id") ?? "";
  const orderRef      = searchParams.get("order_ref") ?? "";
  const method        = searchParams.get("method") ?? "card";

  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div className={`min-h-screen bg-[#f4f5f1] flex items-center justify-center px-4 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm overflow-hidden">
        {success ? (
          <>
            {/* Success header */}
            <div className="bg-[#17583a] px-8 py-10 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 className="text-2xl font-heading font-black text-white">Payment Successful!</h1>
              <p className="text-[#a8c7b6] mt-2 text-sm">Your order has been confirmed.</p>
            </div>

            {/* Details */}
            <div className="px-8 py-8 space-y-4">
              {transactionId && (
                <div className="flex justify-between items-center py-3 border-b border-[#f0f2ee]">
                  <span className="text-sm text-[#5f786c]">Transaction ID</span>
                  <span className="text-sm font-mono font-semibold text-[#0d3a24]">{transactionId}</span>
                </div>
              )}
              {orderRef && (
                <div className="flex justify-between items-center py-3 border-b border-[#f0f2ee]">
                  <span className="text-sm text-[#5f786c]">Order Reference</span>
                  <span className="text-sm font-semibold text-[#0d3a24]">{orderRef}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-[#f0f2ee]">
                <span className="text-sm text-[#5f786c]">Payment Method</span>
                <span className="text-sm font-semibold text-[#0d3a24] capitalize">
                  {method === "wallet" ? "💳 Mobile Wallet" : "💳 Credit / Debit Card"}
                </span>
              </div>

              <div className="mt-6 p-4 bg-[#e8f3ec] rounded-xl text-sm text-[#17583a] text-center">
                📦 We&apos;ll send you a confirmation email with your order details.
              </div>

              <div className="flex gap-3 mt-6">
                <Link
                  href="/shop"
                  className="flex-1 py-3 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:border-[#17583a] transition-colors text-center"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/account"
                  className="flex-1 py-3 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors text-center"
                >
                  Track Order
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Failure header */}
            <div className="bg-red-500 px-8 py-10 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </div>
              <h1 className="text-2xl font-heading font-black text-white">Payment Failed</h1>
              <p className="text-red-100 mt-2 text-sm">Your payment could not be processed.</p>
            </div>

            <div className="px-8 py-8 space-y-4">
              {transactionId && (
                <div className="flex justify-between items-center py-3 border-b border-[#f0f2ee]">
                  <span className="text-sm text-[#5f786c]">Reference</span>
                  <span className="text-sm font-mono text-[#0d3a24]">{transactionId}</span>
                </div>
              )}

              <div className="p-4 bg-red-50 rounded-xl text-sm text-red-700 text-center">
                ⚠️ No amount was charged. Please try again or use a different payment method.
              </div>

              <div className="flex gap-3 mt-6">
                <Link
                  href="/checkout"
                  className="flex-1 py-3 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors text-center"
                >
                  Try Again
                </Link>
                <Link
                  href="/contact"
                  className="flex-1 py-3 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:border-[#17583a] transition-colors text-center"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f5f1] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#17583a] border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <CheckoutCompleteContent />
    </Suspense>
  );
}
