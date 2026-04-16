import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label, error, hint, leftIcon, rightIcon,
  id, className = "", ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "_");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#8aab99] pointer-events-none">{leftIcon}</span>
        )}
        <input
          id={inputId}
          className={[
            "w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#0d3a24] placeholder:text-[#b4c9be]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[#17583a]/30 focus:border-[#17583a]",
            error
              ? "border-red-400 bg-red-50"
              : "border-[#d4ded7] hover:border-[#8aab99]",
            leftIcon  ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            className,
          ].filter(Boolean).join(" ")}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#8aab99]">{rightIcon}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-[#8aab99]">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = "", ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "_");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#5f786c]"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={[
          "w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#0d3a24] placeholder:text-[#b4c9be] resize-y min-h-[100px]",
          "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#17583a]/30 focus:border-[#17583a]",
          error ? "border-red-400 bg-red-50" : "border-[#d4ded7] hover:border-[#8aab99]",
          className,
        ].filter(Boolean).join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
