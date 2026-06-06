"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price: number;
  product?: { name: string; images?: { url: string; is_primary: boolean }[] };
  variant?: { name: string } | null;
}

interface Order {
  id: number;
  order_number: string | null;
  created_at: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  status: string;
  payment_status: string;
  currency: string;
  coupon_code: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  user_id: string | null;
  address_id: number | null;
  profile?: { first_name: string | null; last_name: string | null; email: string | null; phone: string | null } | null;
  address?: { street: string | null; city: string | null; full_name: string | null; phone: string | null } | null;
  order_items?: OrderItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700 border border-amber-200",
  confirmed:  "bg-blue-100 text-blue-700 border border-blue-200",
  processing: "bg-purple-100 text-purple-700 border border-purple-200",
  shipped:    "bg-indigo-100 text-indigo-700 border border-indigo-200",
  delivered:  "bg-green-100 text-green-700 border border-green-200",
  cancelled:  "bg-red-100 text-red-700 border border-red-200",
  returned:   "bg-orange-100 text-orange-700 border border-orange-200",
};

const PAY_COLORS: Record<string, string> = {
  pending:  "bg-gray-100 text-gray-600",
  paid:     "bg-green-100 text-green-700",
  failed:   "bg-red-100 text-red-700",
  refunded: "bg-orange-100 text-orange-700",
};

const AR_STATUS: Record<string, string> = {
  pending: "معلق", confirmed: "مؤكد", processing: "قيد التجهيز",
  shipped: "مشحون", delivered: "تم التسليم", cancelled: "ملغى", returned: "مُرتجع",
};

