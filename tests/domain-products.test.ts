import { describe, expect, it } from "vitest";
import { calculateDomainEconomics, DOMAIN_PRODUCTS } from "../lib/domain-products";

describe("calculateDomainEconomics", () => {
  it("MRRと粗利を計算できる", () => {
    const result = calculateDomainEconomics({
      leadsPerMonth: 100,
      activationRatePercent: 10,
      monthlyPrice: 10000,
      variableCostPercent: 20,
      retentionMonths: 12,
      acquisitionCostPerLead: 1000,
    });

    expect(result.activatedCustomers).toBe(10);
    expect(result.monthlyRecurringRevenue).toBe(100000);
    expect(result.monthlyVariableCost).toBe(20000);
    expect(result.monthlyGrossProfit).toBe(80000);
    expect(result.annualGrossProfit).toBe(960000);
  });

  it("成約率0%ならCACと回収期間は無限大になる", () => {
    const result = calculateDomainEconomics({
      leadsPerMonth: 100,
      activationRatePercent: 0,
      monthlyPrice: 12000,
      variableCostPercent: 20,
      retentionMonths: 12,
      acquisitionCostPerLead: 1000,
    });

    expect(result.customerAcquisitionCost).toBe(Number.POSITIVE_INFINITY);
    expect(result.paybackMonths).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("DOMAIN_PRODUCTS", () => {
  it("10ドメイン定義を持つ", () => {
    expect(DOMAIN_PRODUCTS).toHaveLength(10);
  });
});
