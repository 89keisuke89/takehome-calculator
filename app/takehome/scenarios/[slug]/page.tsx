import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseSlot } from "@/app/components/adsense-slot";
import {
  getEmploymentTypeLabel,
  getPrefectureLabel,
  getRelatedScenarios,
  getScenarioSalaryUrl,
  getScenarioUrl,
  getScenariosForSalary,
  getTakehomeScenarioBySlug,
  getTakehomeScenarioResult,
  TAKEHOME_SCENARIOS,
} from "@/lib/takehome-scenarios";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return TAKEHOME_SCENARIOS.map((scenario) => ({ slug: scenario.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const scenario = getTakehomeScenarioBySlug(params.slug);
  if (!scenario) {
    return {
      title: "ページが見つかりません",
      description: "条件別の手取りページが見つかりませんでした。",
    };
  }

  const result = getTakehomeScenarioResult(scenario);
  const monthly = Math.round(result.monthlyTakehome).toLocaleString("ja-JP");
  const title = `【${result.taxYear}年版】${scenario.query}｜月手取り${monthly}円の目安`;
  const description = `${scenario.title}。月手取り${monthly}円、年間手取り${Math.round(
    result.annualTakehome
  ).toLocaleString("ja-JP")}円の概算。社会保険料・所得税・住民税の内訳まで確認できます。`;

  return {
    title,
    description,
    alternates: {
      canonical: getScenarioUrl(scenario.slug),
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "ja_JP",
    },
  };
}

export default function TakehomeScenarioPage({ params }: Props) {
  const scenario = getTakehomeScenarioBySlug(params.slug);
  if (!scenario) {
    return (
      <main>
        <div className="container">
          <section className="card">
            <h1>ページが見つかりません</h1>
            <p className="mt-12">条件別ページのURLを確認してください。</p>
            <p className="mt-12">
              <Link href="/">トップへ戻る</Link>
            </p>
          </section>
        </div>
      </main>
    );
  }

  const result = getTakehomeScenarioResult(scenario);
  const relatedScenarios = getRelatedScenarios(scenario.slug);
  const nearbySalaryLevels = Array.from(
    new Set(getScenariosForSalary(scenario.input.annualGross, 5).map((item) => item.input.annualGross))
  ).slice(0, 3);
  const assumptions = [
    `税制年度: ${result.taxYear}年度`,
    `職業区分: ${getEmploymentTypeLabel(result.employmentType)}`,
    `居住都道府県: ${getPrefectureLabel(result.prefecture)}`,
    `年齢: ${scenario.input.age ?? 35}歳`,
    `扶養: 配偶者${scenario.input.dependentProfile?.spouse ? "あり" : "なし"} / 一般${
      scenario.input.dependentProfile?.general ?? 0
    }人`,
  ];
  const faq = [
    {
      question: `${scenario.query}の月手取りはいくら？`,
      answer: `この条件では月${Math.round(result.monthlyTakehome).toLocaleString(
        "ja-JP"
      )}円が目安です。`,
    },
    {
      question: "この結果は確定額ですか？",
      answer:
        "概算です。賞与配分、各種控除、自治体条件で変わるため、最終確認は給与明細・公的資料で確認してください。",
    },
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main>
      <div className="container">
        <h1>{scenario.title}</h1>
        <p className="mt-12">{scenario.lead}</p>
        <p className="mt-12">
          検索意図: <strong>{scenario.query}</strong>
        </p>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <AdSenseSlot slot="3456789012" className="mt-20" />

        <section className="card mt-20">
          <h2>結論</h2>
          <div className="list mt-20">
            <div className="list-item">
              月あたり手取り: {Math.round(result.monthlyTakehome).toLocaleString("ja-JP")}円
            </div>
            <div className="list-item">
              年間手取り: {Math.round(result.annualTakehome).toLocaleString("ja-JP")}円
            </div>
            <div className="list-item">社会保険料: {Math.round(result.socialInsurance).toLocaleString("ja-JP")}円</div>
            <div className="list-item">所得税: {Math.round(result.incomeTax).toLocaleString("ja-JP")}円</div>
            <div className="list-item">住民税: {Math.round(result.residentTax).toLocaleString("ja-JP")}円</div>
          </div>
        </section>

        <section className="card mt-20">
          <h2>前提条件</h2>
          <div className="list mt-20">
            {assumptions.map((item) => (
              <div className="list-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="card mt-20">
          <h2>よくある質問</h2>
          <div className="list mt-20">
            {faq.map((item) => (
              <div className="list-item" key={item.question}>
                <strong>{item.question}</strong>
                <p className="mt-8">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card mt-20">
          <h2>近い条件ページ</h2>
          <div className="seo-links mt-12">
            {relatedScenarios.map((item) => (
              <Link key={item.slug} href={getScenarioUrl(item.slug)}>
                {item.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="card mt-20">
          <h2>近い年収のページ</h2>
          <div className="seo-links mt-12">
            {nearbySalaryLevels.map((salary) => (
              <Link key={salary} href={getScenarioSalaryUrl(salary)}>
                年収{salary.toLocaleString("ja-JP")}円の手取りページ
              </Link>
            ))}
          </div>
        </section>

        <p className="small mt-12">
          詳細条件の再計算は <Link href="/">トップページの計算フォーム</Link> を使ってください。
        </p>
      </div>
    </main>
  );
}
