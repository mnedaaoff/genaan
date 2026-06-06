import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "../../../lib/get-admin-client";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminClient(req);
    if (!admin.client) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let { error: uploadErr } = await admin.client.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    // If the bucket doesn't exist yet, create it as public and retry once
    if (uploadErr && uploadErr.message.toLowerCase().includes("not found")) {
      const { error: bucketErr } = await admin.client.storage.createBucket(
        bucket,
        { public: true },
      );
      if (bucketErr && !bucketErr.message.toLowerCase().includes("already exists")) {
        return NextResponse.json(
          { error: `Failed to create storage bucket '${bucket}': ${bucketErr.message}` },
          { status: 500 },
        );
      }

      // Retry the upload after bucket creation
      const { error: retryErr } = await admin.client.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });
      uploadErr = retryErr;
    }

    if (uploadErr) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadErr.message}` },
        { status: 500 },
      );
    }

    const { data: urlData } = admin.client.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    if (productId) {
      if (existingImageId) {
        const { error: imgErr } = await admin.client
          .from("product_images")
          .update({ url: publicUrl })
          .eq("id", existingImageId);
        if (imgErr) {
          return NextResponse.json(
            { error: `product_images update failed: ${imgErr.message}` },
            { status: 500 },
          );
        }
      } else {
        const { error: imgErr } = await admin.client
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
            { status: 500 },
          );
        }
      }
    }

    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
