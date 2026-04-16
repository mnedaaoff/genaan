"use client";

import { mockDashboardStats } from "../../lib/mock-data";
import { StatCard } from "../../components/admin/StatCard";
import { LineChart } from "../../components/admin/Charts";

// SVG icon helper
function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function DashboardPage() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`EGP ${stats.total_revenue.toLocaleString()}`}
          icon="revenue"
          trend={{ value: 12.4, label: "vs last month" }}
          accent
        />
        <StatCard title="Total Users" value={stats.total_users.toLocaleString()} icon="users" trend={{ value: 8.1, label: "vs last month" }} />
        <StatCard title="Active Orders" value={stats.active_orders} icon="orders" trend={{ value: -3.2, label: "vs last month" }} />
        <StatCard title="Low Stock Items" value={stats.low_stock_count} icon="warning" trend={{ value: 2, label: "items flagged" }} />
      </div>

      {/* Sales chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-heading font-bold text-[#0d3a24]">Sales Overview</h2>
            <p className="text-xs text-[#8aab99] mt-0.5">Last 30 days</p>
          </div>
          <span className="text-lg font-black font-heading text-[#17583a]">
            EGP {stats.sales_by_day.reduce((s, d) => s + d.revenue, 0).toLocaleString()}
          </span>
        </div>
        <LineChart data={stats.sales_by_day} height={220} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#e8f3ec] flex items-center justify-center text-[#17583a]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
            </div>
            <h2 className="text-base font-heading font-bold text-[#0d3a24]">Top Products</h2>
          </div>
          <div className="space-y-3">
            {stats.top_products.map((p, i) => {
              const pct = Math.round((p.revenue / stats.top_products[0].revenue) * 100);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-[#8aab99]">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[#0d3a24]">{p.name}</p>
                      <p className="text-sm font-bold text-[#17583a]">EGP {p.revenue.toLocaleString()}</p>
                    </div>
                    <div className="h-1.5 bg-[#e8f3ec] rounded-full overflow-hidden">
                      <div className="h-full bg-[#17583a] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-[#8aab99] mt-1">{p.units} units sold</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#e8f3ec] flex items-center justify-center text-[#17583a]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <h2 className="text-base font-heading font-bold text-[#0d3a24]">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {stats.recent_activity.map(log => {
              const isOrder = log.description.includes("order") || log.description.includes("Order");
              const isUser = log.description.includes("user") || log.description.includes("registration");
              const isStock = log.description.includes("stock") || log.description.includes("Stock");
              const isCoupon = log.description.includes("Coupon") || log.description.includes("coupon");

              const iconPath = isOrder
                ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                : isUser
                  ? "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM19 8l2 2 4-4"
                  : isStock
                    ? "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
                    : isCoupon
                      ? "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      : "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9";

              return (
                <div key={log.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isStock ? "bg-amber-50 text-amber-600" : "bg-[#e8f3ec] text-[#17583a]"
                    }`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={iconPath} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#0d3a24] leading-5">{log.description}</p>
                    <p className="text-[10px] text-[#8aab99] mt-0.5">
                      {new Date(log.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
