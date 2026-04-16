"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Textarea } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

const PRODUCT_TYPES = ["plant", "pot", "soil", "vitamin", "accessory"] as const;
const LIGHT_LEVELS   = ["low", "medium", "bright", "direct"] as const;
const HUMIDITY_LEVELS = ["low", "medium", "high"] as const;

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", type: "plant", price: "", description: "", scientific_name: "",
    watering_days: "7", light_level: "medium", humidity_level: "medium",
    stock: "0",
  });
  const [attributes, setAttributes] = useState([{ key: "", value: "" }]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm(f => ({
      ...f,
      [field]: val,
      ...(field === "name" ? { slug: val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // mock API delay
    setSaved(true);
    setSaving(false);
    setTimeout(() => router.push("/admin/products"), 1200);
  };

  const addAttr = () => setAttributes(a => [...a, { key: "", value: "" }]);
  const setAttr = (i: number, field: "key" | "value", val: string) =>
    setAttributes(a => a.map((attr, idx) => idx === i ? { ...attr, [field]: val } : attr));
  const removeAttr = (i: number) => setAttributes(a => a.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-[#8aab99] hover:text-[#5f786c] text-sm">← Products</Link>
        <span className="text-[#c4d5cc]">/</span>
        <span className="text-sm font-semibold text-[#0d3a24]">New Product</span>
      </div>

      {saved && (
        <div className="mb-5 p-4 bg-[#e8f3ec] border border-[#b4d9c5] rounded-xl text-sm font-semibold text-[#17583a]">
          ✓ Product created successfully! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-heading font-bold text-[#0d3a24]">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input id="product_name" label="Product Name" placeholder="e.g. ZZ Sentinel" value={form.name} onChange={set("name")} required/>
            <Input id="product_slug" label="Slug (auto)" placeholder="zz-sentinel" value={form.slug} onChange={set("slug")}/>
          </div>
          <Input id="product_scientific" label="Scientific Name (optional)" placeholder="e.g. Zamioculcas zamiifolia" value={form.scientific_name} onChange={set("scientific_name")}/>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Product Type</label>
              <select id="product_type" value={form.type} onChange={set("type")} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]">
                {PRODUCT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <Input id="product_price" label="Price (�EGP )" type="number" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={set("price")} required/>
          </div>
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Description</label>
            <Textarea id="product_description" placeholder="Describe the product…" value={form.description} onChange={set("description")}/>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-heading font-bold text-[#0d3a24] mb-4">Initial Inventory</h2>
          <Input id="product_stock" label="Starting Stock Quantity" type="number" min="0" value={form.stock} onChange={set("stock")}/>
        </div>

        {/* Plant Care */}
        {form.type === "plant" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-heading font-bold text-[#0d3a24]">Plant Care</h2>
            <div className="grid grid-cols-3 gap-4">
              <Input id="product_watering" label="Watering (days)" type="number" min="1" value={form.watering_days} onChange={set("watering_days")}/>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Light Level</label>
                <select id="product_light" value={form.light_level} onChange={set("light_level")} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]">
                  {LIGHT_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Humidity</label>
                <select id="product_humidity" value={form.humidity_level} onChange={set("humidity_level")} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]">
                  {HUMIDITY_LEVELS.map(h => <option key={h} value={h} className="capitalize">{h.charAt(0).toUpperCase() + h.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Attributes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-bold text-[#0d3a24]">Product Attributes</h2>
            <button type="button" onClick={addAttr} className="text-xs font-semibold text-[#17583a] hover:underline">+ Add Row</button>
          </div>
          <div className="space-y-3">
            {attributes.map((attr, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Input label="" placeholder="Key (e.g. Height)" value={attr.key} onChange={e => setAttr(i, "key", e.target.value)} className="flex-1"/>
                <Input label="" placeholder="Value (e.g. 60cm)" value={attr.value} onChange={e => setAttr(i, "value", e.target.value)} className="flex-1"/>
                <button type="button" onClick={() => removeAttr(i)} className="text-[#c4d5cc] hover:text-red-400 transition-colors mt-0.5">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/products" className="px-5 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-lg hover:border-[#17583a] transition-colors">Cancel</Link>
          <Button type="submit" loading={saving} size="md">Save & Publish</Button>
        </div>
      </form>
    </div>
  );
}
