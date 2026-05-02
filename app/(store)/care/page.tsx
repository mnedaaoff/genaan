"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { plantCareRequests } from "../../lib/api";

const careGuides = [
  {
    id: 1, icon: "💧", title: "Watering Guide",
    summary: "Learn the art of consistent watering — neither too much nor too little.",
    tips: ["Check soil moisture 2 inches deep before watering", "Water thoroughly until it drains from the bottom", "Reduce frequency in winter when growth slows", "Use room-temperature water whenever possible"],
    frequency: "Every 7–14 days",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: 2, icon: "☀️", title: "Light Requirements",
    summary: "Match your plant to the right light conditions for thriving growth.",
    tips: ["Rotate pots quarterly for even growth", "South-facing windows offer the most light", "Sheer curtains diffuse harsh midday sun", "Grow lights work well for low-light spaces"],
    frequency: "Assess seasonally",
    color: "bg-amber-50 border-amber-200",
  },
  {
    id: 3, icon: "🌡️", title: "Temperature & Humidity",
    summary: "Most houseplants thrive in 15–24°C with moderate humidity.",
    tips: ["Keep plants away from heating vents and drafts", "Group plants together to raise local humidity", "Mist tropical plants in dry winter air", "A pebble tray with water boosts humidity naturally"],
    frequency: "Monitor year-round",
    color: "bg-orange-50 border-orange-200",
  },
  {
    id: 4, icon: "🌱", title: "Fertilising",
    summary: "Feed your plants the right nutrients during the growing season.",
    tips: ["Fertilise monthly from spring through summer", "Never fertilise a dry or stressed plant", "Half-strength liquid fertiliser is preferred", "Stop feeding in autumn and winter"],
    frequency: "Monthly (spring–summer)",
    color: "bg-green-50 border-green-200",
  },
  {
    id: 5, icon: "🪴", title: "Repotting",
    summary: "Know when and how to give your plant a new home.",
    tips: ["Repot when roots emerge from drainage holes", "Spring is the ideal time to repot", "Use well-draining soil specific to the plant type", "Water thoroughly after repotting to reduce stress"],
    frequency: "Every 1–2 years",
    color: "bg-[#e8f3ec] border-[#b4d9c5]",
  },
  {
    id: 6, icon: "🐛", title: "Pests & Problems",
    summary: "Identify and treat common plant pests before they spread.",
    tips: ["Inspect undersides of leaves regularly", "Isolate new plants for 2 weeks before mixing", "Neem oil spray works for most pests", "Yellow leaves often indicate overwatering"],
    frequency: "Weekly inspection",
    color: "bg-red-50 border-red-200",
  },
];

export default function CarePage() {
  const [message, setMessage]      = useState("");
  const [image, setImage]          = useState<File | null>(null);
  const [imagePreview, setPreview] = useState<string | null>(null);
  const [loading, setLoading]      = useState(false);
  const [success, setSuccess]      = useState(false);
  const [error, setError]          = useState("");
  const fileRef                    = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { setError("الرجاء كتابة وصف المشكلة."); return; }
    setLoading(true);
    setError("");
    try {
      await plantCareRequests.submit(message, image ?? undefined);
      setSuccess(true);
      setMessage("");
      setImage(null);
      setPreview(null);
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ، يرجى المحاولة مجددًا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f1]">
      {/* Header */}
      <div className="bg-white border-b border-[#e4ece7]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-12">
          <p className="text-xs tracking-[0.2em] font-semibold text-[#6a8377] uppercase mb-2">Smart Botany</p>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-[#0d3a24]">Plant Care Guides</h1>
          <p className="mt-3 text-sm text-[#5f786c] max-w-md">Everything you need to know to keep your indoor plants healthy, happy, and thriving.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-10">
        {/* Quick care by plant type */}
        <div className="mb-12 p-7 bg-white rounded-3xl shadow-sm">
          <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-5">Find Care by Plant Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { type: "Plants",      emoji: "🌿", href: "/shop?type=plant" },
              { type: "Pots",        emoji: "🏺", href: "/shop?type=pot" },
              { type: "Soil",        emoji: "🪨", href: "/shop?type=soil" },
              { type: "Vitamins",    emoji: "⚗️", href: "/shop?type=vitamin" },
              { type: "Accessories", emoji: "🔧", href: "/shop?type=accessory" },
            ].map(t => (
              <Link
                key={t.type}
                href={t.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e4ece7] hover:border-[#17583a] hover:bg-[#e8f3ec] transition-colors group"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-xs font-semibold text-[#5f786c] group-hover:text-[#17583a]">{t.type}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Care guides */}
        <h2 className="text-2xl font-heading font-bold text-[#0d3a24] mb-6">Essential Care Guides</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {careGuides.map(guide => (
            <div key={guide.id} className={`rounded-2xl border p-6 ${guide.color}`}>
              <div className="text-3xl mb-3">{guide.icon}</div>
              <h3 className="text-lg font-heading font-bold text-[#0d3a24]">{guide.title}</h3>
              <p className="mt-2 text-sm text-[#5f786c] leading-6">{guide.summary}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-white/80">
                <span className="text-[10px] font-semibold text-[#5f786c] uppercase tracking-wide">Frequency:</span>
                <span className="text-xs font-bold text-[#0d3a24]">{guide.frequency}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#5f786c]">
                    <span className="text-[#17583a] mt-0.5 flex-shrink-0">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Ask Our Experts ───────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#e8f3ec] flex items-center justify-center mx-auto mb-4 text-2xl">🌿</div>
              <h2 className="text-2xl font-heading font-black text-[#0d3a24] mb-2">Ask Our Plant Experts</h2>
              <p className="text-sm text-[#5f786c]">
                Upload a photo of your plant and describe the problem — our team will respond within 24 hours.
              </p>
            </div>

            {success ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="w-16 h-16 bg-[#e8f3ec] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 className="font-bold text-[#0d3a24] text-xl mb-2">تم الإرسال بنجاح!</h3>
                <p className="text-[#5f786c] text-sm mb-6">سيتواصل معك فريقنا في أقرب وقت.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors"
                >
                  إرسال سؤال آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-2">
                    Plant Photo (Optional)
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-[#d4ded7] rounded-xl p-6 text-center hover:border-[#17583a] hover:bg-[#f4f9f6] transition-colors"
                  >
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="Preview" className="mx-auto h-40 object-contain rounded-lg" />
                    ) : (
                      <div className="text-[#8aab99]">
                        <svg className="mx-auto mb-2 w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                        </svg>
                        <p className="text-sm font-semibold">Click to upload photo</p>
                        <p className="text-xs mt-1">JPEG, PNG, WebP — max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {image && (
                    <button
                      type="button"
                      onClick={() => { setImage(null); setPreview(null); }}
                      className="mt-2 text-xs text-red-500 hover:underline"
                    >
                      Remove photo
                    </button>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-2">
                    Describe the Problem *
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    placeholder="e.g. My Monstera's leaves are turning yellow and drooping. I water it every week..."
                    className="w-full px-4 py-3 rounded-xl border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a] resize-none"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full py-3.5 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending...</>
                  ) : (
                    <>Send to Expert 🌿</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
