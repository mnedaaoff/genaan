"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Consultation {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
  user_id?: string | null;
}

const STATUS_COLORS = {
  pending:     "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved:    "bg-green-100 text-green-700",
};

export default function AdminMessagesPage() {
  const [messages, setMessages]   = useState<Consultation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Consultation | null>(null);
  const [lang, setLang]           = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.warn("Messages error:", error.message);
      setMessages((data ?? []) as Consultation[]);
      setSelected(prev => {
        if (!prev || !data) return null;
        return data.find((d: any) => d.id === prev.id) || null;
      });
      setLoading(false);
    }
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await supabase.from("consultations").update({ status }).eq("id", id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: status as any } : m));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as any } : null);
  };

  const handleSendNotification = async (recipientEmail: string | null, recipientUserId: string | null | undefined, name: string | null) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      let finalUserId = recipientUserId;
      if (!finalUserId && recipientEmail) {
        // Fallback: look up profile by email
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", recipientEmail)
          .maybeSingle();
        if (profileData) {
          finalUserId = profileData.id;
        }
      }

      if (!finalUserId) {
        alert(isRTL ? "عذراً، هذا المستخدم ليس لديه حساب مسجل بالبريد الإلكتروني المذكور." : "Sorry, this user doesn't have a registered account with this email.");
        return;
      }

      const { error } = await supabase.from("notifications").insert({
        user_id: finalUserId,
        title: isRTL ? `رد على رسالتك / استفسارك` : `Reply to your message / inquiry`,
        message: replyText.trim(),
        is_read: false,
      });

      if (error) throw error;
      alert(isRTL ? "تم إرسال الرد كإشعار للمستخدم بنجاح!" : "Reply sent as a notification to the user successfully!");
      setReplyText("");
    } catch (err: any) {
      alert(isRTL ? `فشل إرسال الإشعار: ${err.message}` : `Failed to send notification: ${err.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  const AR_STATUS: Record<string, string> = {
    pending: "معلق", in_progress: "قيد المعالجة", resolved: "تم الحل",
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "الرسائل والاستفسارات" : "Messages & Inquiries"}</h1>
        <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "استفسارات العملاء" : "Customer consultations"}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden lg:col-span-1">
          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-[#f0f2ee] rounded animate-pulse"/>)}</div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center text-[#8aab99] text-sm">💬 {isRTL ? "لا توجد رسائل" : "No messages"}</div>
          ) : (
            <div className="divide-y divide-[#f4f5f1] overflow-y-auto max-h-[600px]">
              {messages.map(msg => (
                <button key={msg.id} onClick={() => setSelected(msg)}
                  className={`w-full text-start px-4 py-3.5 hover:bg-[#f4faf7] transition-colors ${selected?.id === msg.id ? "bg-[#e8f3ec]" : ""}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#0d3a24] truncate">{msg.name || "—"}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[msg.status]}`}>
                      {isRTL ? AR_STATUS[msg.status] : msg.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#5f786c] truncate">{msg.message}</p>
                  <p className="text-[10px] text-[#8aab99] mt-1">{new Date(msg.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6 lg:col-span-2">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-[#8aab99] text-sm py-20">
              {isRTL ? "اختر رسالة لعرضها" : "Select a message to view"}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-[#0d3a24] text-lg">{selected.name}</h2>
                  <p className="text-xs text-[#5f786c]">{selected.email} {selected.phone && `• ${selected.phone}`}</p>
                  <p className="text-[10px] text-[#8aab99]">{new Date(selected.created_at).toLocaleString(isRTL ? "ar-EG" : "en-GB")}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={e => updateStatus(selected.id, e.target.value)}
                  className="text-xs border border-[#d4ded7] rounded-lg px-3 py-1.5 bg-[#f4f5f1] text-[#0d3a24] focus:outline-none focus:ring-1 focus:ring-[#17583a]"
                >
                  <option value="pending">{isRTL ? "معلق" : "Pending"}</option>
                  <option value="in_progress">{isRTL ? "قيد المعالجة" : "In Progress"}</option>
                  <option value="resolved">{isRTL ? "تم الحل" : "Resolved"}</option>
                </select>
              </div>
              <div className="bg-[#f4f5f1] rounded-xl p-5 text-sm text-[#163e2b] leading-relaxed whitespace-pre-wrap">
                {parseMessage(selected.message).text}
              </div>

              {/* Attachments */}
              {parseMessage(selected.message).images.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#0d3a24] mb-2 uppercase tracking-wide">
                    {isRTL ? "الصور المرفقة للمساحة" : "Attached Space Images"}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {parseMessage(selected.message).images.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#d4ded7] hover:opacity-85 transition-opacity"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Notification Form */}
              <div className="border-t border-[#f0f2ee] pt-5 mt-3 space-y-2">
                <label className="block text-xs font-bold text-[#0d3a24] uppercase tracking-wide">
                  {isRTL ? "الرد بإشعار للمستخدم" : "Send Reply Notification"}
                </label>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={isRTL ? "اكتب ردك هنا..." : "Write your response..."}
                  className="w-full min-h-[80px] p-3 text-xs border border-[#d4ded7] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#17583a] bg-[#f4f5f1] text-[#0d3a24] resize-y"
                />
                <button
                  onClick={() => handleSendNotification(selected.email, selected.user_id, selected.name)}
                  disabled={sendingReply || !replyText.trim()}
                  className="px-4 py-2 bg-[#17583a] text-white rounded-xl text-xs font-semibold hover:bg-[#195b36] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingReply ? (isRTL ? "جاري الإرسال..." : "Sending...") : (isRTL ? "إرسال الإشعار" : "Send Notification")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function parseMessage(msg: string | null) {
  if (!msg) return { text: "", images: [] };
  const match = msg.match(/\|\|IMAGE_URLS:(.*?)\|\|/);
  if (match) {
    const urls = match[1].split(",").filter(Boolean);
    const text = msg.replace(/\|\|IMAGE_URLS:.*?\|\|/, "").trim();
    return { text, images: urls };
  }
  return { text: msg, images: [] };
}
