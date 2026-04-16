import Link from "next/link";

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
              { type: "Plants", emoji: "🌿", href: "/shop?type=plant" },
              { type: "Pots",   emoji: "🏺", href: "/shop?type=pot"   },
              { type: "Soil",   emoji: "🪨", href: "/shop?type=soil"  },
              { type: "Vitamins",emoji: "⚗️",href: "/shop?type=vitamin" },
              { type: "Accessories",emoji:"🔧",href: "/shop?type=accessory" },
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careGuides.map(guide => (
            <div key={guide.id} className={`rounded-2xl border p-6 ${guide.color} card-hover`}>
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

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <h2 className="text-2xl font-heading font-bold text-[#0d3a24]">Need personalised advice?</h2>
          <p className="mt-2 text-sm text-[#5f786c]">Our plant care experts are available via live chat to answer your questions.</p>
          <Link href="/shop" className="inline-block mt-6 px-8 py-3.5 bg-[#17583a] text-white text-sm font-bold rounded-full hover:bg-[#195b36] transition-colors">
            Shop with Smart Care
          </Link>
        </div>
      </div>
    </div>
  );
}
