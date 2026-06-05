import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "../../../lib/get-admin-client";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const body = await req.json();
    const nameEn = typeof body.name_en === "string" ? body.name_en.trim() : "";
    const nameAr = typeof body.name_ar === "string" ? body.name_ar.trim() : "";
    const parent_id =
      body.parent_id === null || body.parent_id === undefined || body.parent_id === ""
        ? null
        : Number(body.parent_id);

    if (!nameEn || !nameAr) {
      return NextResponse.json(
        { error: "English and Arabic names are required" },
        { status: 400 }
      );
    }

    const { data, error } = await admin.client
      .from("categories")
      .insert({
        name_en: nameEn,
        name_ar: nameAr,
        name: nameEn,
        parent_id: Number.isFinite(parent_id) ? parent_id : null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const body = await req.json();
    const id = Number(body.id);
    const image = typeof body.image === "string" ? body.image : null;

    if (!Number.isFinite(id) || !image) {
      return NextResponse.json({ error: "Invalid category update" }, { status: 400 });
    }

    const { error } = await admin.client
      .from("categories")
      .update({ image })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const { error } = await admin.client.from("categories").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
