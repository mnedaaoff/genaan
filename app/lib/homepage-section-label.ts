export interface HomepageSectionLike {
  name_en?: string | null;
  name_ar?: string | null;
  name?: string | null;
}

export function homepageSectionLabel(
  section: HomepageSectionLike,
  lang: "en" | "ar"
): string {
  if (lang === "ar") {
    return section.name_ar?.trim() || section.name_en?.trim() || section.name?.trim() || "";
  }
  return section.name_en?.trim() || section.name_ar?.trim() || section.name?.trim() || "";
}

export function homepageSectionDescription(
  section: { description_en?: string | null; description_ar?: string | null },
  lang: "en" | "ar"
): string {
  if (lang === "ar") {
    return section.description_ar?.trim() || section.description_en?.trim() || "";
  }
  return section.description_en?.trim() || section.description_ar?.trim() || "";
}
