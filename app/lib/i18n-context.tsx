"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Lang, type Translations } from "./translations";

interface I18nContextValue {
  lang:    Lang;
  t:       Translations;
  setLang: (l: Lang) => void;
  isRTL:   boolean;
  toggle:  () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const LANG_KEY = "genaan_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Rehydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY) as Lang | null;
      if (stored === "ar" || stored === "en") setLangState(stored);
    } catch { /* ignore */ }
  }, []);

  // Sync html[dir] and html[lang] whenever lang changes
  useEffect(() => {
    const isRTL = lang === "ar";
    document.documentElement.dir  = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "ar" : "en");
  }, [lang, setLang]);

  const isRTL = lang === "ar";
  const t     = translations[lang];

  return (
    <I18nContext.Provider value={{ lang, t, setLang, isRTL, toggle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
