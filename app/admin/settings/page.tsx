"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { revalidateStorefrontCache } from "../../lib/revalidate-storefront";
import { CACHE_TAGS } from "../../lib/cache/tags";

interface FAQ { id: number; question: string | null; answer: string | null; sort_order: number; }
interface Setting { key: string; value: string | null; type: string; }

const SETTING_KEYS = (isRTL: boolean) => [
  { key: "contact_email",    label: isRTL ? "البريد الإلكتروني للتواصل" : "Contact Email",     icon: "📧", type: "email" },
  { key: "contact_phone",    label: isRTL ? "الهاتف / واتساب" : "Phone / WhatsApp",  icon: "📞", type: "text" },
  { key: "contact_address",  label: isRTL ? "العنوان" : "Address",           icon: "📍", type: "text" },
  { key: "contact_whatsapp", label: isRTL ? "رقم الواتساب" : "WhatsApp Number",   icon: "💬", type: "text" },
  { key: "social_instagram", label: isRTL ? "رابط إنستجرام" : "Instagram URL",     icon: "📸", type: "url" },
  { key: "social_facebook",  label: isRTL ? "رابط فيسبوك" : "Facebook URL",      icon: "📘", type: "url" },
  { key: "social_twitter",   label: isRTL ? "رابط تويتر/إكس" : "Twitter/X URL",     icon: "🐦", type: "url" },
  { key: "social_tiktok",    label: isRTL ? "رابط تيك توك" : "TikTok URL",        icon: "🎵", type: "url" },
  { key: "social_telegram",  label: isRTL ? "رابط تيليجرام" : "Telegram URL",      icon: "✈️", type: "url" },
  { key: "store_name",       label: isRTL ? "اسم المتجر" : "Store Name",        icon: "🏪", type: "text" },
  { key: "store_tagline",    label: isRTL ? "شعار المتجر" : "Store Tagline",     icon: "💬", type: "text" },
  { key: "our_story_title_en", label: isRTL ? "عنوان قصتنا (إنجليزي)" : "Our Story Title (English)", icon: "📖", type: "text" },
  { key: "our_story_title_ar", label: isRTL ? "عنوان قصتنا (عربي)" : "Our Story Title (Arabic)",  icon: "📖", type: "text" },
  { key: "our_story_body_en",  label: isRTL ? "نص قصتنا (إنجليزي)" : "Our Story Body (English)",  icon: "📝", type: "textarea" },
  { key: "our_story_body_ar",  label: isRTL ? "نص قصتنا (عربي)" : "Our Story Body (Arabic)",   icon: "📝", type: "textarea" },
  { key: "our_story_image",    label: isRTL ? "رابط صورة قصتنا" : "Our Story Image URL",       icon: "🖼️", type: "url" },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<"settings" | "faq">("settings");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [faqs, setFaqs]         = useState<FAQ[]>([]);
  const [loadingS, setLoadingS] = useState(true);
  const [loadingF, setLoadingF] = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [faqForm, setFaqForm]   = useState({ question: "", answer: "" });
  const [faqSaving, setFaqSaving] = useState(false);
  const [lang, setLang]         = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from("settings").select("key,value");
      if (data) {
        const map = data.reduce((acc: any, row: any) => ({ ...acc, [row.key]: row.value ?? "" }), {});
        setSettings(map);
      }
      setLoadingS(false);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    async function loadFaqs() {
      const { data } = await supabase.from("faqs").select("*").order("sort_order");
      setFaqs((data ?? []) as FAQ[]);
      setLoadingF(false);
    }
    loadFaqs();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        if (!key) continue;
        await supabase.from("settings").upsert({ key, value, type: "string", updated_at: new Date().toISOString() }, { onConflict: "key" });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await revalidateStorefrontCache(CACHE_TAGS.settings);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const addFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    setFaqSaving(true);
    const { data } = await supabase.from("faqs").insert({ question: faqForm.question.trim(), answer: faqForm.answer.trim(), sort_order: faqs.length }).select().single();
    if (data) setFaqs(prev => [...prev, data as FAQ]);
    setFaqForm({ question: "", answer: "" });
    setFaqSaving(false);
    await revalidateStorefrontCache(CACHE_TAGS.settings);
  };

  const deleteFaq = async (id: number) => {
    await supabase.from("faqs").delete().eq("id", id);
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#0d3a24] placeholder-[#8aab99] focus:outline-none focus:ring-2 focus:ring-[#17583a] transition-all";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "الإعدادات" : "Settings"}</h1>
        <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "إعدادات المتجر والأسئلة الشائعة" : "Store settings, social links, FAQ and our story"}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-[#f0f2ee] w-fit">
        {[
          { key: "settings", label: isRTL ? "⚙️ إعدادات المتجر" : "⚙️ Store Settings" },
          { key: "faq",      label: isRTL ? "❓ الأسئلة الشائعة" : "❓ FAQ" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.key ? "bg-[#0d3a24] text-white" : "text-[#5f786c] hover:text-[#0d3a24]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Settings tab */}
      {tab === "settings" && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6">
          {loadingS ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-[#f0f2ee] rounded-xl animate-pulse"/>)}</div>
          ) : (
            <div className="space-y-5">
              {SETTING_KEYS(isRTL).map(sk => (
                <div key={sk.key}>
                  <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">
                    {sk.icon} {sk.label}
                  </label>
                  {sk.type === "textarea" ? (
                    <textarea rows={4} value={settings[sk.key] ?? ""} onChange={e => setSettings(s => ({ ...s, [sk.key]: e.target.value }))}
                      className={`${inp} resize-none`}/>
                  ) : (
                    <input type={sk.type} value={settings[sk.key] ?? ""} onChange={e => setSettings(s => ({ ...s, [sk.key]: e.target.value }))}
                      placeholder={sk.type === "url" ? "https://..." : ""} className={inp}/>
                  )}
                </div>
              ))}
              <div className="pt-4 flex items-center gap-3">
                <button onClick={saveSettings} disabled={saving}
                  className="px-8 py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-bold hover:bg-[#17583a] transition-colors disabled:opacity-50 shadow-sm">
                  {saving ? (isRTL ? "جارٍ الحفظ..." : "Saving…") : (isRTL ? "✓ حفظ الإعدادات" : "✓ Save Settings")}
                </button>
                {saved && <span className="text-sm text-green-600 font-semibold">✓ {isRTL ? "تم الحفظ" : "Saved!"}</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ tab */}
      {tab === "faq" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add FAQ form */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6">
            <h2 className="font-bold text-[#0d3a24] mb-4 text-sm">➕ {isRTL ? "إضافة سؤال جديد" : "Add New FAQ"}</h2>
            <form onSubmit={addFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "السؤال *" : "Question *"}</label>
                <input type="text" required value={faqForm.question} onChange={e => setFaqForm(f => ({ ...f, question: e.target.value }))}
                  placeholder={isRTL ? "السؤال الشائع" : "Frequently asked question"} className={inp}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "الإجابة *" : "Answer *"}</label>
                <textarea rows={4} required value={faqForm.answer} onChange={e => setFaqForm(f => ({ ...f, answer: e.target.value }))}
                  placeholder={isRTL ? "الإجابة التفصيلية" : "Detailed answer"} className={`${inp} resize-none`}/>
              </div>
              <button type="submit" disabled={faqSaving}
                className="w-full py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-bold hover:bg-[#17583a] transition-colors disabled:opacity-50">
                {faqSaving ? "…" : (isRTL ? "✓ إضافة" : "✓ Add FAQ")}
              </button>
            </form>
          </div>

          {/* FAQ list */}
          <div className="space-y-3">
            {loadingF ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse"/>)}</div>
            ) : faqs.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-[#f0f2ee]">
                <p className="text-3xl mb-2">❓</p>
                <p className="text-[#8aab99] text-sm">{isRTL ? "لا توجد أسئلة شائعة بعد" : "No FAQs yet"}</p>
              </div>
            ) : (
              faqs.map((faq, idx) => (
                <div key={faq.id} className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-[#0d3a24] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{idx + 1}</span>
                        <div>
                          <p className="font-semibold text-[#0d3a24] text-sm mb-1">{faq.question}</p>
                          <p className="text-xs text-[#5f786c] leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteFaq(faq.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold flex-shrink-0">
                      {isRTL ? "حذف" : "Del"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
