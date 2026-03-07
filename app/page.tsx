import type { Metadata } from "next";
import Link from "next/link";
import { AdPlacementExperiment } from "./components/ad-placement-experiment";
import { DomainProductContent } from "./components/domain-product-content";
import { TakehomeCalculator } from "./components/takehome-calculator";
import { getActiveDomainProduct } from "@/lib/active-domain";
import { POPULAR_SALARY_LEVELS, toSalarySlug } from "@/lib/takehome";
import { getScenarioUrl, TAKEHOME_SCENARIOS } from "@/lib/takehome-scenarios";

const activeDomainProduct = getActiveDomainProduct();

export function generateMetadata(): Metadata {
  if (!activeDomainProduct) {
    return {
      alternates: {
        canonical: "/",
      },
    };
  }

  return {
    title: `${activeDomainProduct.title} | ${activeDomainProduct.domain}`,
    description: activeDomainProduct.oneLiner,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: activeDomainProduct.title,
      description: activeDomainProduct.oneLiner,
      type: "website",
      locale: "ja_JP",
      siteName: activeDomainProduct.title,
    },
  };
}

export default function HomePage() {
  if (activeDomainProduct) {
    return (
      <main>
        <div className="container">
          <DomainProductContent product={activeDomainProduct} />
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <span className="badge">無料・会員登録なし</span>
        <h1>手取り給与を30秒で概算</h1>
        <p>
          年収を入れるだけで、税率系パラメータを自動調整。手取り年収と月の受取額の目安をすぐ確認できます。
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

        <section className="card mt-20">
          <h2>ミニゲーム</h2>
          <p>休憩用にクラシック Snake を遊べます。</p>
          <p className="mt-12">
            <Link href="/games/snake" className="button inline-button">
              Snakeを遊ぶ
            </Link>
          </p>
        </section>

        <p className="small mt-12">
          税制更新運用は <Link href="/ops">運用ページ</Link> で管理できます。
        </p>
        <p className="small mt-12">
          別ジャンル10本の実装は <Link href="/domains">ドメイン一覧</Link> から確認できます。
        </p>
      </div>
    </main>
  );
}
