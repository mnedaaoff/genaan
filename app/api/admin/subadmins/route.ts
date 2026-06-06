import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "../../../lib/get-admin-client";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    // Only master admins or subadmins with staff permission can list subadmins
    // For simplicity, we fetch all users where role is subadmin
    const { data: subadmins, error } = await admin.client
      .from("profiles")
      .select("*")
      .eq("role", "subadmin")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ subadmins });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const body = await req.json();
    const { email, password, first_name, last_name, phone, permissions } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Create auth user using Supabase Auth Admin API (bypasses RLS & signups restrictions)
    const { data: authData, error: authErr } = await admin.client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    });

    if (authErr || !authData.user) {
      throw new Error(authErr?.message ?? "Failed to create auth user");
    }

    // 2. Create profile row with subadmin role and specific permissions
    const { error: profileErr } = await admin.client
      .from("profiles")
      .upsert({
        id: authData.user.id,
        first_name: first_name || null,
        last_name: last_name || null,
        email,
        phone: phone || null,
        role: "subadmin",
        permissions: permissions || [],
        is_admin: false,
        created_at: new Date().toISOString(),
      });

    if (profileErr) {
      // Cleanup auth user if profile creation fails
      await admin.client.auth.admin.deleteUser(authData.user.id);
      throw profileErr;
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const body = await req.json();
    const { id, first_name, last_name, phone, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: "Subadmin user ID is required" }, { status: 400 });
    }

    const { error } = await admin.client
      .from("profiles")
      .update({
        first_name: first_name !== undefined ? first_name : undefined,
        last_name: last_name !== undefined ? last_name : undefined,
        phone: phone !== undefined ? phone : undefined,
        permissions: permissions !== undefined ? permissions : undefined,
      })
      .eq("id", id)
      .eq("role", "subadmin");

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subadmin user ID is required" }, { status: 400 });
    }

    // 1. Delete from auth (this cascades or deletes profile if FK setup.
    // If profiles has ON DELETE CASCADE from auth.users, profiles will delete automatically.
    // Let's delete profile manually first to be safe if no cascade is active:
    await admin.client.from("profiles").delete().eq("id", id).eq("role", "subadmin");

    const { error: authErr } = await admin.client.auth.admin.deleteUser(id);
    if (authErr) throw authErr;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
