import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      return NextResponse.json({ error: "Missing SUPABASE_URL" }, { status: 500 });
    }

    const keyToUse = serviceKey || anonKey;
    if (!keyToUse) {
      return NextResponse.json({ error: "Missing Supabase key" }, { status: 500 });
    }

    // Admin client created at request-time — bypasses RLS via service key
    const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
      auth: { persistSession: false },
    });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "products";
    const pathFromForm = formData.get("path") as string | null;
    const productId = formData.get("product_id") as string | null;
    const existingImageId = formData.get("existing_image_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const filePath =
      pathFromForm ||
      `products/${productId ?? "unknown"}-${Date.now()}.${ext}`;

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload to Supabase Storage (service key bypasses storage RLS)
    const { error: uploadErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        {
          error: `Storage upload failed: ${uploadErr.message}`,
          keyUsed: serviceKey ? "service_role" : "anon",
        },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // 2. Update product_images table server-side (service key bypasses table RLS)
    if (productId) {
      if (existingImageId) {
        const { error: imgErr } = await supabaseAdmin
          .from("product_images")
          .update({ url: publicUrl })
          .eq("id", existingImageId);
        if (imgErr) {
          return NextResponse.json(
            { error: `product_images update failed: ${imgErr.message}` },
            { status: 500 }
          );
        }
      } else {
        const { error: imgErr } = await supabaseAdmin
          .from("product_images")
          .insert({
            product_id: Number(productId),
            url: publicUrl,
            is_primary: true,
            sort_order: 0,
          });
        if (imgErr) {
          return NextResponse.json(
            { error: `product_images insert failed: ${imgErr.message}` },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}

// Next.js App Router segment config
export const dynamic = "force-dynamic";
