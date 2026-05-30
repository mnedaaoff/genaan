"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRTL = lang === "ar";

  // Show error if redirected due to unauthorized access
  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError(
        isRTL
          ? "⛔ هذا الحساب ليس له صلاحية الوصول للوحة التحكم"
          : "⛔ This account does not have admin access"
      );
    }
  }, [searchParams, isRTL]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Step 1: Authenticate with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(isRTL ? "بريد إلكتروني أو كلمة مرور غير صحيحة" : "Invalid email or password");
      if (!data.session) throw new Error("No session returned");

      // Step 2: Check admin flag — check BOTH user_metadata and app_metadata
      // raw_user_meta_data → user_metadata, raw_app_meta_data → app_metadata
      let isAdmin = false;

      const userMeta = data.session.user.user_metadata ?? {};
      const appMeta  = data.session.user.app_metadata  ?? {};

      if (
        userMeta.is_admin === true || userMeta.role === "admin" ||
        appMeta.is_admin  === true || appMeta.role  === "admin"
      ) {
        isAdmin = true;
      }

      // Check public.profiles table (correct table name)
      if (!isAdmin) {
        const { data: profile, error: dbErr } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.session.user.id)
          .single();

        if (!dbErr && profile?.is_admin === true) {
          isAdmin = true;
        }
        // If dbErr (RLS or other), silently skip — rely on metadata only
      }

      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error(
          isRTL
            ? "هذا الحساب ليس له صلاحية الوصول للوحة التحكم"
            : "This account does not have admin access"
        );
      }

      localStorage.setItem("genaan_lang", lang);
      router.replace("/admin");
    } catch (err: any) {
      setError(err.message ?? (isRTL ? "فشل تسجيل الدخول" : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0d3a24] relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#17583a]/40 blur-3xl pointer-events-none"/>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#2d7a55]/30 blur-3xl pointer-events-none"/>

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌿</div>
            <h1 className="text-2xl font-black text-[#0d3a24]">Genaan Admin</h1>
            <p className="text-sm text-[#5f786c] mt-1">
              {isRTL ? "لوحة تحكم المتجر — للمدراء فقط" : "Store Control Panel — Admins Only"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0d3a24] mb-1.5">
                {isRTL ? "البريد الإلكتروني" : "Email address"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@genaan.com"
                className="w-full px-4 py-3 rounded-xl border border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#0d3a24] placeholder-[#8aab99] focus:outline-none focus:ring-2 focus:ring-[#17583a] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0d3a24] mb-1.5">
                {isRTL ? "كلمة المرور" : "Password"}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#0d3a24] placeholder-[#8aab99] focus:outline-none focus:ring-2 focus:ring-[#17583a] focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#0d3a24] text-white font-bold text-sm hover:bg-[#17583a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? (isRTL ? "جارٍ التحقق..." : "Verifying…")
                : (isRTL ? "دخول" : "Sign in")}
            </button>
          </form>

          {/* Lang toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setLang(l => l === "en" ? "ar" : "en")}
              className="text-xs text-[#8aab99] hover:text-[#17583a] transition-colors font-medium"
            >
              🌐 {isRTL ? "Switch to English" : "التبديل إلى العربية"}
            </button>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-5">
          🔐 {isRTL ? "للوصول المصرح به فقط" : "Authorized access only"}
        </p>
      </div>
    </div>
  );
}

// Wrap with Suspense because useSearchParams needs it
export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
