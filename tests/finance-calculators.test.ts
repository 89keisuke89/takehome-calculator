import { describe, expect, it } from "vitest";
import {
  calculateLoan,
  calculateOvertimePay,
  calculatePartTimePay,
} from "../lib/finance-calculators";

describe("calculatePartTimePay", () => {
  it("基本時給と控除率から手取りを計算できる", () => {
    const result = calculatePartTimePay({
      hourlyWage: 1000,
      hoursPerWeek: 20,
      weeksPerMonth: 4,
      overtimeHoursPerMonth: 0,
      lateNightHoursPerMonth: 0,
      transportAllowancePerMonth: 0,
      withholdingRatePercent: 10,
    });

    expect(result.regularPay).toBe(80000);
    expect(result.grossPay).toBe(80000);
    expect(result.withholdingAmount).toBe(8000);
    expect(result.netPay).toBe(72000);
  });
});

describe("calculateOvertimePay", () => {
  it("固定残業代を差し引いた支給残業代を返す", () => {
    const result = calculateOvertimePay({
      monthlySalary: 320000,
      monthlyWorkingHours: 160,
      weekdayOvertimeHours: 10,
      lateNightOvertimeHours: 0,
      holidayOvertimeHours: 0,
      fixedOvertimeAllowance: 10000,
      deductionRatePercent: 20,
    });

    expect(result.baseHourlyWage).toBe(2000);
    expect(result.statutoryOvertimePay).toBe(25000);
    expect(result.payableOvertimePay).toBe(15000);
    expect(result.estimatedNetOvertimePay).toBe(12000);
  });
});

describe("calculateLoan", () => {
  it("金利0%の場合は元本を等分した返済になる", () => {
    const result = calculateLoan({
      principal: 1200000,
      annualRatePercent: 0,
      years: 1,
      annualExtraPayment: 0,
    });

    expect(result.monthlyPayment).toBe(100000);
    expect(result.totalInterest).toBe(0);
    expect(result.totalMonths).toBe(12);
  });

  it("繰上返済を入れると返済期間が短くなる", () => {
    const noExtra = calculateLoan({
      principal: 30000000,
      annualRatePercent: 1.3,
      years: 35,
      annualExtraPayment: 0,
    });
    const withExtra = calculateLoan({
      principal: 30000000,
      annualRatePercent: 1.3,
      years: 35,
      annualExtraPayment: 120000,
    });

    expect(withExtra.withExtraPayment).not.toBeNull();
    expect(withExtra.withExtraPayment?.months ?? noExtra.totalMonths).toBeLessThan(noExtra.totalMonths);
    expect(withExtra.withExtraPayment?.interestSaved ?? 0).toBeGreaterThan(0);
  });
});
