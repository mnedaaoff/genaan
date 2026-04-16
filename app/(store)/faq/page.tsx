"use client";

import { useState } from "react";

const FAQ_DATA = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "How fast do you ship?",
        a: "We process and ship orders within 1-2 business days. Delivery typically takes 3-5 business days depending on your location. Expedited shipping options are available at checkout."
      },
      {
        q: "Do you ship internationally?",
        a: "Currently, our smart plants and botanical products are only available within the United States to ensure they arrive fresh and pristine."
      },
      {
        q: "What if my plant arrives damaged?",
        a: "We guarantee that your plant will arrive in happy, healthy condition. If your plant arrives damaged, please contact us within 48 hours of delivery with photos of the plant and packaging, and we’ll send a replacement."
      }
    ]
  },
  {
    category: "Plant Care",
    questions: [
      {
        q: "Are the plants easy to care for?",
        a: "Absolutely! Genaan specializes in making plant ownership effortless. Every plant comes with specific care instructions, and our smart app integration will notify you exactly when to water and fertilize."
      },
      {
        q: "What is a 'Smart Plant'?",
        a: "A 'Smart Plant' refers to our ecosystem where each plant is paired with our digital platform. By scanning the QR code on the pot, you instantly access tailored care logs, watering reminders, and growth tracking."
      }
    ]
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "Due to the living nature of our products, we do not accept returns on live plants. However, non-living items like pots, accessories, and tools can be returned within 30 days of receipt in their original condition."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<{cat: number, q: number} | null>({cat: 0, q: 0});

  const toggleQuestion = (catIndex: number, qIndex: number) => {
    if (openIndex?.cat === catIndex && openIndex?.q === qIndex) {
      setOpenIndex(null);
    } else {
      setOpenIndex({cat: catIndex, q: qIndex});
    }
  };

  return (
    <div className="py-20 px-5 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black font-heading text-[#0d3a24] tracking-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-[#17583a]/70">
          Everything you need to know about Genaan, our products, and our services.
        </p>
      </div>

      <div className="space-y-12">
        {FAQ_DATA.map((category, catIndex) => (
          <div key={catIndex}>
            <h2 className="text-2xl font-bold text-[#0d3a24] mb-6 pb-2 border-b-2 border-[#e8f3ec] inline-block font-heading">
              {category.category}
            </h2>
            <div className="space-y-4">
              {category.questions.map((faq, qIndex) => {
                const isOpen = openIndex?.cat === catIndex && openIndex?.q === qIndex;
                return (
                  <div 
                    key={qIndex} 
                    className={`border border-[#17583a]/10 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-[#e8f3ec]/50 shadow-md shadow-[#17583a]/5' : 'bg-white hover:border-[#17583a]/20'}`}
                  >
                    <button 
                      className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                      onClick={() => toggleQuestion(catIndex, qIndex)}
                    >
                      <span className="font-bold text-[#0d3a24] pr-4">{faq.q}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-[#17583a] text-white rotate-180' : 'bg-gray-100 text-[#17583a]'}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </button>
                    <div 
                      className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <p className="text-[#17583a]/80 leading-relaxed text-sm md:text-base">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div className="mt-20 bg-gradient-to-br from-[#0d3a24] to-[#17583a] rounded-3xl p-10 text-center text-white">
        <h3 className="text-2xl font-bold font-heading mb-3">Still have questions?</h3>
        <p className="text-[#a8c7b6] mb-8 max-w-md mx-auto">
          Can't find the answer you're looking for? Please chat to our friendly team.
        </p>
        <a href="/contact" className="inline-block px-8 py-3 bg-white text-[#0d3a24] font-bold rounded-xl hover:bg-gray-100 transition-colors">
          Get in Touch
        </a>
      </div>
    </div>
  );
}
