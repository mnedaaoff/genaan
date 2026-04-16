"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";

const COMMUNITY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=600&q=80", alt: "Plant shelfie" },
  { src: "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=600&q=80", alt: "Home jungle" },
  { src: "https://images.unsplash.com/photo-1442315625053-0768ac882ced?auto=format&fit=crop&w=600&q=80", alt: "Workspace plants" },
  { src: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80", alt: "Plant lover" },
];

export function CommunitySection() {
  const { t } = useI18n();

  return (
    <section className="py-14">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e8f3ec] rounded-full mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 100 8 4 4 0 000-8z"/></svg>
          <p className="text-[11px] tracking-[0.18em] font-bold text-[#17583a] uppercase">{t.community.badge}</p>
        </div>
        <h2 className="text-3xl font-heading font-black text-[#0d3a24]">{t.community.heading}</h2>
        <p className="mt-3 text-sm text-[#5f786c]">{t.community.subtitle}</p>
      </div>

      {/* Image mosaic */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {COMMUNITY_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`rounded-2xl overflow-hidden ${i % 2 === 1 ? "mt-6" : ""} bg-[#f0f2ee]`}
          >
            <div className="relative h-52">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"/>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/spaces"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0d3a24] text-white text-sm font-semibold hover:bg-[#17583a] transition-colors shadow-sm"
        >
          {t.community.cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </section>
  );
}
