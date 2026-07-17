import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { handleStripeWebhookEvent } from "@/lib/services/billing.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ success: false, message: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    await handleStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    const message = error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
