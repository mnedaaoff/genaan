"use client";

import { useEffect, useState } from "react";
import { settings as settingsApi } from "../../../lib/api";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<string>("Loading...");

  useEffect(() => {
    async function loadPolicy() {
      try {
        const res: any = await settingsApi.get();
        const policySetting = res.find((s: any) => s.key === "privacy_policy");
        if (policySetting && policySetting.value) {
          setContent(policySetting.value);
        } else {
          setContent("Privacy Policy has not been set yet.");
        }
      } catch (e) {
        setContent("Failed to load Privacy Policy.");
      }
    }
    loadPolicy();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f5f1] py-16 px-5">
      <div className="max-w-[800px] mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm">
        <h1 className="text-3xl md:text-5xl font-heading font-black text-[#0d3a24] mb-8 text-center">
          Privacy Policy
        </h1>
        <div className="text-[#5f786c] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}
