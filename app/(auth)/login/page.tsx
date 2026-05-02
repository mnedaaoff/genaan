"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { useI18n } from "../../lib/i18n-context";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-[#f4f5f1]">
      {/* Left panel - form */}
      <div className="flex-1 flex flex-col justify-start px-6 pt-10 pb-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">


          <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-2">{t.auth.login_title}</h1>
          <p className="text-[#5f786c] text-sm mb-8">
            {t.auth.no_account}{" "}
            <Link href="/register" className="text-[#17583a] font-semibold hover:underline">{t.auth.register_link}</Link>
          </p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-sm text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">{t.auth.email}</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a] focus:ring-2 focus:ring-[#17583a]/10 transition-all"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8aab99]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">{t.auth.password}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a] focus:ring-2 focus:ring-[#17583a]/10 transition-all"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8aab99]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8aab99] hover:text-[#5f786c]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-2">
              <Link
                href="/forgot-password"
                className="text-xs text-[#17583a] font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#17583a] text-white font-bold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 00-9-9" /></svg> Signing in...</>
              ) : t.auth.login_btn}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel - photo */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0d3a24] overflow-hidden">
        <Image
          src="/assets/login.png"
          alt="Plants"
          fill
          className="object-cover opacity-60"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3a24]/80 to-transparent flex flex-col justify-start p-12">
          <blockquote className="text-white">
            <p className="text-2xl font-heading font-bold mb-4 leading-snug">"Plants bring life to any space and peace to any mind."</p>
            <footer className="text-[#a8c7b6] text-sm">The genaan team</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
