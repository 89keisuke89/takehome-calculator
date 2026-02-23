import { DEFAULT_PREFECTURE, type PrefectureCode, getPrefectureConfig } from "./prefectures";
import { DEFAULT_TAX_YEAR, getTaxConfig, type EmploymentType, type IncomeTaxBracket, type RangeRate } from "./tax-config";

export type TakehomeInput = {
  annualGross: number;
  dependents: number;
  age: number;
  taxYear: number;
  employmentType: EmploymentType;
  prefecture: PrefectureCode;
};

export type TakehomeResult = {
  taxYear: number;
  employmentType: EmploymentType;
  prefecture: PrefectureCode;
  annualGross: number;
  annualBusinessIncome: number;
  socialInsuranceRate: number;
  residentTaxRate: number;
  appliedIncomeTaxRate: number;
  employmentIncomeDeduction: number;
  socialInsurance: number;
  incomeTax: number;
  residentTax: number;
  annualTakehome: number;
  monthlyTakehome: number;
  burdenRate: number;
  calculationNotes: string[];
};

export const SEO_SALARY_MIN = 2_000_000;
export const SEO_SALARY_MAX = 12_000_000;
export const SEO_SALARY_STEP = 100_000;
export const SEO_SALARY_LEVELS = buildSalaryLevels(SEO_SALARY_MIN, SEO_SALARY_MAX, SEO_SALARY_STEP);
export const POPULAR_SALARY_LEVELS = [3_000_000, 4_000_000, 5_000_000, 6_000_000, 7_000_000, 8_000_000];

export function calculateTakehome(input: Partial<TakehomeInput>): TakehomeResult {
  const safeInput = normalizeInput(input);
  const config = getTaxConfig(safeInput.taxYear);
  const prefectureConfig = getPrefectureConfig(safeInput.prefecture);
  const model = config.employmentModels[safeInput.employmentType];

  const baseGross = Math.max(0, safeInput.annualGross);
  const annualBusinessIncome = baseGross * (1 - model.businessExpenseRate);
  const socialInsuranceRate =
    pickRateByRange(baseGross, model.socialInsuranceRates) +
    (safeInput.age >= 40 && safeInput.age < 65 ? model.careInsuranceRate : 0);
  const socialInsurance = annualBusinessIncome * socialInsuranceRate;

  const employmentIncomeDeduction = model.useEmploymentIncomeDeduction
    ? calcEmploymentIncomeDeduction(
        baseGross,
        config.employmentIncomeDeductionRules,
        config.employmentIncomeDeductionMin,
        config.employmentIncomeDeductionMax
      )
    : 0;

  const incomeDependentDeduction =
    Math.max(0, safeInput.dependents) * config.dependentDeductionIncomeTax;
  const residentDependentDeduction =
    Math.max(0, safeInput.dependents) * config.dependentDeductionResidentTax;

  const incomeTaxable =
    annualBusinessIncome -
    employmentIncomeDeduction -
    config.basicDeductionIncomeTax -
    socialInsurance -
    incomeDependentDeduction;
  const incomeTax = calcIncomeTaxAmount(incomeTaxable, config.incomeTaxBrackets);

  const residentTaxRate = Math.max(
    0,
    config.residentBaseRate + prefectureConfig.residentTaxRateAdjustment
  );
  const residentTaxable =
    annualBusinessIncome -
    employmentIncomeDeduction -
    config.basicDeductionResidentTax -
    socialInsurance -
    residentDependentDeduction;

  const residentTax =
    annualBusinessIncome <= config.residentTaxExemptionIncome || residentTaxable <= 0
      ? 0
      : residentTaxable * residentTaxRate +
        config.residentPerCapitaLevy +
        prefectureConfig.perCapitaLevyAdjustment;

  const annualTakehome = baseGross - socialInsurance - incomeTax - residentTax;
  const appliedIncomeTaxRate = findIncomeTaxRate(incomeTaxable, config.incomeTaxBrackets);

  const calculationNotes: string[] = [];
  calculationNotes.push(
    safeInput.employmentType === "employee"
      ? "会社員モデル: 給与所得控除を適用"
      : "個人事業モデル: 必要経費率を適用"
  );
  if (safeInput.age >= 40 && safeInput.age < 65) {
    calculationNotes.push("40-64歳のため介護保険料を上乗せ");
  }
  calculationNotes.push(`居住地補正: ${prefectureConfig.label}`);

  return {
    taxYear: config.year,
    employmentType: safeInput.employmentType,
    prefecture: safeInput.prefecture,
    annualGross: baseGross,
    annualBusinessIncome,
    socialInsuranceRate,
    residentTaxRate,
    appliedIncomeTaxRate,
    employmentIncomeDeduction,
    socialInsurance,
    incomeTax,
    residentTax,
    annualTakehome,
    monthlyTakehome: annualTakehome / 12,
    burdenRate: baseGross > 0 ? (socialInsurance + incomeTax + residentTax) / baseGross : 0,
    calculationNotes,
  };
}

