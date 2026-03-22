"use client";

import { useMemo, useState } from "react";
import { calculatePartTimePay } from "@/lib/finance-calculators";

function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

export function PartTimePayCalculator() {
  const [hourlyWage, setHourlyWage] = useState(1200);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [weeksPerMonth, setWeeksPerMonth] = useState(4.33);
  const [overtimeHoursPerMonth, setOvertimeHoursPerMonth] = useState(0);
  const [lateNightHoursPerMonth, setLateNightHoursPerMonth] = useState(0);
  const [transportAllowancePerMonth, setTransportAllowancePerMonth] = useState(0);
  const [withholdingRatePercent, setWithholdingRatePercent] = useState(3);

  const result = useMemo(
    () =>
      calculatePartTimePay({
        hourlyWage,
        hoursPerWeek,
        weeksPerMonth,
        overtimeHoursPerMonth,
        lateNightHoursPerMonth,
        transportAllowancePerMonth,
        withholdingRatePercent,
      }),
    [
      hourlyWage,
      hoursPerWeek,
      weeksPerMonth,
      overtimeHoursPerMonth,
      lateNightHoursPerMonth,
      transportAllowancePerMonth,
      withholdingRatePercent,
    ]
  );

  return (
    <div className="calc-grid">
      <section className="card">
        <h2>バイト給料の入力</h2>
        <p className="small mt-8">時給・シフトから月収と手取りの目安を計算します。</p>
        <div className="form mt-20">
          <label className="field">
            <span>時給（円）</span>
            <input
              type="number"
              min={0}
              step={10}
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>週の勤務時間（時間）</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>1か月の週換算（通常4.33）</span>
            <input
              type="number"
              min={0}
              max={6}
              step={0.01}
              value={weeksPerMonth}
              onChange={(e) => setWeeksPerMonth(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>残業時間（1.25倍, 月）</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={overtimeHoursPerMonth}
              onChange={(e) => setOvertimeHoursPerMonth(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>深夜勤務時間（1.25倍, 月）</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={lateNightHoursPerMonth}
              onChange={(e) => setLateNightHoursPerMonth(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>交通費など（円 / 月）</span>
            <input
              type="number"
              min={0}
              step={100}
              value={transportAllowancePerMonth}
              onChange={(e) => setTransportAllowancePerMonth(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>控除率の目安（%）</span>
            <input
              type="number"
              min={0}
              max={40}
              step={0.1}
              value={withholdingRatePercent}
              onChange={(e) => setWithholdingRatePercent(Number(e.target.value || 0))}
            />
          </label>
        </div>
        <p className="small mt-12">
          ※ 残業時間と深夜時間は重複しない前提の概算です。勤務先の就業規則で最終確認してください。
        </p>
      </section>

      <section className="card">
        <h2>試算結果</h2>
        <div className="result-box mt-20">
          <div className="result-main">{formatYen(result.netPay)}</div>
          <div className="small">月あたり手取り（目安）</div>
        </div>
        <div className="list mt-20">
          <div className="list-item">月の通常勤務時間: {result.regularHoursPerMonth.toFixed(1)}時間</div>
          <div className="list-item">通常給与: {formatYen(result.regularPay)}</div>
          <div className="list-item">残業分: {formatYen(result.overtimePay)}</div>
          <div className="list-item">深夜分: {formatYen(result.lateNightPay)}</div>
          <div className="list-item">総支給: {formatYen(result.grossPay)}</div>
          <div className="list-item">控除額（推定）: {formatYen(result.withholdingAmount)}</div>
        </div>
      </section>

      <section className="card calc-full">
        <h2>使い方メモ</h2>
        <div className="list mt-20">
          <div className="list-item">勤務シフトが安定している月は、週換算を4.33で入力。</div>
          <div className="list-item">繁忙月は残業時間を加算し、実感に近い見込み額を作る。</div>
          <div className="list-item">源泉徴収率は給与明細を見て調整すると精度が上がる。</div>
        </div>
      </section>
    </div>
  );
}
