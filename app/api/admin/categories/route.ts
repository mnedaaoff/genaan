import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url, anonKey, serviceKey };
}

async function getAdminClient(req: NextRequest): Promise<
  | { client: SupabaseClient; error?: never; status?: never }
  | { client?: never; error: string; status: number }
> {
  const { url, anonKey, serviceKey } = getSupabaseConfig();

  if (!url) {
    return { error: "Missing Supabase URL", status: 500 };
  }

  if (serviceKey) {
    return {
      client: createClient(url, serviceKey, { auth: { persistSession: false } }),
    };
  }

  if (!anonKey) {
    return { error: "Missing Supabase key", status: 500 };
  }

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { error: "Missing authorization token", status: 401 };
  }

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: { user }, error: authErr } = await userClient.auth.getUser(token);
  if (authErr || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  const userMeta = user.user_metadata ?? {};
  const appMeta = user.app_metadata ?? {};
  let isAdmin =
    userMeta.is_admin === true || userMeta.role === "admin" ||
    appMeta.is_admin === true || appMeta.role === "admin";

  if (!isAdmin) {
    const { data: profile } = await userClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (profile?.is_admin === true) isAdmin = true;
  }

  if (!isAdmin) {
    const { data: roleRows } = await userClient
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id);
    if (roleRows?.some((row) => {
      const role = row.roles as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(role) ? role[0]?.name : role?.name;
      return name?.toLowerCase() === "admin" || name?.toLowerCase() === "administrator";
    })) {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    return { error: "Forbidden", status: 403 };
  }

  return { client: userClient };
}

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
