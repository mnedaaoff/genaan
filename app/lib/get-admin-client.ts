import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url, anonKey, serviceKey };
}

export async function getAdminClient(req: NextRequest): Promise<
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
