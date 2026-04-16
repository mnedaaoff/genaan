"use client";

import { useState, useEffect } from "react";
import { posts as postsApi } from "../../lib/api";

export default function AdminJournalPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", excerpt: "", image: "" });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postsApi.list();
      setPosts(data);
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
        await postsApi.update(editingId, formData);
      } else {
        await postsApi.create(formData);
      }
      setFormData({ title: "", content: "", excerpt: "", image: "" });
      setEditingId(null);
      loadPosts();
    } catch (err) {
      alert("Error saving Post.");
    }
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setFormData({ title: post.title, content: post.body, excerpt: post.excerpt, image: post.cover_image || "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this Post?")) return;
    try {
      await postsApi.delete(id);
      loadPosts();
    } catch (err) {
      alert("Error deleting Post.");
    }
  };

  if (loading) return <div className="p-8">Loading posts...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0d3a24] mb-6">Manage Journal Stories</h1>

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-2xl shadow-sm max-w-4xl">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Post" : "Add New Post"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input 
              type="text" required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cover Image URL</label>
            <input 
              type="text"
              value={formData.image} 
              onChange={e => setFormData({...formData, image: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt (Optional)</label>
            <textarea 
              rows={2}
              value={formData.excerpt} 
              onChange={e => setFormData({...formData, excerpt: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea 
              required rows={8}
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17583a] outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setFormData({title: "", content: "", excerpt: "", image: ""}); }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg shrink-0"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="px-6 py-2 bg-[#17583a] text-white rounded-lg hover:bg-[#0d3a24]">
              {editingId ? "Update" : "Publish Post"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4 max-w-4xl">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <h3 className="font-semibold text-[#0d3a24] text-lg">{post.title}</h3>
              <p className="text-sm text-gray-500 mb-2">Slug: {post.slug}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto sm:ml-4">
              <button onClick={() => handleEdit(post)} className="px-4 py-2 text-sm font-medium bg-[#f4f5f1] text-[#17583a] rounded-lg hover:bg-[#17583a] hover:text-white transition">Edit</button>
              <button onClick={() => handleDelete(post.id)} className="px-4 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">Delete</button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-gray-500">No Journal stories available.</p>}
      </div>
    </div>
  );
}
