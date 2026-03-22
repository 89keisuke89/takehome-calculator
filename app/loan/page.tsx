import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseSlot } from "@/app/components/adsense-slot";
import { LoanCalculator } from "@/app/components/loan-calculator";

const pageTitle = "ローン返済計算ツール｜借入額・金利・期間から毎月返済額を試算";
const pageDescription =
  "住宅ローンや自動車ローンの返済額を無料で計算できます。借入額、金利、返済年数、繰上返済を入力して比較可能。";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/loan",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "article",
    locale: "ja_JP",
  },
};

export default function LoanPage() {
  return (
    <main>
      <div className="container">
        <h1>ローン返済計算ツール</h1>
        <p className="mt-12">
          借入条件を入力して、毎月返済額・総返済額・利息総額をすぐ比較できます。
        </p>
        <AdSenseSlot slot="6789012345" className="mt-20" />

        <LoanCalculator />

        <section className="card mt-20">
          <h2>他の金融計算ツール</h2>
          <div className="seo-links mt-12">
            <Link href="/">手取り計算</Link>
            <Link href="/parttime-pay">バイト給料計算</Link>
            <Link href="/overtime-pay">残業代計算</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
