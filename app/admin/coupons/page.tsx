"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Coupon {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", min_order: "", usage_limit: "", expires_at: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) console.warn("Coupons error:", error.message);
      setCoupons((data ?? []) as Coupon[]);
      setLoading(false);
    }
    load();
  }, []);

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.code.trim() || !form.value) { setFormError(isRTL ? "الكود والقيمة مطلوبان" : "Code and value required"); return; }
    setSaving(true);
    const { data, error } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      min_order: form.min_order ? Number(form.min_order) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      used_count: 0,
      is_active: true,
      expires_at: form.expires_at || null,
    }).select().single();
    if (error) { setFormError(error.message); }
    else if (data) {
      setCoupons(prev => [data as Coupon, ...prev]);
      setForm({ code: "", type: "percent", value: "", min_order: "", usage_limit: "", expires_at: "" });
    }
    setSaving(false);
  };

  const toggleActive = async (id: number, current: boolean) => {
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm(isRTL ? "حذف هذا الكوبون؟" : "Delete this coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const inp = "px-3 py-2.5 rounded-xl border border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#0d3a24] focus:outline-none focus:ring-2 focus:ring-[#17583a] w-full";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "الكوبونات" : "Coupons"}</h1>
        <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "إدارة كوبونات الخصم" : "Manage discount coupons"}</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6 mb-6">
        <h2 className="font-bold text-[#0d3a24] mb-4 text-sm">🎟️ {isRTL ? "إنشاء كوبون جديد" : "Create New Coupon"}</h2>
        {formError && <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>}
        <form onSubmit={createCoupon} className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5">{isRTL ? "كود الكوبون" : "Code"}</label>
            <input type="text" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="SUMMER20" className={`${inp} uppercase font-mono tracking-widest font-bold`}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5">{isRTL ? "النوع" : "Type"}</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
              <option value="percent">{isRTL ? "نسبة %" : "Percent %"}</option>
              <option value="fixed">{isRTL ? "مبلغ ثابت EGP" : "Fixed EGP"}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5">{isRTL ? "القيمة" : "Value"}</label>
            <input type="number" required min="1" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder={form.type === "percent" ? "20" : "100"} className={inp}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5">{isRTL ? "الحد الأدنى للطلب" : "Min Order"}</label>
            <input type="number" min="0" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
              placeholder="0" className={inp}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5">{isRTL ? "تاريخ الانتهاء" : "Expires At"}</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className={inp}/>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving}
              className="w-full px-4 py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-bold hover:bg-[#17583a] transition-colors disabled:opacity-50">
              {saving ? "…" : (isRTL ? "✓ إنشاء" : "✓ Create")}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f2ee] flex items-center justify-between">
          <h2 className="font-bold text-[#0d3a24] text-sm">{isRTL ? "الكوبونات الحالية" : "All Coupons"}</h2>
          <span className="text-xs text-[#8aab99]">{coupons.length} {isRTL ? "كوبون" : "coupons"}</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-[#f0f2ee] rounded animate-pulse"/>)}</div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center"><p className="text-3xl mb-3">🎟️</p><p className="text-[#8aab99] text-sm">{isRTL ? "لا توجد كوبونات" : "No coupons yet"}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2ee] bg-[#fafbf9]">
                  {[isRTL?"الكود":"Code", isRTL?"الخصم":"Discount", isRTL?"الحد الأدنى":"Min Order",
                    isRTL?"الاستخدام":"Usage", isRTL?"الانتهاء":"Expires", isRTL?"الحالة":"Status", ""].map((h,i) => (
                    <th key={i} className="px-5 py-3 text-start text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f5f1]">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-[#fafbf9] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-[#0d3a24] text-xs tracking-widest bg-[#f4f5f1] px-2.5 py-1 rounded-lg">{c.code}</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#17583a]">
                      {c.type === "percent" ? `${c.value}%` : `EGP ${c.value}`}
                      <span className="text-[10px] text-[#8aab99] font-normal ms-1">{isRTL ? (c.type === "percent" ? "خصم" : "ثابت") : c.type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#5f786c] text-xs">{c.min_order ? `EGP ${c.min_order}` : (isRTL ? "بدون حد" : "None")}</td>
                    <td className="px-5 py-3.5 text-[#5f786c] text-xs">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                    <td className="px-5 py-3.5 text-[#5f786c] text-xs">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB") : (isRTL ? "لا ينتهي" : "No expiry")}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toggleActive(c.id, c.is_active)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "متوقف" : "Off")}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => deleteCoupon(c.id)} className="text-xs text-red-500 font-semibold hover:underline">{isRTL ? "حذف" : "Delete"}</button>
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
