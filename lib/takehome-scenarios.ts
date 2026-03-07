import { DEFAULT_TAX_YEAR, type EmploymentType } from "./tax-config";
import { getPrefectureConfig, type PrefectureCode } from "./prefectures";
import { calculateTakehome, toSalarySlug, type TakehomeInput } from "./takehome";

type ScenarioOverrides = Partial<
  Omit<TakehomeInput, "annualGross" | "dependentProfile" | "deductionOptions" | "insuranceInput">
> & {
  dependentProfile?: Partial<TakehomeInput["dependentProfile"]>;
  deductionOptions?: Partial<TakehomeInput["deductionOptions"]>;
  insuranceInput?: Partial<TakehomeInput["insuranceInput"]>;
};

export type TakehomeScenario = {
  slug: string;
  query: string;
  title: string;
  lead: string;
  input: Partial<TakehomeInput> & { annualGross: number };
};

const BASE_DEPENDENTS: TakehomeInput["dependentProfile"] = {
  spouse: false,
  general: 0,
  specified: 0,
  elderly: 0,
};

const BASE_DEDUCTIONS: TakehomeInput["deductionOptions"] = {
  idecoEnabled: false,
  lifeInsuranceEnabled: false,
  hometownTaxEnabled: false,
  housingLoanEnabled: false,
};

const BASE_INSURANCE: TakehomeInput["insuranceInput"] = {
  mode: "auto",
  manualAmount: 0,
};

function createScenarioInput(
  annualGross: number,
  overrides: ScenarioOverrides = {}
): Partial<TakehomeInput> & { annualGross: number } {
  return {
    annualGross,
    taxYear: overrides.taxYear ?? DEFAULT_TAX_YEAR,
    age: overrides.age ?? 35,
    employmentType: overrides.employmentType ?? "employee",
    prefecture: overrides.prefecture ?? "tokyo",
    dependentProfile: {
      ...BASE_DEPENDENTS,
      ...overrides.dependentProfile,
    },
    deductionOptions: {
      ...BASE_DEDUCTIONS,
      ...overrides.deductionOptions,
    },
    insuranceInput: {
      ...BASE_INSURANCE,
      ...overrides.insuranceInput,
    },
  };
}

function scenario(
  slug: string,
  query: string,
  title: string,
  lead: string,
  annualGross: number,
  overrides: ScenarioOverrides = {}
): TakehomeScenario {
  return {
    slug,
    query,
    title,
    lead,
    input: createScenarioInput(annualGross, overrides),
  };
}

export const TAKEHOME_SCENARIOS: TakehomeScenario[] = [
  scenario(
    "employee-tokyo-400",
    "会社員 年収400万円 手取り 東京",
    "会社員・東京で年収400万円の手取り目安",
    "独身・35歳・扶養なしでの概算",
    4_000_000,
    { employmentType: "employee", prefecture: "tokyo" }
  ),
  scenario(
    "employee-tokyo-500-spouse",
    "会社員 年収500万円 手取り 配偶者控除",
    "会社員・配偶者ありで年収500万円の手取り目安",
    "東京在住・配偶者控除ありの概算",
    5_000_000,
    {
      employmentType: "employee",
      prefecture: "tokyo",
      dependentProfile: { spouse: true },
    }
  ),
  scenario(
    "employee-osaka-600-family",
    "会社員 年収600万円 手取り 大阪 子ども1人",
    "会社員・大阪・子ども1人で年収600万円の手取り目安",
    "一般扶養1人を反映した概算",
    6_000_000,
    {
      employmentType: "employee",
      prefecture: "osaka",
      dependentProfile: { general: 1 },
    }
  ),
  scenario(
    "contract-tokyo-450",
    "契約社員 年収450万円 手取り 東京",
    "契約・派遣で年収450万円の手取り目安",
    "東京都・35歳・扶養なしの概算",
    4_500_000,
    { employmentType: "contract", prefecture: "tokyo" }
  ),
  scenario(
    "parttime-tokyo-250",
    "パート 年収250万円 手取り 東京",
    "パート・アルバイトで年収250万円の手取り目安",
    "東京都・扶養なしの概算",
    2_500_000,
    { employmentType: "part_time", prefecture: "tokyo" }
  ),
  scenario(
    "self-employed-600",
    "個人事業主 年収600万円 手取り",
    "個人事業主で年収600万円の手取り目安",
    "35歳・扶養なしの概算",
    6_000_000,
    { employmentType: "self_employed", prefecture: "tokyo" }
  ),
  scenario(
    "employee-kanagawa-700-housing",
    "会社員 年収700万円 手取り 住宅ローン控除",
    "会社員・年収700万円・住宅ローン控除ありの手取り目安",
    "神奈川在住で税額控除を反映した概算",
    7_000_000,
    {
      employmentType: "employee",
      prefecture: "kanagawa",
      deductionOptions: { housingLoanEnabled: true },
    }
  ),
  scenario(
    "employee-aichi-800-ideco",
    "会社員 年収800万円 手取り iDeCo",
    "会社員・年収800万円・iDeCoありの手取り目安",
    "愛知県在住でiDeCo控除を反映した概算",
    8_000_000,
    {
      employmentType: "employee",
      prefecture: "aichi",
      deductionOptions: { idecoEnabled: true },
    }
  ),
  scenario(
    "self-employed-1000-family",
    "個人事業主 年収1000万円 手取り 配偶者 子ども",
    "個人事業主・配偶者ありで年収1000万円の手取り目安",
    "配偶者＋一般扶養1人の概算",
    10_000_000,
    {
      employmentType: "self_employed",
      prefecture: "tokyo",
      dependentProfile: { spouse: true, general: 1 },
    }
  ),
  scenario(
    "employee-fukuoka-350",
    "会社員 年収350万円 手取り 福岡",
    "会社員・福岡で年収350万円の手取り目安",
    "福岡県在住・扶養なしの概算",
    3_500_000,
    { employmentType: "employee", prefecture: "fukuoka" }
  ),
];

export function getTakehomeScenarioBySlug(slug: string): TakehomeScenario | null {
  return TAKEHOME_SCENARIOS.find((item) => item.slug === slug) ?? null;
}

export function getScenarioUrl(slug: string): string {
  return `/takehome/scenarios/${slug}`;
}

export function getScenarioSalaryUrl(annualGross: number): string {
  return `/takehome/${toSalarySlug(annualGross)}`;
}

export function getTakehomeScenarioResult(scenario: TakehomeScenario) {
  return calculateTakehome(scenario.input);
}

export function getScenariosForSalary(annualGross: number, limit = 4): TakehomeScenario[] {
  return TAKEHOME_SCENARIOS.map((scenario) => ({
    scenario,
    diff: Math.abs(scenario.input.annualGross - annualGross),
  }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, limit)
    .map((item) => item.scenario);
}

export function getRelatedScenarios(currentSlug: string, limit = 4): TakehomeScenario[] {
  return TAKEHOME_SCENARIOS.filter((scenario) => scenario.slug !== currentSlug).slice(0, limit);
}

export function getEmploymentTypeLabel(type: EmploymentType): string {
  if (type === "employee") return "会社員";
  if (type === "contract") return "契約・派遣";
  if (type === "part_time") return "パート・アルバイト";
  return "個人事業主";
}

export function getPrefectureLabel(code: PrefectureCode): string {
  return getPrefectureConfig(code).label;
}
