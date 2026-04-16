import React from "react";

type Variant = "green" | "yellow" | "red" | "blue" | "gray" | "purple";
type Size    = "sm" | "md";

const styles: Record<Variant, string> = {
  green:  "bg-[#e8f3ec] text-[#17583a]",
  yellow: "bg-amber-50  text-amber-700",
  red:    "bg-red-50    text-red-700",
  blue:   "bg-blue-50   text-blue-700",
  gray:   "bg-gray-100  text-gray-600",
  purple: "bg-purple-50 text-purple-700",
};

const sizes: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[10px] rounded",
  md: "px-2.5 py-1 text-xs rounded-md",
};

export function Badge({
  children,
  variant = "green",
  size = "md",
  dot = false,
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  dot?: boolean;
  className?: string;
}) {
  const dotColor =
    variant === "green"  ? "bg-[#17583a]" :
    variant === "red"    ? "bg-red-500"   :
    variant === "yellow" ? "bg-amber-500" :
    variant === "blue"   ? "bg-blue-500"  :
    variant === "purple" ? "bg-purple-500":
    "bg-gray-400";

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold whitespace-nowrap ${styles[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />}
      {children}
    </span>
  );
}
