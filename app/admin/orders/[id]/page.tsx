"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockOrders } from "../../../lib/mock-data";
import { Badge } from "../../../components/ui/Badge";
import type { OrderStatus } from "../../../lib/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = mockOrders.find(o => o.id === Number(id));

  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "pending");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-[#8aab99]">Order not found.</p>
      <Link href="/admin/orders" className="mt-4 inline-block text-sm text-[#17583a] hover:underline">← Back to Orders</Link>
    </div>
  );

  const handleStatusUpdate = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const statusColors: Record<OrderStatus, "yellow" | "blue" | "purple" | "green" | "red"> = {
    pending: "yellow", confirmed: "blue", shipped: "purple", delivered: "green", cancelled: "red",
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-[#8aab99] hover:text-[#5f786c] text-sm">← Orders</Link>
          <span className="text-[#c4d5cc]">/</span>
          <span className="text-sm font-semibold text-[#0d3a24]">Order #{order.id}</span>
        </div>
        <Badge variant={statusColors[status]} dot>{status}</Badge>
      </div>

      {saved && (
        <div className="mb-5 p-4 bg-[#e8f3ec] border border-[#b4d9c5] rounded-xl text-sm font-semibold text-[#17583a]">
          ✓ Order status updated to &quot;{status}&quot;
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Order items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-heading font-bold text-[#0d3a24] mb-4">Order Items</h2>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f0f2ee] flex-shrink-0">
                      {item.product?.images?.[0]?.url && (
                        <Image src={item.product.images[0].url} alt={item.product?.name ?? ""} fill className="object-cover"/>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0d3a24]">{item.product?.name}</p>
                      <p className="text-xs text-[#8aab99]">Qty: {item.quantity} × EGP {item.unit_price.toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-[#17583a]">EGP {item.total.toFixed(2)}</p>
                  </div>
                ))}
                {/* Totals */}
                <div className="border-t border-[#f0f2ee] pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[#5f786c]"><span>Subtotal</span><span>EGP {order.subtotal.toFixed(2)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-[#17583a]"><span>Discount</span><span>-EGP {order.discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold text-[#0d3a24] text-base"><span>Total</span><span>EGP {order.total.toFixed(2)}</span></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#8aab99]">No items data available.</p>
            )}
          </div>

          {/* Timeline */}
          {order.events && order.events.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-heading font-bold text-[#0d3a24] mb-4">Order Timeline</h2>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[#e4ece7]"/>
                <div className="space-y-5">
                  {order.events.map((ev, i) => (
                    <div key={ev.id} className="flex items-start gap-5 relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${i === 0 ? "bg-[#17583a]" : "bg-white border-2 border-[#d4ded7]"}`}>
                        {i === 0 && <div className="w-2 h-2 bg-white rounded-full"/>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0d3a24]">{ev.event}</p>
                        <p className="text-xs text-[#8aab99]">{new Date(ev.created_at).toLocaleString("en-GB")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Status update */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-heading font-bold text-[#0d3a24] mb-4">Update Status</h2>
            <div className="space-y-2 mb-4">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors capitalize ${
                    status === s
                      ? "border-[#17583a] bg-[#e8f3ec] text-[#17583a]"
                      : "border-[#d4ded7] text-[#5f786c] hover:border-[#8aab99]"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${status === s ? "bg-[#17583a]" : "bg-[#d4ded7]"}`}/>
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={saving || status === order.status}
              className="w-full py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-lg hover:bg-[#195b36] transition-colors disabled:opacity-40"
            >
              {saving ? "Saving…" : "Update Status"}
            </button>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-heading font-bold text-[#0d3a24] mb-3">Customer</h2>
            <p className="font-semibold text-[#0d3a24]">{order.user?.name}</p>
            <p className="text-sm text-[#5f786c]">{order.user?.email}</p>
          </div>

          {/* Delivery */}
          {order.address && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-heading font-bold text-[#0d3a24] mb-3">Delivery Address</h2>
              <address className="text-sm text-[#5f786c] not-italic leading-6">
                {order.address.line1}<br/>
                {order.address.city}, {order.address.postcode}<br/>
                {order.address.country}
              </address>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
