"use client";

import { useMemo, useState } from "react";
import {
  calculateDomainEconomics,
  DomainEconomicsInput,
} from "@/lib/domain-products";

type Props = {
  defaults: DomainEconomicsInput;
};

function formatYen(value: number) {
  if (!Number.isFinite(value)) {
    return "計算不可";
  }
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

function formatFinite(value: number) {
  if (!Number.isFinite(value)) {
    return "計算不可";
  }
  return `${value.toFixed(1)}か月`;
}

export function DomainEconomicsSimulator({ defaults }: Props) {
  const [input, setInput] = useState<DomainEconomicsInput>(defaults);

  const result = useMemo(() => calculateDomainEconomics(input), [input]);

  const onNumberChange =
    (key: keyof DomainEconomicsInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setInput((prev) => ({
        ...prev,
        [key]: Number.isNaN(value) ? 0 : value,
      }));
    };

  return (
    <section className="card mt-20">
      <h2>収益シミュレーション</h2>
      <p className="small mt-8">仮説値を調整して、初月の成立性を確認できます。</p>

      <div className="kpi-grid mt-20">
        <label className="field">
          <span>月間リード数</span>
          <input
            type="number"
            min={0}
            value={input.leadsPerMonth}
            onChange={onNumberChange("leadsPerMonth")}
          />
        </label>
        <label className="field">
          <span>成約率（%）</span>
          <input
            type="number"
            min={0}
            max={100}
            value={input.activationRatePercent}
            onChange={onNumberChange("activationRatePercent")}
          />
        </label>
        <label className="field">
          <span>月額単価（円）</span>
          <input
            type="number"
            min={0}
            value={input.monthlyPrice}
            onChange={onNumberChange("monthlyPrice")}
          />
        </label>
        <label className="field">
          <span>変動原価率（%）</span>
          <input
            type="number"
            min={0}
            max={100}
            value={input.variableCostPercent}
            onChange={onNumberChange("variableCostPercent")}
          />
        </label>
        <label className="field">
          <span>平均継続月数</span>
          <input
            type="number"
            min={0}
            value={input.retentionMonths}
            onChange={onNumberChange("retentionMonths")}
          />
        </label>
        <label className="field">
          <span>1リード獲得単価（円）</span>
          <input
            type="number"
            min={0}
            value={input.acquisitionCostPerLead}
            onChange={onNumberChange("acquisitionCostPerLead")}
          />
        </label>
      </div>

      <div className="list mt-20">
        <div className="list-item">月間成約数: {result.activatedCustomers.toLocaleString("ja-JP")}社</div>
        <div className="list-item">月間MRR: {formatYen(result.monthlyRecurringRevenue)}</div>
        <div className="list-item">月間変動費: {formatYen(result.monthlyVariableCost)}</div>
        <div className="list-item">月間粗利: {formatYen(result.monthlyGrossProfit)}</div>
        <div className="list-item">年間粗利: {formatYen(result.annualGrossProfit)}</div>
        <div className="list-item">CAC: {formatYen(result.customerAcquisitionCost)}</div>
        <div className="list-item">LTV: {formatYen(result.lifetimeValue)}</div>
        <div className="list-item">回収期間: {formatFinite(result.paybackMonths)}</div>
      </div>
    </section>
  );
}
