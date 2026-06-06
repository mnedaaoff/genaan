"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { revalidateStorefrontCache } from "../../lib/revalidate-storefront";
import { CACHE_TAGS } from "../../lib/cache/tags";
import { getAdminAuthHeaders } from "../../lib/admin-auth";

interface FAQ { id: number; question: string | null; answer: string | null; sort_order: number; }
interface Setting { key: string; value: string | null; type: string; }
interface Section { id: number; slug: string; name_en: string; name_ar: string; }

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
  const [tab, setTab] = useState<"settings" | "faq" | "footer" | "subadmins">("settings");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [faqs, setFaqs]         = useState<FAQ[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [footerSectionIds, setFooterSectionIds] = useState<number[]>([]);
  const [loadingS, setLoadingS] = useState(true);
  const [loadingF, setLoadingF] = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [faqForm, setFaqForm]   = useState({ question: "", answer: "" });
  const [faqSaving, setFaqSaving] = useState(false);
  const [footerSaving, setFooterSaving] = useState(false);
  const [lang, setLang]         = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";

  // Subadmins tab states
  const [subadmins, setSubadmins] = useState<any[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [subForm, setSubForm] = useState({
    email: "", password: "", first_name: "", last_name: "", phone: "",
    permissions: [] as string[]
  });
  const [subError, setSubError] = useState("");
  const [subSuccess, setSubSuccess] = useState("");
  const [subSaving, setSubSaving] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);

  const AVAILABLE_PERMISSIONS = [
    { key: "orders", en: "Orders", ar: "الطلبات" },
    { key: "messages", en: "Messages & Inquiries", ar: "الرسائل والاستفسارات" },
    { key: "products", en: "Product Catalog", ar: "كتالوج المنتجات" },
    { key: "blog", en: "Blog posts", ar: "المدونة" },
    { key: "settings", en: "Settings & System", ar: "الإعدادات والنظام" },
  ];

  const fetchSubadmins = async () => {
    setLoadingSub(true);
    setSubError("");
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch("/api/admin/subadmins", { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch subadmins");
      setSubadmins(json.subadmins || []);
    } catch (err: any) {
      setSubError(err.message);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    if (tab === "subadmins") {
      fetchSubadmins();
    }
  }, [tab]);

  const handleCreateSubadmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubSaving(true);
    setSubError("");
    setSubSuccess("");
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch("/api/admin/subadmins", {
        method: "POST",
        headers,
        body: JSON.stringify(subForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create subadmin");
      
      setSubSuccess(isRTL ? "✓ تم إنشاء حساب المشرف الفرعي بنجاح!" : "✓ Subadmin account created successfully!");
      setSubForm({ email: "", password: "", first_name: "", last_name: "", phone: "", permissions: [] });
      setShowSubForm(false);
      fetchSubadmins();
    } catch (err: any) {
      setSubError(err.message);
    } finally {
      setSubSaving(false);
    }
  };

  const handleDeleteSubadmin = async (id: string) => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذا المشرف؟" : "Are you sure you want to delete this subadmin?")) return;
    setSubError("");
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch(`/api/admin/subadmins?id=${id}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete subadmin");
      fetchSubadmins();
    } catch (err: any) {
      setSubError(err.message);
    }
  };

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
        // Load footer section ids from settings
        if (map.footer_shop_sections) {
          try { setFooterSectionIds(JSON.parse(map.footer_shop_sections)); } catch {}
        }
      }
      setLoadingS(false);
    }
    loadSettings();

    async function loadSections() {
      const { data } = await supabase
        .from("homepage_sections")
        .select("id, slug, name_en, name_ar")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setSections(data as Section[]);
    }
    loadSections();
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

  const saveFooterSections = async () => {
    if (footerSectionIds.length !== 3) {
      alert(isRTL ? "يجب اختيار 3 أقسام بالضبط" : "Please select exactly 3 sections");
      return;
    }
    setFooterSaving(true);
    await supabase.from("settings").upsert(
      { key: "footer_shop_sections", value: JSON.stringify(footerSectionIds), type: "json", updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    await revalidateStorefrontCache(CACHE_TAGS.settings);
    setFooterSaving(false);
    alert(isRTL ? "✓ تم حفظ أقسام الفوتر" : "✓ Footer sections saved!");
  };

  const toggleFooterSection = (id: number) => {
    setFooterSectionIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
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
          { key: "footer",   label: isRTL ? "🔗 أقسام الفوتر"  : "🔗 Footer Sections" },
          { key: "faq",      label: isRTL ? "❓ الأسئلة الشائعة" : "❓ FAQ" },
          { key: "subadmins", label: isRTL ? "👥 المشرفين الفرعيين" : "👥 Subadmins" },
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

      {/* Footer Sections tab */}
      {tab === "footer" && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6">
          <h2 className="font-bold text-[#0d3a24] mb-2">{isRTL ? "أقسام Shop في الفوتر" : "Shop Sections in Footer"}</h2>
          <p className="text-sm text-[#5f786c] mb-5">
            {isRTL
              ? "اختر 3 أقسام بالضبط لإظهارها في قائمة Shop بالفوتر"
              : "Pick exactly 3 sections to show under Shop in the footer"}
          </p>
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold">
            <span className={footerSectionIds.length === 3 ? "text-green-600" : "text-amber-600"}>
              {footerSectionIds.length}/3 {isRTL ? "مختار" : "selected"}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {sections.map(sec => {
              const selected = footerSectionIds.includes(sec.id);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => toggleFooterSection(sec.id)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold text-start transition-all ${
                    selected
                      ? "border-[#17583a] bg-[#e8f3ec] text-[#0d3a24]"
                      : "border-[#d4ded7] bg-[#f4f5f1] text-[#5f786c] hover:border-[#17583a]"
                  }`}
                >
                  <span className="me-1">{selected ? "✓" : "○"}</span>
                  {isRTL ? sec.name_ar : sec.name_en}
                </button>
              );
            })}
          </div>
          <button
            onClick={saveFooterSections}
            disabled={footerSaving || footerSectionIds.length !== 3}
            className="px-8 py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-bold hover:bg-[#17583a] transition-colors disabled:opacity-50 shadow-sm"
          >
            {footerSaving ? (isRTL ? "جارٍ الحفظ..." : "Saving…") : (isRTL ? "✓ حفظ الفوتر" : "✓ Save Footer")}
          </button>
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

      {/* Subadmins tab */}
      {tab === "subadmins" && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-[#0d3a24]">{isRTL ? "المشرفين الفرعيين" : "Subadmins Management"}</h2>
              <p className="text-xs text-[#5f786c] mt-0.5">{isRTL ? "قم بإنشاء حسابات الموظفين وتحديد صلاحياتهم" : "Create subadmin staff accounts and manage their permissions"}</p>
            </div>
            {!showSubForm && (
              <button onClick={() => setShowSubForm(true)} className="px-4 py-2 bg-[#17583a] text-white rounded-xl text-xs font-bold hover:bg-[#195b36] transition-colors">
                + {isRTL ? "إضافة مشرف جديد" : "Add New Subadmin"}
              </button>
            )}
          </div>

          {subError && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">{subError}</div>}
          {subSuccess && <div className="p-3 bg-green-50 text-green-700 text-xs font-semibold rounded-xl border border-green-200">{subSuccess}</div>}

          {showSubForm && (
            <form onSubmit={handleCreateSubadmin} className="p-5 bg-[#fafbf9] border border-[#f0f2ee] rounded-2xl space-y-4 max-w-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xs text-[#0d3a24] uppercase tracking-wide">{isRTL ? "إنشاء حساب موظف جديد" : "New Subadmin Profile"}</h3>
                <button type="button" onClick={() => setShowSubForm(false)} className="text-[#8aab99] hover:text-[#0d3a24] text-xs">✕ {isRTL ? "إلغاء" : "Cancel"}</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#0d3a24] mb-1 uppercase tracking-wide">{isRTL ? "الاسم الأول" : "First Name"}</label>
                  <input type="text" value={subForm.first_name} onChange={e => setSubForm({...subForm, first_name: e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0d3a24] mb-1 uppercase tracking-wide">{isRTL ? "اسم العائلة" : "Last Name"}</label>
                  <input type="text" value={subForm.last_name} onChange={e => setSubForm({...subForm, last_name: e.target.value})} className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#0d3a24] mb-1 uppercase tracking-wide">{isRTL ? "البريد الإلكتروني *" : "Email *"}</label>
                  <input type="email" required value={subForm.email} onChange={e => setSubForm({...subForm, email: e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0d3a24] mb-1 uppercase tracking-wide">{isRTL ? "كلمة المرور *" : "Password *"}</label>
                  <input type="password" required minLength={6} value={subForm.password} onChange={e => setSubForm({...subForm, password: e.target.value})} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#0d3a24] mb-1 uppercase tracking-wide">{isRTL ? "الهاتف" : "Phone"}</label>
                <input type="text" value={subForm.phone} onChange={e => setSubForm({...subForm, phone: e.target.value})} className={inp} />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-2 uppercase tracking-wide">{isRTL ? "الصلاحيات المتاحة" : "Permissions List"}</label>
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#d4ded7]">
                  {AVAILABLE_PERMISSIONS.map(p => {
                    const checked = subForm.permissions.includes(p.key);
                    return (
                      <label key={p.key} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0d3a24] hover:text-[#17583a] py-1">
                        <input type="checkbox" checked={checked} onChange={e => {
                          const next = e.target.checked 
                            ? [...subForm.permissions, p.key]
                            : subForm.permissions.filter(x => x !== p.key);
                          setSubForm({...subForm, permissions: next});
                        }} className="rounded text-[#17583a] focus:ring-[#17583a]" />
                        <span>{isRTL ? p.ar : p.en}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={subSaving || !subForm.email || !subForm.password} className="px-6 py-2.5 bg-[#17583a] text-white rounded-xl text-xs font-bold hover:bg-[#195b36] transition-colors disabled:opacity-50 flex items-center gap-2">
                {subSaving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{isRTL ? "✓ حفظ الحساب" : "✓ Save Account"}</span>
              </button>
            </form>
          )}

          {loadingSub ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-14 bg-[#f0f2ee] rounded-xl animate-pulse" />)}</div>
          ) : subadmins.length === 0 ? (
            <div className="text-center py-10 bg-[#fafbf9] border border-dashed border-[#d4ded7] rounded-2xl">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-xs text-[#8aab99]">{isRTL ? "لا يوجد مشرفين فرعيين حالياً" : "No subadmins registered yet"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#f0f2ee] rounded-xl">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="bg-[#fafbf9] border-b border-[#f0f2ee] text-[10px] font-bold text-[#5f786c] uppercase tracking-wider">
                    <th className="px-4 py-2.5 text-start">{isRTL ? "الموظف" : "Staff Member"}</th>
                    <th className="px-4 py-2.5 text-start">{isRTL ? "البريد الإلكتروني" : "Email"}</th>
                    <th className="px-4 py-2.5 text-start">{isRTL ? "الصلاحيات" : "Permissions"}</th>
                    <th className="px-4 py-2.5 text-center">{isRTL ? "إجراء" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f5f1]">
                  {subadmins.map(s => {
                    const name = [s.first_name, s.last_name].filter(Boolean).join(" ") || "—";
                    return (
                      <tr key={s.id} className="hover:bg-[#fafbf9]">
                        <td className="px-4 py-3.5 font-bold text-[#0d3a24]">{name}</td>
                        <td className="px-4 py-3.5 text-[#5f786c]">{s.email}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {s.permissions && s.permissions.length > 0 ? (
                              s.permissions.map((pKey: string) => {
                                const pObj = AVAILABLE_PERMISSIONS.find(p => p.key === pKey);
                                return (
                                  <span key={pKey} className="px-2 py-0.5 rounded bg-[#e8f3ec] text-[#17583a] text-[10px] font-semibold uppercase tracking-wider">
                                    {pObj ? (isRTL ? pObj.ar : pObj.en) : pKey}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-red-500 italic">{isRTL ? "لا توجد صلاحيات" : "No permissions"}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button onClick={() => handleDeleteSubadmin(s.id)} className="text-red-500 hover:text-red-700 font-bold">
                            {isRTL ? "حذف" : "Delete"}
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
      )}
    </div>
  );
}
