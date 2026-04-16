"use client";

import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { useI18n } from "../../lib/i18n-context";

export function Navbar() {
  const { itemCount, openCart } = useCart();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#e4ece7]">
      <div className="mx-auto max-w-[1200px] px-5 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#17583a] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
            </svg>
          </div>
          <span className="font-heading font-black text-xl text-[#0d3a24] tracking-tight">genaan</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5f786c]">
          <Link href="/shop" className="hover:text-[#17583a] transition-colors">{t.nav.shop}</Link>
          <Link href="/journal" className="hover:text-[#17583a] transition-colors">Journal</Link>
          <Link href="/spaces" className="hover:text-[#17583a] transition-colors">Spaces</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            id="lang-toggle"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#d4ded7] text-xs font-bold text-[#5f786c] hover:border-[#17583a] hover:text-[#17583a] transition-colors"
            title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            {lang === "en" ? "AR" : "EN"}
          </button>

          {/* Cart */}
          <button
            id="cart-btn"
            onClick={openCart}
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f4f5f1] transition-colors text-[#0d3a24]"
            aria-label={t.nav.cart}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
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
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f5f1] text-sm font-semibold text-[#0d3a24] hover:bg-[#e4ece7] transition-colors">
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
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#17583a] text-white text-sm font-semibold hover:bg-[#195b36] transition-colors"
            >
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
