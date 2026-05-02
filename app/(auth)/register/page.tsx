"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { useI18n } from "../../lib/i18n-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(`${form.firstName} ${form.lastName}`, form.email, form.password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-[#f4f5f1]">
      {/* Left panel - photo */}
      <div className="hidden lg:block lg:w-[45%] relative bg-[#0d3a24] overflow-hidden">
        <Image
          src="/assets/register.png"
          alt="Plants"
          fill
          className="object-cover opacity-50"
          sizes="45vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3a24]/90 to-[#17583a]/40 flex flex-col justify-start p-12">

          <div>
            <p className="text-white text-3xl font-heading font-bold mb-6 leading-tight">Start your green journey today.</p>
            <div className="space-y-3">
              {[
                "Free delivery on orders over 2,000 EGP",
                "Expert plant care advice",
                "30-day happiness guarantee",
              ].map(feat => (
                <div key={feat} className="flex items-center gap-3 text-[#a8c7b6] text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ecb71" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col justify-start px-6 pt-10 pb-12 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#17583a] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
              </svg>
            </div>
            <span className="font-heading font-black text-xl text-[#0d3a24]">genaan</span>
          </Link>

          <h1 className="text-3xl font-heading font-black text-[#0d3a24] mb-2">{t.auth.register_title}</h1>
          <p className="text-[#5f786c] text-sm mb-8">
            {t.auth.have_account}{" "}
            <Link href="/login" className="text-[#17583a] font-semibold hover:underline">{t.auth.login_link}</Link>
          </p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "firstName", field: "firstName", label: t.auth.first_name, placeholder: "Ahmed" },
                { id: "lastName", field: "lastName", label: t.auth.last_name, placeholder: "Mohamed" },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">{f.label}</label>
                  <input id={f.id} type="text" value={form[f.field as keyof typeof form]} onChange={set(f.field)} placeholder={f.placeholder} required className="w-full px-3 py-3 rounded-xl border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]" />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="reg_email" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">{t.auth.email}</label>
              <input id="reg_email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required className="w-full px-4 py-3 rounded-xl border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]" />
            </div>

            <div>
              <label htmlFor="reg_phone" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">{t.auth.phone}</label>
              <div className="flex">
                <span className="flex items-center px-3.5 rounded-s-xl border border-e-0 border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#5f786c] font-medium shrink-0">+20</span>
                <input id="reg_phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" className="flex-1 px-4 py-3 rounded-e-xl border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]" />
              </div>
            </div>

            <div>
              <label htmlFor="reg_password" className="block text-[10px] font-bold tracking-[0.14em] uppercase text-[#5f786c] mb-1.5">{t.auth.password}</label>
              <input id="reg_password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required minLength={8} className="w-full px-4 py-3 rounded-xl border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]" />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#17583a] text-white font-bold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 00-9-9" /></svg> Creating account...</>
              ) : t.auth.register_btn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
