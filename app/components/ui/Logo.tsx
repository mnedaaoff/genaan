import Image from "next/image";

export function Logo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const scales: Record<string, { icon: number; text: string }> = {
    sm: { icon: 20, text: "text-lg"  },
    md: { icon: 26, text: "text-xl"  },
    lg: { icon: 36, text: "text-3xl" },
  };
  const s = scales[size];
  return (
    <div className={`flex items-center gap-2 tracking-tight ${className}`}>
      <Image src="/assets/icon.png" alt="Genaan Logo" width={s.icon} height={s.icon} className="object-contain" />
      <span
        className={`${s.text}`}
        style={{ fontFamily: "var(--font-fugaz), sans-serif" }}
      >
        <span className="text-[#17583a]">G</span>
        <span className="text-[#0d3a24]">enaan</span>
      </span>
    </div>
  );
}
