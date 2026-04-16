import Image from "next/image";

const spaces = [
  { id: 1, title: "Nordic Minimalist",    room: "Living Room",  image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",  plants: ["Monstera Delux", "Ava Ivy"] },
  { id: 2, title: "Urban Jungle",         room: "Home Office",  image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80",  plants: ["Livista Grand", "ZZ Sentinel"] },
  { id: 3, title: "Biophilic Bedroom",    room: "Bedroom",      image: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=900&q=80",  plants: ["Ava Ivy", "Cyber Spirit"] },
  { id: 4, title: "Kitchen Garden",       room: "Kitchen",      image: "https://images.unsplash.com/photo-1438109382753-8368e7e1e7cf?auto=format&fit=crop&w=900&q=80",  plants: ["ZZ Sentinel", "Premium Aroid Mix"] },
  { id: 5, title: "Botanical Bathroom",   room: "Bathroom",     image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",  plants: ["Ava Ivy", "Monstera Delux"] },
  { id: 6, title: "Workspace Sanctuary",  room: "Studio",       image: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80",  plants: ["ZZ Sentinel", "Livista Grand"] },
];

export default function SpacesPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f1]">
      {/* Header */}
      <div className="bg-white border-b border-[#e4ece7]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-12">
          <p className="text-xs tracking-[0.2em] font-semibold text-[#6a8377] uppercase mb-2">Interior Inspiration</p>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-[#0d3a24]">Green Spaces</h1>
          <p className="mt-3 text-sm text-[#5f786c] max-w-md">Curated room designs where plants transform ordinary spaces into living sanctuaries.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-10">
        {/* Room filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["All Rooms", "Living Room", "Bedroom", "Home Office", "Kitchen", "Bathroom", "Studio"].map(r => (
            <button key={r} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${r === "All Rooms" ? "bg-[#17583a] text-white border-[#17583a]" : "bg-white border-[#d4ded7] text-[#5f786c] hover:border-[#17583a] hover:text-[#17583a]"}`}>
              {r}
            </button>
          ))}
        </div>

        {/* Masonry-style grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space, i) => (
            <article
              key={space.id}
              className={`group relative rounded-2xl overflow-hidden shadow-sm cursor-pointer card-hover ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className={`relative ${i === 0 || i === 4 ? "h-80" : "h-64"}`}>
                <Image src={space.image} alt={space.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-block mb-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] font-semibold tracking-wide uppercase">
                  {space.room}
                </span>
                <h2 className="text-lg font-heading font-bold text-white">{space.title}</h2>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {space.plants.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-white/15 rounded text-white text-[10px]">{p}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA section */}
        <div className="mt-14 rounded-3xl bg-[#17583a] p-10 text-white text-center">
          <h2 className="text-3xl font-heading font-bold">Design Your Own Space</h2>
          <p className="mt-3 text-white/70 text-sm max-w-md mx-auto">Our plant stylists can help you choose the perfect plants for your home. Book a free 30-min consultation.</p>
          <button className="mt-6 px-8 py-3.5 bg-white text-[#17583a] text-sm font-bold rounded-full hover:bg-[#f4f5f1] transition-colors">
            Book a Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
