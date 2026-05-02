"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "../../lib/i18n-context";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // TODO: wire up real API call
      await new Promise(r => setTimeout(r, 1000));
      // Store email for OTP page
      sessionStorage.setItem("reset_email", email);
      router.push("/verify-otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-[#f4f5f1]">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-start px-6 pt-10 pb-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">

          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[#5f786c] text-sm hover:text-[#17583a] transition-colors mb-10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to sign in
          </Link>

          <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-2">Forgot password?</h1>
          <p className="text-[#5f786c] text-sm mb-8">
            Enter your email and we&apos;ll send you a verification code to reset your password.
          </p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-sm text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fp_email" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">
                {t.auth.email}
              </label>
              <div className="relative">
                <input
                  id="fp_email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a] focus:ring-2 focus:ring-[#17583a]/10 transition-all"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8aab99]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>

            <button
              id="send-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#17583a] text-white font-bold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/>
                  </svg>
                  Sending code...
                </>
              ) : "Send verification code"}
            </button>
          </form>

          <p className="mt-6 text-center text-[#5f786c] text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-[#17583a] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — photo */}
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
          <div>
            <p className="text-white text-2xl font-heading font-bold mb-3 leading-snug">
              Secure account recovery
            </p>
            <p className="text-[#a8c7b6] text-sm leading-6">
              We&apos;ll send a one-time code to your email. It expires in 10 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
