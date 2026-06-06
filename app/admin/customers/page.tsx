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

  // Search query state
  const [searchQuery, setSearchQuery] = useState("");

  // Master-Detail selected customer
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [detailTab, setDetailTab] = useState<'send' | 'orders' | 'addresses' | 'inquiries'>('send');
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [customerInquiries, setCustomerInquiries] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Messaging state (individual)
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState("");

  // Broadcast state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

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

  // Fetch customer details on selection
  useEffect(() => {
    if (!selectedCustomer) return;

    // Reset details lists
    setCustomerOrders([]);
    setCustomerAddresses([]);
    setCustomerInquiries([]);

    const customerId = selectedCustomer.id;
    const customerEmail = selectedCustomer.email;

    async function loadCustomerDetails() {
      setLoadingDetails(true);
      try {
        // 1. Fetch orders
        const { data: orders } = await supabase
          .from("orders")
          .select("id, created_at, status, total, currency, order_number")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false });
        setCustomerOrders(orders || []);

        // 2. Fetch addresses
        const { data: addresses } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", customerId)
          .order("is_default", { ascending: false });
        setCustomerAddresses(addresses || []);

        // 3. Fetch consultations (inquiries)
        const { data: consultations } = await supabase
          .from("consultations")
          .select("id, message, status, created_at")
          .or(`user_id.eq.${customerId}${customerEmail ? `,email.eq.${customerEmail}` : ''}`)
          .order("created_at", { ascending: false });
        setCustomerInquiries(consultations || []);
      } catch (err) {
        console.error("Failed to load customer details:", err);
      } finally {
        setLoadingDetails(false);
      }
    }

    // Initialize default titles for messages
    setMessageTitle(isRTL ? "تحديث من الإدارة" : "Update from Genaan");
    setMessageBody("");
    setMessageSuccess("");

    loadCustomerDetails();
  }, [selectedCustomer, isRTL]);

  // Send individual notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !messageTitle.trim() || !messageBody.trim()) return;

    setSendingMessage(true);
    setMessageSuccess("");

    try {
      const payload: Record<string, any> = {
        user_id: selectedCustomer.id,
        title: messageTitle.trim(),
        is_read: false
      };
      payload.body = messageBody.trim();
      payload.message = messageBody.trim();

      const { error } = await supabase.from("notifications").insert(payload);
      if (error) throw error;

      setMessageSuccess(isRTL ? "تم إرسال الإشعار بنجاح!" : "Notification sent successfully!");
      setMessageBody("");
      setTimeout(() => setMessageSuccess(""), 4000);
    } catch (err: any) {
      alert(isRTL ? `فشل الإرسال: ${err.message}` : `Failed to send: ${err.message}`);
    } finally {
      setSendingMessage(false);
    }
  };

  // Send broadcast notification
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    setSendingBroadcast(true);
    setBroadcastSuccess("");

    try {
      // Filter out admins from broadcast
      const targets = customers.filter(c => !c.is_admin);
      if (targets.length === 0) {
        alert(isRTL ? "لا يوجد عملاء لإرسال الرسالة إليهم!" : "No customers to send the broadcast to!");
        setSendingBroadcast(false);
        return;
      }

      const payloads = targets.map(c => {
        const payload: Record<string, any> = {
          user_id: c.id,
          title: broadcastTitle.trim(),
          is_read: false
        };
        payload.body = broadcastBody.trim();
        payload.message = broadcastBody.trim();
        return payload;
      });

      const { error } = await supabase.from("notifications").insert(payloads);
      if (error) throw error;

      setBroadcastSuccess(isRTL ? `تم إرسال الرسالة بنجاح إلى ${targets.length} عميل!` : `Message sent successfully to ${targets.length} customers!`);
      setBroadcastTitle("");
      setBroadcastBody("");
      setTimeout(() => {
        setBroadcastSuccess("");
        setShowBroadcastModal(false);
      }, 3000);
    } catch (err: any) {
      alert(isRTL ? `فشل إرسال البث: ${err.message}` : `Failed to send broadcast: ${err.message}`);
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Filter list based on search query
  const filteredCustomers = customers.filter(c => {
    const name = [c.first_name, c.last_name].filter(Boolean).join(" ").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "العملاء والرسائل" : "Customers & Messages"}</h1>
          <p className="text-sm text-[#5f786c] mt-0.5">
            {isRTL 
              ? "إدارة حسابات المشترين وإرسال التنبيهات المخصصة والعروض العامة." 
              : "Manage user accounts, send custom alerts and storewide broadcasts."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setBroadcastTitle(isRTL ? "عرض خاص جديد! 🎉" : "New Special Offer! 🎉");
              setBroadcastBody("");
              setBroadcastSuccess("");
              setShowBroadcastModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#17583a] text-white rounded-xl text-sm font-semibold hover:bg-[#195b36] transition-all shadow-sm"
          >
            <span>📢</span>
            <span>{isRTL ? "إرسال عرض للجميع" : "Send Broadcast"}</span>
          </button>
          <div className="text-xs font-bold text-[#5f786c] bg-[#e8f3ec] px-3 py-1.5 rounded-lg border border-[#cbe1d3]">
            {customers.length} {isRTL ? "مستخدم" : "users"}
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Customers List */}
        <div className={`${selectedCustomer ? "lg:col-span-2" : "lg:col-span-3"} transition-all duration-300`}>
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden">
            {/* Search toolbar */}
            <div className="p-4 border-b border-[#f0f2ee] bg-[#fafbf9] flex items-center">
              <div className="relative w-full max-w-md">
                <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-[#8aab99] text-xs pointer-events-none">🔍</span>
                <input
                  type="text"
                  placeholder={isRTL ? "بحث بالاسم، البريد أو الهاتف..." : "Search by name, email or phone..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full ps-9 pe-4 py-2 text-sm border border-[#d4ded7] rounded-xl focus:outline-none focus:border-[#17583a] bg-white text-[#0d3a24]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-[#8aab99] hover:text-[#0d3a24] text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-[#f0f2ee] rounded animate-pulse" />
                ))}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-[#8aab99] text-sm">{isRTL ? "لا يوجد نتائج مطابقة للبحث" : "No matching results found"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#f0f2ee] bg-[#fafbf9]">
                      <th className="px-5 py-3 text-start text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">{isRTL ? "العميل" : "Customer"}</th>
                      <th className="px-5 py-3 text-start text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">{isRTL ? "البريد الإلكتروني" : "Email"}</th>
                      <th className="px-5 py-3 text-start text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">{isRTL ? "الهاتف" : "Phone"}</th>
                      <th className="px-5 py-3 text-start text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">{isRTL ? "تاريخ التسجيل" : "Registered"}</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">{isRTL ? "الإجراء" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f5f1]">
                    {filteredCustomers.map((c) => {
                      const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || (isRTL ? "بدون اسم" : "Unnamed User");
                      const initial = (c.first_name || c.email || "U").charAt(0).toUpperCase();
                      const isSelected = selectedCustomer?.id === c.id;

                      return (
                        <tr 
                          key={c.id} 
                          className={`hover:bg-[#fafbf9] transition-colors ${isSelected ? "bg-[#e8f3ec]/40 hover:bg-[#e8f3ec]/60" : ""}`}
                        >
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
                          <td className="px-5 py-3.5 text-[#5f786c] text-xs">
                            {new Date(c.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => {
                                setSelectedCustomer(isSelected ? null : c);
                                setDetailTab("send");
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isSelected 
                                  ? "bg-[#0d3a24] text-white" 
                                  : "border border-[#d4ded7] text-[#0d3a24] hover:bg-[#fafbf9]"
                              }`}
                            >
                              {isSelected ? (isRTL ? "إغلاق" : "Close") : (isRTL ? "عرض وتواصل" : "View & Message")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Customer Details Panel */}
        {selectedCustomer && (
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-5 self-start animate-fade-in space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#17583a] text-white flex items-center justify-center text-lg font-bold">
                  {(selectedCustomer.first_name || selectedCustomer.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-[#0d3a24] text-base">
                    {[selectedCustomer.first_name, selectedCustomer.last_name].filter(Boolean).join(" ") || (isRTL ? "مستخدم بدون اسم" : "Unnamed User")}
                  </h3>
                  <p className="text-xs text-[#5f786c]">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p className="text-xs text-[#8aab99]">{selectedCustomer.phone}</p>}
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="w-6 h-6 rounded-full bg-[#f4f5f1] hover:bg-[#e4ece7] flex items-center justify-center text-[#5f786c] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick tabs */}
            <div className="flex border-b border-[#f0f2ee] pb-1 gap-3 overflow-x-auto text-xs whitespace-nowrap scrollbar-none">
              {(['send', 'orders', 'addresses', 'inquiries'] as const).map((tab) => {
                const labels = {
                  send: isRTL ? "رسالة" : "Message",
                  orders: isRTL ? "الطلبات" : "Orders",
                  addresses: isRTL ? "العناوين" : "Addresses",
                  inquiries: isRTL ? "الاستفسارات" : "Inquiries",
                };
                const isActive = detailTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`pb-2 font-bold transition-all relative ${
                      isActive ? "text-[#17583a]" : "text-[#8aab99] hover:text-[#5f786c]"
                    }`}
                  >
                    {labels[tab]}
                    {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#17583a] rounded-full" />}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="space-y-4 min-h-[200px]">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2">
                  <div className="w-8 h-8 border-3 border-[#17583a]/25 border-t-[#17583a] rounded-full animate-spin" />
                  <p className="text-xs text-[#8aab99]">{isRTL ? "جاري التحميل..." : "Loading info..."}</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: SEND MESSAGE */}
                  {detailTab === "send" && (
                    <form onSubmit={handleSendNotification} className="space-y-4">
                      {messageSuccess && (
                        <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-200 animate-fade-in">
                          {messageSuccess}
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">
                          {isRTL ? "عنوان التنبيه" : "Alert Title"}
                        </label>
                        <input
                          type="text"
                          required
                          value={messageTitle}
                          onChange={(e) => setMessageTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-[#d4ded7] rounded-xl focus:outline-none focus:border-[#17583a] bg-white text-[#0d3a24]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">
                          {isRTL ? "نص الرسالة" : "Message Body"}
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={messageBody}
                          onChange={(e) => setMessageBody(e.target.value)}
                          placeholder={isRTL ? "اكتب رسالتك هنا..." : "Type your message here..."}
                          className="w-full px-3 py-2 text-xs border border-[#d4ded7] rounded-xl focus:outline-none focus:border-[#17583a] bg-white text-[#0d3a24] resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sendingMessage || !messageTitle.trim() || !messageBody.trim()}
                        className="w-full py-2 bg-[#17583a] text-white text-xs font-bold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {sendingMessage ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{isRTL ? "جاري الإرسال..." : "Sending..."}</span>
                          </>
                        ) : (
                          <>
                            <span>✉️</span>
                            <span>{isRTL ? "إرسال كإشعار" : "Send as Notification"}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* TAB 2: ORDERS */}
                  {detailTab === "orders" && (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {customerOrders.length === 0 ? (
                        <p className="text-xs text-[#8aab99] text-center py-8">{isRTL ? "لا توجد طلبات لهذا العميل" : "No orders for this customer"}</p>
                      ) : (
                        customerOrders.map((o) => (
                          <div key={o.id} className="p-3 bg-[#fafbf9] border border-[#f0f2ee] rounded-xl text-xs flex justify-between items-center">
                            <div>
                              <p className="font-bold text-[#0d3a24]">{o.order_number || `#${o.id.slice(0, 8)}`}</p>
                              <p className="text-[10px] text-[#8aab99] mt-0.5">{new Date(o.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</p>
                            </div>
                            <div className="text-end">
                              <p className="font-black text-[#17583a]">{o.currency || "EGP"} {Number(o.total).toFixed(2)}</p>
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 ${
                                o.status === 'completed' || o.status === 'paid' ? 'bg-green-100 text-green-800' :
                                o.status === 'pending' || o.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                                o.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 3: ADDRESSES */}
                  {detailTab === "addresses" && (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {customerAddresses.length === 0 ? (
                        <p className="text-xs text-[#8aab99] text-center py-8">{isRTL ? "لا توجد عناوين مسجلة" : "No saved addresses"}</p>
                      ) : (
                        customerAddresses.map((a) => (
                          <div key={a.id} className="p-3 bg-[#fafbf9] border border-[#f0f2ee] rounded-xl text-xs relative">
                            {a.is_default && (
                              <span className="absolute top-3 end-3 text-[8px] bg-[#17583a] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">
                                {isRTL ? "الافتراضي" : "Default"}
                              </span>
                            )}
                            <h4 className="font-bold text-[#0d3a24] mb-0.5">{a.full_name}</h4>
                            <p className="text-[11px] text-[#5f786c]">{a.phone}</p>
                            <p className="text-[11px] text-[#5f786c] mt-1">{a.street}</p>
                            <p className="text-[11px] text-[#8aab99]">{a.city}, {a.postcode || ""}, {a.country}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 4: INQUIRIES */}
                  {detailTab === "inquiries" && (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {customerInquiries.length === 0 ? (
                        <p className="text-xs text-[#8aab99] text-center py-8">{isRTL ? "لا توجد استفسارات مرسلة" : "No consultations found"}</p>
                      ) : (
                        customerInquiries.map((i) => (
                          <div key={i.id} className="p-3 bg-[#fafbf9] border border-[#f0f2ee] rounded-xl text-xs space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                i.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                i.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {i.status}
                              </span>
                              <span className="text-[9px] text-[#8aab99]">{new Date(i.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</span>
                            </div>
                            <p className="text-[#0d3a24] leading-normal whitespace-pre-wrap">{i.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0d3a24]/40 backdrop-blur-sm" 
            onClick={() => { if (!sendingBroadcast) setShowBroadcastModal(false); }}
          />

          {/* Modal Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#f0f2ee] p-6 max-w-lg w-full z-10 relative space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#0d3a24]">
                  {isRTL ? "📢 إرسال رسالة جماعية (بث)" : "📢 Send Storewide Broadcast"}
                </h3>
                <p className="text-xs text-[#5f786c] mt-0.5">
                  {isRTL 
                    ? "أرسل تنبيهاً موحداً لجميع العملاء المسجلين دفعة واحدة." 
                    : "Send a notification to all registered customers at once."}
                </p>
              </div>
              <button
                disabled={sendingBroadcast}
                onClick={() => setShowBroadcastModal(false)}
                className="w-7 h-7 rounded-full bg-[#f4f5f1] hover:bg-[#e4ece7] flex items-center justify-center text-[#5f786c] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              {broadcastSuccess && (
                <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-200">
                  {broadcastSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5f786c]">
                  {isRTL ? "عنوان البث / العرض" : "Broadcast Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRTL ? "أدخل عنواناً جذاباً..." : "Enter an engaging title..."}
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-[#d4ded7] rounded-xl focus:outline-none focus:border-[#17583a] bg-white text-[#0d3a24]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#5f786c]">
                  {isRTL ? "نص الرسالة" : "Message Content"}
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={isRTL ? "اكتب تفاصيل العرض أو الرسالة هنا..." : "Type the offer or announcement details here..."}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-[#d4ded7] rounded-xl focus:outline-none focus:border-[#17583a] bg-white text-[#0d3a24] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={sendingBroadcast}
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:bg-[#fafbf9]"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastBody.trim()}
                  className="px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingBroadcast ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isRTL ? "جاري الإرسال جماعياً..." : "Sending broadcast..."}</span>
                    </>
                  ) : (
                    <>
                      <span>📢</span>
                      <span>{isRTL ? "إرسال للبث" : "Send Broadcast"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
