import type { Metadata } from "next";
import Link from "next/link";
import { AdPlacementExperiment } from "./components/ad-placement-experiment";
import { TakehomeCalculator } from "./components/takehome-calculator";
import { POPULAR_SALARY_LEVELS, toSalarySlug } from "@/lib/takehome";
import { getScenarioUrl, TAKEHOME_SCENARIOS } from "@/lib/takehome-scenarios";

const homeTitle = "【無料】手取り計算アプリ｜年収・給料から月の手取りを自動計算";
const homeDescription =
  "無料の手取り計算アプリです。年収・給料から月の手取りを自動計算し、社会保険料・所得税・住民税の内訳まで確認できます。会社員・個人事業主・パートに対応。";

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
      siteName: "手取り給与計算アプリ",
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
        <h1>無料の手取り計算アプリ</h1>
        <p>
          年収・給料を入れるだけで、月の手取りを自動計算できます。会社員・個人事業主・パートに対応し、
          社会保険料・所得税・住民税の内訳まで確認できます。
        </p>
        <p className="small mt-12">
          無料で使える手取りシミュレーションツールです。
        </p>
        <AdPlacementExperiment position="header" />

        <TakehomeCalculator />
        <AdPlacementExperiment position="result" />

        <section className="card mt-20">
          <h2>年収別ページ</h2>
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
