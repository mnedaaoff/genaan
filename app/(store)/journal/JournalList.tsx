"use client";

import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";

interface Post {
  id: number;
  title: string;
  content: string | null;
  image: string | null;
  slug: string | null;
  created_at: string;
}

export function JournalList({ posts }: { posts: Post[] }) {
  const { t } = useI18n();
  const [featured, ...rest] = posts;

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-10">
        <div className="py-20 text-center text-[#8aab99]">No articles published yet.</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-10">
      {featured && (
        <Link href={`/journal/${featured.slug ?? featured.id}`} className="group block mb-10">
          <article className="rounded-2xl overflow-hidden bg-white shadow-sm grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto bg-[#e8f3ec] overflow-hidden">
              {featured.image
                ? <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                : <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>}
            </div>
            <div className="flex flex-col justify-center p-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#e8f3ec] rounded-full mb-4 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#17583a]"/>
                <span className="text-[10px] font-bold text-[#17583a] uppercase tracking-[0.12em]">Featured</span>
              </div>
              <h2 className="text-2xl font-heading font-black text-[#0d3a24] leading-tight mb-3">{featured.title}</h2>
              <p className="text-sm text-[#5f786c] leading-7 line-clamp-3">{featured.content}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#17583a] flex items-center justify-center text-white text-xs font-bold">G</div>
                <div>
                  <p className="text-xs font-semibold text-[#0d3a24]">Genaan Team</p>
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

      {rest.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map(post => (
            <Link key={post.id} href={`/journal/${post.slug ?? post.id}`} className="group block">
              <article className="rounded-2xl overflow-hidden bg-white shadow-sm h-full flex flex-col hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden bg-[#e8f3ec]">
                  {post.image
                    ? <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full flex items-center justify-center text-4xl">📝</div>}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-heading font-bold text-[#0d3a24] leading-tight mb-2">{post.title}</h2>
                  <p className="text-xs text-[#5f786c] leading-6 line-clamp-2 flex-1">{post.content}</p>
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
    </div>
  );
}
