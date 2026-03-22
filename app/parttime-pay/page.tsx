import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseSlot } from "@/app/components/adsense-slot";
import { PartTimePayCalculator } from "@/app/components/part-time-pay-calculator";

const pageTitle = "バイト給料計算ツール｜時給・シフトから月収と手取りを計算";
const pageDescription =
  "時給とシフトから、バイトの月収・手取りを無料で試算できます。残業時間、深夜時間、交通費、控除率にも対応。";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/parttime-pay",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "article",
    locale: "ja_JP",
  },
};

export default function PartTimePayPage() {
  return (
    <main>
      <div className="container">
        <h1>バイト給料計算ツール</h1>
        <p className="mt-12">
          時給・シフト・割増時間を入力すると、月の総支給と手取りの目安を計算できます。
        </p>
        <AdSenseSlot slot="4567890123" className="mt-20" />

        <PartTimePayCalculator />

        <section className="card mt-20">
          <h2>他の金融計算ツール</h2>
          <div className="seo-links mt-12">
            <Link href="/">手取り計算</Link>
            <Link href="/overtime-pay">残業代計算</Link>
            <Link href="/loan">ローン返済計算</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
