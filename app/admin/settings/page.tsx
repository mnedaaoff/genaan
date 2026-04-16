"use client";

import { useState, useEffect } from "react";
import { settings as settingsApi } from "../../lib/api";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    privacy_policy: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data: any = await settingsApi.get();
        const kv = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setFormData({
          contact_phone: kv.contact_phone || "",
          contact_email: kv.contact_email || "",
          contact_address: kv.contact_address || "",
          privacy_policy: kv.privacy_policy || "",
        });
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const items = Object.entries(formData).map(([key, value]) => ({ key, value, type: "string" }));
      await settingsApi.update(items);
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0d3a24] mb-6">Store Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-2xl shadow-sm max-w-4xl">
        {/* Contact Info Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Contact Us Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input 
                type="text" 
                value={formData.contact_phone} 
                onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input 
                type="email" 
                value={formData.contact_email} 
                onChange={e => setFormData({...formData, contact_email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Physical Address</label>
              <input 
                type="text" 
                value={formData.contact_address} 
                onChange={e => setFormData({...formData, contact_address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Privacy Policy Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Privacy Policy Page</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Policy Content</label>
            <textarea 
              value={formData.privacy_policy} 
              onChange={e => setFormData({...formData, privacy_policy: e.target.value})}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none font-mono text-sm"
              placeholder="Enter comprehensive privacy policy text here..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2 bg-[#17583a] text-white rounded-lg hover:bg-[#0d3a24] transition-colors disabled:opacity-50 font-medium"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
