import { getAdminAuthHeaders } from "./admin-auth";

export interface HomepageSectionOption {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  is_active?: boolean;
}

export async function saveProductSections(
  productId: number,
  sectionIds: number[]
): Promise<void> {
  const headers = await getAdminAuthHeaders();
  const res = await fetch("/api/admin/homepage", {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      action: "sync_product_sections",
      product_id: productId,
      section_ids: sectionIds,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to save product sections");
}
