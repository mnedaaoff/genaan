"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Guard: only accessible after OTP verification
  useEffect(() => {
    if (!sessionStorage.getItem("otp_verified")) {
      router.replace("/forgot-password");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // TODO: wire up real API call
      await new Promise(r => setTimeout(r, 1000));
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("otp_verified");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-[#4ecb71]"][strength];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-[#f4f5f1]">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-start px-6 pt-10 pb-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">

          {success ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f3ec] flex items-center justify-center mx-auto mb-6">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#17583a" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-3">Password updated!</h1>
              <p className="text-[#5f786c] text-sm mb-8">
                Your password has been reset successfully. Redirecting you to sign in…
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#17583a] text-white text-sm font-bold rounded-xl hover:bg-[#195b36] transition-colors"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              {/* Back link */}
              <Link
                href="/verify-otp"
                className="inline-flex items-center gap-1.5 text-[#5f786c] text-sm hover:text-[#17583a] transition-colors mb-10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back
              </Link>


              <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-2">Set new password</h1>
              <p className="text-[#5f786c] text-sm mb-8">
                Choose a strong password for your account.
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
                {/* New password */}
                <div>
                  <label htmlFor="new_password" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a] focus:ring-2 focus:ring-[#17583a]/10 transition-all"
                    />
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8aab99]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8aab99] hover:text-[#5f786c]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPassword
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-[#e4ece7]"}`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-[#5f786c]">Strength: <span className="font-semibold">{strengthLabel}</span></p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm_password" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-10 pr-10 py-3.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                        confirm && confirm !== password
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-[#d4ded7] focus:border-[#17583a] focus:ring-[#17583a]/10"
                      }`}
                    />
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8aab99]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8aab99] hover:text-[#5f786c]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showConfirm
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="mt-1.5 text-[11px] text-red-500">Passwords do not match</p>
                  )}
                </div>

                <button
                  id="reset-password-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#17583a] text-white font-bold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/>
                      </svg>
                      Updating password...
                    </>
                  ) : "Update password"}
                </button>
              </form>
            </>
          )}
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
              Almost there
            </p>
            <p className="text-[#a8c7b6] text-sm leading-6">
              Use at least 8 characters with a mix of letters, numbers, and symbols for a strong password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
