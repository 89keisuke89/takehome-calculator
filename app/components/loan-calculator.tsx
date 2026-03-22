"use client";

import { useMemo, useState } from "react";
import { calculateLoan } from "@/lib/finance-calculators";

function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  if (restMonths === 0) {
    return `${years}年`;
  }
  return `${years}年${restMonths}か月`;
}

export function LoanCalculator() {
  const [principal, setPrincipal] = useState(30_000_000);
  const [annualRatePercent, setAnnualRatePercent] = useState(1.3);
  const [years, setYears] = useState(35);
  const [annualExtraPayment, setAnnualExtraPayment] = useState(0);

  const result = useMemo(
    () =>
      calculateLoan({
        principal,
        annualRatePercent,
        years,
        annualExtraPayment,
      }),
    [principal, annualRatePercent, years, annualExtraPayment]
  );

  return (
    <div className="calc-grid">
      <section className="card">
        <h2>ローン返済の入力</h2>
        <p className="small mt-8">元利均等返済を前提に、毎月返済額と利息総額を計算します。</p>
        <div className="form mt-20">
          <label className="field">
            <span>借入額（円）</span>
            <input
              type="number"
              min={0}
              step={100000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>年利（%）</span>
            <input
              type="number"
              min={0}
              max={20}
              step={0.01}
              value={annualRatePercent}
              onChange={(e) => setAnnualRatePercent(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>返済期間（年）</span>
            <input
              type="number"
              min={1}
              max={50}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>繰上返済（円 / 年）</span>
            <input
              type="number"
              min={0}
              step={10000}
              value={annualExtraPayment}
              onChange={(e) => setAnnualExtraPayment(Number(e.target.value || 0))}
            />
          </label>
        </div>
        <p className="small mt-12">
          ※ 実際の借入は手数料・金利タイプ（固定/変動）・返済日で差が出るため、正式見積で確認してください。
        </p>
      </section>

      <section className="card">
        <h2>試算結果</h2>
        <div className="result-box mt-20">
          <div className="result-main">{formatYen(result.monthlyPayment)}</div>
          <div className="small">毎月返済額（目安）</div>
        </div>
        <div className="list mt-20">
          <div className="list-item">返済期間: {formatDuration(result.totalMonths)}</div>
          <div className="list-item">総返済額: {formatYen(result.totalPayment)}</div>
          <div className="list-item">利息総額: {formatYen(result.totalInterest)}</div>
        </div>

        {result.withExtraPayment ? (
          <div className="list mt-20">
            <div className="list-item">繰上返済あり期間: {formatDuration(result.withExtraPayment.months)}</div>
            <div className="list-item">期間短縮: {formatDuration(result.withExtraPayment.termShortenedMonths)}</div>
            <div className="list-item">利息削減: {formatYen(result.withExtraPayment.interestSaved)}</div>
          </div>
        ) : null}
      </section>

      <section className="card calc-full">
        <h2>使い方メモ</h2>
        <div className="list mt-20">
          <div className="list-item">住宅ローン・自動車ローン・教育ローンの比較に使えます。</div>
          <div className="list-item">年1回の繰上返済を入れると、期間短縮と利息削減を同時に比較できます。</div>
          <div className="list-item">金利が変動する契約は、金利シナリオを複数作って比較するのが安全です。</div>
        </div>
      </section>
    </div>
  );
}
