import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 bg-[#f4f5f1]">
      <div className="text-center max-w-md">
        <p className="text-8xl font-heading font-black text-[#e4ece7] mb-4">404</p>
        <h1 className="text-2xl font-heading font-bold text-[#0d3a24] mb-3">
          Page Not Found
        </h1>
        <p className="text-[#5f786c] text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/shop"
            className="px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors"
          >
            Browse Shop
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:border-[#17583a] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
