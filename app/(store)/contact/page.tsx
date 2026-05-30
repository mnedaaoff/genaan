"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useI18n } from "../../lib/i18n-context";

import { useAuth } from "../../lib/auth-context";

export default function ContactPage() {
  const { lang, isRTL } = useI18n();
  const { user } = useAuth();

  const [info, setInfo] = useState({
    contact_phone: "", contact_email: "", contact_address: "",
    contact_whatsapp: "", social_instagram: "", social_facebook: "",
    social_twitter: "", social_tiktok: "",
  });

  const [form, setForm]     = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState("");
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from("settings").select("key,value");
      if (data) {
        const map = data.reduce((acc: any, row: any) => ({ ...acc, [row.key]: row.value }), {});
        setInfo(prev => ({ ...prev, ...map }));
      }
      setInfoLoading(false);
    }
    loadSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachedFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError(isRTL ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const uploadedUrls: string[] = [];
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const ext = file.name.split(".").pop();
          const path = `consultations/attachment-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from("spaces").upload(path, file, { upsert: true });
          if (uploadErr) {
            throw new Error(isRTL
              ? `فشل رفع المرفقات: ${uploadErr.message}. تأكد من تفعيل الصلاحية العامة للرفع (Public Insert Policy) على Supabase.`
              : `Failed to upload attachments: ${uploadErr.message}. Make sure Public Insert Policy is enabled for bucket 'spaces'.`);
          }
          const { data: urlData } = supabase.storage.from("spaces").getPublicUrl(path);
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      let finalMessage = form.message;
      if (uploadedUrls.length > 0) {
        finalMessage += `\n\n||IMAGE_URLS:${uploadedUrls.join(",")}||`;
      }

      const payload: any = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: `Subject: ${form.subject || (lang === "ar" ? "عام" : "General")}\n\n${finalMessage}`,
        status: "pending",
      };

      if (user?.id) {
        payload.user_id = user.id;
      }

      let { error: insertErr } = await supabase.from("consultations").insert(payload);
      if (insertErr && insertErr.message.includes("column \"user_id\"")) {
        delete payload.user_id;
        const retry = await supabase.from("consultations").insert(payload);
        insertErr = retry.error;
      }
      if (insertErr) throw new Error(insertErr.message);

      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setAttachedFiles([]);
      setPreviews([]);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const socials = [
    { key: "social_instagram", label: "Instagram", icon: "📸", color: "hover:bg-pink-50 hover:border-pink-300" },
    { key: "social_facebook",  label: "Facebook",  icon: "📘", color: "hover:bg-blue-50 hover:border-blue-300" },
    { key: "social_tiktok",    label: "TikTok",    icon: "🎵", color: "hover:bg-slate-50 hover:border-slate-300" },
    { key: "social_twitter",   label: "Twitter",   icon: "🐦", color: "hover:bg-sky-50 hover:border-sky-300" },
    { key: "contact_whatsapp", label: "WhatsApp",  icon: "💬", color: "hover:bg-green-50 hover:border-green-300" },
  ].filter(s => info[s.key as keyof typeof info]);

  return (
    <div className="min-h-screen bg-[#f4f5f1]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[#17583a] py-16 px-5 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
          {isRTL ? "اتصل بنا" : "Contact Us"}
        </h1>
        <p className="text-[#a8c7b6] max-w-md mx-auto text-sm">
          {isRTL
            ? "يسعدنا تواصلك معنا. أرسل لنا رسالة وسنقوم بالرد عليك في أقرب وقت ممكن."
            : "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
        </p>
      </div>

      <div className="mx-auto max-w-[1100px] px-5 py-12 grid md:grid-cols-[1fr_400px] gap-8">
        {/* Left — Contact Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">
            {isRTL ? "أرسل رسالة" : "Send a Message"}
          </h2>

          {success ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 bg-[#e8f3ec] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="font-bold text-[#0d3a24] text-xl mb-2">
                {isRTL ? "تم الإرسال بنجاح!" : "Message Sent!"}
              </h3>
              <p className="text-[#5f786c] text-sm mb-6">
                {isRTL ? "سنقوم بالرد عليك خلال 24 ساعة." : "We'll get back to you within 24 hours."}
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors"
              >
                {isRTL ? "إرسال رسالة أخرى" : "Send Another"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">
                    {isRTL ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRTL ? "مثال: أحمد محمد" : "e.g. John Doe"}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">
                    {isRTL ? "البريد الإلكتروني *" : "Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">
                    {isRTL ? "الهاتف" : "Phone"}
                  </label>
                  <input
                    type="tel"
                    placeholder="+20 100 000 0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">
                    {isRTL ? "الموضوع" : "Subject"}
                  </label>
                  <input
                    type="text"
                    placeholder={isRTL ? "استفسار عن طلب، تصميم مساحة..." : "Order inquiry, space design..."}
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">
                  {isRTL ? "الرسالة *" : "Message *"}
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={isRTL ? "كيف يمكننا مساعدتك..." : "Tell us how we can help..."}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a] resize-none"
                />
              </div>

              {/* Space Images Upload */}
              <div className="bg-[#f4faf7] rounded-xl p-4 border border-[#e4ece7]">
                <label className="block text-xs font-bold text-[#0d3a24] mb-1">
                  {isRTL ? "صور المساحة (اختياري)" : "Space Images (Optional)"}
                </label>
                <p className="text-[10px] text-[#5f786c] mb-3">
                  {isRTL ? "أرفق صورًا لمساحتك لمساعدتنا في تصميمها واختيار النباتات المناسبة" : "Attach photos of your space to help us design it"}
                </p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {previews.map((url, i) => (
                    <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#d4ded7]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 border-2 border-dashed border-[#d4ded7] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#17583a] transition-colors">
                    <span className="text-xl text-[#8aab99]">+</span>
                    <span className="text-[8px] text-[#8aab99] font-semibold">{isRTL ? "إضافة" : "Add"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {isRTL ? "جاري الإرسال..." : "Sending..."}
                  </>
                ) : (
                  isRTL ? "إرسال الرسالة ←" : "Send Message →"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right — Contact Info */}
        <div className="space-y-6">
          {/* Info Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-[#0d3a24]">
              {isRTL ? "معلومات التواصل" : "Get in Touch"}
            </h2>
            {infoLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-[#f4f5f1] rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {info.contact_email && (
                  <a href={`mailto:${info.contact_email}`} className="flex items-center gap-3 p-3.5 bg-[#f4f9f6] rounded-xl hover:bg-[#e8f3ec] transition-colors group">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8aab99] uppercase tracking-wider">{isRTL ? "البريد الإلكتروني" : "Email"}</p>
                      <p className="text-sm font-medium text-[#0d3a24] group-hover:text-[#17583a]">{info.contact_email}</p>
                    </div>
                  </a>
                )}
                {info.contact_phone && (
                  <a href={`tel:${info.contact_phone}`} className="flex items-center gap-3 p-3.5 bg-[#f4f9f6] rounded-xl hover:bg-[#e8f3ec] transition-colors group">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8aab99] uppercase tracking-wider">{isRTL ? "الهاتف" : "Phone"}</p>
                      <p className="text-sm font-medium text-[#0d3a24] group-hover:text-[#17583a]">{info.contact_phone}</p>
                    </div>
                  </a>
                )}
                {info.contact_address && (
                  <div className="flex items-center gap-3 p-3.5 bg-[#f4f9f6] rounded-xl">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8aab99] uppercase tracking-wider">{isRTL ? "العنوان" : "Address"}</p>
                      <p className="text-sm font-medium text-[#0d3a24]">{info.contact_address}</p>
                    </div>
                  </div>
                )}
                {info.contact_whatsapp && (
                  <a href={`https://wa.me/${info.contact_whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3.5 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                    <span className="text-xl">💬</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8aab99] uppercase tracking-wider">WhatsApp</p>
                      <p className="text-sm font-medium text-[#0d3a24] group-hover:text-green-700">{isRTL ? "تحدث معنا" : "Chat with us"}</p>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Social Links */}
          {socials.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-heading font-bold text-[#0d3a24] mb-4">
                {isRTL ? "تابعنا على" : "Follow Us"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {socials.map(s => (
                  <a
                    key={s.key}
                    href={info[s.key as keyof typeof info]}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-2 p-3 rounded-xl border border-[#e4ece7] transition-colors text-sm font-semibold text-[#5f786c] ${s.color}`}
                  >
                    <span>{s.icon}</span>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Space Design CTA */}
          <div className="bg-[#e8f3ec] rounded-2xl p-6">
            <p className="text-sm font-medium text-[#17583a] mb-3">
              {isRTL ? "🏡 تبحث عن إلهام لتصميم مساحتك؟" : "🏡 Looking for interior design advice?"}
            </p>
            <a
              href="/spaces"
              className="inline-block px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors"
            >
              {isRTL ? "تصفح مساحاتنا ←" : "Design Your Space →"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
