"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { useI18n } from "../../lib/i18n-context";
import { supabase } from "../../lib/supabase";

export function Navbar() {
  const { itemCount, openCart } = useCart();
  const { user, logout } = useAuth();
  const { t, lang, setLang, isRTL } = useI18n();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Scroll-aware transparency — only on home page
  const [scrolled, setScrolled] = useState(!isHome);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return; // fixed on all non-home pages
    setScrolled(false);
    const hero = document.querySelector("section") as HTMLElement | null;
    const threshold = hero?.offsetHeight ?? window.innerHeight * 0.85;
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
  }, [isHome]);

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadNotificationsCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);

        if (!error && count !== null) {
          setUnreadNotificationsCount(count);
        }
      } catch (err) {
        console.warn("Failed to fetch unread notifications count:", err);
      }
    };

    fetchUnreadCount();

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <>
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
            <Link href="/journal" className={`hover:text-[#17583a] transition-colors ${!scrolled && "hover:text-white"}`}>{t.nav.journal}</Link>
            <Link href="/spaces" className={`hover:text-[#17583a] transition-colors ${!scrolled && "hover:text-white"}`}>{t.nav.spaces}</Link>
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

            {/* Notifications Bell */}
            {user && (
              <Link
                href="/account?tab=notifications"
                className={[
                  "relative w-10 h-10 flex items-center justify-center rounded-[6px] transition-colors",
                  scrolled ? "hover:bg-[#f4f5f1] text-[#0d3a24]" : "text-white hover:bg-white/10",
                ].join(" ")}
                aria-label={isRTL ? "الإشعارات" : "Notifications"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                  </span>
                )}
              </Link>
            )}

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

            {/* Hamburger mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={[
                "md:hidden w-10 h-10 flex items-center justify-center rounded-[6px] transition-colors",
                scrolled ? "hover:bg-[#f4f5f1] text-[#0d3a24]" : "text-white hover:bg-white/10",
              ].join(" ")}
              aria-label="Toggle Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={[
          "fixed inset-0 z-50 transition-opacity duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#0d3a24]/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

        {/* Drawer content */}
        <div
          className={[
            "absolute top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] p-6",
            isRTL ? "left-0" : "right-0",
            mobileMenuOpen ? "translate-x-0" : (isRTL ? "-translate-x-full" : "translate-x-full"),
          ].join(" ")}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Close button */}
          <div className="flex items-center justify-between mb-8">
            <span className="font-heading font-black text-xl text-[#0d3a24]">genaan</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f4f5f1] text-[#0d3a24] hover:bg-[#e4ece7]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-4 text-base font-semibold text-[#5f786c]">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#17583a] py-2 border-b border-[#f4f5f1] flex items-center justify-between"
            >
              <span>{t.nav.shop}</span>
              <i className="fa-solid fa-chevron-right text-xs text-[#8aab99] rtl:rotate-180" />
            </Link>
            <Link
              href="/journal"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#17583a] py-2 border-b border-[#f4f5f1] flex items-center justify-between"
            >
              <span>{t.nav.journal}</span>
              <i className="fa-solid fa-chevron-right text-xs text-[#8aab99] rtl:rotate-180" />
            </Link>
            <Link
              href="/spaces"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#17583a] py-2 border-b border-[#f4f5f1] flex items-center justify-between"
            >
              <span>{t.nav.spaces}</span>
              <i className="fa-solid fa-chevron-right text-xs text-[#8aab99] rtl:rotate-180" />
            </Link>
          </nav>

          {/* Mobile specific controls (Language switcher, Cart, Auth) */}
          <div className="mt-auto pt-6 border-t border-[#e4ece7] space-y-4">
            {/* Lang switch */}
            <button
              onClick={() => {
                setLang(lang === "en" ? "ar" : "en");
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#f4f5f1] text-[#0d3a24] font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-language text-base" />
                {lang === "en" ? "العربية" : "English"}
              </span>
              <span className="text-xs text-[#8aab99]">{lang === "en" ? "AR" : "EN"}</span>
            </button>

            {/* Notifications trigger (only if logged in) */}
            {user && (
              <Link
                href="/account?tab=notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#f4f5f1] text-[#0d3a24] font-bold text-sm"
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {isRTL ? "الإشعارات" : "Notifications"}
                </span>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart trigger */}
            <button
              onClick={() => {
                openCart();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#e8f3ec] text-[#17583a] font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-bag-shopping" />
                {t.nav.cart}
              </span>
              {itemCount > 0 && (
                <span className="bg-[#17583a] text-white text-[10px] px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f4f5f1] text-[#0d3a24] font-semibold text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-[#17583a] flex items-center justify-center text-white text-[10px] font-bold">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  {user.name}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 text-sm text-red-600 font-semibold"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-3 bg-[#17583a] text-white rounded-xl font-bold text-sm"
              >
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
