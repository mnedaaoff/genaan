"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getAdminUploadHeaders } from "../../lib/admin-auth";
import { revalidateStorefrontCache } from "../../lib/revalidate-storefront";
import { CACHE_TAGS } from "../../lib/cache/tags";

interface Post {
  id: number;
  title: string | null;
  content: string | null;
  image: string | null;
  slug: string | null;
  is_published: boolean;
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
  const [form, setForm] = useState({ title: "", content: "", slug: "", is_published: true });

  useEffect(() => {
    const s = localStorage.getItem("genaan_lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,content,image,slug,is_published,created_at")
      .order("created_at", { ascending: false });
    if (error) console.warn("Posts error:", error.message);
    setPosts((data ?? []) as Post[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Upload via secure server API route (bypasses storage RLS)
  const uploadImageViaApi = async (file: File, postId: number): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "posts");
    fd.append("path", `${postId}-${Date.now()}.${file.name.split(".").pop()}`);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: await getAdminUploadHeaders(),
      body: fd,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  };

  const makeSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[\u0600-\u06FF]/g, "") // remove Arabic chars
      .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
      .trim()
      .replace(/\s+/g, "-")           // spaces to dashes
      || "post";                       // fallback if empty

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) { setFormError(isRTL ? "العنوان مطلوب" : "Title is required"); return; }
    setSaving(true);
    try {
      const slug = form.slug.trim()
        ? form.slug.trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        : makeSlug(form.title.trim()) + "-" + Date.now();

      const { data: post, error: insertErr } = await supabase
        .from("posts")
        .insert({
          title: form.title.trim(),
          content: form.content.trim() || null,
          slug,
          is_published: form.is_published,
        })
        .select("id")
        .single();

      if (insertErr) throw new Error(insertErr.message);

      // Upload image via secure API route
      if (imageFile && post) {
        try {
          const imageUrl = await uploadImageViaApi(imageFile, post.id);
          await supabase.from("posts").update({ image: imageUrl }).eq("id", post.id);
        } catch (uploadErr: any) {
          console.error("Image upload failed:", uploadErr.message);
          setFormError(`Post created but image upload failed: ${uploadErr.message}`);
        }
      }

      setForm({ title: "", content: "", slug: "", is_published: true });
      setImageFile(null);
      setImagePreview("");
      setShowForm(false);
      await load();
      // Revalidate journal cache so new post appears immediately
      await revalidateStorefrontCache(CACHE_TAGS.posts);
    } catch (err: any) {
      setFormError(err.message ?? "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (post: Post) => {
    const newVal = !post.is_published;
    await supabase.from("posts").update({ is_published: newVal }).eq("id", post.id);
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: newVal } : p));
    await revalidateStorefrontCache(CACHE_TAGS.posts);
  };

  const deletePost = async (id: number) => {
    if (!confirm(isRTL ? "حذف هذا المقال؟" : "Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
    await revalidateStorefrontCache(CACHE_TAGS.posts);
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
                  placeholder="my-post-title (auto-generated if empty)" className={inp} dir="ltr" />
                <p className="text-[10px] text-[#8aab99] mt-1">{isRTL ? "فقط حروف إنجليزية وأرقام وشرطات" : "Only English letters, numbers and dashes"}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d3a24] mb-1.5 uppercase tracking-wide">{isRTL ? "المحتوى" : "Content"}</label>
                <textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={isRTL ? "اكتب محتوى المقال هنا..." : "Write the post content here..."} className={`${inp} resize-none`} />
              </div>
              {/* Published toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-[#0d3a24]">{isRTL ? "نشر المقال" : "Publish post"}</p>
                  <p className="text-xs text-[#8aab99]">{isRTL ? "إذا كان غير منشور لن يظهر في الموقع" : "Unpublished posts won't appear on the site"}</p>
                </div>
                <button type="button" onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? "bg-[#17583a]" : "bg-[#d4ded7]"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? "start-5" : "start-0.5"}`} />
                </button>
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
              <div className="h-40 bg-[#e8f3ec] overflow-hidden relative">
                {post.image
                  ? <img src={post.image} alt={post.title ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">📝</div>}
                {/* Published badge */}
                <span className={`absolute top-2 start-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${post.is_published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {post.is_published ? (isRTL ? "منشور" : "Published") : (isRTL ? "مسودة" : "Draft")}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#0d3a24] line-clamp-2 mb-2 text-sm">{post.title || "—"}</h3>
                <p className="text-xs text-[#5f786c] line-clamp-2 mb-3">{post.content}</p>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-[#8aab99]">{new Date(post.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</p>
                    {post.slug && (
                      <a href={`/journal/${post.slug}`} target="_blank" rel="noreferrer"
                        className="text-[10px] text-[#17583a] hover:underline font-semibold">
                        /{post.slug}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePublish(post)}
                      className={`text-xs font-semibold transition-colors ${post.is_published ? "text-amber-500 hover:text-amber-700" : "text-green-600 hover:text-green-800"}`}>
                      {post.is_published ? (isRTL ? "إخفاء" : "Unpublish") : (isRTL ? "نشر" : "Publish")}
                    </button>
                    <button onClick={() => deletePost(post.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
                      {isRTL ? "حذف" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
