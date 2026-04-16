import React from "react";

type Variant = "primary" | "outline" | "ghost" | "danger" | "white";
type Size    = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#17583a] text-white hover:bg-[#195b36] active:bg-[#0d3a24] shadow-sm",
  outline: "border border-[#d4ded7] bg-white text-[#245640] hover:border-[#17583a] hover:text-[#17583a]",
  ghost:   "text-[#5f786c] hover:bg-[#e8f3ec] hover:text-[#17583a]",
  danger:  "bg-red-600 text-white hover:bg-red-700",
  white:   "bg-white text-[#17583a] hover:bg-[#f4f5f1] shadow-sm",
};

const sizes: Record<Size, string> = {
  xs: "px-3 py-1.5 text-xs rounded-md",
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3.5 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size    = "md",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150",
    "focus-visible:ring-2 focus-visible:ring-[#17583a] focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed select-none",
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
      )}
      {children}
    </button>
  );
}
