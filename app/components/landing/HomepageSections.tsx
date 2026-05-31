"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";
import { supabase } from "../../lib/supabase";
import { homepageSectionDescription, homepageSectionLabel } from "../../lib/homepage-section-label";

interface HomepageSection {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  image?: string | null;
  sort_order: number;
}

const FALLBACK_ICONS: Record<string, string> = {
  plants: "🌿",
  landscape: "🏡",
  corporate_decor: "🏢",
  humidifier_plants: "💧",
  plant_decor: "🪴",
};

const CARD_WIDTH = 220;
const CARD_GAP = 16;
const SCROLL_STEP = CARD_WIDTH + CARD_GAP;

function SectionCard({ section, lang }: { section: HomepageSection; lang: "en" | "ar" }) {
  const title = homepageSectionLabel(section, lang);
  const desc = homepageSectionDescription(section, lang);

  return (
    <Link
      href={`/shop?section=${section.slug}`}
      className="group relative shrink-0 overflow-hidden rounded-2xl bg-white border border-[#e4ece7] shadow-sm hover:shadow-md hover:border-[#17583a]/30 transition-all"
      style={{ width: CARD_WIDTH }}
    >
      <div className="relative aspect-[4/3] bg-[#e8f3ec]">
        {section.image ? (
          <Image
            src={section.image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes={`${CARD_WIDTH}px`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {FALLBACK_ICONS[section.slug] ?? "🌱"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d3a24]/75 via-[#0d3a24]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <p className="text-sm font-bold leading-tight line-clamp-2">{title}</p>
          {desc && (
            <p className="text-[10px] text-white/80 mt-1 line-clamp-2">{desc}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function HomepageSections() {
  const { lang, isRTL } = useI18n();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("homepage_sections")
        .select("id, slug, name_en, name_ar, description_en, description_ar, image, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      setSections((data ?? []) as HomepageSection[]);
      setLoading(false);
    }
    load();
  }, []);

  const updateScrollButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    if (max <= 2) {
      setCanScrollBack(false);
      setCanScrollForward(false);
      return;
    }
    setCanScrollBack(el.scrollLeft > 4);
    setCanScrollForward(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [sections, updateScrollButtons]);

  const scrollByStep = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-36 shrink-0 rounded-2xl bg-[#e4ece7] animate-pulse" style={{ width: CARD_WIDTH }} />
          ))}
        </div>
      </section>
    );
  }

  if (sections.length === 0) return null;

  const showArrows = canScrollBack || canScrollForward;

  return (
    <section className="py-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] font-bold text-[#6a8377] uppercase mb-2">
          {lang === "ar" ? "تسوق حسب القسم" : "Shop by Department"}
        </p>
        <h2 className="text-2xl md:text-3xl font-heading font-black text-[#0d3a24]">
          {lang === "ar" ? "أقسامنا" : "Our Collections"}
        </h2>
      </div>

      <div className="relative">
        {showArrows && (
          <>
            <button
              type="button"
              aria-label={lang === "ar" ? "السابق" : "Previous"}
              onClick={() => scrollByStep(-1)}
              disabled={!canScrollBack}
              className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-[#e4ece7] shadow-md flex items-center justify-center text-[#17583a] transition-opacity disabled:opacity-0 disabled:pointer-events-none hover:bg-[#e8f3ec] ${isRTL ? "end-1" : "start-1"}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d={isRTL ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
              </svg>
            </button>
            <button
              type="button"
              aria-label={lang === "ar" ? "التالي" : "Next"}
              onClick={() => scrollByStep(1)}
              disabled={!canScrollForward}
              className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-[#e4ece7] shadow-md flex items-center justify-center text-[#17583a] transition-opacity disabled:opacity-0 disabled:pointer-events-none hover:bg-[#e8f3ec] ${isRTL ? "start-1" : "end-1"}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d={isRTL ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
              </svg>
            </button>
          </>
        )}

        <div
          ref={trackRef}
          dir="ltr"
          className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {sections.map(section => (
            <SectionCard key={section.id} section={section} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
