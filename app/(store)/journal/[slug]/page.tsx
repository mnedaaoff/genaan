"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useI18n } from "../../../lib/i18n-context";

interface Post {
  id: number;
  title: string;
  content: string | null;
  image: string | null;
  slug: string | null;
  created_at: string;
}

export default function JournalPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRTL } = useI18n();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) { setNotFound(true); setLoading(false); return; }

      // Try by slug first, then by ID
      let { data } = await supabase
        .from("posts")
        .select("id,title,content,image,slug,created_at")
        .eq("slug", slug)
        .single();

      if (!data) {
        const numId = Number(slug);
        if (!isNaN(numId)) {
          const res = await supabase
            .from("posts")
            .select("id,title,content,image,slug,created_at")
            .eq("id", numId)
            .single();
          data = res.data;
        }
      }

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(data as Post);

      // Load related
      const { data: allPosts } = await supabase
        .from("posts")
        .select("id,title,content,image,slug,created_at")
        .neq("id", data.id)
        .order("created_at", { ascending: false })
        .limit(3);
      setRelated((allPosts ?? []) as Post[]);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5f1]">
        <div className="h-[400px] bg-[#e8f3ec] animate-pulse" />
        <div className="mx-auto max-w-[800px] px-5 py-12">
          <div className="bg-white rounded-3xl p-12 shadow-sm space-y-4">
            <div className="h-8 bg-[#f0f2ee] rounded-xl w-3/4 animate-pulse" />
            <div className="h-4 bg-[#f0f2ee] rounded-xl w-full animate-pulse" />
            <div className="h-4 bg-[#f0f2ee] rounded-xl w-5/6 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f4f5f1] px-5">
        <p className="text-5xl mb-4">📝</p>
        <h1 className="text-2xl font-heading font-black text-[#0d3a24] mb-2">
          {isRTL ? "المقال غير موجود" : "Post Not Found"}
        </h1>
        <p className="text-sm text-[#5f786c] mb-6">
          {isRTL ? "هذا المقال غير متاح أو تم حذفه" : "This article doesn't exist or has been removed."}
        </p>
        <Link href="/journal" className="px-6 py-3 bg-[#17583a] text-white font-semibold rounded-xl hover:bg-[#195b36] transition-colors">
          {isRTL ? "العودة للمجلة" : "Back to Journal"}
        </Link>
      </div>
    );
  }

  // Split content into paragraphs
  const paragraphs = (post.content ?? "").split(/\n\n|\n/).filter(p => p.trim());

  return (
    <div className="min-h-screen bg-[#f4f5f1]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero image */}
      <div className="relative h-[350px] md:h-[450px] bg-[#0d3a24]">
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0d3a24] to-[#17583a] flex items-center justify-center">
            <span className="text-8xl opacity-20">🌿</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-[800px] px-5 md:px-8 pb-10">
            <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white transition-colors">{isRTL ? "الرئيسية" : "Home"}</Link>
              <span>/</span>
              <Link href="/journal" className="hover:text-white transition-colors">{isRTL ? "المجلة" : "Journal"}</Link>
              <span>/</span>
              <span className="text-white/80 truncate">{post.title}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-heading font-black text-white leading-tight">{post.title}</h1>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-[#17583a] flex items-center justify-center text-white text-xs font-bold">G</div>
              <div>
                <p className="text-xs font-semibold text-white/90">{isRTL ? "فريق جنان" : "Genaan Team"}</p>
                <p className="text-[10px] text-white/50">
                  {new Date(post.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[800px] px-5 md:px-8 py-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="prose prose-sm max-w-none text-[#5f786c] leading-8 space-y-4">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="text-[#8aab99] italic">{isRTL ? "لا يوجد محتوى بعد" : "No content yet."}</p>
            )}
          </div>
          <div className="mt-8 pt-8 border-t border-[#e4ece7] flex items-center justify-between">
            <Link href="/journal" className="text-sm font-semibold text-[#17583a] hover:underline">
              ← {isRTL ? "العودة للمجلة" : "Back to Journal"}
            </Link>
            <Link href="/shop" className="px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-lg hover:bg-[#195b36] transition-colors">
              {isRTL ? "تسوّق" : "Shop Plants"}
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">
              {isRTL ? "المزيد من المجلة" : "More from the Journal"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map(p => (
                <Link key={p.id} href={`/journal/${p.slug ?? p.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm card-hover block">
                  <div className="relative h-36 overflow-hidden bg-[#e8f3ec]">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📝</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-heading font-bold text-[#0d3a24] leading-tight group-hover:text-[#17583a] transition-colors">{p.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
