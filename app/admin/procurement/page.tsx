"use client";

import { mockProcurementStats } from "../../lib/mock-data";
import { BarChart } from "../../components/admin/Charts";
import { Badge } from "../../components/ui/Badge";
import type { InventoryLogType } from "../../lib/types";

const LOG_BADGES: Record<InventoryLogType, { label: string; variant: "green" | "red" | "yellow" | "blue" | "gray" }> = {
  in:         { label: "Stock In",    variant: "green"  },
  out:        { label: "Stock Out",   variant: "red"    },
  reserve:    { label: "Reserved",    variant: "yellow" },
  release:    { label: "Released",    variant: "blue"   },
  adjustment: { label: "Adjustment",  variant: "gray"   },
};

export default function ProcurementPage() {
  const stats = mockProcurementStats;
  const budgetPct = Math.round((stats.budget_used / stats.budget_allocated) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8aab99]">Fulfillment Rate</p>
          <p className="text-3xl font-heading font-black text-[#17583a] mt-2">{stats.fulfillment_rate}%</p>
          <div className="mt-3 h-2 bg-[#e8f3ec] rounded-full">
            <div className="h-full bg-[#17583a] rounded-full" style={{ width: `${stats.fulfillment_rate}%` }}/>
          </div>
          <p className="text-xs text-[#8aab99] mt-2">Supplier target: 95%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8aab99]">Budget Used</p>
          <p className="text-3xl font-heading font-black text-[#0d3a24] mt-2">ÂEGP {(stats.budget_used / 1000).toFixed(1)}k</p>
          <div className="mt-3 h-2 bg-[#e8f3ec] rounded-full">
            <div className={`h-full rounded-full ${budgetPct > 85 ? "bg-amber-500" : "bg-[#17583a]"}`} style={{ width: `${budgetPct}%` }}/>
          </div>
          <p className="text-xs text-[#8aab99] mt-2">of ÂEGP {(stats.budget_allocated / 1000).toFixed(0)}k allocated ({budgetPct}%)</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8aab99]">Remaining Budget</p>
          <p className="text-3xl font-heading font-black text-[#0d3a24] mt-2">ÂEGP {((stats.budget_allocated - stats.budget_used) / 1000).toFixed(1)}k</p>
          <p className="text-xs text-[#8aab99] mt-5">Available for new procurement orders</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-heading font-bold text-[#0d3a24]">Stock by Category</h2>
          <div className="flex items-center gap-4 text-xs text-[#8aab99]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#17583a] inline-block"/>Reserved</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#e8f3ec] border border-[#17583a] inline-block"/>Available</span>
          </div>
        </div>
        <BarChart data={stats.by_category} height={220}/>
      </div>

      {/* Category breakdown table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-heading font-bold text-[#0d3a24] mb-4">Inventory Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e4ece7]">
                <th className="text-left py-2.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Category</th>
                <th className="text-right py-2.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Total Stock</th>
                <th className="text-right py-2.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Reserved</th>
                <th className="text-right py-2.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2ee]">
              {stats.by_category.map(row => (
                <tr key={row.category}>
                  <td className="py-3 font-medium text-[#0d3a24]">{row.category}</td>
                  <td className="py-3 text-right text-[#5f786c]">{row.stock}</td>
                  <td className="py-3 text-right text-amber-600">{row.reserved}</td>
                  <td className="py-3 text-right font-bold text-[#17583a]">{row.stock - row.reserved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory logs */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-heading font-bold text-[#0d3a24] mb-4">Recent Inventory Movements</h2>
        <div className="space-y-3">
          {stats.recent_logs.map(log => {
            const b = LOG_BADGES[log.type];
            return (
              <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#fafafa] border border-[#f0f2ee]">
                <Badge variant={b.variant} size="sm">{b.label}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0d3a24]">{log.product?.name}</p>
                  <p className="text-xs text-[#8aab99]">{log.note}</p>
                </div>
                <span className={`text-sm font-bold ${log.quantity > 0 ? "text-[#17583a]" : "text-red-600"}`}>
                  {log.quantity > 0 ? "+" : ""}{log.quantity} units
                </span>
                <span className="text-xs text-[#8aab99] hidden sm:block">
                  {new Date(log.created_at).toLocaleDateString("en-GB")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
