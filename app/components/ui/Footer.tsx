"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";

const FOOTER_LINKS = {
  shop: [
    { labelKey: "plants", href: "/shop?type=plant" },
    { labelKey: "pots", href: "/shop?type=pot" },
    { labelKey: "care", href: "/care" },
  ],
  about: [
    { labelKey: "our_story", href: "/about" },
    { labelKey: "journal", href: "/journal" },
  ],
  support: [
    { labelKey: "contact", href: "/contact" },
    { labelKey: "faq", href: "/faq" },
    { labelKey: "shipping", href: "/shipping" },
  ],
};

export function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0d3a24] text-white mt-20">
      <div className="mx-auto max-w-[1200px] px-5 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
                </svg>
              </div>
              <span className="font-heading font-black text-2xl text-white tracking-tight">genaan</span>
            </Link>
            <p className="text-[#a8c7b6] text-sm leading-7 mb-6 max-w-xs">
              {t.footer.newsletter_subtitle}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-[#4ecb71] text-sm font-semibold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                {t.footer.subscribed}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.footer.email_placeholder}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-[#5f9a7a] text-sm focus:outline-none focus:border-white/30"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-[#0d3a24] text-sm font-bold rounded-xl hover:bg-[#e8f3ec] transition-colors shrink-0"
                >
                  {t.footer.subscribe}
                </button>
              </form>
            )}
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#5f9a7a] mb-5">{t.footer.shop}</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.shop.map(l => (
                <li key={l.labelKey}>
                  <Link href={l.href} className="text-[#a8c7b6] text-sm hover:text-white transition-colors">
                    {t.footer[l.labelKey as keyof typeof t.footer]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Support */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#5f9a7a] mb-5">{t.footer.about}</h4>
            <ul className="space-y-3 mb-8">
              {FOOTER_LINKS.about.map(l => (
                <li key={l.labelKey}>
                  <Link href={l.href} className="text-[#a8c7b6] text-sm hover:text-white transition-colors">
                    {t.footer[l.labelKey as keyof typeof t.footer]}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#5f9a7a] mb-5">{t.footer.support}</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map(l => (
                <li key={l.labelKey}>
                  <Link href={l.href} className="text-[#a8c7b6] text-sm hover:text-white transition-colors">
                    {t.footer[l.labelKey as keyof typeof t.footer]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#5f9a7a]">
          <p>© {new Date().getFullYear()} genaan. {t.footer.rights}</p>
          <div className="flex items-center gap-4">
            {/* Social icons */}
            {[
              { label: "Instagram", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z" },
              { label: "TikTok", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.24 6.24 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.14a4.85 4.85 0 01-1-.45z" },
            ].map(s => (
              <a key={s.label} href="#" aria-label={s.label} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={s.path}/></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
