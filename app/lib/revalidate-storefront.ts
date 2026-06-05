import { getAdminAuthHeaders } from "./admin-auth";
import type { CACHE_TAGS } from "./cache/tags";

type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export async function revalidateStorefrontCache(tag: CacheTag): Promise<void> {
  try {
    const headers = await getAdminAuthHeaders();
    await fetch("/api/revalidate", {
      method: "POST",
      headers,
      body: JSON.stringify({ tag }),
    });
  } catch {
    // Non-fatal — cache expires by revalidate interval
  }
}
