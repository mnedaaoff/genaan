"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useI18n } from "../../lib/i18n-context";

interface Space {
  id: number;
  title: string;
  room: string | null;
  description: string | null;
  cover_image: string | null;
  space_images: SpaceImage[];
}

interface SpaceImage {
  id: number;
  url: string;
  caption: string | null;
  likes_count: number;
}

export default function SpacesPage() {
  const { lang, isRTL } = useI18n();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [roomFilter, setRoomFilter] = useState("All");
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const [likingId, setLikingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("spaces")
        .select("id, title, room, description, cover_image, space_images(id, url, caption, likes_count)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setSpaces((data ?? []) as unknown as Space[]);
      setLoading(false);

      // Load user's likes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likes } = await supabase
          .from("space_likes")
          .select("space_image_id")
          .eq("user_id", user.id);
        if (likes) {
          setLikedImages(new Set(likes.map((l: any) => l.space_image_id)));
        }
      }
    }
    load();
  }, []);

  const rooms = ["All", ...Array.from(new Set(spaces.map(s => s.room).filter((r): r is string => r !== null && r !== "")))];
  const filtered = roomFilter === "All" ? spaces : spaces.filter(s => s.room === roomFilter);

  const toggleLike = async (imageId: number) => {
    setLikingId(imageId);
    const { data } = await supabase.rpc("toggle_space_like", { p_image_id: imageId });
    if (data && typeof data === "object") {
      const result = data as { liked?: boolean; error?: string };
      if (result.error) {
        alert(isRTL ? "يجب تسجيل الدخول للإعجاب" : "Please log in to like");
      } else {
        setLikedImages(prev => {
          const next = new Set(prev);
          if (result.liked) next.add(imageId);
          else next.delete(imageId);
          return next;
        });
        // Update local count
        setSpaces(prev => prev.map(s => ({
          ...s,
          space_images: s.space_images.map(img =>
            img.id === imageId
              ? { ...img, likes_count: img.likes_count + (result.liked ? 1 : -1) }
              : img
          ),
        })));
        if (selectedSpace) {
          setSelectedSpace(prev => prev ? {
            ...prev,
            space_images: prev.space_images.map(img =>
              img.id === imageId
                ? { ...img, likes_count: img.likes_count + ((data as any).liked ? 1 : -1) }
                : img
            ),
          } : null);
        }
      }
    }
    setLikingId(null);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f1]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-white border-b border-[#e4ece7]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-12">
          <p className="text-xs tracking-[0.2em] font-semibold text-[#6a8377] uppercase mb-2">
            {isRTL ? "إلهام التصميم الداخلي" : "Interior Inspiration"}
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-[#0d3a24]">
            {isRTL ? "مساحات خضراء" : "Green Spaces"}
          </h1>
          <p className="mt-3 text-sm text-[#5f786c] max-w-md">
            {isRTL ? "تصاميم غرف منسقة حيث تحوّل النباتات المساحات العادية إلى واحات حية." : "Curated room designs where plants transform ordinary spaces into living sanctuaries."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-10">
        {/* Room filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {rooms.map(r => (
            <button key={r} onClick={() => setRoomFilter(r)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${roomFilter === r ? "bg-[#17583a] text-white border-[#17583a]" : "bg-white border-[#d4ded7] text-[#5f786c] hover:border-[#17583a] hover:text-[#17583a]"}`}>
              {r === "All" ? (isRTL ? "الكل" : "All Rooms") : r}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <p className="text-4xl mb-3">🏡</p>
            <p className="text-[#5f786c] text-sm">{isRTL ? "لا توجد مساحات بعد" : "No spaces yet"}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((space, i) => (
              <article
                key={space.id}
                onClick={() => setSelectedSpace(space)}
                className={`group relative rounded-2xl overflow-hidden shadow-sm cursor-pointer card-hover ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className={`relative ${i === 0 || i === 4 ? "h-80" : "h-64"}`}>
                  {space.cover_image ? (
                    <Image src={space.cover_image} alt={space.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#17583a] to-[#2d7a55] flex items-center justify-center">
                      <span className="text-5xl">🌿</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {space.room && (
                    <span className="inline-block mb-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] font-semibold tracking-wide uppercase">
                      {space.room}
                    </span>
                  )}
                  <h2 className="text-lg font-heading font-bold text-white">{space.title}</h2>
                  {space.space_images?.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-white/70 text-xs">{space.space_images.length} {isRTL ? "صورة" : "photos"}</span>
                      <span className="text-white/40">·</span>
                      <div className="flex items-center gap-1">
                        <svg className="text-pink-300" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                        <span className="text-white/70 text-xs">
                          {space.space_images.reduce((sum, img) => sum + img.likes_count, 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA section */}
        <div className="mt-14 rounded-3xl bg-[#17583a] p-10 text-white text-center">
          <h2 className="text-3xl font-heading font-bold">{isRTL ? "صمّم مساحتك الخاصة" : "Design Your Own Space"}</h2>
          <p className="mt-3 text-white/70 text-sm max-w-md mx-auto">
            {isRTL ? "اطلب تصميم مساحتك" : "Request your space design"}
          </p>
          <Link href="/contact" className="inline-block mt-6 px-8 py-3.5 bg-white text-[#17583a] text-sm font-bold rounded-full hover:bg-[#f4f5f1] transition-colors">
            {isRTL ? "تصميم مساحتك" : "Design your space"}
          </Link>
        </div>
      </div>

      {/* ── Space Detail Modal ── */}
      {selectedSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSpace(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop" />
          <div
            onClick={e => e.stopPropagation()}
            className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-fade-in"
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-[#f0f2ee] flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="text-xl font-heading font-bold text-[#0d3a24]">{selectedSpace.title}</h2>
                {selectedSpace.room && <p className="text-xs text-[#8aab99] mt-0.5">{selectedSpace.room}</p>}
              </div>
              <button onClick={() => setSelectedSpace(null)}
                className="w-8 h-8 rounded-full bg-[#f0f2ee] hover:bg-[#e4ece7] flex items-center justify-center transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d3a24" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Description */}
            {selectedSpace.description && (
              <div className="px-6 py-4">
                <p className="text-sm text-[#5f786c] leading-relaxed">{selectedSpace.description}</p>
              </div>
            )}

            {/* Images gallery */}
            <div className="px-6 pb-6 space-y-4">
              {selectedSpace.space_images?.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-3xl mb-2">📷</p>
                  <p className="text-sm text-[#8aab99]">{isRTL ? "لا توجد صور بعد" : "No photos yet"}</p>
                </div>
              ) : (
                selectedSpace.space_images?.map(img => (
                  <div key={img.id} className="rounded-2xl overflow-hidden bg-[#f0f2ee]">
                    <div className="relative w-full aspect-[16/10]">
                      <Image src={img.url} alt={img.caption ?? ""} fill className="object-cover" sizes="700px" />
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <p className="text-xs text-[#5f786c] flex-1 truncate">{img.caption ?? ""}</p>
                      <button
                        onClick={() => toggleLike(img.id)}
                        disabled={likingId === img.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          likedImages.has(img.id)
                            ? "bg-pink-50 text-pink-500 border border-pink-200"
                            : "bg-[#f4f5f1] text-[#5f786c] border border-transparent hover:border-pink-200 hover:text-pink-500"
                        }`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24"
                          fill={likedImages.has(img.id) ? "currentColor" : "none"}
                          stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                        {img.likes_count}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
