import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "../../../lib/get-admin-client";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { data: sections, error: secErr } = await admin.client
      .from("homepage_sections")
      .select(`
        id, slug, name_en, name_ar, description_en, description_ar, image, sort_order, is_active,
        homepage_section_products (product_id, sort_order)
      `)
      .order("sort_order");

    if (secErr) {
      return NextResponse.json({ error: secErr.message }, { status: 500 });
    }

    const { data: bestRows, error: bestErr } = await admin.client
      .from("homepage_best_sellers")
      .select("id, product_id, sort_order")
      .order("sort_order");

    if (bestErr) {
      return NextResponse.json({ error: bestErr.message }, { status: 500 });
    }

    const bestIds = (bestRows ?? []).map(r => r.product_id);
    let bestProducts: unknown[] = [];
    if (bestIds.length) {
      const { data: prods } = await admin.client
        .from("products")
        .select("id, name, name_en, name_ar, price, product_images(url, is_primary)")
        .in("id", bestIds);
      const byId = new Map((prods ?? []).map(p => [p.id, p]));
      bestProducts = (bestRows ?? [])
        .map(r => byId.get(r.product_id))
        .filter(Boolean);
    }

    const { data: allProducts } = await admin.client
      .from("products")
      .select("id, name, name_en, name_ar, is_active")
      .eq("is_active", true)
      .order("name");

    return NextResponse.json({
      sections: sections ?? [],
      best_sellers: bestRows ?? [],
      best_products: bestProducts,
      all_products: allProducts ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load homepage data";
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
    const action = body.action as string;

    if (action === "sync_product_sections") {
      const productId = Number(body.product_id);
      const sectionIds = Array.isArray(body.section_ids)
        ? body.section_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id))
        : [];

      if (!Number.isFinite(productId)) {
        return NextResponse.json({ error: "Invalid product_id" }, { status: 400 });
      }

      await admin.client.from("homepage_section_products").delete().eq("product_id", productId);

      if (sectionIds.length) {
        const rows = sectionIds.map((sectionId: number) => ({
          section_id: sectionId,
          product_id: productId,
          sort_order: 0,
        }));
        const { error } = await admin.client.from("homepage_section_products").insert(rows);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "bulk_assign_section") {
      const productIds = Array.isArray(body.product_ids)
        ? body.product_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id))
        : [];
      const sectionId = body.section_id === null || body.section_id === ""
        ? null
        : Number(body.section_id);

      if (!productIds.length) {
        return NextResponse.json({ error: "No products selected" }, { status: 400 });
      }

      if (sectionId === null) {
        const { error } = await admin.client
          .from("homepage_section_products")
          .delete()
          .in("product_id", productIds);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
      }

      if (!Number.isFinite(sectionId)) {
        return NextResponse.json({ error: "Invalid section_id" }, { status: 400 });
      }

      for (const productId of productIds) {
        const { data: existing } = await admin.client
          .from("homepage_section_products")
          .select("id")
          .eq("product_id", productId)
          .eq("section_id", sectionId)
          .maybeSingle();
        if (!existing) {
          const { error } = await admin.client.from("homepage_section_products").insert({
            product_id: productId,
            section_id: sectionId,
            sort_order: 0,
          });
          if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "bulk_add_to_section") {
      const sectionId = Number(body.section_id);
      const productIds = Array.isArray(body.product_ids)
        ? body.product_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id))
        : [];

      if (!Number.isFinite(sectionId) || productIds.length === 0) {
        return NextResponse.json({ error: "Invalid section or products" }, { status: 400 });
      }

      const rows = productIds.map((productId: number) => ({
        section_id: sectionId,
        product_id: productId,
        sort_order: 0,
      }));

      const { error } = await admin.client
        .from("homepage_section_products")
        .upsert(rows, { onConflict: "section_id,product_id", ignoreDuplicates: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === "bulk_clear_sections") {
      const productIds = Array.isArray(body.product_ids)
        ? body.product_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id))
        : [];

      if (productIds.length === 0) {
        return NextResponse.json({ error: "No products specified" }, { status: 400 });
      }

      const { error } = await admin.client
        .from("homepage_section_products")
        .delete()
        .in("product_id", productIds);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === "create_section") {
      const nameEn = typeof body.name_en === "string" ? body.name_en.trim() : "";
      const nameAr = typeof body.name_ar === "string" ? body.name_ar.trim() : "";
      if (!nameEn || !nameAr) {
        return NextResponse.json({ error: "English and Arabic names are required" }, { status: 400 });
      }

      const slugBase = typeof body.slug === "string" && body.slug.trim()
        ? body.slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        : nameEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const slug = `${slugBase || "section"}-${Date.now()}`;

      const { data: last } = await admin.client
        .from("homepage_sections")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data, error } = await admin.client
        .from("homepage_sections")
        .insert({
          slug,
          name_en: nameEn,
          name_ar: nameAr,
          description_en: typeof body.description_en === "string" ? body.description_en.trim() || null : null,
          description_ar: typeof body.description_ar === "string" ? body.description_ar.trim() || null : null,
          sort_order: (last?.sort_order ?? 0) + 1,
          is_active: true,
        })
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }

    if (action === "delete_section") {
      const id = Number(body.id);
      if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid section id" }, { status: 400 });
      }
      const { error } = await admin.client.from("homepage_sections").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === "update_section") {
      const id = Number(body.id);
      if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid section id" }, { status: 400 });
      }

      const payload: Record<string, unknown> = {};
      if (typeof body.name_en === "string") payload.name_en = body.name_en.trim();
      if (typeof body.name_ar === "string") payload.name_ar = body.name_ar.trim();
      if (typeof body.description_en === "string") payload.description_en = body.description_en.trim() || null;
      if (typeof body.description_ar === "string") payload.description_ar = body.description_ar.trim() || null;
      if (typeof body.image === "string") payload.image = body.image.trim() || null;
      if (typeof body.is_active === "boolean") payload.is_active = body.is_active;
      if (body.sort_order != null) payload.sort_order = Number(body.sort_order);

      const { error } = await admin.client.from("homepage_sections").update(payload).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === "sync_section_products") {
      const sectionId = Number(body.section_id);
      const productIds = Array.isArray(body.product_ids)
        ? body.product_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id))
        : [];

      if (!Number.isFinite(sectionId)) {
        return NextResponse.json({ error: "Invalid section id" }, { status: 400 });
      }

      await admin.client.from("homepage_section_products").delete().eq("section_id", sectionId);

      if (productIds.length) {
        const rows = productIds.map((productId: number, idx: number) => ({
          section_id: sectionId,
          product_id: productId,
          sort_order: idx,
        }));
        const { error } = await admin.client.from("homepage_section_products").insert(rows);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "sync_best_sellers") {
      const productIds = Array.isArray(body.product_ids)
        ? body.product_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id))
        : [];

      await admin.client.from("homepage_best_sellers").delete().neq("id", 0);

      if (productIds.length) {
        const rows = productIds.map((productId: number, idx: number) => ({
          product_id: productId,
          sort_order: idx,
        }));
        const { error } = await admin.client.from("homepage_best_sellers").insert(rows);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update homepage";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
