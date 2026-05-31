"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

// SVG icon components for sidebar
const Icons = {
  dashboard:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  products:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C7.37 17.4 9.25 14.58 12.34 13.17L13 16l6-4-4-5-.71 1z"/></svg>,
  orders:      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  customers:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  messages:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>,
  posts:       <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  coupons:     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-2.5 3.5l-1.5-.9-1.5.9.4-1.7-1.3-1.1 1.7-.1.7-1.6.7 1.6 1.7.1-1.3 1.1.4 1.7zM11 9H9V7h2v2zm0 4H9v-2h2v2zm0 4H9v-2h2v2z"/></svg>,
  categories:  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5S15.01 22 17.5 22s4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/></svg>,
  spaces:      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  settings:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  homepage:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
};

const NAV_ITEMS = [
  { href: "/admin",            icon: Icons.dashboard,  en: "Dashboard",   ar: "لوحة التحكم",    section: null },
  { href: "/admin/products",   icon: Icons.products,   en: "Products",    ar: "المنتجات",        section: "Catalog" },
  { href: "/admin/homepage",   icon: Icons.homepage,   en: "Homepage",    ar: "الصفحة الرئيسية", section: "Catalog" },
  { href: "/admin/orders",     icon: Icons.orders,     en: "Orders",      ar: "الطلبات",         section: "Sales" },
  { href: "/admin/coupons",    icon: Icons.coupons,    en: "Coupons",     ar: "الكوبونات",       section: "Sales" },
  { href: "/admin/customers",  icon: Icons.customers,  en: "Customers",   ar: "العملاء",         section: "People" },
  { href: "/admin/messages",   icon: Icons.messages,   en: "Messages",    ar: "الرسائل",         section: "People" },
  { href: "/admin/spaces",     icon: Icons.spaces,     en: "Spaces",      ar: "تصميم المساحات", section: "People" },
  { href: "/admin/posts",      icon: Icons.posts,      en: "Blog",        ar: "المدونة",         section: "Content" },
  { href: "/admin/settings",   icon: Icons.settings,   en: "Settings",    ar: "الإعدادات",       section: "System" },
];

