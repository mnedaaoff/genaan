"use client";

import { homepageSectionLabel } from "../../lib/homepage-section-label";
import type { HomepageSectionOption } from "../../lib/product-sections";

interface ProductSectionsPickerProps {
  sections: HomepageSectionOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  lang: "en" | "ar";
}

export function ProductSectionsPicker({
  sections,
  selectedIds,
  onChange,
  lang,
}: ProductSectionsPickerProps) {
  const isRTL = lang === "ar";

  if (sections.length === 0) {
    return (
      <p className="text-xs text-[#8aab99]">
        {isRTL
          ? "لا توجد أقسام — أضفها من الصفحة الرئيسية في الداشبورد."
          : "No sections yet — add them under Homepage in the dashboard."}
      </p>
    );
  }

  const toggle = (id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(x => x !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-[#5f786c] leading-relaxed">
        {isRTL
          ? "نفس الأقسام اللي بتظهر في الصفحة الرئيسية وصفحة المتجر."
          : "Same sections shown on the homepage and shop page."}
      </p>
      <div className="max-h-44 overflow-y-auto space-y-1 border border-[#e4ece7] rounded-xl bg-[#f4f5f1] p-2">
        {sections.map(sec => (
            <label
              key={sec.id}
              className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-white cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(sec.id)}
                onChange={() => toggle(sec.id)}
                className="rounded border-[#d4ded7] text-[#17583a]"
              />
              <span className="font-medium text-[#0d3a24]">
                {homepageSectionLabel(sec, lang)}
              </span>
            </label>
          ))}
      </div>
    </div>
  );
}
