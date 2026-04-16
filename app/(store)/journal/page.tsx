"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { posts as postsApi } from "../../lib/api";
import type { Post } from "../../lib/types";
import { useI18n } from "../../lib/i18n-context";

export default function JournalPage() {
  const { t } = useI18n();
  const [postList, setPostList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi.list()
      .then(data => { setPostList(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const [featured, ...rest] = postList;

  return (
    <div className="min-h-screen bg-[#f4f5f1]">
      {/* Header */}
      <div className="bg-[#0d3a24] text-white">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-14">
          <p className="text-xs tracking-[0.2em] font-bold text-[#78be98] uppercase mb-3">{t.journal.title}</p>
          <h1 className="text-4xl font-heading font-black leading-tight max-w-xl">{t.journal.subtitle}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-10">
        {loading ? (
          <div className="space-y-6">
            <div className="skeleton h-80 rounded-2xl"/>
            <div className="grid gap-5 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl"/>)}
            </div>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/journal/${featured.slug}`} className="group block mb-10">
                <article className="rounded-2xl overflow-hidden bg-white shadow-sm grid md:grid-cols-2 card-hover">
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src={featured.cover_image ?? ""}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  <div className="flex flex-col justify-center p-8">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#e8f3ec] rounded-full mb-4 self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#17583a]"/>
                      <span className="text-[10px] font-bold text-[#17583a] uppercase tracking-[0.12em]">Featured</span>
                    </div>
                    <h2 className="text-2xl font-heading font-black text-[#0d3a24] leading-tight mb-3">{featured.title}</h2>
                    <p className="text-sm text-[#5f786c] leading-7 line-clamp-3">{featured.excerpt}</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#17583a] flex items-center justify-center text-white text-xs font-bold">
                        {featured.author?.name?.charAt(0) ?? "G"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0d3a24]">{featured.author?.name ?? "Genaan Team"}</p>
                        <p className="text-[10px] text-[#8aab99]">{new Date(featured.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                      </div>
                      <span className="ms-auto text-sm font-semibold text-[#17583a] flex items-center gap-1 group-hover:gap-2 transition-all">
                        {t.journal.read}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Post grid */}
            {rest.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map(post => (
                  <Link key={post.id} href={`/journal/${post.slug}`} className="group block">
                    <article className="rounded-2xl overflow-hidden bg-white shadow-sm card-hover h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.cover_image ?? ""}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h2 className="font-heading font-bold text-[#0d3a24] leading-tight mb-2">{post.title}</h2>
                        <p className="text-xs text-[#5f786c] leading-6 line-clamp-2 flex-1">{post.excerpt}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-[10px] text-[#8aab99]">{new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                          <span className="text-xs font-semibold text-[#17583a] flex items-center gap-1 group-hover:gap-2 transition-all">
                            {t.journal.read}
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {postList.length === 0 && (
              <div className="py-20 text-center text-[#8aab99]">No articles published yet.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
