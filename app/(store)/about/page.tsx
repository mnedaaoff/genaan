import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story | Genaan",
  description: "Learn about Genaan's journey to bring smart plants to the digital era.",
};

async function fetchPageContent(key: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/page-contents/${key}`, {
      next: { revalidate: 3600 }, // cache 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const content = await fetchPageContent("our-story");

  const title    = content?.title || "Our Story";
  const body     = content?.body  || null;
  const subtitle = content?.meta?.subtitle ||
    "The genesis of Genaan was rooted in a simple idea: how can we seamlessly integrate nature into our modern, digital, and fast-paced lives?";

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-5xl md:text-6xl font-black font-heading text-[#0d3a24] tracking-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-[#17583a]/80 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-24 w-full">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
          {content?.meta?.hero_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.meta.hero_image}
              alt="Our Story"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0d3a24] to-[#4ecb71] opacity-90">
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">The Seed of Innovation</h3>
                <p className="text-white/80 text-sm">Founded in 2026, redefining botanical commerce.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8 text-[#17583a]/90 leading-relaxed font-medium">
          {body ? (
            <div
              className="prose prose-green max-w-none"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <>
              <p>
                We realized that despite the technological advancements surrounding us, humanity always gravitates back towards the organic, the living, the green. But plant care often seemed inaccessible, requiring time and knowledge that many lacked.
              </p>
              <p>
                Genaan was born out of a desire to bridge this gap. We combine smart, automated care tracking with premium, aesthetic indoor plants, transforming the way you interact with nature. Every plant is carefully curated, arriving with smart care instructions adapted for your specific environment.
              </p>
            </>
          )}
          <div className="pt-6 border-t border-[#17583a]/20">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-[#e8f3ec] flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#0d3a24] mb-1">Sustainable Growth</h4>
                <p className="text-sm">Driven by an ethos of sustainability and mindful organic practices.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#e8f3ec] rounded-3xl p-10 md:p-16 text-center w-full shadow-inner">
        <h2 className="text-3xl font-black font-heading text-[#0d3a24] mb-4">Join Our Journey</h2>
        <p className="max-w-xl mx-auto text-[#17583a] mb-8">
          Become a part of the Genaan ecosystem. Discover the joy of smart plants and let&apos;s grow a greener future together.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[#17583a] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#0d3a24] transition-colors shadow-lg shadow-[#17583a]/30"
        >
          Explore Collection
        </Link>
      </div>
    </div>
  );
}
