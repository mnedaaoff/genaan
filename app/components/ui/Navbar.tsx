"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { useI18n } from "../../lib/i18n-context";

export function Navbar() {
  const { itemCount, openCart } = useCart();
  const { user, logout } = useAuth();
  const { t, lang, setLang, isRTL } = useI18n();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Scroll-aware transparency — only on home page
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) return; // fixed on all non-home pages
    setScrolled(false);
    const hero = document.querySelector("section") as HTMLElement | null;
    const threshold = hero?.offsetHeight ?? window.innerHeight * 0.85;
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur border-b border-[#e4ece7] shadow-sm"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      {/* Always LTR: logo on left, actions on right — only nav links flip */}
      <div dir="ltr" className="mx-auto max-w-[1200px] px-5 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/assets/icon.png"
            alt="Genaan logo"
            width={40}
            height={40}
            className={["object-contain transition-all duration-300", !scrolled ? "brightness-[1.55] saturate-[0.7]" : ""].join(" ")}
          />
          <span
            className={[
              "text-xl tracking-tight transition-colors duration-300",
              scrolled ? "text-[#0d3a24]" : "text-white drop-shadow",
            ].join(" ")}
            style={{ fontFamily: "var(--font-fugaz), sans-serif" }}
          >
            genaan
          </span>
        </Link>

        {/* Nav links */}
        <nav
          dir={isRTL ? "rtl" : "ltr"}
          className={[
            "hidden md:flex items-center gap-6 text-sm font-medium transition-colors duration-300",
            scrolled ? "text-[#5f786c]" : "text-white/90",
          ].join(" ")}
        >
          <Link href="/shop" className={`hover:text-[#17583a] transition-colors ${!scrolled && "hover:text-white"}`}>{t.nav.shop}</Link>
          <Link href="/journal" className={`hover:text-[#17583a] transition-colors ${!scrolled && "hover:text-white"}`}>Journal</Link>
          <Link href="/spaces" className={`hover:text-[#17583a] transition-colors ${!scrolled && "hover:text-white"}`}>Spaces</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language toggle — rounded-[6px] */}
          <button
            id="lang-toggle"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-bold transition-colors",
              scrolled
                ? "text-[#5f786c] hover:text-[#17583a]"
                : "text-white hover:text-white/80",
            ].join(" ")}
            title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
          >
            <i className="fa-solid fa-language text-sm" />
            {lang === "en" ? "AR" : "EN"}
          </button>

          {/* Cart */}
          <button
            id="cart-btn"
            onClick={openCart}
            className={[
              "relative w-10 h-10 flex items-center justify-center rounded-[6px] transition-colors",
              scrolled ? "hover:bg-[#f4f5f1] text-[#0d3a24]" : "text-white hover:bg-white/10",
            ].join(" ")}
            aria-label={t.nav.cart}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#17583a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <div className="relative group hidden md:block">
              <button
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-[6px] text-sm font-semibold transition-colors",
                  scrolled ? "bg-[#f4f5f1] text-[#0d3a24] hover:bg-[#e4ece7]" : "bg-white/15 text-white hover:bg-white/25",
                ].join(" ")}
              >
                <div className="w-6 h-6 rounded-full bg-[#17583a] flex items-center justify-center text-white text-[10px] font-bold">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                {user.name?.split(" ")[0]}
              </button>
              <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-[#e4ece7]">
                <Link href="/account" className="block px-4 py-2.5 text-sm text-[#0d3a24] hover:bg-[#f4f5f1]">{t.nav.account}</Link>
                <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">{t.nav.logout}</button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              id="login-btn"
              className={[
                "hidden md:flex items-center gap-2 px-4 py-2 rounded-[6px] text-sm font-semibold transition-colors",
                scrolled
                  ? "bg-[#17583a] text-white hover:bg-[#195b36]"
                  : "bg-white/15 text-white border border-white/50 hover:bg-white/25",
              ].join(" ")}
            >
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
