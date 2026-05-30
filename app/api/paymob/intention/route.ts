import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/paymob/intention
 *
 * Creates a Paymob Payment Intention via their Intention API v1.
 * Expects JSON body: { order_id, amount_cents, currency, items, billing_data, payment_method }
 * Returns: { client_secret, public_key }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY;
    const cardIntegrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;
    const walletIntegrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;

    console.log("[Paymob] Config check:", {
      hasSecretKey: !!secretKey,
      hasPublicKey: !!publicKey,
      cardIntegrationId,
      walletIntegrationId,
      paymentMethod: body.payment_method,
    });

    if (!secretKey || !publicKey) {
      return NextResponse.json(
        { error: "Paymob keys not configured. Set PAYMOB_SECRET_KEY and NEXT_PUBLIC_PAYMOB_PUBLIC_KEY in .env.local" },
        { status: 500 }
      );
    }

    // For Unified Checkout, we should always send ALL configured integration IDs.
    // Paymob will dynamically display only the active payment methods on the unified checkout page.
    // This prevents 404 errors if one of the methods (like wallet) is not yet active on the merchant profile.
    const integrationIds: number[] = [];
    if (cardIntegrationId) integrationIds.push(Number(cardIntegrationId));
    if (walletIntegrationId) integrationIds.push(Number(walletIntegrationId));

    if (integrationIds.length === 0) {
      return NextResponse.json(
        { error: "No payment integration IDs configured. Set PAYMOB_CARD_INTEGRATION_ID or PAYMOB_WALLET_INTEGRATION_ID." },
        { status: 500 }
      );
    }

    // Build intention payload per Paymob Intention API v1
    const intentionPayload = {
      amount: body.amount_cents,   // Amount in cents (100 EGP = 10000)
      currency: body.currency ?? "EGP",
      payment_methods: integrationIds,
      items: (body.items && body.items.length > 0)
        ? body.items
        : [
            {
              name: `Order #${body.order_id}`,
              amount: body.amount_cents,
              description: `Genaan Order #${body.order_id}`,
              quantity: 1,
            },
          ],
      billing_data: {
        first_name:   body.billing_data?.first_name   ?? "Guest",
        last_name:    body.billing_data?.last_name    ?? "User",
        email:        body.billing_data?.email        ?? "guest@genaan.com",
        phone_number: body.billing_data?.phone_number ?? "01000000000",
        street:       body.billing_data?.street       ?? "NA",
        city:         body.billing_data?.city         ?? "Cairo",
        country:      body.billing_data?.country      ?? "EG",
        state:        body.billing_data?.state        ?? "NA",
        apartment:    body.billing_data?.apartment    ?? "NA",
        floor:        body.billing_data?.floor        ?? "NA",
        building:     body.billing_data?.building     ?? "NA",
        postal_code:  body.billing_data?.postal_code  ?? "00000",
      },
      extras: {
        ee: body.order_id ? String(body.order_id) : undefined,
      },
      special_reference: body.order_id ? `genaan-${body.order_id}` : undefined,
      redirection_url: body.return_url ?? undefined,
    };

    console.log("[Paymob] Sending intention:", JSON.stringify({
      amount: intentionPayload.amount,
      currency: intentionPayload.currency,
      payment_methods: intentionPayload.payment_methods,
      items_count: intentionPayload.items.length,
      billing_email: intentionPayload.billing_data.email,
      billing_phone: intentionPayload.billing_data.phone_number,
      special_reference: intentionPayload.special_reference,
    }));

    // Call Paymob Intention API
    const paymobRes = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${secretKey}`,
      },
      body: JSON.stringify(intentionPayload),
    });

    const responseText = await paymobRes.text();
    console.log("[Paymob] Response status:", paymobRes.status);
    console.log("[Paymob] Response body:", responseText.substring(0, 500));

    if (!paymobRes.ok) {
      return NextResponse.json(
        { error: `Paymob API error (${paymobRes.status}): ${responseText.substring(0, 200)}` },
        { status: 502 }
      );
    }

    let paymobData;
    try {
      paymobData = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: `Paymob returned invalid JSON: ${responseText.substring(0, 100)}` },
        { status: 502 }
      );
    }

    if (!paymobData.client_secret) {
      return NextResponse.json(
        { error: `Paymob did not return client_secret. Response: ${JSON.stringify(paymobData).substring(0, 200)}` },
        { status: 502 }
      );
    }

    console.log("[Paymob] ✅ Intention created, client_secret received");

    return NextResponse.json({
      client_secret: paymobData.client_secret,
      public_key: publicKey,
      intention_id: paymobData.id,
    });
  } catch (err: any) {
    console.error("[Paymob] Intention error:", err?.message ?? err);
    return NextResponse.json(
      { error: `Server error: ${err?.message ?? "Unknown error"}` },
      { status: 500 }
    );
  }
}
