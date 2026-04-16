import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="mb-12 flex items-center justify-between">
      <h1 className="text-2xl font-black tracking-tight">Genaan</h1>
      <nav className="hidden items-center gap-8 text-sm text-[#5b7467] md:flex">
        <a href="#">Home</a>
        <a href="#">Plants</a>
        <a href="#">Store</a>
        <a href="#">Contact Us</a>
      </nav>
      <div className="flex items-center gap-2 text-sm">
        <button className="rounded-full border border-[#d4ded7] px-2.5 py-1">♡</button>
        <button className="rounded-full border border-[#d4ded7] px-2.5 py-1">🛒</button>
      </div>
    </header>
  );
}
