import { NextResponse } from "next/server";
import { assertEnv } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";

type CheckoutBody = {
  email?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    assertEnv(["STRIPE_SECRET_KEY", "STRIPE_PRICE_ID", "NEXT_PUBLIC_APP_URL"]);

    const stripe = getStripeClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const priceId = process.env.STRIPE_PRICE_ID;
    const body = (await request.json()) as CheckoutBody;
    const email = body.email?.trim().toLowerCase();

    if (!appUrl || !priceId) {
      return NextResponse.json({ message: "環境変数が不足しています。" }, { status: 500 });
    }

    if (!email) {
      return NextResponse.json({ message: "メールアドレスを入力してください。" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "有効なメールアドレスを入力してください。" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        metadata: {
          email
        }
      },
      metadata: {
        email
      }
    });

    if (!session.url) {
      return NextResponse.json({ message: "決済URLの生成に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Stripe設定を確認してください。" }, { status: 500 });
  }
}
