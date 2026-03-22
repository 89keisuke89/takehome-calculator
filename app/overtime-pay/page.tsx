import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseSlot } from "@/app/components/adsense-slot";
import { OvertimePayCalculator } from "@/app/components/overtime-pay-calculator";

const pageTitle = "残業代計算ツール｜月給と残業時間から手取り残業代を試算";
const pageDescription =
  "月給・所定労働時間・残業時間から、残業代と手取りの目安を無料で計算できます。平日・深夜・休日に対応。";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/overtime-pay",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "article",
    locale: "ja_JP",
  },
};

export default function OvertimePayPage() {
  return (
    <main>
      <div className="container">
        <h1>残業代計算ツール</h1>
        <p className="mt-12">
          月給と残業時間を入力すると、法定割増率ベースの残業代を概算できます。
        </p>
        <AdSenseSlot slot="5678901234" className="mt-20" />

        <OvertimePayCalculator />

        <section className="card mt-20">
          <h2>他の金融計算ツール</h2>
          <div className="seo-links mt-12">
            <Link href="/">手取り計算</Link>
            <Link href="/parttime-pay">バイト給料計算</Link>
            <Link href="/loan">ローン返済計算</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
