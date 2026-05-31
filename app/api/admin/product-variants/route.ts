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

function buildVariantName(color: string, size: string): string {
  const parts = [color.trim(), size.trim()].filter(Boolean);
  return parts.join(" · ") || "Default";
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const productId = Number(new URL(req.url).searchParams.get("product_id"));
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product_id" }, { status: 400 });
    }

    const { data, error } = await admin.client
      .from("product_variants")
      .select("id, color, size, price, stock, name")
      .eq("product_id", productId)
      .order("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load variants";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const body = await req.json();
    const productId = Number(body.product_id);
    const variants = Array.isArray(body.variants) ? body.variants : [];
    const basePrice = Number(body.base_price) || 0;

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product_id" }, { status: 400 });
    }

    const validRows = variants.filter(
      (v: { color?: string; size?: string }) =>
        (typeof v.color === "string" && v.color.trim()) ||
        (typeof v.size === "string" && v.size.trim())
    );

    const keepIds = validRows
      .map((v: { id?: number }) => Number(v.id))
      .filter((id: number) => Number.isFinite(id));

    const { data: existing } = await admin.client
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    const toDelete = (existing ?? [])
      .map(r => r.id)
      .filter(id => !keepIds.includes(id));

    if (toDelete.length) {
      const { error: delErr } = await admin.client
        .from("product_variants")
        .delete()
        .in("id", toDelete);
      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 });
      }
    }

    const saved = [];
    for (const row of validRows) {
      const color = typeof row.color === "string" ? row.color.trim() : "";
      const size = typeof row.size === "string" ? row.size.trim() : "";
      const payload = {
        product_id: productId,
        name: buildVariantName(color, size),
        color: color || null,
        size: size || null,
        price: row.price != null && row.price !== "" ? Number(row.price) : basePrice,
        stock: row.stock != null && row.stock !== "" ? Number(row.stock) : 0,
      };

      const rowId = Number(row.id);
      if (Number.isFinite(rowId)) {
        const { data, error } = await admin.client
          .from("product_variants")
          .update(payload)
          .eq("id", rowId)
          .select("id, color, size, price, stock, name")
          .single();
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        saved.push(data);
      } else {
        const { data, error } = await admin.client
          .from("product_variants")
          .insert(payload)
          .select("id, color, size, price, stock, name")
          .single();
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        saved.push(data);
      }
    }

    if (saved.length > 0) {
      const minPrice = Math.min(
        ...saved.map(v => Number(v.price)).filter(p => Number.isFinite(p) && p > 0)
      );
      if (Number.isFinite(minPrice)) {
        await admin.client.from("products").update({ price: minPrice }).eq("id", productId);
      }
    }

    return NextResponse.json({ data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save variants";
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
      return NextResponse.json({ error: "Invalid variant id" }, { status: 400 });
    }

    const { error } = await admin.client.from("product_variants").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete variant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
