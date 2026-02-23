import type { Metadata } from "next";
import Link from "next/link";
import { AdSenseSlot } from "@/app/components/adsense-slot";
import { calculateTakehome, SEO_SALARY_LEVELS } from "@/lib/takehome";

type Props = {
  params: { salary: string };
};

function toAnnualGross(salaryParam: string): number | null {
  const unit = Number(salaryParam);
  if (!Number.isFinite(unit) || unit <= 0) return null;
  return Math.round(unit * 10_000);
}

export function generateStaticParams() {
  return SEO_SALARY_LEVELS.map((salary) => ({ salary: String(salary / 10_000) }));
}

export function generateMetadata({ params }: Props): Metadata {
  const annualGross = toAnnualGross(params.salary) ?? 0;
  const result = calculateTakehome({ annualGross });
  return {
    title: `年収${annualGross.toLocaleString("ja-JP")}円の手取り目安`,
    description: `年収${annualGross.toLocaleString("ja-JP")}円の月手取り目安は${Math.round(
      result.monthlyTakehome
    ).toLocaleString("ja-JP")}円。税金と社会保険の内訳付き。`,
    alternates: {
      canonical: `/takehome/${params.salary}`,
    },
  };
}

export default function SalaryTakehomePage({ params }: Props) {
  const annualGross = toAnnualGross(params.salary);
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

  return (
    <main>
      <div className="container">
        <h1>年収{annualGross.toLocaleString("ja-JP")}円の手取り目安</h1>
        <p>
          月あたり手取りは <strong>{Math.round(result.monthlyTakehome).toLocaleString("ja-JP")}円</strong> が目安です。
        </p>
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

        <p className="small mt-12">
          他の条件で試算する場合は <Link href="/">トップページの詳細計算</Link> を使ってください。
        </p>
      </div>
    </main>
  );
}
