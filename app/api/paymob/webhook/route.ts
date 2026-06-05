import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const hmacReceived = searchParams.get("hmac");

    console.log("[Paymob Webhook] Received webhook payload type:", body.type);

    // Paymob callbacks send type = "TRANSACTION" for payments
    if (body.type !== "TRANSACTION") {
      return NextResponse.json({ received: true });
    }

    const transaction = body.obj;
    if (!transaction) {
      return NextResponse.json({ error: "Missing transaction object" }, { status: 400 });
    }

    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;

    if (hmacSecret && hmacReceived) {
      // Concatenate fields in Paymob specified order
      const dataToHash = 
        String(transaction.amount_cents ?? "") +
        String(transaction.created_at ?? "") +
        String(transaction.currency ?? "") +
        String(transaction.error_occured ?? "") +
        String(transaction.has_parent_transaction ?? "") +
        String(transaction.id ?? "") +
        String(transaction.integration_id ?? "") +
        String(transaction.is_3d_secure ?? "") +
        String(transaction.is_auth ?? "") +
        String(transaction.is_capture ?? "") +
        String(transaction.is_refunded ?? "") +
        String(transaction.is_standalone_payment ?? "") +
        String(transaction.transaction_processed_callback_responses ?? "") +
        String(transaction.pending ?? "") +
        String(transaction.source_data?.pan ?? "") +
        String(transaction.source_data?.sub_type ?? "") +
        String(transaction.source_data?.type ?? "") +
        String(transaction.success ?? "");

      const computedHmac = crypto
        .createHmac("sha512", hmacSecret)
        .update(dataToHash)
        .digest("hex");

      if (computedHmac !== hmacReceived) {
        console.warn("[Paymob Webhook] ❌ HMAC verification failed!");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      console.log("[Paymob Webhook] ✅ HMAC verification succeeded");
    } else {
      console.warn("[Paymob Webhook] ⚠️ HMAC signature check skipped (PAYMOB_HMAC_SECRET not set or hmac parameter missing)");
    }

    // Extract Order UUID from special_reference (e.g. "genaan-UUID")
    const specialRef = transaction.special_reference;
    let orderId: string | null = null;
    if (specialRef && specialRef.startsWith("genaan-")) {
      orderId = specialRef.substring(7);
    } else if (transaction.extra_data?.ee) {
      orderId = String(transaction.extra_data.ee);
    }

    if (!orderId) {
      console.warn("[Paymob Webhook] No order ID found in transaction");
      return NextResponse.json({ error: "No order reference found" }, { status: 400 });
    }

    console.log(`[Paymob Webhook] Processing payment for Order ID: ${orderId}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[Paymob Webhook] Missing Supabase service role configuration");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Initialize admin client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const isSuccess = transaction.success === true || String(transaction.success) === "true";
    const isPending = transaction.pending === true || String(transaction.pending) === "true";

    let paymentStatus: "paid" | "failed" | "pending" = "pending";
    let orderStatus: "confirmed" | "canceled" | "pending" = "pending";

    if (isSuccess && !isPending) {
      paymentStatus = "paid";
      orderStatus = "confirmed";
    } else if (!isSuccess && !isPending) {
      paymentStatus = "failed";
      orderStatus = "canceled";
    }

    console.log(`[Paymob Webhook] Updating order ${orderId} status to payment_status: ${paymentStatus}, status: ${orderStatus}`);

    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateErr) {
      console.error("[Paymob Webhook] Failed to update order in database:", updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    console.log(`[Paymob Webhook] ✅ Order ${orderId} updated successfully`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Paymob Webhook] Internal error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
}
