export type PartTimePayInput = {
  hourlyWage: number;
  hoursPerWeek: number;
  weeksPerMonth: number;
  overtimeHoursPerMonth: number;
  lateNightHoursPerMonth: number;
  transportAllowancePerMonth: number;
  withholdingRatePercent: number;
};

export type PartTimePayResult = {
  regularHoursPerMonth: number;
  regularPay: number;
  overtimePay: number;
  lateNightPay: number;
  grossPay: number;
  withholdingAmount: number;
  netPay: number;
};

export type OvertimePayInput = {
  monthlySalary: number;
  monthlyWorkingHours: number;
  weekdayOvertimeHours: number;
  lateNightOvertimeHours: number;
  holidayOvertimeHours: number;
  fixedOvertimeAllowance: number;
  deductionRatePercent: number;
};

export type OvertimePayResult = {
  baseHourlyWage: number;
  weekdayOvertimePay: number;
  lateNightOvertimePay: number;
  holidayOvertimePay: number;
  statutoryOvertimePay: number;
  payableOvertimePay: number;
  estimatedDeduction: number;
  estimatedNetOvertimePay: number;
};

export type LoanInput = {
  principal: number;
  annualRatePercent: number;
  years: number;
  annualExtraPayment: number;
};

type LoanRepaymentSummary = {
  months: number;
  totalPayment: number;
  totalInterest: number;
};

export type LoanResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalMonths: number;
  withExtraPayment: (LoanRepaymentSummary & {
    annualExtraPayment: number;
    termShortenedMonths: number;
    interestSaved: number;
  }) | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sanitize(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function nonNegative(value: number): number {
  return Math.max(0, sanitize(value));
}

export function calculatePartTimePay(input: PartTimePayInput): PartTimePayResult {
  const hourlyWage = nonNegative(input.hourlyWage);
  const hoursPerWeek = nonNegative(input.hoursPerWeek);
  const weeksPerMonth = clamp(nonNegative(input.weeksPerMonth), 0, 6);
  const overtimeHoursPerMonth = nonNegative(input.overtimeHoursPerMonth);
  const lateNightHoursPerMonth = nonNegative(input.lateNightHoursPerMonth);
  const transportAllowancePerMonth = nonNegative(input.transportAllowancePerMonth);
  const withholdingRate = clamp(nonNegative(input.withholdingRatePercent), 0, 40) / 100;

  const regularHoursPerMonth = hoursPerWeek * weeksPerMonth;
  const regularPay = regularHoursPerMonth * hourlyWage;
  const overtimePay = overtimeHoursPerMonth * hourlyWage * 1.25;
  const lateNightPay = lateNightHoursPerMonth * hourlyWage * 1.25;
  const grossPay = regularPay + overtimePay + lateNightPay + transportAllowancePerMonth;
  const withholdingAmount = grossPay * withholdingRate;
  const netPay = grossPay - withholdingAmount;

  return {
    regularHoursPerMonth,
    regularPay,
    overtimePay,
    lateNightPay,
    grossPay,
    withholdingAmount,
    netPay,
  };
}

export function calculateOvertimePay(input: OvertimePayInput): OvertimePayResult {
  const monthlySalary = nonNegative(input.monthlySalary);
  const monthlyWorkingHours = Math.max(1, nonNegative(input.monthlyWorkingHours));
  const weekdayOvertimeHours = nonNegative(input.weekdayOvertimeHours);
  const lateNightOvertimeHours = nonNegative(input.lateNightOvertimeHours);
  const holidayOvertimeHours = nonNegative(input.holidayOvertimeHours);
  const fixedOvertimeAllowance = nonNegative(input.fixedOvertimeAllowance);
  const deductionRate = clamp(nonNegative(input.deductionRatePercent), 0, 50) / 100;

  const baseHourlyWage = monthlySalary / monthlyWorkingHours;
  const weekdayOvertimePay = baseHourlyWage * 1.25 * weekdayOvertimeHours;
  const lateNightOvertimePay = baseHourlyWage * 1.5 * lateNightOvertimeHours;
  const holidayOvertimePay = baseHourlyWage * 1.35 * holidayOvertimeHours;
  const statutoryOvertimePay = weekdayOvertimePay + lateNightOvertimePay + holidayOvertimePay;
  const payableOvertimePay = Math.max(statutoryOvertimePay - fixedOvertimeAllowance, 0);
  const estimatedDeduction = payableOvertimePay * deductionRate;
  const estimatedNetOvertimePay = payableOvertimePay - estimatedDeduction;

  return {
    baseHourlyWage,
    weekdayOvertimePay,
    lateNightOvertimePay,
    holidayOvertimePay,
    statutoryOvertimePay,
    payableOvertimePay,
    estimatedDeduction,
    estimatedNetOvertimePay,
  };
}

function calculateMonthlyPayment(principal: number, monthlyRate: number, totalMonths: number): number {
  if (totalMonths <= 0) return 0;
  if (monthlyRate === 0) return principal / totalMonths;
  const compound = (1 + monthlyRate) ** totalMonths;
  return (principal * monthlyRate * compound) / (compound - 1);
}

function simulateRepayment(
  principal: number,
  monthlyRate: number,
  monthlyPayment: number,
  annualExtraPayment: number
): LoanRepaymentSummary {
  let balance = principal;
  let months = 0;
  let totalPayment = 0;
  const maxMonths = 2400;

  while (balance > 0.5 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const scheduledPayment = Math.min(monthlyPayment, balance + interest);
    const principalPortion = Math.max(0, scheduledPayment - interest);

    balance = Math.max(0, balance - principalPortion);
    totalPayment += scheduledPayment;
    months += 1;

    if (annualExtraPayment > 0 && months % 12 === 0 && balance > 0) {
      const bonusPayment = Math.min(annualExtraPayment, balance);
      balance -= bonusPayment;
      totalPayment += bonusPayment;
    }
  }

  return {
    months,
    totalPayment,
    totalInterest: Math.max(0, totalPayment - principal),
  };
}

export function calculateLoan(input: LoanInput): LoanResult {
  const principal = nonNegative(input.principal);
  const years = clamp(nonNegative(input.years), 1, 50);
  const annualRatePercent = clamp(nonNegative(input.annualRatePercent), 0, 20);
  const annualExtraPayment = nonNegative(input.annualExtraPayment);

  const totalMonths = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRatePercent / 12 / 100;
  const monthlyPayment = calculateMonthlyPayment(principal, monthlyRate, totalMonths);
  const baseSummary = simulateRepayment(principal, monthlyRate, monthlyPayment, 0);

  const withExtraPayment =
    annualExtraPayment > 0
      ? (() => {
          const extraSummary = simulateRepayment(
            principal,
            monthlyRate,
            monthlyPayment,
            annualExtraPayment
          );
          return {
            annualExtraPayment,
            months: extraSummary.months,
            totalPayment: extraSummary.totalPayment,
            totalInterest: extraSummary.totalInterest,
            termShortenedMonths: Math.max(baseSummary.months - extraSummary.months, 0),
            interestSaved: Math.max(baseSummary.totalInterest - extraSummary.totalInterest, 0),
          };
        })()
      : null;

  return {
    monthlyPayment,
    totalPayment: baseSummary.totalPayment,
    totalInterest: baseSummary.totalInterest,
    totalMonths: baseSummary.months,
    withExtraPayment,
  };
}
