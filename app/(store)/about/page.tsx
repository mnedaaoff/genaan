"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";
import { supabase } from "../../lib/supabase";

interface StoryContent {
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  image: string;
}

const DEFAULTS: StoryContent = {
  title_en: "Our Story",
  title_ar: "قصتنا",
  body_en: `We realized that despite the technological advancements surrounding us, humanity always gravitates back towards the organic, the living, the green. But plant care often seemed inaccessible, requiring time and knowledge that many lacked.

Genaan was born out of a desire to bridge this gap. We combine smart, automated care tracking with premium, aesthetic indoor plants, transforming the way you interact with nature. Every plant is carefully curated, arriving with smart care instructions adapted for your specific environment.`,
  body_ar: `أدركنا أنه على الرغم من التطور التكنولوجي من حولنا، يميل الإنسان دائمًا نحو الطبيعة، نحو الأخضر والحياة. لكن العناية بالنباتات كثيرًا ما بدت أمرًا صعبًا يتطلب وقتًا ومعرفةً لا يمتلكهما الكثيرون.

وُلدت جنان من رغبة في سد هذه الفجوة. نجمع بين تتبع العناية الذكي ونباتات داخلية متميزة وجميلة، لنغير الطريقة التي تتفاعل بها مع الطبيعة. كل نبتة مختارة بعناية، وتصلك مع تعليمات عناية ذكية مصممة لبيئتك الخاصة.`,
  image: "",
};

export default function AboutPage() {
  const { lang, isRTL } = useI18n();
  const [content, setContent] = useState<StoryContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStory() {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", [
          "our_story_title_en",
          "our_story_title_ar",
          "our_story_body_en",
          "our_story_body_ar",
          "our_story_image",
        ]);

      if (data && data.length > 0) {
        const map: Record<string, string> = {};
        data.forEach((row: any) => { if (row.value) map[row.key] = row.value; });
        setContent({
          title_en: map["our_story_title_en"] || DEFAULTS.title_en,
          title_ar: map["our_story_title_ar"] || DEFAULTS.title_ar,
          body_en:  map["our_story_body_en"]  || DEFAULTS.body_en,
          body_ar:  map["our_story_body_ar"]  || DEFAULTS.body_ar,
          image:    map["our_story_image"]    || DEFAULTS.image,
        });
      }
      setLoading(false);
    }
    loadStory();
  }, []);

  const title = lang === "ar" ? content.title_ar : content.title_en;
  const body  = lang === "ar" ? content.body_ar  : content.body_en;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f4f5f1]">
        <div className="w-10 h-10 border-4 border-[#e4ece7] border-t-[#17583a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="flex flex-col items-center justify-center py-20 px-4 md:px-8 max-w-5xl mx-auto"
    >
      {/* Hero heading */}
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-5xl md:text-6xl font-black font-heading text-[#0d3a24] tracking-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-[#17583a]/80 max-w-2xl mx-auto leading-relaxed">
          {lang === "ar"
            ? "نشأت جنان من فكرة بسيطة: كيف يمكننا دمج الطبيعة بسلاسة في حياتنا الرقمية والعصرية المتسارعة؟"
            : "The genesis of Genaan was rooted in a simple idea: how can we seamlessly integrate nature into our modern, digital, and fast-paced lives?"}
        </p>
      </div>

      {/* Story grid */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-24 w-full">
        {/* Image column */}
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
          {content.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0d3a24] to-[#4ecb71] opacity-90">
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {lang === "ar" ? "بذرة الابتكار" : "The Seed of Innovation"}
                </h3>
                <p className="text-white/80 text-sm">
                  {lang === "ar"
                    ? "تأسست عام 2026، نُعيد تعريف تجارة النباتات."
                    : "Founded in 2026, redefining botanical commerce."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Body column */}
        <div className="space-y-6 text-[#17583a]/90 leading-relaxed font-medium">
          {body.split("\n\n").map((para, i) => (
            <p key={i} className="text-base leading-8">
              {para}
            </p>
          ))}

          <div className="pt-6 border-t border-[#17583a]/20">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-[#e8f3ec] flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#0d3a24] mb-1">
                  {lang === "ar" ? "النمو المستدام" : "Sustainable Growth"}
                </h4>
                <p className="text-sm">
                  {lang === "ar"
                    ? "مدفوعون بأخلاقيات الاستدامة والممارسات العضوية الواعية."
                    : "Driven by an ethos of sustainability and mindful organic practices."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="bg-[#e8f3ec] rounded-3xl p-10 md:p-16 text-center w-full shadow-inner">
        <h2 className="text-3xl font-black font-heading text-[#0d3a24] mb-4">
          {lang === "ar" ? "انضم إلى رحلتنا" : "Join Our Journey"}
        </h2>
        <p className="max-w-xl mx-auto text-[#17583a] mb-8">
          {lang === "ar"
            ? "كن جزءًا من منظومة جنان. اكتشف متعة النباتات الذكية ولنبنِ معًا مستقبلًا أكثر خضرةً."
            : "Become a part of the Genaan ecosystem. Discover the joy of smart plants and let's grow a greener future together."}
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[#17583a] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#0d3a24] transition-colors shadow-lg shadow-[#17583a]/30"
        >
          {lang === "ar" ? "استكشف المجموعة" : "Explore Collection"}
        </Link>
      </div>
    </div>
  );
}
