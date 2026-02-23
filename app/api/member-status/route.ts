import { NextResponse } from "next/server";
import { assertEnv } from "@/lib/env";
import { findMemberByEmail } from "@/lib/members";

type MemberStatusBody = {
  email?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function POST(request: Request) {
  try {
    assertEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

    const body = (await request.json()) as MemberStatusBody;
    const email = body.email?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "有効なメールアドレスを入力してください。" }, { status: 400 });
    }

    const member = await findMemberByEmail(email);

    if (!member) {
      return NextResponse.json({ active: false, status: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        active: ACTIVE_STATUSES.has(member.status),
        status: member.status,
        currentPeriodEnd: member.current_period_end
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ message: "会員状態の確認に失敗しました。" }, { status: 500 });
  }
}
