import type { Metadata } from "next";
import Link from "next/link";
import { AdPlacementExperiment } from "./components/ad-placement-experiment";
import { FinanceToolSwitcher } from "./components/finance-tool-switcher";
import { POPULAR_SALARY_LEVELS, toSalarySlug } from "@/lib/takehome";
import { getScenarioUrl, TAKEHOME_SCENARIOS } from "@/lib/takehome-scenarios";

const homeTitle = "無料の金融計算ツール総合サイト｜手取り・バイト給料・残業代・ローン計算";
const homeDescription =
  "手取り計算、バイト給料計算、残業代計算、ローン返済計算を1サイトで使える無料ツール集です。条件を入力するだけで、月収・手取り・返済額の目安をすぐ確認できます。";

export function generateMetadata(): Metadata {
  return {
    title: homeTitle,
    description: homeDescription,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: homeTitle,
      description: homeDescription,
      type: "website",
      locale: "ja_JP",
      siteName: "金融計算ツール総合サイト",
    },
    twitter: {
      card: "summary",
      title: homeTitle,
      description: homeDescription,
    },
  };
}

export default function HomePage() {
  return (
    <main>
      <div className="container">
        <span className="badge">無料・会員登録なし</span>
        <h1>無料の金融計算ツール総合サイト</h1>
        <p>
          手取り計算、バイト給料計算、残業代計算、ローン返済計算を1つの画面で使えます。まずは下のタブから目的の計算ツールを選んでください。
        </p>
        <p className="small mt-12">
          すべて無料で、会員登録なしですぐ試算できます。
        </p>
        <AdPlacementExperiment position="header" />

        <FinanceToolSwitcher />
        <AdPlacementExperiment position="result" />

        <section className="card mt-20">
          <h2>ツール別ページ</h2>
          <div className="seo-links mt-12">
            <Link href="/">手取り計算（詳細）</Link>
            <Link href="/parttime-pay">バイト給料計算</Link>
            <Link href="/overtime-pay">残業代計算</Link>
            <Link href="/loan">ローン返済計算</Link>
          </div>
        </section>

        <section className="card mt-20">
          <h2>年収別の手取りページ</h2>
          <div className="seo-links mt-12">
            {POPULAR_SALARY_LEVELS.map((salary) => (
              <Link key={salary} href={`/takehome/${toSalarySlug(salary)}`}>
                年収{salary.toLocaleString("ja-JP")}円の手取り目安
              </Link>
            ))}
          </div>
        </section>

        <section className="card mt-20">
          <h2>条件別ページ</h2>
          <div className="seo-links mt-12">
            {TAKEHOME_SCENARIOS.map((scenario) => (
              <Link key={scenario.slug} href={getScenarioUrl(scenario.slug)}>
                {scenario.title}
              </Link>
            ))}
          </div>
        </section>

        <p className="small mt-12">
          税制更新運用は <Link href="/ops">運用ページ</Link> で管理できます。
        </p>
      </div>
    </main>
  );
}
