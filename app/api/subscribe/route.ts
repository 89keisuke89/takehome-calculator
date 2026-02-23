import { NextResponse } from "next/server";
import { assertEnv } from "@/lib/env";
import { getServiceSupabaseClient } from "@/lib/supabase";

type SubscribeBody = {
  email?: string;
  shopName?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    assertEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  } catch {
    return NextResponse.json({ message: "サーバー設定を確認してください。" }, { status: 500 });
  }

  const body = (await request.json()) as SubscribeBody;
  const email = body.email?.trim().toLowerCase();
  const shopName = body.shopName?.trim() || null;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: "有効なメールアドレスを入力してください。" }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabaseClient();
    const { error } = await supabase.from("leads").insert({
      email,
      shop_name: shopName,
      source: "lp"
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "このメールアドレスは登録済みです。" }, { status: 200 });
      }

      return NextResponse.json({ message: "登録に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ message: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "サーバー設定を確認してください。" }, { status: 500 });
  }
}
