"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockProducts } from "../../lib/mock-data";
import { Badge } from "../../components/ui/Badge";
import type { Product } from "../../lib/types";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = mockProducts.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.scientific_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchType;
  });

  const stockBadge = (p: Product) => {
    const avail = p.inventory?.available ?? 0;
    if (avail === 0) return <Badge variant="red" dot>Out of Stock</Badge>;
    if (avail <= 5) return <Badge variant="yellow" dot>Low Stock ({avail})</Badge>;
    return <Badge variant="green" dot>In Stock ({avail})</Badge>;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8aab99]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="search" placeholder="Search name or species…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#d4ded7] bg-white text-sm focus:outline-none focus:border-[#17583a]" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[#d4ded7] bg-white text-sm text-[#5f786c] focus:outline-none focus:border-[#17583a]">
            <option value="all">All Types</option>
            {["plant", "pot", "soil", "vitamin", "accessory"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <Link href="/admin/products/create" className="flex items-center gap-2 px-4 py-2 bg-[#17583a] text-white text-sm font-semibold rounded-lg hover:bg-[#195b36] transition-colors whitespace-nowrap">
          <span className="text-base leading-none">+</span> Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e4ece7] bg-[#fafafa]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide w-[280px]">Product</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Stock Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Rating</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#8aab99] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2ee]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#f0f2ee] flex-shrink-0">
                        {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0d3a24] leading-tight">{p.name}</p>
                        {p.scientific_name && <p className="text-[10px] italic text-[#8aab99]">{p.scientific_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="capitalize text-[#5f786c] text-xs font-medium">{p.type}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-[#0d3a24]">EGP {p.price.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3.5">{stockBadge(p)}</td>
                  <td className="px-4 py-3.5">
                    {p.avg_rating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-sm font-semibold text-[#0d3a24]">{p.avg_rating}</span>
                        <span className="text-[10px] text-[#8aab99]">({p.review_count})</span>
                      </div>
                    ) : <span className="text-[#c4d5cc] text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${p.id}`} className="px-3 py-1.5 text-xs font-semibold text-[#17583a] bg-[#e8f3ec] rounded-md hover:bg-[#d8ede3] transition-colors">Edit</Link>
                      <button onClick={() => setDeleteId(p.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#8aab99] text-sm">No products match your search.</div>
        )}
        <div className="px-5 py-3.5 border-t border-[#f0f2ee] bg-[#fafafa] text-xs text-[#8aab99]">
          Showing {filtered.length} of {mockProducts.length} products
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-heading font-bold text-[#0d3a24]">Delete Product?</h3>
            <p className="mt-2 text-sm text-[#5f786c]">This action cannot be undone. The product and all its variants will be permanently removed.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-lg hover:border-[#17583a] transition-colors">Cancel</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
