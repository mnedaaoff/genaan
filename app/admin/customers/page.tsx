"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
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
      const { data, error } = await supabase
        .from("profiles")
        .select("id,first_name,last_name,email,phone,is_admin,created_at")
        .order("created_at", { ascending: false });
      if (error) console.warn("Customers error:", error.message);
      setCustomers((data ?? []) as Profile[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "العملاء" : "Customers"}</h1>
          <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "قائمة مستخدمي المتجر" : "Store user profiles"}</p>
        </div>
        <div className="text-xs text-[#8aab99]">{customers.length} {isRTL ? "عميل" : "users"}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-[#f0f2ee] rounded animate-pulse"/>)}</div>
        ) : customers.length === 0 ? (
          <div className="py-20 text-center"><p className="text-4xl mb-3">👥</p><p className="text-[#8aab99] text-sm">{isRTL ? "لا يوجد عملاء بعد" : "No customers yet"}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2ee] bg-[#fafbf9]">
                  {[isRTL?"العميل":"Customer", isRTL?"البريد الإلكتروني":"Email", isRTL?"الهاتف":"Phone", isRTL?"تاريخ التسجيل":"Registered"].map((h,i) => (
                    <th key={i} className="px-5 py-3 text-start text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f5f1]">
                {customers.map(c => {
                  const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || "—";
                  const initial = (c.first_name || c.email || "U").charAt(0).toUpperCase();
                  return (
                    <tr key={c.id} className="hover:bg-[#fafbf9] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e8f3ec] flex items-center justify-center text-[#17583a] font-bold text-xs flex-shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0d3a24] text-sm">{name}</p>
                            {c.is_admin && (
                              <span className="text-[9px] bg-[#0d3a24] text-white px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#5f786c] text-xs">{c.email || "—"}</td>
                      <td className="px-5 py-3.5 text-[#5f786c] text-xs">{c.phone || "—"}</td>
                      <td className="px-5 py-3.5 text-[#5f786c] text-xs">{new Date(c.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
