import { DEFAULT_PREFECTURE, type PrefectureCode, getPrefectureConfig } from "./prefectures";
import {
  DEFAULT_TAX_YEAR,
  getTaxConfig,
  type EmploymentType,
  type IncomeTaxBracket,
  type RangeRate,
} from "./tax-config";

export type DependentProfile = {
  spouse: boolean;
  general: number;
  specified: number;
  elderly: number;
};

export type DeductionOptions = {
  idecoEnabled: boolean;
  lifeInsuranceEnabled: boolean;
  hometownTaxEnabled: boolean;
  housingLoanEnabled: boolean;
};

export type InsuranceInput = {
  mode: "auto" | "manual";
  manualAmount: number;
};

export type TakehomeInput = {
  annualGross: number;
  age: number;
  taxYear: number;
  employmentType: EmploymentType;
  prefecture: PrefectureCode;
  dependentProfile: DependentProfile;
  deductionOptions: DeductionOptions;
  insuranceInput: InsuranceInput;
  // Backward compatibility for existing callers.
  dependents?: number;
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
  deductionTotalIncomeTax: number;
  deductionTotalResidentTax: number;
  taxCreditIncomeTax: number;
  taxCreditResidentTax: number;
  calculationNotes: string[];
};

export const SEO_SALARY_LEVELS = [
  2_500_000,
  3_000_000,
  3_500_000,
  4_000_000,
  4_500_000,
  5_000_000,
  5_500_000,
  6_000_000,
  7_000_000,
  8_000_000,
];
export const POPULAR_SALARY_LEVELS = SEO_SALARY_LEVELS;

