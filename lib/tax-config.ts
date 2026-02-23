import config2026 from "../tax-config/2026.json";
import config2027 from "../tax-config/2027.json";

export type IncomeTaxBracket = {
  upper: number;
  rate: number;
  deduction: number;
};

export type RangeRate = {
  upper: number;
  rate: number;
};

export type EmploymentIncomeDeductionRule = {
  upper: number;
  rate: number;
  adjustment: number;
  fixed?: number;
};

export type EmploymentType = "employee" | "self_employed";

type EmploymentModelConfig = {
  socialInsuranceRates: RangeRate[];
  careInsuranceRate: number;
  businessExpenseRate: number;
  useEmploymentIncomeDeduction: boolean;
};

export type TaxYearConfig = {
  year: number;
  incomeTaxBrackets: IncomeTaxBracket[];
  employmentIncomeDeductionRules: EmploymentIncomeDeductionRule[];
  employmentIncomeDeductionMin: number;
  employmentIncomeDeductionMax: number;
  basicDeductionIncomeTax: number;
  basicDeductionResidentTax: number;
  dependentDeductionIncomeTax: number;
  dependentDeductionResidentTax: number;
  residentPerCapitaLevy: number;
  residentBaseRate: number;
  residentTaxExemptionIncome: number;
  employmentModels: Record<EmploymentType, EmploymentModelConfig>;
};

export const TAX_CONFIGS: Record<number, TaxYearConfig> = {
  2027: config2027 as TaxYearConfig,
  2026: config2026 as TaxYearConfig,
};

export const TAX_YEARS = Object.keys(TAX_CONFIGS)
  .map((year) => Number(year))
  .sort((a, b) => b - a);

export const DEFAULT_TAX_YEAR = TAX_YEARS[0];

export function getTaxConfig(year: number): TaxYearConfig {
  return TAX_CONFIGS[year] ?? TAX_CONFIGS[DEFAULT_TAX_YEAR];
}