function normalizeInput(input: Partial<TakehomeInput>): TakehomeInput {
  return {
    annualGross: input.annualGross ?? 5_000_000,
    dependents: input.dependents ?? 0,
    age: input.age ?? 35,
    taxYear: input.taxYear ?? DEFAULT_TAX_YEAR,
    employmentType: input.employmentType ?? "employee",
    prefecture: input.prefecture ?? DEFAULT_PREFECTURE,
  };
}

function pickRateByRange(amount: number, rates: RangeRate[]): number {
  const rule = rates.find((item) => amount <= item.upper);
  return rule?.rate ?? 0;
}

function calcEmploymentIncomeDeduction(
  annualGross: number,
  rules: Array<{ upper: number; rate: number; adjustment: number; fixed?: number }>,
  minDeduction: number,
  maxDeduction: number
): number {
  const rule = rules.find((item) => annualGross <= item.upper);
  if (!rule) return minDeduction;

  if (typeof rule.fixed === "number") {
    return rule.fixed;
  }

  const computed = annualGross * rule.rate + rule.adjustment;
  return Math.min(maxDeduction, Math.max(minDeduction, computed));
}

function calcIncomeTaxAmount(taxable: number, brackets: IncomeTaxBracket[]): number {
  if (taxable <= 0) return 0;
  const bracket = brackets.find((b) => taxable <= b.upper);
  if (!bracket) return 0;
  return Math.max(0, taxable * bracket.rate - bracket.deduction);
}

function findIncomeTaxRate(taxable: number, brackets: IncomeTaxBracket[]): number {
  if (taxable <= 0) return 0;
  const bracket = brackets.find((b) => taxable <= b.upper);
  return bracket?.rate ?? 0;
}

function buildSalaryLevels(min: number, max: number, step: number): number[] {
  const values: number[] = [];
  for (let salary = min; salary <= max; salary += step) {
    values.push(salary);
  }
  return values;
}

export function toSalarySlug(annualGross: number): string {
  return String(Math.round(annualGross / 10_000));
}

export function fromSalarySlug(salaryParam: string): number | null {
  const unit = Number(salaryParam);
  if (!Number.isFinite(unit) || unit <= 0) return null;
  return Math.round(unit * 10_000);
}

export function getNearbySalaryLevels(annualGross: number): number[] {
  const currentIndex = SEO_SALARY_LEVELS.indexOf(annualGross);
  if (currentIndex === -1) return POPULAR_SALARY_LEVELS.slice(0, 5);

  const indexes = [currentIndex - 2, currentIndex - 1, currentIndex + 1, currentIndex + 2];
  const values = indexes
    .map((index) => SEO_SALARY_LEVELS[index])
    .filter((value): value is number => typeof value === "number");

  return values.length > 0 ? values : POPULAR_SALARY_LEVELS.slice(0, 5);
}
