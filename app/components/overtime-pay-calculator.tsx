"use client";

import { useMemo, useState } from "react";
import { calculateOvertimePay } from "@/lib/finance-calculators";

function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

export function OvertimePayCalculator() {
  const [monthlySalary, setMonthlySalary] = useState(320000);
  const [monthlyWorkingHours, setMonthlyWorkingHours] = useState(160);
  const [weekdayOvertimeHours, setWeekdayOvertimeHours] = useState(20);
  const [lateNightOvertimeHours, setLateNightOvertimeHours] = useState(0);
  const [holidayOvertimeHours, setHolidayOvertimeHours] = useState(0);
  const [fixedOvertimeAllowance, setFixedOvertimeAllowance] = useState(0);
  const [deductionRatePercent, setDeductionRatePercent] = useState(20);

  const result = useMemo(
    () =>
      calculateOvertimePay({
        monthlySalary,
        monthlyWorkingHours,
        weekdayOvertimeHours,
        lateNightOvertimeHours,
        holidayOvertimeHours,
        fixedOvertimeAllowance,
        deductionRatePercent,
      }),
    [
      monthlySalary,
      monthlyWorkingHours,
      weekdayOvertimeHours,
      lateNightOvertimeHours,
      holidayOvertimeHours,
      fixedOvertimeAllowance,
      deductionRatePercent,
    ]
  );

  return (
    <div className="calc-grid">
      <section className="card">
        <h2>残業代の入力</h2>
        <p className="small mt-8">月給から時間単価を逆算して、残業代の目安を計算します。</p>
        <div className="form mt-20">
          <label className="field">
            <span>月給（基本給ベース, 円）</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>月の所定労働時間（時間）</span>
            <input
              type="number"
              min={1}
              step={0.5}
              value={monthlyWorkingHours}
              onChange={(e) => setMonthlyWorkingHours(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>平日残業時間（1.25倍）</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={weekdayOvertimeHours}
              onChange={(e) => setWeekdayOvertimeHours(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>深夜残業時間（1.50倍）</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={lateNightOvertimeHours}
              onChange={(e) => setLateNightOvertimeHours(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>休日労働時間（1.35倍）</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={holidayOvertimeHours}
              onChange={(e) => setHolidayOvertimeHours(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>固定残業代（円 / 月）</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={fixedOvertimeAllowance}
              onChange={(e) => setFixedOvertimeAllowance(Number(e.target.value || 0))}
            />
          </label>

          <label className="field">
            <span>税・社保控除率の目安（%）</span>
            <input
              type="number"
              min={0}
              max={50}
              step={0.1}
              value={deductionRatePercent}
              onChange={(e) => setDeductionRatePercent(Number(e.target.value || 0))}
            />
          </label>
        </div>
        <p className="small mt-12">
          ※ 計算式は労基法の一般的な割増率ベースです。会社独自ルール・深夜/休日重複時は差が出ます。
        </p>
      </section>

      <section className="card">
        <h2>試算結果</h2>
        <div className="result-box mt-20">
          <div className="result-main">{formatYen(result.estimatedNetOvertimePay)}</div>
          <div className="small">手取り残業代（目安）</div>
        </div>
        <div className="list mt-20">
          <div className="list-item">基礎時給: {formatYen(result.baseHourlyWage)}</div>
          <div className="list-item">平日残業代: {formatYen(result.weekdayOvertimePay)}</div>
          <div className="list-item">深夜残業代: {formatYen(result.lateNightOvertimePay)}</div>
          <div className="list-item">休日労働分: {formatYen(result.holidayOvertimePay)}</div>
          <div className="list-item">法定残業代合計: {formatYen(result.statutoryOvertimePay)}</div>
          <div className="list-item">固定残業代控除後: {formatYen(result.payableOvertimePay)}</div>
          <div className="list-item">税・社保控除（推定）: {formatYen(result.estimatedDeduction)}</div>
        </div>
      </section>

      <section className="card calc-full">
        <h2>使い方メモ</h2>
        <div className="list mt-20">
          <div className="list-item">月給は手当込みの総額ではなく、計算に使う基本給ベースで入力。</div>
          <div className="list-item">固定残業代ありの場合は、その額を入力して追加支給分を確認。</div>
          <div className="list-item">給与明細の実支給と差がある場合、控除率を実績値に合わせる。</div>
        </div>
      </section>
    </div>
  );
}
