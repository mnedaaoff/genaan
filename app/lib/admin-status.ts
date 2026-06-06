import { supabase } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Admin flag from database only — never trust client-editable user_metadata.
 * Returns true for full admins AND subadmins.
 */
export async function resolveIsAdmin(user: SupabaseUser): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", user.id)
    .maybeSingle();

  // Full admin via flag or role column
  if (profile?.is_admin === true) return true;
  if (profile?.role === "admin") return true;

  // Subadmin: also allowed into the dashboard (with restricted nav)
  if (profile?.role === "subadmin") return true;

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

/**
 * Returns the permissions array for a subadmin, or null for full admins (meaning all permissions).
 */
export async function resolveAdminPermissions(
  user: SupabaseUser
): Promise<string[] | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role, permissions")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_admin === true || profile?.role === "admin") return null; // full access
  if (profile?.role === "subadmin") {
    return (profile.permissions as string[]) || [];
  }
  return null;
}
