"use client";

import { useAuth } from "../../lib/auth-context";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":   "Dashboard",
  "/admin/products":    "Products & Inventory",
  "/admin/procurement": "Procurement",
  "/admin/orders":      "Order Management",
  "/admin/customers":   "Customers",
  "/admin/coupons":     "Coupons",
  "/admin/chats":       "Live Chat",
  "/admin/settings":    "Settings",
};

export function AdminHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const title = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k));

  return (
    <header className="h-16 bg-white border-b border-[#e4ece7] flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-base font-heading font-bold text-[#0d3a24]">
          {title ? PAGE_TITLES[title] : "Admin"}
        </h1>
        <p className="text-xs text-[#8aab99]">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f0f2ee] text-[#5f786c] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#17583a] rounded-full border-2 border-white"/>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#17583a] flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) ?? "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-[#0d3a24] leading-none">{user?.name ?? "Admin"}</p>
            <p className="text-[10px] text-[#8aab99] leading-none mt-0.5">{user?.is_admin ? "Administrator" : "Staff"}</p>
          </div>
          <button
            onClick={logout}
            className="ml-1 px-2.5 py-1.5 text-[10px] font-semibold text-[#8aab99] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
