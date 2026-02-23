import { NextResponse } from "next/server";
import { assertEnv } from "@/lib/env";
import { findMemberByEmail } from "@/lib/members";

type MemberContentBody = {
  email?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function POST(request: Request) {
  try {
    assertEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

    const body = (await request.json()) as MemberContentBody;
    const email = body.email?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "有効なメールアドレスを入力してください。" }, { status: 400 });
    }

    const member = await findMemberByEmail(email);

    if (!member || !ACTIVE_STATUSES.has(member.status)) {
      return NextResponse.json({ message: "有料会員のみ閲覧できます。" }, { status: 403 });
    }

    return NextResponse.json(
      {
        items: [
          {
            title: "3月の卒業シーズン前予約を埋める導線",
            body: "平日昼を埋めるため、学割+前髪カット無料の組み合わせを訴求。LINE予約リンクは投稿1行目に配置。"
          },
          {
            title: "小規模店舗向けの補助金チェックポイント",
            body: "設備更新は自治体制度が優先。直近30日で更新された自治体ページを毎朝確認し、締切逆算で告知。"
          },
          {
            title: "今週のSNS投稿テンプレ",
            body: "火曜: ビフォーアフター / 木曜: スタッフ紹介 / 土曜: 予約空き枠の即時告知で回転率を最適化。"
          }
        ]
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ message: "会員コンテンツ取得に失敗しました。" }, { status: 500 });
  }
}
