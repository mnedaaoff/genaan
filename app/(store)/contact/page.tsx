"use client";

import { useEffect, useState } from "react";
import { settings as settingsApi, contactMessages } from "../../lib/api";

export default function ContactPage() {
  const [info, setInfo] = useState({
    contact_phone:    "",
    contact_email:    "",
    contact_address:  "",
    contact_whatsapp: "",
    social_instagram: "",
    social_facebook:  "",
    social_twitter:   "",
    social_tiktok:    "",
  });

  const [form, setForm]       = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res: any = await settingsApi.get();
        const map = Array.isArray(res)
          ? res.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
          : res;
        setInfo(prev => ({ ...prev, ...map }));
      } catch {}
      finally { setInfoLoading(false); }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("الرجاء ملء الحقول المطلوبة.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await contactMessages.submit(form);
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ. يرجى المحاولة مجددًا.");
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
    <div className="min-h-screen bg-[#f4f5f1]">
      {/* Header */}
      <div className="bg-[#17583a] py-16 px-5 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">Contact Us</h1>
        <p className="text-[#a8c7b6] max-w-md mx-auto text-sm">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
      </div>

      <div className="mx-auto max-w-[1100px] px-5 py-12 grid md:grid-cols-[1fr_400px] gap-8">
        {/* Left — Contact Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">Send a Message</h2>

          {success ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 bg-[#e8f3ec] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="font-bold text-[#0d3a24] text-xl mb-2">Message Sent!</h3>
              <p className="text-[#5f786c] text-sm mb-6">We&apos;ll get back to you within 24 hours.</p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ahmed Mohamed"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Email *</label>
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
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Phone</label>
                  <input
                    type="tel"
                    placeholder="+20 100 000 0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Subject</label>
                  <input
                    type="text"
                    placeholder="Order inquiry, plant care..."
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a] resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending...</>
                  : "Send Message →"
                }
              </button>
            </form>
          )}
        </div>

        {/* Right — Contact Info */}
        <div className="space-y-6">
          {/* Info Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-[#0d3a24]">Get in Touch</h2>
            {infoLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-[#f4f5f1] rounded-xl animate-pulse"/>)}
              </div>
            ) : (
              <div className="space-y-3">
                {info.contact_email && (
                  <a href={`mailto:${info.contact_email}`} className="flex items-center gap-3 p-3.5 bg-[#f4f9f6] rounded-xl hover:bg-[#e8f3ec] transition-colors group">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8aab99] uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-[#0d3a24] group-hover:text-[#17583a]">{info.contact_email}</p>
                    </div>
                  </a>
                )}
                {info.contact_phone && (
                  <a href={`tel:${info.contact_phone}`} className="flex items-center gap-3 p-3.5 bg-[#f4f9f6] rounded-xl hover:bg-[#e8f3ec] transition-colors group">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8aab99] uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-medium text-[#0d3a24] group-hover:text-[#17583a]">{info.contact_phone}</p>
                    </div>
                  </a>
                )}
                {info.contact_address && (
                  <div className="flex items-center gap-3 p-3.5 bg-[#f4f9f6] rounded-xl">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8aab99] uppercase tracking-wider">Address</p>
                      <p className="text-sm font-medium text-[#0d3a24]">{info.contact_address}</p>
                    </div>
                  </div>
                )}
                {info.contact_whatsapp && (
                  <a href={`https://wa.me/${info.contact_whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3.5 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                    <span className="text-xl">💬</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8aab99] uppercase tracking-wider">WhatsApp</p>
                      <p className="text-sm font-medium text-[#0d3a24] group-hover:text-green-700">Chat with us</p>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Social Links */}
          {socials.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-heading font-bold text-[#0d3a24] mb-4">Follow Us</h3>
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
              🏡 Looking for interior design advice?
            </p>
            <a
              href="/spaces"
              className="inline-block px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors"
            >
              Design Your Space →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
