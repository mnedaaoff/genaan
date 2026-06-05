"use client";

import Image from "next/image";
import { useI18n } from "../../lib/i18n-context";

const STATS = [
  { key: "stat1" as const, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "stat2" as const, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"    },
  { key: "stat3" as const, icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14"             },
];

export function InnovationSection() {
  const { t, lang } = useI18n();

  return (
    <section className="py-14 grid gap-12 md:grid-cols-2 items-center">
      {/* Image collage */}
      <div className="relative">
        <div className="rounded-2xl overflow-hidden shadow-xl h-80">
          <Image
            src="/assets/smart_humidifier_pot.png"
            alt={t.innovation.badge}
            width={900} height={600}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        {/* Floating card */}
        <div className="absolute -bottom-5 -end-5 bg-white rounded-2xl p-4 shadow-lg max-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#e8f3ec] flex items-center justify-center text-[#17583a]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22a7 7 0 007-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 007 7z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#0d3a24]">{lang === "ar" ? "ترطيب وتعطير" : "Aroma & Mist"}</span>
          </div>
          <p className="text-[11px] text-[#8aab99] leading-4">
            {lang === "ar" 
              ? "أصيص نبات ذكي بجهاز ترطيب مدمج بالزيوت العطرية" 
              : "Built-in humidifier that diffuses gentle scented mist"}
          </p>
        </div>
      </div>

      {/* Text */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e8f3ec] rounded-full mb-5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="2.5">
            <path d="M12 22a7 7 0 007-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 007 7z" />
          </svg>
          <p className="text-[11px] tracking-[0.15em] font-bold text-[#17583a] uppercase">{t.innovation.badge}</p>
        </div>

        <h2 className="text-3xl font-heading font-black text-[#0d3a24] leading-tight mb-5">
          {t.innovation.heading}
        </h2>

        <p className="text-sm leading-7 text-[#5f786c] mb-8">
          {t.innovation.body}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {STATS.map(({ key, icon }) => (
            <div key={key} className="bg-[#f4f5f1] rounded-2xl p-4 text-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="1.8" className="mx-auto mb-2">
                <path d={icon}/>
              </svg>
              <p className="text-xl font-heading font-black text-[#0d3a24]">{t.innovation[`${key}_val`]}</p>
              <p className="text-[10px] text-[#8aab99] mt-0.5">{t.innovation[`${key}_lbl`]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
