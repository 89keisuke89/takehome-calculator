"use client";

import { useMemo, useState } from "react";
import { DEFAULT_PREFECTURE, PREFECTURES, type PrefectureCode } from "@/lib/prefectures";
import { calculateTakehome } from "@/lib/takehome";
import { DEFAULT_TAX_YEAR, TAX_YEARS, type EmploymentType } from "@/lib/tax-config";

function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

export function TakehomeCalculator() {
  const [taxYear, setTaxYear] = useState(DEFAULT_TAX_YEAR);
  const [annualGross, setAnnualGross] = useState(5_000_000);
  const [spouse, setSpouse] = useState(false);
  const [generalDependents, setGeneralDependents] = useState(0);
  const [specifiedDependents, setSpecifiedDependents] = useState(0);
  const [elderlyDependents, setElderlyDependents] = useState(0);
  const [age, setAge] = useState(35);
  const [employmentType, setEmploymentType] = useState<EmploymentType>("employee");
  const [prefecture, setPrefecture] = useState<PrefectureCode>(DEFAULT_PREFECTURE);
  const [insuranceMode, setInsuranceMode] = useState<"auto" | "manual">("auto");
  const [manualInsuranceAmount, setManualInsuranceAmount] = useState(0);
  const [idecoEnabled, setIdecoEnabled] = useState(false);
  const [lifeInsuranceEnabled, setLifeInsuranceEnabled] = useState(false);
  const [hometownTaxEnabled, setHometownTaxEnabled] = useState(false);
  const [housingLoanEnabled, setHousingLoanEnabled] = useState(false);

  const result = useMemo(
    () =>
      calculateTakehome({
        taxYear,
        annualGross,
        age,
        employmentType,
        prefecture,
        dependentProfile: {
          spouse,
          general: generalDependents,
          specified: specifiedDependents,
          elderly: elderlyDependents,
        },
        insuranceInput: {
          mode: insuranceMode,
          manualAmount: manualInsuranceAmount,
        },
        deductionOptions: {
          idecoEnabled,
          lifeInsuranceEnabled,
          hometownTaxEnabled,
          housingLoanEnabled,
        },
      }),
    [
      taxYear,
      annualGross,
      age,
      employmentType,
      prefecture,
      spouse,
      generalDependents,
      specifiedDependents,
      elderlyDependents,
      insuranceMode,
      manualInsuranceAmount,
      idecoEnabled,
      lifeInsuranceEnabled,
      hometownTaxEnabled,
      housingLoanEnabled,
    ]
  );

  return (
    <div className="calc-grid">
      <section className="card">
        <h2>入力</h2>
        <p className="small mt-8">
          年収に加えて職業・都道府県・年齢を使って、税率と社会保険率を自動調整します。
        </p>
        <div className="form mt-20">
          <label className="field">
            <span>税制年度</span>
            <select value={taxYear} onChange={(e) => setTaxYear(Number(e.target.value))}>
              {TAX_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}年度
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>職業区分</span>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            >
              <option value="employee">会社員</option>
              <option value="contract">契約・派遣</option>
              <option value="part_time">パート・アルバイト</option>
              <option value="self_employed">個人事業主</option>
            </select>
          </label>

          <label className="field">
            <span>居住都道府県</span>
            <select
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value as PrefectureCode)}
            >
              {PREFECTURES.map((pref) => (
                <option key={pref.code} value={pref.code}>
                  {pref.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>年齢</span>
            <input
              type="number"
              min={18}
              max={100}
              value={age}
              onChange={(e) => setAge(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>年収（額面・円）</span>
            <input
              type="number"
              min={0}
              step={10000}
              value={annualGross}
              onChange={(e) => setAnnualGross(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>配偶者控除（対象）</span>
            <select value={spouse ? "yes" : "no"} onChange={(e) => setSpouse(e.target.value === "yes")}>
              <option value="no">なし</option>
              <option value="yes">あり</option>
            </select>
          </label>

          <label className="field">
            <span>一般扶養人数</span>
            <input
              type="number"
              min={0}
              max={10}
              value={generalDependents}
              onChange={(e) => setGeneralDependents(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>特定扶養人数（19〜22歳）</span>
            <input
              type="number"
              min={0}
              max={10}
              value={specifiedDependents}
              onChange={(e) => setSpecifiedDependents(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>老人扶養人数（70歳以上）</span>
            <input
              type="number"
              min={0}
              max={10}
              value={elderlyDependents}
              onChange={(e) => setElderlyDependents(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>社会保険料入力モード</span>
            <select
              value={insuranceMode}
              onChange={(e) => setInsuranceMode(e.target.value as "auto" | "manual")}
            >
              <option value="auto">自動推定</option>
              <option value="manual">実額入力</option>
            </select>
          </label>

          {insuranceMode === "manual" ? (
            <label className="field">
              <span>年間 社会保険料（実額）</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={manualInsuranceAmount}
                onChange={(e) => setManualInsuranceAmount(Number(e.target.value || 0))}
              />
            </label>
          ) : null}

          <label className="check-toggle">
            <input
              type="checkbox"
              checked={idecoEnabled}
              onChange={(e) => setIdecoEnabled(e.target.checked)}
            />
            <span>iDeCo控除を適用（簡易）</span>
          </label>

          <label className="check-toggle">
            <input
              type="checkbox"
              checked={lifeInsuranceEnabled}
              onChange={(e) => setLifeInsuranceEnabled(e.target.checked)}
            />
            <span>生命保険料控除を適用（簡易）</span>
          </label>

          <label className="check-toggle">
            <input
              type="checkbox"
              checked={hometownTaxEnabled}
              onChange={(e) => setHometownTaxEnabled(e.target.checked)}
            />
            <span>ふるさと納税控除を適用（簡易）</span>
          </label>

          <label className="check-toggle">
            <input
              type="checkbox"
              checked={housingLoanEnabled}
              onChange={(e) => setHousingLoanEnabled(e.target.checked)}
            />
            <span>住宅ローン控除を適用（簡易）</span>
          </label>
        </div>
        <p className="small mt-12">
          ※ 概算モデルです。最終的な税額は自治体条件・控除条件で変わります。現在は
          {` ${result.taxYear}年度設定`}を適用しています。
        </p>
      </section>

      <section className="card">
        <h2>試算結果</h2>
        <div className="result-box mt-20">
          <div className="result-main">{formatYen(result.monthlyTakehome)}</div>
          <div className="small">月あたり手取り（目安）</div>
        </div>

        <div className="list mt-20">
          <div className="list-item">年間手取り: {formatYen(result.annualTakehome)}</div>
          <div className="list-item">社会保険料: {formatYen(result.socialInsurance)}</div>
          <div className="list-item">所得税: {formatYen(result.incomeTax)}</div>
          <div className="list-item">住民税: {formatYen(result.residentTax)}</div>
          <div className="list-item">
            社会保険料率（自動）: {(result.socialInsuranceRate * 100).toFixed(2)}%
          </div>
          <div className="list-item">
            住民税率（自動）: {(result.residentTaxRate * 100).toFixed(2)}%
          </div>
          <div className="list-item">
            所得税率（適用）: {(result.appliedIncomeTaxRate * 100).toFixed(1)}%
          </div>
          <div className="list-item">
            給与所得控除: {formatYen(result.employmentIncomeDeduction)}
          </div>
          <div className="list-item">所得控除合計（所得税）: {formatYen(result.deductionTotalIncomeTax)}</div>
          <div className="list-item">税額控除（所得税）: {formatYen(result.taxCreditIncomeTax)}</div>
          <div className="list-item">税額控除（住民税）: {formatYen(result.taxCreditResidentTax)}</div>
          <div className="list-item">負担率: {(result.burdenRate * 100).toFixed(1)}%</div>
        </div>
      </section>

      <section className="card calc-full">
        <h2>試算根拠</h2>
        <div className="list mt-20">
          <div className="list-item">
            職業:{" "}
            {employmentType === "employee"
              ? "会社員"
              : employmentType === "contract"
                ? "契約・派遣"
                : employmentType === "part_time"
                  ? "パート・アルバイト"
                  : "個人事業主"}
          </div>
          <div className="list-item">居住都道府県: {PREFECTURES.find((p) => p.code === prefecture)?.label}</div>
          <div className="list-item">年齢: {age}歳</div>
          <div className="list-item">計算対象所得: {formatYen(result.annualBusinessIncome)}</div>
          {result.calculationNotes.map((note) => (
            <div className="list-item" key={note}>
              {note}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
