import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseSlot } from "@/app/components/adsense-slot";
import {
  calculateTakehome,
  fromSalarySlug,
  getNearbySalaryLevels,
  SEO_SALARY_LEVELS,
  toSalarySlug,
} from "@/lib/takehome";
import {
  buildSalaryCaution,
  buildSalaryDescription,
  buildSalaryFaq,
  buildSalaryIntro,
  buildSalaryTitle,
} from "@/lib/seo-content";

type Props = {
  params: { salary: string };
};

export function generateStaticParams() {
  return SEO_SALARY_LEVELS.map((salary) => ({ salary: toSalarySlug(salary) }));
}

export function generateMetadata({ params }: Props): Metadata {
  const annualGross = fromSalarySlug(params.salary) ?? 0;
  const result = calculateTakehome({ annualGross });
  const title = buildSalaryTitle(annualGross);
  const description = buildSalaryDescription(annualGross, result);
  return {
    title,
    description,
    alternates: {
      canonical: `/takehome/${params.salary}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "ja_JP",
    },
  };
}

export default function SalaryTakehomePage({ params }: Props) {
  const annualGross = fromSalarySlug(params.salary);
  if (!annualGross) {
    return (
      <main>
        <div className="container">
          <section className="card">
            <h1>ページが見つかりません</h1>
            <p className="mt-12">URLの年収指定を確認してください。</p>
            <p className="mt-12">
              <Link href="/">トップへ戻る</Link>
            </p>
          </section>
        </div>
      </main>
    );
  }

  const result = calculateTakehome({ annualGross });
  const introLines = buildSalaryIntro(annualGross, result);
  const caution = buildSalaryCaution(annualGross);
  const faq = buildSalaryFaq(annualGross, result);
  const nearby = getNearbySalaryLevels(annualGross);
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
        <h1>{buildSalaryTitle(annualGross)}</h1>
        <p>
          月あたり手取りは <strong>{Math.round(result.monthlyTakehome).toLocaleString("ja-JP")}円</strong> が目安です。
        </p>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <AdSenseSlot slot="2345678901" className="mt-20" />

        <section className="card mt-20">
          <h2>内訳</h2>
          <div className="list mt-20">
            <div className="list-item">年間手取り: {Math.round(result.annualTakehome).toLocaleString("ja-JP")}円</div>
            <div className="list-item">社会保険料: {Math.round(result.socialInsurance).toLocaleString("ja-JP")}円</div>
            <div className="list-item">所得税: {Math.round(result.incomeTax).toLocaleString("ja-JP")}円</div>
            <div className="list-item">住民税: {Math.round(result.residentTax).toLocaleString("ja-JP")}円</div>
            <div className="list-item">負担率: {(result.burdenRate * 100).toFixed(1)}%</div>
          </div>
        </section>

        <section className="card mt-20">
          <h2>年収{annualGross.toLocaleString("ja-JP")}円のポイント</h2>
          {introLines.map((line) => (
            <p className="mt-12" key={line}>
              {line}
            </p>
          ))}
          <p className="mt-12">{caution}</p>
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
          <h2>近い年収の手取りページ</h2>
          <div className="seo-links mt-12">
            {nearby.map((salary) => (
              <Link key={salary} href={`/takehome/${toSalarySlug(salary)}`}>
                年収{salary.toLocaleString("ja-JP")}円の手取り目安
              </Link>
            ))}
          </div>
        </section>

        <p className="small mt-12">
          他の条件で試算する場合は <Link href="/">トップページの詳細計算</Link> を使ってください。
        </p>
      </div>
    </main>
  );
}
