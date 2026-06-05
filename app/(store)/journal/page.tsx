import { getCachedPosts } from "../../lib/cache/public-data";
import { JournalList } from "./JournalList";

export const revalidate = 300;

export default async function JournalPage() {
  const posts = await getCachedPosts();

  return (
    <div className="min-h-screen bg-[#f4f5f1]">
      <div className="bg-[#0d3a24] text-white">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-14">
          <p className="text-xs tracking-[0.2em] font-bold text-[#78be98] uppercase mb-3">Journal</p>
          <h1 className="text-4xl md:text-5xl font-heading font-black leading-tight max-w-xl">Genaan Journal</h1>
        </div>
      </div>
      <JournalList posts={posts ?? []} />
    </div>
  );
}
