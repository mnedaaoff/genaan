"use client";

import { mockCustomers } from "../../lib/mock-data";

export default function CustomersPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPIs */}
      <div className="grid gap-4 grid-cols-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8aab99]">Total Customers</p>
          <p className="text-3xl font-heading font-black text-[#0d3a24] mt-2">{mockCustomers.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8aab99]">Avg. Lifetime Value</p>
          <p className="text-3xl font-heading font-black text-[#0d3a24] mt-2">
            EGP {Math.round(mockCustomers.reduce((s, c) => s + c.lifetime_spend, 0) / mockCustomers.length).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8aab99]">Total Revenue</p>
          <p className="text-3xl font-heading font-black text-[#17583a] mt-2">
            EGP {mockCustomers.reduce((s, c) => s + c.lifetime_spend, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e4ece7] flex items-center justify-between">
          <h2 className="text-base font-heading font-bold text-[#0d3a24]">All Customers</h2>
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8aab99]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="search" placeholder="Search customers…" className="pl-9 pr-3 py-2 rounded-lg border border-[#d4ded7] bg-[#fafafa] text-sm focus:outline-none focus:border-[#17583a]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e4ece7] bg-[#fafafa]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Customer</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Orders</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Lifetime Spend</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Last Order</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2ee]">
              {mockCustomers.map(c => (
                <tr key={c.id} className="hover:bg-[#fafafa] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#17583a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0d3a24]">{c.name}</p>
                        <p className="text-xs text-[#8aab99]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-[#0d3a24]">{c.total_orders}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-[#17583a]">EGP {c.lifetime_spend.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#5f786c]">
                    {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#8aab99]">
                    {new Date(c.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
