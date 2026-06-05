import { supabase } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Admin flag from database only — never trust client-editable user_metadata.
 */
export async function resolveIsAdmin(user: SupabaseUser): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_admin === true) return true;

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id);

  return (
    roleRows?.some(row => {
      const role = row.roles as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(role) ? role[0]?.name : role?.name;
      return name?.toLowerCase() === "admin" || name?.toLowerCase() === "administrator";
    }) ?? false
  );
}
