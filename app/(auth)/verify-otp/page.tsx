"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Read email stored by forgot-password page
  useEffect(() => {
    const stored = sessionStorage.getItem("reset_email");
    if (stored) setEmail(stored);
    else router.replace("/forgot-password");
  }, [router]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-advance on input
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1); // keep last char
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    const next = [...otp];
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      // TODO: wire up real API call
      await new Promise(r => setTimeout(r, 1000));
      sessionStorage.setItem("otp_verified", "1");
      router.push("/reset-password");
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    try {
      await new Promise(r => setTimeout(r, 800));
      setCountdown(60);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-[#f4f5f1]">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-start px-6 pt-10 pb-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">

          {/* Back link */}
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-[#5f786c] text-sm hover:text-[#17583a] transition-colors mb-10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </Link>


          <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-2">Check your email</h1>
          <p className="text-[#5f786c] text-sm mb-8">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-[#0d3a24]">{email || "your email"}</span>.
            Enter it below to continue.
          </p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-sm text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP digit boxes */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-3">
                Verification Code
              </label>
              <div className="flex gap-2.5" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={[
                      "w-full aspect-square text-center text-xl font-bold rounded-xl border bg-white transition-all focus:outline-none",
                      digit
                        ? "border-[#17583a] text-[#0d3a24] ring-2 ring-[#17583a]/10"
                        : "border-[#d4ded7] text-[#0d3a24] focus:border-[#17583a] focus:ring-2 focus:ring-[#17583a]/10",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              disabled={loading || otp.join("").length < OTP_LENGTH}
              className="w-full py-4 bg-[#17583a] text-white font-bold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/>
                  </svg>
                  Verifying...
                </>
              ) : "Verify code"}
            </button>
          </form>

          {/* Resend */}
          <p className="mt-6 text-center text-[#5f786c] text-sm">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="text-[#17583a] font-semibold hover:underline disabled:text-[#8aab99] disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
            </button>
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
            <div className="flex gap-2 mb-6">
              {Array(OTP_LENGTH).fill(null).map((_, i) => (
                <div
                  key={i}
                  className={[
                    "flex-1 h-2 rounded-full transition-all duration-300",
                    otp[i] ? "bg-[#4ecb71]" : "bg-white/20",
                  ].join(" ")}
                />
              ))}
            </div>
            <p className="text-white text-2xl font-heading font-bold mb-3 leading-snug">
              One step away from access
            </p>
            <p className="text-[#a8c7b6] text-sm leading-6">
              The code expires in 10 minutes. Check your spam folder if you don&apos;t see it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
