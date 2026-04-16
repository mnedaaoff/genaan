"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";

// Curated hero images cycling in a subtle parallax-like layout
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80",
];

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="py-10 md:py-14 grid items-center gap-8 md:grid-cols-2">
      {/* Text */}
      <div className="animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e8f3ec] rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#17583a] animate-pulse inline-block"/>
          <p className="text-[11px] tracking-[0.18em] font-bold text-[#17583a] uppercase">
            {t.hero.badge}
          </p>
        </div>

        <h1 className="mb-5 font-heading text-5xl md:text-6xl font-black leading-[0.95] text-[#0d3a24]">
          {t.hero.headline.split("\n").map((line, i) => (
            <span key={i}>{line}{i < t.hero.headline.split("\n").length - 1 && <br/>}</span>
          ))}
        </h1>

        <p className="mb-8 max-w-md text-sm leading-7 text-[#5f786c]">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#17583a] text-white text-sm font-semibold hover:bg-[#195b36] transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            {t.hero.cta_shop}
          </Link>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#d4ded7] bg-white text-sm font-semibold text-[#245640] hover:border-[#17583a] hover:text-[#17583a] transition-colors"
          >
            {t.hero.cta_journal}
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center gap-5 text-xs text-[#8aab99]">
          {[
            { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Free delivery 2,000+ EGP" },
            { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", text: "Expert plant care" },
            { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", text: "Secure checkout" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="2"><path d={b.icon}/></svg>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Image mosaic */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl overflow-hidden shadow-lg h-72">
          <Image
            src={HERO_IMAGES[0]}
            alt="Featured plant"
            width={600} height={760}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            priority
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg h-52 mt-10">
          <Image
            src={HERO_IMAGES[1]}
            alt="Plant collection"
            width={600} height={520}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </div>
    </section>
  );
}
