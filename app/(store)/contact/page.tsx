"use client";

import { useEffect, useState } from "react";
import { settings as settingsApi } from "../../lib/api";

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState({
    contact_phone: "Loading...",
    contact_email: "Loading...",
    contact_address: "Loading...",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res: any = await settingsApi.get();
        const info = res.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setContactInfo({
          contact_phone: info.contact_phone || "Not provided.",
          contact_email: info.contact_email || "Not provided.",
          contact_address: info.contact_address || "Not provided.",
        });
      } catch (e) {
        setContactInfo({
          contact_phone: "Failed to load.",
          contact_email: "Failed to load.",
          contact_address: "Failed to load.",
        });
      }
    }
    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f5f1] py-16 px-5 flex items-center justify-center">
      <div className="w-full max-w-[600px] bg-white p-8 md:p-12 rounded-3xl shadow-sm text-center">
        <h1 className="text-3xl md:text-5xl font-heading font-black text-[#0d3a24] mb-8">
          Contact Us
        </h1>
        
        <div className="space-y-6 text-[#5f786c]">
          <div className="p-4 bg-[#f8f9f7] rounded-xl">
            <h3 className="font-semibold text-[#0d3a24] mb-1">Email</h3>
            <p>{contactInfo.contact_email}</p>
          </div>
          
          <div className="p-4 bg-[#f8f9f7] rounded-xl">
            <h3 className="font-semibold text-[#0d3a24] mb-1">Phone</h3>
            <p>{contactInfo.contact_phone}</p>
          </div>
          
          <div className="p-4 bg-[#f8f9f7] rounded-xl">
            <h3 className="font-semibold text-[#0d3a24] mb-1">Address</h3>
            <p>{contactInfo.contact_address}</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-[#8aab99]">
          For space design inquiries, please visit our <a href="/spaces" className="text-[#17583a] hover:underline font-medium">Design Your Space</a> page.
        </p>
      </div>
    </div>
  );
}
