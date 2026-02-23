import { describe, expect, it } from "vitest";
import { calculateTakehome } from "../lib/takehome";

describe("calculateTakehome", () => {
  it("職業区分で控除・計算対象所得が切り替わる", () => {
    const employee = calculateTakehome({
      annualGross: 6_000_000,
      employmentType: "employee",
      age: 35,
      dependents: 0,
      taxYear: 2027,
      prefecture: "tokyo",
    });
    const selfEmployed = calculateTakehome({
      annualGross: 6_000_000,
      employmentType: "self_employed",
      age: 35,
      dependents: 0,
      taxYear: 2027,
      prefecture: "tokyo",
    });
    expect(employee.employmentIncomeDeduction).toBeGreaterThan(0);
    expect(selfEmployed.employmentIncomeDeduction).toBe(0);
    expect(selfEmployed.annualBusinessIncome).toBeLessThan(employee.annualBusinessIncome);
  });

  it("40-64歳は介護保険を含むため社会保険率が上がる", () => {
    const before40 = calculateTakehome({
      annualGross: 5_000_000,
      age: 39,
      taxYear: 2027,
      employmentType: "employee",
      prefecture: "tokyo",
      dependents: 0,
    });
    const after40 = calculateTakehome({
      annualGross: 5_000_000,
      age: 40,
      taxYear: 2027,
      employmentType: "employee",
      prefecture: "tokyo",
      dependents: 0,
    });
    expect(after40.socialInsuranceRate).toBeGreaterThan(before40.socialInsuranceRate);
  });

  it("住民税は都道府県補正で差が出る", () => {
    const tokyo = calculateTakehome({
      annualGross: 5_000_000,
      taxYear: 2027,
      employmentType: "employee",
      prefecture: "tokyo",
      age: 35,
      dependents: 0,
    });
    const aomori = calculateTakehome({
      annualGross: 5_000_000,
      taxYear: 2027,
      employmentType: "employee",
      prefecture: "aomori",
      age: 35,
      dependents: 0,
    });
    expect(tokyo.residentTax).toBeGreaterThan(aomori.residentTax);
  });

  it("扶養人数を増やすと税負担が減る", () => {
    const noDependent = calculateTakehome({
      annualGross: 5_000_000,
      taxYear: 2027,
      employmentType: "employee",
      prefecture: "tokyo",
      age: 35,
      dependents: 0,
    });
    const twoDependents = calculateTakehome({
      annualGross: 5_000_000,
      taxYear: 2027,
      employmentType: "employee",
      prefecture: "tokyo",
      age: 35,
      dependents: 2,
    });
    expect(twoDependents.incomeTax + twoDependents.residentTax).toBeLessThan(
      noDependent.incomeTax + noDependent.residentTax
    );
  });
});
