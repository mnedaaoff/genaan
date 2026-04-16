"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { mockProducts } from "../../../lib/mock-data";
import { Input, Textarea } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

const PRODUCT_TYPES = ["plant", "pot", "soil", "vitamin", "accessory"] as const;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const product = mockProducts.find(p => p.id === Number(id));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    type: product?.type ?? "plant",
    price: product?.price?.toString() ?? "",
    description: product?.description ?? "",
    scientific_name: product?.scientific_name ?? "",
    watering_days: product?.plant_care?.watering_days?.toString() ?? "7",
    light_level: product?.plant_care?.light_level ?? "medium",
    humidity_level: product?.plant_care?.humidity_level ?? "medium",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaved(true);
    setSaving(false);
  };

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-[#8aab99]">Product not found.</p>
      <Link href="/admin/products" className="mt-4 inline-block text-sm text-[#17583a] hover:underline">← Back to Products</Link>
    </div>
  );

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-[#8aab99] hover:text-[#5f786c] text-sm">← Products</Link>
        <span className="text-[#c4d5cc]">/</span>
        <span className="text-sm font-semibold text-[#0d3a24]">Edit: {product.name}</span>
      </div>

      {saved && (
        <div className="mb-5 p-4 bg-[#e8f3ec] border border-[#b4d9c5] rounded-xl text-sm font-semibold text-[#17583a]">
          ✓ Changes saved successfully!
        </div>
      )}

      {/* Image preview */}
      {product.images?.[0]?.url && (
        <div className="relative h-48 rounded-2xl overflow-hidden mb-5 bg-white shadow-sm">
          <Image src={product.images[0].url} alt={product.name} fill className="object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
          <button className="absolute bottom-4 right-4 px-3 py-1.5 bg-white text-xs font-semibold text-[#0d3a24] rounded-lg shadow hover:bg-[#f4f5f1] transition-colors">
            Replace Image
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-heading font-bold text-[#0d3a24]">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input id="edit_name" label="Product Name" value={form.name} onChange={set("name")} required/>
            <Input id="edit_slug" label="Slug" value={form.slug} onChange={set("slug")}/>
          </div>
          <Input id="edit_scientific" label="Scientific Name" value={form.scientific_name} onChange={set("scientific_name")}/>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Type</label>
              <select id="edit_type" value={form.type} onChange={set("type")} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]">
                {PRODUCT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <Input id="edit_price" label="Price (EGP)" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} required/>
          </div>
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Description</label>
            <Textarea id="edit_description" value={form.description} onChange={set("description")}/>
          </div>
        </div>

        {form.type === "plant" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-heading font-bold text-[#0d3a24]">Plant Care</h2>
            <div className="grid grid-cols-3 gap-4">
              <Input id="edit_watering" label="Watering (days)" type="number" min="1" value={form.watering_days} onChange={set("watering_days")}/>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Light Level</label>
                <select id="edit_light" value={form.light_level} onChange={set("light_level")} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]">
                  {["low","medium","bright","direct"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Humidity</label>
                <select id="edit_humidity" value={form.humidity_level} onChange={set("humidity_level")} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]">
                  {["low","medium","high"].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setShowDeleteModal(true)} className="px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors">
            Delete Product
          </button>
          <div className="flex gap-3">
            <Link href="/admin/products" className="px-5 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-lg hover:border-[#17583a] transition-colors">Cancel</Link>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </div>
      </form>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}/>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-heading font-bold text-[#0d3a24]">Delete &quot;{product.name}&quot;?</h3>
            <p className="mt-2 text-sm text-[#5f786c]">This action is permanent and cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-lg transition-colors hover:border-[#8aab99]">Cancel</button>
              <button onClick={() => router.push("/admin/products")} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
