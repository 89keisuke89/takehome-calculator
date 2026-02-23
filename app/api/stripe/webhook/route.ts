import { NextResponse } from "next/server";
import Stripe from "stripe";
import { assertEnv } from "@/lib/env";
import { upsertMember } from "@/lib/members";
import { getStripeClient } from "@/lib/stripe";

function formatPeriodEnd(unixTime: number | null | undefined) {
  if (!unixTime) {
    return null;
  }

  return new Date(unixTime * 1000).toISOString();
}

function readEmail(subscription: Stripe.Subscription, fallback: string | null) {
  const metadataEmail = subscription.metadata?.email?.trim().toLowerCase();
  if (metadataEmail) {
    return metadataEmail;
  }

  return fallback?.trim().toLowerCase() || null;
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const stripe = getStripeClient();
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;

  if (!customerId) {
    return;
  }

  const customer = await stripe.customers.retrieve(customerId);
  const customerEmail = !("deleted" in customer) ? customer.email : null;
  const email = readEmail(subscription, customerEmail);

  if (!email) {
    return;
  }

  const itemPeriodEnds = subscription.items.data.map((item) => item.current_period_end);
  const currentPeriodEnd = itemPeriodEnds.length > 0 ? Math.max(...itemPeriodEnds) : null;

  await upsertMember({
    email,
    status: subscription.status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    priceId: subscription.items.data[0]?.price.id ?? null,
    currentPeriodEnd: formatPeriodEnd(currentPeriodEnd)
  });
}

export async function POST(request: Request) {
  try {
    assertEnv(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

    const stripe = getStripeClient();
    const signature = request.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ message: "Webhook signature is missing." }, { status: 400 });
    }

    const payload = await request.text();

    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await handleSubscriptionEvent(subscription);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(subscription);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(subscription);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ message: "Webhook processing failed." }, { status: 400 });
  }
}