const SECTIONS = ["Catalog", "Sales", "People", "Content", "System"];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [lang, setLang]           = useState<"en" | "ar">("en");
  const [adminEmail, setAdminEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking]   = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<{ name: string } | null>(null);

  // ── Always read stored lang ──────────────────────────────────────────────────
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("genaan_lang") : null;
    if (stored === "ar" || stored === "en") setLang(stored);
  }, []);

  // ── Unread messages count + real-time subscription ───────────────────────────
  useEffect(() => {
    if (pathname === "/admin/login") return;

    // Load initial unread count
    supabase
      .from("consultations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setUnreadCount(count ?? 0));

    // Real-time: listen for new consultations
    const channel = supabase
      .channel("consultations-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "consultations" }, (payload) => {
        setUnreadCount(prev => prev + 1);
        setToast({ name: (payload.new as any).name ?? "Someone" });
        setTimeout(() => setToast(null), 4000);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "consultations" }, () => {
        // Recount on status updates
        supabase
          .from("consultations")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .then(({ count }) => setUnreadCount(count ?? 0));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pathname]);

  // ── Auth check — skip entirely if we're on the login page ───────────────────
  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);   // nothing to check
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;

      // No session → go to login
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      // Check is_admin from BOTH user_metadata AND app_metadata
      // (raw_app_meta_data → app_metadata, raw_user_meta_data → user_metadata)
      const userMeta = session.user.user_metadata ?? {};
      const appMeta  = session.user.app_metadata  ?? {};
      let isAdmin =
        userMeta.is_admin === true || userMeta.role === "admin" ||
        appMeta.is_admin  === true || appMeta.role  === "admin";

      if (!isAdmin) {
        const { data: profile, error: dbErr } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (!dbErr && profile?.is_admin === true) {
          isAdmin = true;
        }
        // If dbErr, silently skip — rely on app_metadata only
      }

      if (!isAdmin) {
        await supabase.auth.signOut();
        router.replace("/admin/login?error=unauthorized");
        return;
      }

      setAdminEmail(session.user.email ?? "Admin");
      setChecking(false);
    });
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  // ── Login page: render without the dashboard shell ──────────────────────────
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // ── Still verifying ──────────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen bg-[#0d3a24] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">
            {lang === "ar" ? "جارٍ التحقق..." : "Checking credentials…"}
          </p>
        </div>
      </div>
    );
  }

  const isRTL = lang === "ar";

  return (
    <div className="min-h-screen bg-[#f4f5f1] flex" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 z-50 w-64 bg-[#0d3a24] flex flex-col shadow-2xl transition-transform duration-300
          ${isRTL ? "right-0" : "left-0"}
          ${sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
          <img src="/favicon.ico" alt="Genaan" className="w-8 h-8 rounded-lg shrink-0" />
          <span className="text-xl font-black text-white tracking-tight">Genaan</span>
          <span className="ms-2 text-[10px] bg-[#17583a] text-[#a3d4b5] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {/* Dashboard */}
          {NAV_ITEMS.filter(i => !i.section).map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-semibold mb-1
                ${pathname === item.href ? "bg-white/15 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
              <span className="opacity-90">{item.icon}</span>
              <span>{isRTL ? item.ar : item.en}</span>
            </Link>
          ))}
          {/* Grouped sections */}
          {SECTIONS.map(section => {
            const sectionItems = NAV_ITEMS.filter(i => i.section === section);
            if (!sectionItems.length) return null;
            return (
              <div key={section} className="mt-4">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-1">{section}</p>
                {sectionItems.map(item => {
                  const isMessages = item.href === "/admin/messages" || item.href === "/admin/spaces";
                  const badge = isMessages && unreadCount > 0 && item.href === "/admin/messages" ? unreadCount : 0;
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium mb-0.5
                        ${pathname.startsWith(item.href) && item.href !== '/admin' ? "bg-white/15 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                      <span className="opacity-90 flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{isRTL ? item.ar : item.en}</span>
                      {badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 animate-pulse">
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#17583a] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{adminEmail}</p>
              <p className="text-white/40 text-[10px]">{isRTL ? "مدير النظام" : "System Admin"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            {isRTL ? "تسجيل الخروج" : "Log out"}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 md:ms-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#e4ece7] flex items-center px-5 gap-4 sticky top-0 z-30 shadow-sm">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#f0f2ee] transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d3a24" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>

          <div className="flex-1"/>

          {/* Lang toggle */}
          <button
            onClick={() => {
              const nl = lang === "en" ? "ar" : "en";
              setLang(nl);
              localStorage.setItem("genaan_lang", nl);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#17583a] bg-[#e8f3ec] px-3 py-1.5 rounded-full hover:bg-[#d8ede3] transition-colors"
          >
            🌐 {lang === "en" ? "عربي" : "English"}
          </button>

          {/* Back to store */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5f786c] hover:text-[#0d3a24] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            {isRTL ? "المتجر" : "Store"}
          </Link>
        </header>

        <main className="flex-1 p-5 md:p-8">
          {children}
        </main>
      </div>
      {/* Toast notification for new messages */}
      {toast && (
        <div className="fixed bottom-6 end-6 z-[100] animate-slide-up">
          <div className="bg-[#0d3a24] text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 min-w-[280px]">
            <div className="w-10 h-10 bg-[#17583a] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{isRTL ? "رسالة جديدة!" : "New Message!"}</p>
              <p className="text-white/70 text-xs">{isRTL ? `من: ${toast.name}` : `From: ${toast.name}`}</p>
            </div>
            <Link href="/admin/messages"
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-semibold transition-colors">
              {isRTL ? "عرض" : "View"}
            </Link>
            <button onClick={() => setToast(null)} className="text-white/50 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
