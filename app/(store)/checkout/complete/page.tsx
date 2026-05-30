"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function CompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const success = searchParams.get("success");
  const pending = searchParams.get("pending");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    async function checkOrder() {
      if (!orderId) { setStatus("success"); return; }
      
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, payment_status")
        .eq("id", orderId)
        .single();

      if (data) {
        setOrderNumber(data.order_number ?? `#${data.id}`);
        
        // If Paymob redirects with success=false, show failed/canceled page
        if (success === "false") {
          setStatus("failed");
          // Update order payment status in database
          await supabase
            .from("orders")
            .update({ 
              payment_status: "failed",
              status: "canceled"
            })
            .eq("id", orderId);
        } else {
          setStatus("success");
        }
      } else {
        setStatus(success === "false" ? "failed" : "success");
      }
    }
    checkOrder();
  }, [orderId, success, pending]);

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f4f5f1]">
        <div className="w-10 h-10 border-4 border-[#e4ece7] border-t-[#17583a] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f4f5f1] px-5 py-10">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg animate-fade-in">
          <div className="w-20 h-20 bg-[#fdf2f2] rounded-full flex items-center justify-center mx-auto mb-6 text-[#de3e3e]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-black text-[#661d1d] mb-3">Order Canceled</h1>
          <p className="text-[#7f5f5f] text-sm leading-6 mb-2">
            {orderNumber
              ? `Payment for order ${orderNumber} was canceled or unsuccessful.`
              : "Payment was canceled or unsuccessful."}
          </p>
          <p className="text-[#a88d8d] text-xs mb-8">No funds were charged. If this was an accident, you can try checking out again.</p>
          <div className="flex flex-col gap-3">
            <Link href="/checkout" className="block w-full py-3.5 bg-[#de3e3e] text-white font-semibold rounded-xl hover:bg-[#c53030] transition-colors">
              Try Again
            </Link>
            <Link href="/" className="block w-full py-3 border border-[#f3d4d4] text-[#7f5f5f] font-semibold rounded-xl hover:border-[#de3e3e] transition-colors text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#f4f5f1] px-5 py-10">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg animate-fade-in">
        <div className="w-20 h-20 bg-[#e8f3ec] rounded-full flex items-center justify-center mx-auto mb-6 text-[#17583a]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-3">Order Placed!</h1>
        <p className="text-[#5f786c] text-sm leading-6 mb-2">
          {orderNumber
            ? `Your order ${orderNumber} has been placed successfully.`
            : "Your order has been placed successfully."}
        </p>
        <p className="text-[#8aab99] text-xs mb-8">You will receive a confirmation shortly. Payment status will be updated automatically.</p>
        <div className="flex flex-col gap-3">
          <Link href="/shop" className="block w-full py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors">
            Continue Shopping
          </Link>
          <Link href="/" className="block w-full py-3 border border-[#d4ded7] text-[#5f786c] font-semibold rounded-xl hover:border-[#17583a] transition-colors text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f4f5f1]">
        <div className="w-10 h-10 border-4 border-[#e4ece7] border-t-[#17583a] rounded-full animate-spin"/>
      </div>
    }>
      <CompleteContent />
    </Suspense>
  );
}
