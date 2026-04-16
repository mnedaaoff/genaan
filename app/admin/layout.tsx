"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { Sidebar } from "../components/admin/Sidebar";
import { AdminHeader } from "../components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading } = useAuth();

  // Auth guard
  if (!isLoading && (!user || !user.is_admin)) {
    return (
      <div className="min-h-screen bg-[#f4f5f1] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-md max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-heading font-bold text-[#0d3a24]">Admin Access Required</h1>
          <p className="text-sm text-[#5f786c] mt-2 mb-6">
            Sign in with an admin account to access the dashboard.
          </p>
          <Link href="/login" className="block py-3 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors text-sm">
            Sign In
          </Link>
          <Link href="/" className="block mt-3 text-sm text-[#8aab99] hover:text-[#5f786c]">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f1]">
        <div className="w-8 h-8 border-3 border-[#17583a] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f5f1] overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
