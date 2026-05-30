"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";

const COMMUNITY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=900&q=90",
    alt: "Lush indoor plant wall with trailing vines",
    user: "Nour A.",
    likes: 284,
    tag: { en: "Living Room", ar: "غرفة المعيشة" },
    span: "tall",
  },
  {
    src: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=90",
    alt: "Bright window with potted plants",
    user: "Layla M.",
    likes: 172,
    tag: { en: "Plant Corner", ar: "ركن النباتات" },
    span: "normal",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=90",
    alt: "Outdoor balcony garden",
    user: "Ahmed R.",
    likes: 319,
    tag: { en: "Balcony", ar: "الشرفة" },
    span: "normal",
  },
  {
    src: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=90",
    alt: "Collection of succulents on wooden shelf",
    user: "Mona T.",
    likes: 201,
    tag: { en: "Succulents", ar: "عصاريات" },
    span: "tall",
  },
  {
    src: "https://images.unsplash.com/photo-1493606278519-11aa9f86e40a?auto=format&fit=crop&w=800&q=90",
    alt: "Monstera and tropical plants in office",
    user: "Sara K.",
    likes: 143,
    tag: { en: "Workspace", ar: "مكتب" },
    span: "normal",
  },
  {
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=90",
    alt: "Minimalist bedroom with trailing pothos",
    user: "Reem H.",
    likes: 389,
    tag: { en: "Bedroom", ar: "غرفة النوم" },
    span: "normal",
  },
];

const STATS = [
  { value: "12K+", en: "Plant lovers", ar: "عاشق للنباتات" },
  { value: "4.8★", en: "Community rating", ar: "تقييم المجتمع" },
  { value: "850+", en: "Spaces shared", ar: "مساحة مشتركة" },
];

export function CommunitySection() {
  const { t, lang, isRTL } = useI18n();

  return (
    <section className="py-24 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Header ── */}
      <div className="text-center max-w-2xl mx-auto mb-14 px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#e8f3ec] to-[#d4ede0] rounded-full mb-6 shadow-sm border border-[#c4e0d0]">
          <span className="text-sm">🌿</span>
          <p className="text-[11px] tracking-[0.2em] font-bold text-[#17583a] uppercase">{t.community.badge}</p>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-[#0d3a24] leading-[1.1] mb-4">
          {t.community.heading}
        </h2>
        <p className="text-base md:text-lg text-[#5f786c] max-w-lg mx-auto leading-relaxed">
          {t.community.subtitle}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mt-10">
          {STATS.map((s, i) => (
            <div key={i} className="text-center group">
              <p className="text-2xl sm:text-3xl font-black text-[#17583a] tabular-nums group-hover:scale-110 transition-transform duration-200 inline-block">
                {s.value}
              </p>
              <p className="text-xs text-[#5f786c] mt-1 font-medium">{lang === "ar" ? s.ar : s.en}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gallery Grid ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div
          className="grid gap-3 sm:gap-4"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          {COMMUNITY_IMAGES.map((img, i) => {
            const isTall = img.span === "tall";
            return (
              <div
                key={i}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#e8f3ec] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                style={{
                  gridRow: isTall ? "span 2" : "span 1",
                  height: isTall ? "420px" : "196px",
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Permanent subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#0d3a24]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-400 backdrop-blur-[1px]" />

                {/* Tag badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#17583a] inline-block animate-pulse" />
                  <span className="text-[10px] font-bold text-[#0d3a24] uppercase tracking-wide">
                    {lang === "ar" ? img.tag.ar : img.tag.en}
                  </span>
                </div>

                {/* Bottom user info — always visible */}
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#17583a] to-[#2d7a55] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-md">
                      {img.user.charAt(0)}
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md flex-1 truncate">{img.user}</span>
                    {/* Like count */}
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <svg className="text-pink-300" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                      <span className="text-white text-[9px] font-semibold">{img.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="text-center mt-12 px-4">
        <Link
          href="/spaces"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-[#0d3a24] to-[#17583a] text-white text-sm font-bold hover:from-[#17583a] hover:to-[#2d7a55] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
        >
          <span className="text-base">🌱</span>
          {t.community.cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d={isRTL ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"}/>
          </svg>
        </Link>
      </div>
    </section>
  );
}
