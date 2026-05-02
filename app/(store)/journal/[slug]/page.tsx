import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "../../../lib/api";

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: any;
  let related: any[] = [];

  try {
    post = await posts.get(slug);
    const all = await posts.list();
    related = all.filter((p: any) => p.id !== post.id).slice(0, 3);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f4f5f1]">
      {/* Hero image */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image src={post.cover_image ?? ""} alt={post.title} fill className="object-cover" priority/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-[800px] px-5 md:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white">Home</Link><span>/</span>
              <Link href="/journal" className="hover:text-white">Journal</Link><span>/</span>
              <span className="text-white/80 truncate">{post.title}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-heading font-black text-white leading-tight">{post.title}</h1>
            <p className="mt-3 text-sm text-white/70">{new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[800px] px-5 md:px-8 py-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
          <p className="text-lg text-[#5f786c] leading-8 font-medium mb-6">{post.excerpt}</p>
          <div className="prose prose-sm max-w-none text-[#5f786c] leading-8 space-y-4">
            <p>Plants have been humanity's companions for millennia, shaping cultures, cuisines, and climates alike. In the modern era, we're rediscovering the profound impact that bringing greenery indoors has on our wellbeing—from reducing stress to improving air quality.</p>
            <p>At Genaan, we believe plant care should be intuitive, not intimidating. Our platform combines the wisdom of experienced botanists with cutting-edge digital tools to help you grow with confidence.</p>
            <p>Whether you're nurturing your first succulent or expanding an already impressive collection, the secret is consistency. Regular watering schedules, appropriate lighting, and seasonal adjustments make all the difference.</p>
            <p>The relationship between human and plant is fundamentally symbiotic: we provide water, light, and care; they provide oxygen, beauty, and a sense of connection to the natural world that so many of us crave.</p>
            <p>Ready to deepen your botanical journey? Explore our curated collection and discover plants perfectly matched to your lifestyle, space, and experience level.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-[#e4ece7] flex items-center justify-between">
            <Link href="/journal" className="text-sm font-semibold text-[#17583a] hover:underline">← Back to Journal</Link>
            <Link href="/shop" className="px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-lg hover:bg-[#195b36] transition-colors">
              Shop Plants
            </Link>
          </div>
        </div>

        {/* Related posts */}
        <div className="mt-12">
          <h2 className="text-xl font-heading font-bold text-[#0d3a24] mb-6">More from the Journal</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map(p => (
              <Link key={p.id} href={`/journal/${p.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm card-hover block">
                <div className="relative h-36 overflow-hidden">
                  <Image src={p.cover_image ?? ""} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform"/>
                </div>
                <div className="p-4">
                  <p className="text-xs font-heading font-bold text-[#0d3a24] leading-tight group-hover:text-[#17583a] transition-colors">{p.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
