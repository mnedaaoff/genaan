"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

interface Stats {
  revenue: number;
  orders: number;
  pendingOrders: number;
  customers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, orders: 0, pendingOrders: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ordersRes, customersRes, recentRes] = await Promise.all([
          supabase.from("orders").select("total, status, payment_status"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id,order_number,total,status,payment_status,created_at").order("created_at", { ascending: false }).limit(5),
        ]);

        const orders = ordersRes.data ?? [];
        const revenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + Number(o.total || 0), 0);
        const pending = orders.filter(o => o.status === "pending").length;

        setStats({ revenue, orders: orders.length, pendingOrders: pending, customers: customersRes.count ?? 0 });
        setRecentOrders(recentRes.data ?? []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const AR_STATUS: Record<string, string> = {
    pending:"معلق", confirmed:"مؤكد", processing:"قيد التجهيز",
    shipped:"مشحون", delivered:"تم التسليم", cancelled:"ملغى",
  };
  const STATUS_COLORS: Record<string, string> = {
    pending:"bg-amber-100 text-amber-700", confirmed:"bg-blue-100 text-blue-700",
    processing:"bg-indigo-50 text-indigo-700", shipped:"bg-indigo-100 text-indigo-700",
    delivered:"bg-green-100 text-green-700", cancelled:"bg-red-100 text-red-700",
  };

  const STAT_CARDS = [
    { label: isRTL ? "إجمالي الإيرادات" : "Total Revenue", value: `EGP ${stats.revenue.toLocaleString()}`, icon: "💰", href: "/admin/orders", color: "bg-green-50 text-green-700" },
    { label: isRTL ? "إجمالي الطلبات" : "Total Orders",   value: stats.orders, icon: "📦", href: "/admin/orders", color: "bg-blue-50 text-blue-700" },
    { label: isRTL ? "طلبات معلقة" : "Pending Orders",   value: stats.pendingOrders, icon: "⏳", href: "/admin/orders?filter=pending", color: "bg-amber-50 text-amber-700" },
    { label: isRTL ? "العملاء" : "Customers",            value: stats.customers, icon: "👥", href: "/admin/customers", color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "لوحة التحكم" : "Dashboard"}</h1>
        <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "مرحباً، إليك نظرة عامة على متجرك" : "Welcome! Here's an overview of your store"}</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(card => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#5f786c] font-semibold mb-2">{card.label}</p>
                {loading
                  ? <div className="h-7 w-24 bg-[#f0f2ee] rounded animate-pulse"/>
                  : <p className="text-2xl font-black text-[#0d3a24]">{card.value}</p>}
              </div>
              <span className={`text-2xl p-2 rounded-xl ${card.color}`}>{card.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f2ee] flex items-center justify-between">
          <h2 className="font-bold text-[#0d3a24]">{isRTL ? "آخر الطلبات" : "Recent Orders"}</h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-[#17583a] hover:underline">{isRTL ? "عرض الكل" : "View all"}</Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-[#f0f2ee] rounded animate-pulse"/>)}</div>
        ) : recentOrders.length === 0 ? (
          <div className="py-16 text-center"><p className="text-3xl mb-3">📦</p><p className="text-[#8aab99] text-sm">{isRTL ? "لا توجد طلبات بعد" : "No orders yet"}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2ee] bg-[#fafbf9]">
                  {[isRTL?"رقم":"Order", isRTL?"التاريخ":"Date", isRTL?"المبلغ":"Total", isRTL?"الحالة":"Status", isRTL?"الدفع":"Payment"].map((h,i) => (
                    <th key={i} className="px-5 py-3 text-start text-xs font-semibold text-[#5f786c] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f5f1]">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-[#fafbf9] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0d3a24]">#{o.order_number ?? String(o.id).slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3.5 text-[#5f786c] text-xs">{new Date(o.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#0d3a24]">EGP {Number(o.total || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {isRTL ? (AR_STATUS[o.status] ?? o.status) : o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {isRTL ? ({"paid":"مدفوع","pending":"معلق","failed":"فشل","refunded":"مسترد"} as Record<string,string>)[o.payment_status] ?? o.payment_status : o.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