const AR_PAY: Record<string, string> = {
  pending: "لم يُدفع", paid: "مدفوع", failed: "فشل", refunded: "مسترد",
};

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [payFilter, setPayFilter] = useState<"all" | "paid" | "failed" | "pending">("all");
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());
  const [lang, setLang]           = useState<"en" | "ar">("en");
  const [newOrderToast, setNewOrderToast] = useState<{ number: string } | null>(null);
  const isRTL = lang === "ar";

  useEffect(() => {
    const stored = localStorage.getItem("genaan_lang");
    if (stored === "ar" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase
        .from("orders")
        .select(`
          id, order_number, created_at, total, subtotal, discount, shipping,
          status, payment_status, currency, coupon_code,
          shipping_name, shipping_phone, shipping_city, shipping_country,
          user_id, address_id,
          profile:profiles ( first_name, last_name, email, phone ),
          address:addresses ( street, city, full_name, phone )
        `)
        // Only show orders that have gone through payment flow
        .not("payment_status", "eq", "pending")
        .order("created_at", { ascending: false });

      if (filter !== "all") q = q.eq("status", filter);
      if (payFilter !== "all") q = q.eq("payment_status", payFilter);
      const { data, error } = await q;
      if (error) console.error("Orders fetch error:", error.message);
      setOrders((data ?? []) as unknown as Order[]);
      setLoading(false);
    }
    load();

    // Real-time: notify when a new order with completed payment arrives
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const o = payload.new as any;
        if (o.payment_status && o.payment_status !== "pending") {
          load();
          setNewOrderToast({ number: o.order_number ?? `#${String(o.id).slice(-6).toUpperCase()}` });
          setTimeout(() => setNewOrderToast(null), 5000);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const o = payload.new as any;
        // When payment_status changes from pending to paid/failed, reload
        if (o.payment_status && o.payment_status !== "pending") {
          load();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [filter, payFilter]);

  // Toggle expand + lazy-load items
  const toggleExpand = async (order: Order) => {
    const id = order.id;
    if (expanded.has(id)) {
      setExpanded(prev => { const s = new Set(prev); s.delete(id); return s; });
      return;
    }

    // Already loaded?
    if (order.order_items) {
      setExpanded(prev => new Set(prev).add(id));
      return;
    }

    setLoadingItems(prev => new Set(prev).add(id));
    const { data: items, error } = await supabase
      .from("order_items")
      .select(`
        id, product_id, variant_id, quantity, price,
        product:products ( name, images:product_images ( url, is_primary ) ),
        variant:product_variants ( name )
      `)
      .eq("order_id", id);

    if (error) console.error("Items fetch error:", error.message);

    // If no address via FK, try to fetch user's default address as fallback
    let addressFallback = order.address;
    if (!order.address && order.user_id) {
      const { data: userAddr } = await supabase
        .from("addresses")
        .select("street, city, full_name, phone")
        .eq("user_id", order.user_id)
        .eq("is_default", true)
        .maybeSingle();
      if (userAddr) addressFallback = userAddr;
    }

    setOrders(prev => prev.map(o => o.id === id ? { ...o, order_items: (items ?? []) as unknown as OrderItem[], address: addressFallback } : o));
    setLoadingItems(prev => { const s = new Set(prev); s.delete(id); return s; });
    setExpanded(prev => new Set(prev).add(id));
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const FILTERS = ["all", ...ALL_STATUSES];

  // ── Stats bar ──
  const total   = orders.length;
  const pending = orders.filter(o => o.status === "pending").length;
  const revenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + Number(o.total || 0), 0);

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "الطلبات" : "Orders"}</h1>
          <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "إدارة طلبات المتجر" : "Manage store orders"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#8aab99] font-medium">{isRTL ? "حالة الدفع:" : "Payment filter:"}</span>
          {(["all", "paid", "failed"] as const).map(p => (
            <button key={p}
              onClick={() => setPayFilter(p)}
              className={`px-3 py-1.5 rounded-full font-semibold capitalize transition-colors ${
                payFilter === p ? "bg-[#0d3a24] text-white" : "bg-white text-[#5f786c] border border-[#d4ded7] hover:border-[#17583a]"
              }`}>
              {isRTL
                ? (p === "all" ? "الكل" : p === "paid" ? "مدفوع" : "فشل الدفع")
                : p
              }
            </button>
          ))}
        </div>
      </div>

      {/* New order toast */}
      {newOrderToast && (
        <div className="fixed bottom-6 end-6 z-[100] animate-slide-up">
          <div className="bg-[#0d3a24] text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 min-w-[280px]">
            <div className="w-10 h-10 bg-[#17583a] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{isRTL ? "طلب جديد!" : "New Order!"}</p>
              <p className="text-white/70 text-xs">{newOrderToast.number}</p>
            </div>
            <button onClick={() => setNewOrderToast(null)} className="text-white/50 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: isRTL ? "إجمالي الطلبات" : "Total Orders",    value: total,                               color: "text-[#0d3a24]" },
          { label: isRTL ? "في الانتظار"    : "Pending",          value: pending,                             color: "text-amber-600" },
          { label: isRTL ? "الإيرادات"      : "Paid Revenue",     value: `EGP ${revenue.toLocaleString()}`,   color: "text-green-700" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0f2ee]">
            <p className="text-xs text-[#5f786c] mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-[#0d3a24] text-white"
                : "bg-white text-[#5f786c] border border-[#d4ded7] hover:border-[#17583a]"
            }`}
          >
            {isRTL ? (f === "all" ? "الكل" : AR_STATUS[f] ?? f) : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-[#f0f2ee] rounded-xl animate-pulse"/>)}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-[#8aab99] text-sm">
            {isRTL ? "لا توجد طلبات" : "No orders found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2ee] bg-[#fafbf9]">
                  {[
                    isRTL ? "تفاصيل"     : "",
                    isRTL ? "رقم الطلب"  : "Order",
                    isRTL ? "التاريخ"    : "Date",
                    isRTL ? "العميل"     : "Customer",
                    isRTL ? "المبلغ"     : "Total",
                    isRTL ? "الحالة"     : "Status",
                    isRTL ? "الدفع"      : "Payment",
                    isRTL ? "تغيير الحالة" : "Change Status",
                  ].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-start text-xs font-semibold text-[#5f786c] uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const isExp = expanded.has(order.id);
                  const isLoadingRow = loadingItems.has(order.id);
                  const profileName = order.profile
                    ? `${order.profile.first_name ?? ""} ${order.profile.last_name ?? ""}`.trim()
                    : null;
                  const customerName = order.shipping_name || profileName || (isRTL ? "مجهول" : "Unknown");
                  const customerPhone = order.shipping_phone || order.profile?.phone || "—";

                  return (
                    <>
                      {/* ── Main row ── */}
                      <tr
                        key={order.id}
                        className={`border-b border-[#f4f5f1] transition-colors cursor-pointer hover:bg-[#fafbf9] ${isExp ? "bg-[#fafbf9]" : ""}`}
                        onClick={() => toggleExpand(order)}
                      >
                        {/* Expand chevron */}
                        <td className="px-4 py-3.5 text-[#8aab99]">
                          {isLoadingRow ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                          ) : (
                            <svg
                              width="16" height="16" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5"
                              className={`transition-transform duration-200 ${isExp ? "rotate-90" : ""}`}
                            >
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                          )}
                        </td>

                        {/* Order number */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-bold text-[#0d3a24]">
                            {order.order_number ?? `#${String(order.id).slice(-6).toUpperCase()}`}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-[#5f786c] text-xs whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}
                          <br/>
                          <span className="text-[#8aab99]">
                            {new Date(order.created_at).toLocaleTimeString(isRTL ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-[#0d3a24] text-xs">{customerName}</p>
                          <p className="text-[#8aab99] text-[11px]">{order.profile?.email ?? "—"}</p>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3.5 font-bold text-[#0d3a24] whitespace-nowrap">
                          {order.currency ?? "EGP"} {Number(order.total || 0).toLocaleString()}
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {isRTL ? (AR_STATUS[order.status] ?? order.status) : order.status}
                          </span>
                        </td>

                        {/* Payment badge */}
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PAY_COLORS[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                            {isRTL ? (AR_PAY[order.payment_status] ?? order.payment_status) : order.payment_status}
                          </span>
                        </td>

                        {/* Status change */}
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            className="text-xs border border-[#d4ded7] rounded-lg px-2 py-1.5 bg-[#f4f5f1] text-[#0d3a24] focus:outline-none focus:ring-1 focus:ring-[#17583a]"
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>{isRTL ? AR_STATUS[s] : s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>

                      {/* ── Expanded detail row ── */}
                      {isExp && (
                        <tr key={`detail-${order.id}`} className="bg-[#f8faf8]">
                          <td colSpan={8} className="px-6 py-5">
                            <div className="grid md:grid-cols-2 gap-6">

                              {/* Products */}
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5f786c] mb-3">
                                  {isRTL ? "المنتجات المطلوبة" : "Order Items"}
                                </p>
                                {!order.order_items || order.order_items.length === 0 ? (
                                  <p className="text-xs text-[#8aab99]">{isRTL ? "لا توجد منتجات" : "No items"}</p>
                                ) : (
                                  <div className="space-y-2">
                                    {order.order_items.map(item => {
                                      const img = item.product?.images?.find(i => i.is_primary)?.url
                                        ?? item.product?.images?.[0]?.url;
                                      return (
                                        <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-[#eef1ec]">
                                          {/* Product image */}
                                          <div className="w-10 h-10 rounded-lg bg-[#f0f2ee] flex-shrink-0 overflow-hidden">
                                            {img
                                              ? <img src={img} alt="" className="w-full h-full object-cover"/>
                                              : <div className="w-full h-full flex items-center justify-center text-[#8aab99]">
                                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                                </div>
                                            }
                                          </div>
                                          {/* Name + variant */}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-[#0d3a24] truncate">
                                              {item.product?.name ?? `Product #${item.product_id}`}
                                            </p>
                                            {item.variant?.name && (
                                              <p className="text-[11px] text-[#8aab99]">{item.variant.name}</p>
                                            )}
                                          </div>
                                          {/* Qty × price */}
                                          <div className="text-end flex-shrink-0">
                                            <p className="text-xs font-bold text-[#0d3a24]">
                                              {order.currency ?? "EGP"} {(Number(item.price) * item.quantity).toLocaleString()}
                                            </p>
                                            <p className="text-[11px] text-[#8aab99]">
                                              {item.quantity} × {Number(item.price).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Price breakdown */}
                                <div className="mt-3 bg-white rounded-xl border border-[#eef1ec] p-3 space-y-1.5 text-xs">
                                  <div className="flex justify-between text-[#5f786c]">
                                    <span>{isRTL ? "المجموع الجزئي" : "Subtotal"}</span>
                                    <span>{order.currency ?? "EGP"} {Number(order.subtotal || 0).toLocaleString()}</span>
                                  </div>
                                  {Number(order.discount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>{isRTL ? "خصم" : "Discount"} {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                                      <span>- {order.currency ?? "EGP"} {Number(order.discount).toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-[#5f786c]">
                                    <span>{isRTL ? "شحن" : "Shipping"}</span>
                                    <span>{Number(order.shipping) === 0 ? (isRTL ? "مجاني" : "Free") : `${order.currency ?? "EGP"} ${Number(order.shipping).toLocaleString()}`}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-[#0d3a24] pt-1.5 border-t border-[#f0f2ee]">
                                    <span>{isRTL ? "الإجمالي" : "Total"}</span>
                                    <span>{order.currency ?? "EGP"} {Number(order.total || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Customer & Shipping */}
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5f786c] mb-3">
                                  {isRTL ? "بيانات العميل والشحن" : "Customer & Shipping"}
                                </p>
                                <div className="bg-white rounded-xl border border-[#eef1ec] p-4 space-y-3">
                                  {/* Customer info */}
                                  <div>
                                    <p className="text-[10px] font-bold text-[#8aab99] uppercase mb-1">{isRTL ? "المستخدم" : "Account"}</p>
                                    <p className="text-xs font-semibold text-[#0d3a24]">
                                      {profileName || (isRTL ? "زائر" : "Guest")}
                                    </p>
                                    {order.profile?.email && (
                                      <p className="text-[11px] text-[#5f786c]">{order.profile.email}</p>
                                    )}
                                    {order.profile?.phone && (
                                      <p className="text-[11px] text-[#5f786c]">{order.profile.phone}</p>
                                    )}
                                  </div>

                                  <div className="border-t border-[#f0f2ee]"/>

                                  {/* Shipping address */}
                                  <div>
                                    <p className="text-[10px] font-bold text-[#8aab99] uppercase mb-1">{isRTL ? "عنوان الشحن" : "Shipping Address"}</p>
                                    <p className="text-xs font-semibold text-[#0d3a24]">{order.shipping_name || order.address?.full_name || "—"}</p>
                                    <p className="text-[11px] text-[#5f786c]">{order.shipping_phone || order.address?.phone || customerPhone}</p>
                                    {/* Street — from addresses table */}
                                    {(order.address?.street) && (
                                      <p className="text-[11px] text-[#5f786c]">{order.address.street}</p>
                                    )}
                                    {/* City + Country */}
                                    {(order.shipping_city || order.address?.city) && (
                                      <p className="text-[11px] text-[#5f786c]">
                                        {order.shipping_city || order.address?.city}
                                        {order.shipping_country ? `, ${order.shipping_country}` : ""}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#8aab99] mt-3 text-center">
        {orders.length} {isRTL ? "طلب — انقر على أي صف لعرض التفاصيل" : "orders — click any row to expand details"}
      </p>
    </div>
  );
}
