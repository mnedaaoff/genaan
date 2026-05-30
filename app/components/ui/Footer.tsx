"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "../../lib/i18n-context";
import { supabase } from "../../lib/supabase";

export function Footer() {
  const { t, isRTL } = useI18n();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [socials, setSocials] = useState({
    instagram: "#",
    facebook: "#",
    whatsapp: "#",
    telegram: "#",
  });

  // Load social links from Supabase settings
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["social_instagram", "social_facebook", "contact_whatsapp", "social_telegram"]);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((row: any) => { if (row.value) map[row.key] = row.value; });
        setSocials({
          instagram: map["social_instagram"] || "#",
          facebook:  map["social_facebook"]  || "#",
          whatsapp:  map["contact_whatsapp"] ? `https://wa.me/${map["contact_whatsapp"].replace(/\D/g, "")}` : "#",
          telegram:  map["social_telegram"]  || "#",
        });
      }
    }
    loadSettings();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const shopLinks = [
    { label: t.footer.plants, href: "/shop?type=plant" },
    { label: t.footer.pots,   href: "/shop?type=pot"   },
    { label: t.footer.care,   href: "/care"            },
  ];

  const aboutLinks = [
    { label: t.footer.our_story, href: "/about"   },
    { label: t.footer.journal,   href: "/journal" },
  ];

  const supportLinks = [
    { label: t.footer.contact,  href: "/contact"  },
    { label: t.footer.faq,      href: "/faq"      },
    { label: t.footer.shipping, href: "/shipping" },
  ];

  const socialIcons = [
    { label: "Instagram", href: socials.instagram, src: "/assets/instagram.png" },
    { label: "WhatsApp",  href: socials.whatsapp,  src: "/assets/whatsapp.png"  },
    { label: "Facebook",  href: socials.facebook,  src: "/assets/fb.png"        },
  ];

  const paymentMethods = [
    { label: "Visa",       src: "/assets/visa.svg"       },
    { label: "Mastercard", src: "/assets/mastercard.svg" },
    { label: "Meeza",      src: "/assets/meeza.svg"      },
    { label: "VF Cash",    src: "/assets/vfcash.svg"     },
  ];

  return (
    <footer dir={isRTL ? "rtl" : "ltr"} className="bg-[#0d3a24] text-white mt-20">
      <div className="mx-auto max-w-[1200px] px-5 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <Image
                src="/assets/icon.png"
                alt="Genaan Logo"
                width={36}
                height={36}
                className="object-contain brightness-0 invert"
              />
              <span
                className="text-2xl text-white tracking-tight"
                style={{ fontFamily: "var(--font-fugaz), sans-serif" }}
              >
                genaan
              </span>
            </Link>
            <p className="text-[#a8c7b6] text-sm leading-7 mb-6">
              {t.footer.newsletter_subtitle}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialIcons.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={s.src}
                    alt={s.label}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#5f9a7a] mb-5">
              {t.footer.shop}
            </h4>
            <ul className="space-y-3">
              {shopLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#a8c7b6] text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#5f9a7a] mb-5">
              {t.footer.about}
            </h4>
            <ul className="space-y-3">
              {aboutLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#a8c7b6] text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#5f9a7a] mb-5">
              {t.footer.support}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#a8c7b6] text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Telegram */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#5f9a7a] mb-5">
              {t.footer.newsletter_title}
            </h4>
            <p className="text-[#a8c7b6] text-sm leading-6 mb-5">
              {t.footer.newsletter_subtitle}
            </p>
            {socials.telegram !== "#" ? (
              <a
                href={socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-fit hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/assets/telegram.svg"
                  alt="Telegram"
                  width={120}
                  height={36}
                  className="w-3/5 h-auto object-contain"
                />
              </a>
            ) : (
              <div className="text-[#5f9a7a] text-xs italic">
                {isRTL ? "أضف رابط تيليجرام من الإعدادات" : "Add Telegram link in Settings"}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#5f9a7a]">
          <p>© {new Date().getFullYear()} genaan. {t.footer.rights}</p>

          {/* Payment icons */}
          <div dir="ltr" className="flex items-center gap-3">
            {paymentMethods.map(p => (
              <div key={p.label} title={p.label}>
                <Image
                  src={p.src}
                  alt={p.label}
                  width={44}
                  height={28}
                  className="object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
