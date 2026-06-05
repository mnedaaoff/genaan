import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "../../lib/get-admin-client";
import { CACHE_TAGS } from "../../lib/cache/tags";

const ALLOWED_TAGS = new Set<string>(Object.values(CACHE_TAGS));

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const body = await req.json().catch(() => ({}));
    const tag = typeof body.tag === "string" ? body.tag : "";

    if (!ALLOWED_TAGS.has(tag)) {
      return NextResponse.json({ error: "Invalid cache tag" }, { status: 400 });
    }

    revalidateTag(tag, "max");
    return NextResponse.json({ ok: true, tag });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Revalidation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