export function calculateTakehome(input: Partial<TakehomeInput>): TakehomeResult {
  const safeInput = normalizeInput(input);
  const config = getTaxConfig(safeInput.taxYear);
  const prefectureConfig = getPrefectureConfig(safeInput.prefecture);
  const model = config.employmentModels[safeInput.employmentType];

  const baseGross = Math.max(0, safeInput.annualGross);
  const annualBusinessIncome = baseGross * (1 - model.businessExpenseRate);

  const autoInsuranceRate =
    pickRateByRange(baseGross, model.socialInsuranceRates) +
    (safeInput.age >= 40 && safeInput.age < 65 ? model.careInsuranceRate : 0);
  const autoInsuranceAmount = annualBusinessIncome * autoInsuranceRate;
  const socialInsurance =
    safeInput.insuranceInput.mode === "manual"
      ? Math.max(0, safeInput.insuranceInput.manualAmount)
      : autoInsuranceAmount;
  const socialInsuranceRate = annualBusinessIncome > 0 ? socialInsurance / annualBusinessIncome : 0;

  const employmentIncomeDeduction = model.useEmploymentIncomeDeduction
    ? calcEmploymentIncomeDeduction(
        baseGross,
        config.employmentIncomeDeductionRules,
        config.employmentIncomeDeductionMin,
        config.employmentIncomeDeductionMax
      )
    : 0;

  const dependentIncomeDeduction =
    (safeInput.dependentProfile.spouse ? config.spouseDeductionIncomeTax : 0) +
    safeInput.dependentProfile.general * config.dependentDeductionIncomeTax.general +
    safeInput.dependentProfile.specified * config.dependentDeductionIncomeTax.specified +
    safeInput.dependentProfile.elderly * config.dependentDeductionIncomeTax.elderly;

  const dependentResidentDeduction =
    (safeInput.dependentProfile.spouse ? config.spouseDeductionResidentTax : 0) +
    safeInput.dependentProfile.general * config.dependentDeductionResidentTax.general +
    safeInput.dependentProfile.specified * config.dependentDeductionResidentTax.specified +
    safeInput.dependentProfile.elderly * config.dependentDeductionResidentTax.elderly;

  const optionalIncomeDeduction =
    (safeInput.deductionOptions.idecoEnabled ? 240_000 : 0) +
    (safeInput.deductionOptions.lifeInsuranceEnabled
      ? config.lifeInsuranceDeductionIncomeTaxMax
      : 0);
  const optionalResidentDeduction =
    (safeInput.deductionOptions.idecoEnabled ? 240_000 : 0) +
    (safeInput.deductionOptions.lifeInsuranceEnabled
      ? config.lifeInsuranceDeductionResidentTaxMax
      : 0);

  const deductionTotalIncomeTax = dependentIncomeDeduction + optionalIncomeDeduction;
  const deductionTotalResidentTax = dependentResidentDeduction + optionalResidentDeduction;

  const incomeTaxable =
    annualBusinessIncome -
    employmentIncomeDeduction -
    config.basicDeductionIncomeTax -
    socialInsurance -
    deductionTotalIncomeTax;

  const grossIncomeTax = calcIncomeTaxAmount(incomeTaxable, config.incomeTaxBrackets);
  const taxCreditIncomeTax = safeInput.deductionOptions.housingLoanEnabled ? 100_000 : 0;
  const incomeTax = Math.max(0, grossIncomeTax - taxCreditIncomeTax);

  const residentTaxRate = Math.max(
    0,
    config.residentBaseRate + prefectureConfig.residentTaxRateAdjustment
  );
  const residentTaxable =
    annualBusinessIncome -
    employmentIncomeDeduction -
    config.basicDeductionResidentTax -
    socialInsurance -
    deductionTotalResidentTax;

  const grossResidentTax =
    annualBusinessIncome <= config.residentTaxExemptionIncome || residentTaxable <= 0
      ? 0
      : residentTaxable * residentTaxRate +
        config.residentPerCapitaLevy +
        prefectureConfig.perCapitaLevyAdjustment;

  const taxCreditResidentTax = safeInput.deductionOptions.hometownTaxEnabled ? 30_000 : 0;
  const residentTax = Math.max(0, grossResidentTax - taxCreditResidentTax);

  const annualTakehome = baseGross - socialInsurance - incomeTax - residentTax;
  const appliedIncomeTaxRate = findIncomeTaxRate(incomeTaxable, config.incomeTaxBrackets);

  const calculationNotes: string[] = [];
  const employmentLabel =
    safeInput.employmentType === "employee"
      ? "会社員"
      : safeInput.employmentType === "contract"
        ? "契約・派遣"
        : safeInput.employmentType === "part_time"
          ? "パート・アルバイト"
          : "個人事業主";
  calculationNotes.push(`${employmentLabel}モデルを適用`);

  if (safeInput.insuranceInput.mode === "manual") {
    calculationNotes.push("社会保険料は実額入力を優先");
  } else if (safeInput.age >= 40 && safeInput.age < 65) {
    calculationNotes.push("40-64歳のため介護保険料を上乗せ");
  }

  if (safeInput.deductionOptions.idecoEnabled) {
    calculationNotes.push("iDeCo控除を適用");
  }
  if (safeInput.deductionOptions.lifeInsuranceEnabled) {
    calculationNotes.push("生命保険料控除を適用");
  }
  if (safeInput.deductionOptions.hometownTaxEnabled) {
    calculationNotes.push("ふるさと納税控除（簡易）を適用");
  }
  if (safeInput.deductionOptions.housingLoanEnabled) {
    calculationNotes.push("住宅ローン控除（簡易）を適用");
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
    deductionTotalIncomeTax,
    deductionTotalResidentTax,
    taxCreditIncomeTax,
    taxCreditResidentTax,
    calculationNotes,
  };
}

function normalizeInput(input: Partial<TakehomeInput>): TakehomeInput {
  const legacyDependents = Math.max(0, input.dependents ?? 0);
  return {
    annualGross: input.annualGross ?? 5_000_000,
    age: input.age ?? 35,
    taxYear: input.taxYear ?? DEFAULT_TAX_YEAR,
    employmentType: input.employmentType ?? "employee",
    prefecture: input.prefecture ?? DEFAULT_PREFECTURE,
    dependentProfile: input.dependentProfile ?? {
      spouse: false,
      general: legacyDependents,
      specified: 0,
      elderly: 0,
    },
    deductionOptions: input.deductionOptions ?? {
      idecoEnabled: false,
      lifeInsuranceEnabled: false,
      hometownTaxEnabled: false,
      housingLoanEnabled: false,
    },
    insuranceInput: input.insuranceInput ?? {
      mode: "auto",
      manualAmount: 0,
    },
    dependents: input.dependents,
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
