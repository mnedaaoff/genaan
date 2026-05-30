"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Post {
  id: number;
  title: string | null;
  content: string | null;
  image: string | null;
  slug: string | null;
  created_at: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isRTL = lang === "ar";
  const [form, setForm] = useState({ title: "", content: "", slug: "" });

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,content,image,slug,created_at")
      .order("created_at", { ascending: false });
    if (error) console.warn("Posts error:", error.message);
    setPosts((data ?? []) as Post[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) { setFormError(isRTL ? "العنوان مطلوب" : "Title is required"); return; }
    setSaving(true);
    try {
      const slug = form.slug.trim() || form.title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();

      const { data: post, error: insertErr } = await supabase
        .from("posts")
        .insert({ title: form.title.trim(), content: form.content.trim() || null, slug })
        .select("id")
        .single();

      if (insertErr) throw new Error(insertErr.message);

      // Upload image
      if (imageFile && post) {
        const ext = imageFile.name.split(".").pop();
        const path = `${post.id}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("posts").upload(path, imageFile, { upsert: true });
        if (uploadErr) {
          console.error("Image upload failed:", uploadErr.message);
          // Post created but image failed — warn user
          setFormError(`Post created but image upload failed: ${uploadErr.message}. Make sure 'posts' storage bucket exists and is public.`);
        } else {
          const { data: urlData } = supabase.storage.from("posts").getPublicUrl(path);
          await supabase.from("posts").update({ image: urlData.publicUrl }).eq("id", post.id);
        }
      }

      setForm({ title: "", content: "", slug: "" });
      setImageFile(null);
      setImagePreview("");
      setShowForm(false);
      await load();
    } catch (err: any) {
      setFormError(err.message ?? "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm(isRTL ? "حذف هذا المقال؟" : "Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-[#d4ded7] bg-[#f4f5f1] text-sm text-[#0d3a24] placeholder-[#8aab99] focus:outline-none focus:ring-2 focus:ring-[#17583a] transition-all";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0d3a24]">{isRTL ? "المدونة" : "Blog Posts"}</h1>
          <p className="text-sm text-[#5f786c] mt-0.5">{isRTL ? "تظهر في صفحة Journal في الموقع" : "Shown in the Journal page on the website"}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d3a24] text-white rounded-xl text-sm font-semibold hover:bg-[#17583a] transition-colors">
          {showForm ? (isRTL ? "✕ إلغاء" : "✕ Cancel") : (isRTL ? "✚ مقال جديد" : "✚ New Post")}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] p-6 mb-6">
          <h2 className="font-bold text-[#0d3a24] mb-4">📝 {isRTL ? "إنشاء مقال جديد" : "Create New Post"}</h2>
          {formError && <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>}
          <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "العنوان *" : "Title *"}</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={isRTL ? "عنوان المقال" : "Post title"} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "الرابط المختصر (Slug)" : "Slug (URL)"}</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="my-post-title (auto-generated if empty)" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "المحتوى" : "Content"}</label>
                <textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={isRTL ? "اكتب محتوى المقال هنا..." : "Write the post content here..."} className={`${inp} resize-none`} />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "صورة الغلاف" : "Cover Image"}</label>
                <label htmlFor="post-img" className="cursor-pointer block">
                  <div className={`rounded-xl border-2 border-dashed overflow-hidden h-40 ${imagePreview ? "border-[#17583a]" : "border-[#d4ded7] hover:border-[#17583a]"}`}>
                    {imagePreview
                      ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8aab99]">
                        <span className="text-3xl">🖼️</span>
                        <p className="text-xs">{isRTL ? "اضغط لرفع صورة" : "Click to upload"}</p>
                      </div>}
                  </div>
                  <input id="post-img" type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                  }} />
                </label>
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-3 bg-[#0d3a24] text-white rounded-xl text-sm font-bold hover:bg-[#17583a] transition-colors disabled:opacity-50">
                {saving ? (isRTL ? "جارٍ النشر..." : "Publishing…") : (isRTL ? "🚀 نشر المقال" : "🚀 Publish Post")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-56 bg-[#f0f2ee] rounded-2xl animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center shadow-sm border border-[#f0f2ee]">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-[#8aab99] text-sm">{isRTL ? "لا توجد مقالات. أنشئ أول مقال!" : "No posts yet. Create your first post!"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-[#f0f2ee] overflow-hidden group hover:shadow-md transition-shadow">
              <div className="h-40 bg-[#e8f3ec] overflow-hidden">
                {post.image
                  ? <img src={post.image} alt={post.title ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">📝</div>}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#0d3a24] line-clamp-2 mb-2 text-sm">{post.title || "—"}</h3>
                <p className="text-xs text-[#5f786c] line-clamp-2 mb-3">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#8aab99]">{new Date(post.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</p>
                    {post.slug && (
                      <a href={`/journal/${post.slug}`} target="_blank" rel="noreferrer"
                        className="text-[10px] text-[#17583a] hover:underline font-semibold">
                        /{post.slug}
                      </a>
                    )}
                  </div>
                  <button onClick={() => deletePost(post.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
                    {isRTL ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
