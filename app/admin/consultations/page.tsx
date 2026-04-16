"use client";

import { useState, useEffect } from "react";
import { consultations as consApi } from "../../lib/api";

export default function AdminConsultationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await consApi.list();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await consApi.updateStatus(id, status);
      loadItems();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) return <div className="p-8">Loading consultations...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0d3a24] mb-6">Consultation Requests (Design Your Space)</h1>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Client Info</th>
              <th className="p-4 border-b">Space & Budget</th>
              <th className="p-4 border-b">Message</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50/50">
                <td className="p-4 font-mono">#{item.id}</td>
                <td className="p-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500 text-xs">{item.email}</p>
                  <p className="text-gray-500 text-xs">{item.phone}</p>
                </td>
                <td className="p-4">
                  <p><span className="font-medium">Type:</span> {item.space_type || "N/A"}</p>
                  <p><span className="font-medium">Budget:</span> {item.budget || "N/A"}</p>
                </td>
                <td className="p-4 max-w-xs truncate" title={item.message}>
                  {item.message || "-"}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                    ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${item.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                    ${item.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    ${item.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-xs font-medium border-l border-gray-100">
                  <select 
                    value={item.status} 
                    onChange={e => handleUpdateStatus(item.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#17583a] w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No consultation requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
