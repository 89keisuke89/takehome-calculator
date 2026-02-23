import type { TakehomeResult } from "./takehome";

export type SalaryFaq = {
  question: string;
  answer: string;
};

export function buildSalaryTitle(annualGross: number): string {
  return `年収${annualGross.toLocaleString("ja-JP")}円の手取りはいくら？月収・税金内訳を自動計算`;
}

export function buildSalaryDescription(annualGross: number, result: TakehomeResult): string {
  return `年収${annualGross.toLocaleString("ja-JP")}円の月手取り目安は${Math.round(
    result.monthlyTakehome
  ).toLocaleString(
    "ja-JP"
  )}円。社会保険料・所得税・住民税の内訳と負担率を確認できます。`;
}

export function buildSalaryIntro(annualGross: number, result: TakehomeResult): string[] {
  const monthly = Math.round(result.monthlyTakehome).toLocaleString("ja-JP");
  const yearly = Math.round(result.annualTakehome).toLocaleString("ja-JP");
  return [
    `年収${annualGross.toLocaleString("ja-JP")}円の手取りは、現在の計算条件では年間${yearly}円（月${monthly}円）が目安です。`,
    "扶養人数・年齢・居住都道府県で結果が変わるため、詳細条件を入力して最終的な目安を確認してください。",
  ];
}

export function buildSalaryFaq(annualGross: number, result: TakehomeResult): SalaryFaq[] {
  return [
    {
      question: `年収${annualGross.toLocaleString("ja-JP")}円の手取り月収は？`,
      answer: `目安は月${Math.round(result.monthlyTakehome).toLocaleString(
        "ja-JP"
      )}円です。賞与比率や控除条件で変動します。`,
    },
    {
      question: "なぜ同じ年収でも手取りが違うの？",
      answer:
        "扶養人数、年齢（介護保険の有無）、都道府県の住民税補正、職業区分（会社員/個人事業主）で税額と保険料が変わるためです。",
    },
    {
      question: "この金額は確定額？",
      answer:
        "このページは概算です。実際の給与明細や確定申告の結果とは異なる場合があります。最終確認は公的資料や専門家への相談を推奨します。",
    },
  ];
}
