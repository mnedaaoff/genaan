import Image from "next/image";
import iconImg from "@/app/icon.png";

export function Logo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const scales: Record<string, { icon: number; text: string }> = {
    sm: { icon: 20, text: "text-lg"  },
    md: { icon: 26, text: "text-xl"  },
    lg: { icon: 36, text: "text-3xl" },
  };
  const s = scales[size];
  return (
    <div className={`flex items-center gap-2 tracking-tight ${className}`}>
      <Image src={iconImg} alt="Genaan Logo" width={s.icon} height={s.icon} className="object-contain" />
      <span className={`${s.text} font-[family-name:var(--font-fugaz)]`}>
        <span className="text-primary-600">G</span>
        <span className="text-[#0d3a24]">enaan</span>
      </span>
    </div>
  );
}
