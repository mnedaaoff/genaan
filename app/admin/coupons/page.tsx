"use client";

import { useState } from "react";
import { mockCoupons } from "../../lib/mock-data";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { Coupon } from "../../lib/types";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", min_order: "", max_uses: "", expires_at: "" });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const newCoupon: Coupon = {
      id: Date.now(), code: form.code.toUpperCase(), type: form.type as "percent" | "fixed",
      value: Number(form.value), min_order: form.min_order ? Number(form.min_order) : undefined,
      max_uses: form.max_uses ? Number(form.max_uses) : undefined, uses_count: 0, is_active: true,
      expires_at: form.expires_at || undefined, created_at: new Date().toISOString(),
    };
    setCoupons(c => [newCoupon, ...c]);
    setShowCreate(false);
    setForm({ code: "", type: "percent", value: "", min_order: "", max_uses: "", expires_at: "" });
    setSaving(false);
  };

  const toggleActive = (id: number) =>
    setCoupons(c => c.map(cp => cp.id === id ? { ...cp, is_active: !cp.is_active } : cp));

  const confirmDelete = () => {
    if (deleteId !== null) setCoupons(c => c.filter(cp => cp.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm text-[#8aab99]">{coupons.filter(c => c.is_active).length} active coupons</h2>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Create Coupon</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e4ece7] bg-[#fafafa]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Code</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Value</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Min Order</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Usage</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Active</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Expires</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2ee]">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-3.5">
                    <code className="font-mono font-bold text-[#0d3a24] bg-[#f0f2ee] px-2 py-0.5 rounded">{c.code}</code>
                  </td>
                  <td className="px-4 py-3.5 capitalize text-[#5f786c]">{c.type}</td>
                  <td className="px-4 py-3.5 font-bold text-[#17583a]">
                    {c.type === "percent" ? `${c.value}%` : `EGP ${c.value}`}
                  </td>
                  <td className="px-4 py-3.5 text-[#5f786c]">{c.min_order ? `EGP ${c.min_order}` : "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[#5f786c]">{c.uses_count}</span>
                    {c.max_uses && <span className="text-[#c4d5cc]"> / {c.max_uses}</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleActive(c.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${c.is_active ? "bg-[#17583a]" : "bg-[#d4ded7]"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${c.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#8aab99]">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-GB") : "Never"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => setDeleteId(c.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl max-w-md w-full animate-fade-in">
            <h3 className="text-lg font-heading font-bold text-[#0d3a24] mb-4">Create Coupon</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input id="coupon_code" label="Code" placeholder="SUMMER25" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c] mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]">
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <Input id="coupon_value" label={form.type === "percent" ? "Discount %" : "Discount EGP "} type="number" min="1" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input id="coupon_min" label="Min Order EGP " type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} />
                <Input id="coupon_max_uses" label="Max Uses" type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} />
              </div>
              <Input id="coupon_expires" label="Expires (optional)" type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-lg hover:border-[#8aab99] transition-colors">Cancel</button>
                <Button type="submit" loading={saving} fullWidth={false} className="flex-1">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-heading font-bold text-[#0d3a24]">Delete Coupon?</h3>
            <p className="mt-2 text-sm text-[#5f786c]">This coupon will no longer be redeemable by customers.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
