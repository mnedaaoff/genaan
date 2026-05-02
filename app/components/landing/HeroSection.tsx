"use client";

import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section
      className="relative w-full h-screen flex flex-col"
      style={{
        backgroundImage: "url('/assets/hero_image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Top announcement bar — sits below the fixed navbar */}
      <div className="relative z-10 w-full flex justify-center pt-20">
        <span className="text-white/90 text-xs font-medium tracking-wide bg-black/25 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
          Free Delivery on orders over 1500 EGP
        </span>
      </div>

      {/* Hero content — centered vertically */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5">
        <div className="max-w-3xl text-center text-white animate-fade-in">
          <h1
            className="mb-5 text-5xl md:text-7xl leading-[1.05] tracking-tight drop-shadow-lg"
            style={{ fontFamily: "var(--font-fugaz), sans-serif" }}
          >
            {t.hero.headline.split("\n").map((line: string, i: number) => (
              <span key={i}>
                {line}
                {i < t.hero.headline.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="mb-8 mx-auto max-w-lg text-sm md:text-base leading-7 text-white/85 drop-shadow font-medium italic">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-[#17583a] text-white text-sm font-semibold hover:bg-[#195b36] transition-colors shadow-lg"
            >
              {t.hero.cta_shop}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/care"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-white text-[#1a1a1a] text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Plant Care Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
