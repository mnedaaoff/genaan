"use client";

import { useState, useEffect } from "react";
import { faqs as faqsApi } from "../../lib/api";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const data = await faqsApi.list();
      setFaqs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await faqsApi.update(editingId, formData);
      } else {
        await faqsApi.create(formData);
      }
      setFormData({ question: "", answer: "" });
      setEditingId(null);
      loadFaqs();
    } catch (err) {
      alert("Error saving FAQ.");
    }
  };

  const handleEdit = (faq: any) => {
    setEditingId(faq.id);
    setFormData({ question: faq.question, answer: faq.answer });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await faqsApi.delete(id);
      loadFaqs();
    } catch (err) {
      alert("Error deleting FAQ.");
    }
  };

  if (loading) return <div className="p-8">Loading FAQs...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0d3a24] mb-6">Manage FAQs</h1>

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-2xl shadow-sm max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit FAQ" : "Add New FAQ"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <input 
              type="text" required
              value={formData.question} 
              onChange={e => setFormData({...formData, question: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Answer</label>
            <textarea 
              required rows={4}
              value={formData.answer} 
              onChange={e => setFormData({...formData, answer: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setFormData({question: "", answer: ""}); }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg shrink-0"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="px-6 py-2 bg-[#17583a] text-white rounded-lg hover:bg-[#0d3a24]">
              {editingId ? "Update" : "Add FAQ"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4 max-w-3xl">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white p-6 rounded-2xl shadow-sm flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-[#0d3a24]">{faq.question}</h3>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{faq.answer}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button onClick={() => handleEdit(faq)} className="text-[#17583a] hover:underline text-sm font-medium">Edit</button>
              <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-gray-500">No FAQs found.</p>}
      </div>
    </div>
  );
}
