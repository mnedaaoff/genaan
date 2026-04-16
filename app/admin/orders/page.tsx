"use client";

import { useState } from "react";
import Link from "next/link";
import { mockOrders } from "../../lib/mock-data";
import { Badge } from "../../components/ui/Badge";
import type { Order, OrderStatus } from "../../lib/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: "yellow" | "blue" | "purple" | "green" | "red" }> = {
  pending: { label: "Pending", variant: "yellow" },
  confirmed: { label: "Confirmed", variant: "blue" },
  shipped: { label: "Shipped", variant: "purple" },
  delivered: { label: "Delivered", variant: "green" },
  cancelled: { label: "Cancelled", variant: "red" },
};

const TABS: { label: string; status: OrderStatus | "all" }[] = [
  { label: "All", status: "all" },
  { label: "Pending", status: "pending" },
  { label: "Confirmed", status: "confirmed" },
  { label: "Shipped", status: "shipped" },
  { label: "Delivered", status: "delivered" },
];

export default function OrdersPage() {
  const [tab, setTab] = useState<OrderStatus | "all">("all");

  const filtered = tab === "all"
    ? mockOrders
    : mockOrders.filter(o => o.status === tab);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {(["pending", "confirmed", "shipped", "delivered"] as const).map(s => (
          <div key={s} className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8aab99] capitalize">{s}</p>
            <p className="text-2xl font-heading font-black text-[#0d3a24] mt-1">
              {mockOrders.filter(o => o.status === s).length}
            </p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-[#e4ece7]">
        {TABS.map(t => (
          <button
            key={t.status}
            onClick={() => setTab(t.status)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.status
                ? "border-[#17583a] text-[#17583a]"
                : "border-transparent text-[#8aab99] hover:text-[#5f786c]"
              }`}
          >
            {t.label}
            {t.status !== "all" && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-[#f0f2ee] text-[#8aab99] text-[10px] rounded-full">
                {mockOrders.filter(o => o.status === t.status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e4ece7] bg-[#fafafa]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Payment</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Date</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2ee]">
              {filtered.map(order => {
                const sc = STATUS_CONFIG[order.status];
                return (
                  <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#0d3a24]">#{order.id}</span>
                      {order.coupon_code && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-[#e8f3ec] text-[#17583a] rounded font-semibold">{order.coupon_code}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#0d3a24]">{order.user?.name}</p>
                      <p className="text-xs text-[#8aab99]">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#0d3a24]">EGP {order.total.toFixed(2)}</span>
                      {order.discount > 0 && <span className="ml-1 text-[10px] text-[#17583a]">(-EGP {order.discount})</span>}
                    </td>
                    <td className="px-4 py-3.5"><Badge variant={sc.variant} dot>{sc.label}</Badge></td>
                    <td className="px-4 py-3.5">
                      <Badge variant={order.payment_status === "paid" ? "green" : "yellow"}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#8aab99]">
                      {new Date(order.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="px-3 py-1.5 text-xs font-semibold text-[#17583a] bg-[#e8f3ec] rounded-md hover:bg-[#d8ede3] transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#8aab99] text-sm">No orders with this status.</div>
        )}
      </div>
    </div>
  );
}
