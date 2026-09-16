/**
 * 2026–27 Australian resident tax + PAYG helpers.
 * Figures are estimates for planning, not a payslip or tax advice.
 */

export const TAX_YEAR = "2026–27";
export const SUPER_RATE = 0.12;
export const CASUAL_LOADING = 0.25;
export const ORDINARY_HOURS = 38;

const SCALE2 = [
  { max: 362, a: 0, b: 0, nil: true },
  { max: 538, a: 0.15, b: 54.3462 },
  { max: 673, a: 0.25, b: 108.2135 },
  { max: 721, a: 0.17, b: 54.3473 },
  { max: 865, a: 0.179, b: 60.8377 },
  { max: 1282, a: 0.3227, b: 185.1935 },
  { max: 2596, a: 0.32, b: 181.7319 },
  { max: 3653, a: 0.39, b: 363.4627 },
  { max: Infinity, a: 0.47, b: 655.7704 },
];

const STSL_WEEKLY = [
  { max: 1337, a: 0, b: 0, nil: true },
  { max: 2494, a: 0.15, b: 200.5615 },
  { max: 3577, a: 0.17, b: 250.4527 },
  { max: Infinity, a: 0.1, b: 0 },
];

export function roundNearestDollar(value) {
  if (value <= 0) return 0;
  return Math.floor(value + 0.5);
}

export function weeklyEarningsX(grossWeekly) {
  return Math.floor(grossWeekly) + 0.99;
}

function applyScale(grossWeekly, bands) {
  const x = weeklyEarningsX(grossWeekly);
  const band = bands.find((row) => x < row.max);
  if (!band || band.nil) return 0;
  return roundNearestDollar(band.a * x - band.b);
}

export function paygWeekly(grossWeekly) {
  return applyScale(grossWeekly, SCALE2);
}

export function stslWeekly(grossWeekly) {
  return applyScale(grossWeekly, STSL_WEEKLY);
}

export function incomeTax(taxable) {
  if (taxable <= 18200) return 0;
  if (taxable <= 45000) return 0.15 * (taxable - 18200);
  if (taxable <= 135000) return 4020 + 0.3 * (taxable - 45000);
  if (taxable <= 190000) return 31020 + 0.37 * (taxable - 135000);
  return 51370 + 0.45 * (taxable - 190000);
}

export function lito(taxable) {
  if (taxable <= 37500) return 700;
  if (taxable <= 45000) return 700 - 0.05 * (taxable - 37500);
  if (taxable <= 66667) return 325 - 0.015 * (taxable - 45000);
  return 0;
}

export function medicareLevy(taxable) {
  if (taxable <= 28011) return 0;
  if (taxable < 35013) return 0.1 * (taxable - 28011);
  return 0.02 * taxable;
}

export function medicareLevySurcharge(taxable, hasPrivateHospital) {
  if (hasPrivateHospital || taxable <= 105000) return 0;
  if (taxable <= 123000) return 0.01 * taxable;
  if (taxable <= 164000) return 0.0125 * taxable;
  return 0.015 * taxable;
}

export function helpRepayment(repaymentIncome) {
  if (repaymentIncome <= 69528) return 0;
  if (repaymentIncome <= 129717) return 0.15 * (repaymentIncome - 69528);
  if (repaymentIncome <= 186050) return 9028.35 + 0.17 * (repaymentIncome - 129717);
  return 0.1 * repaymentIncome;
}

export function annualTax(taxable, { hasPrivateHospital = true } = {}) {
  const offset = lito(taxable);
  const tax = Math.max(0, incomeTax(taxable) - offset);
  const medicare = medicareLevy(taxable);
  const mls = medicareLevySurcharge(taxable, hasPrivateHospital);
  return {
    incomeTax: tax,
    medicare,
    mls,
    total: tax + medicare + mls,
  };
}

export function impliedBaseRate(casualRate) {
  return casualRate / (1 + CASUAL_LOADING);
}

export function grossWeekly(hours, casualRate, overtime) {
  if (!overtime || hours <= ORDINARY_HOURS) {
    return hours * casualRate;
  }

  const base = impliedBaseRate(casualRate);
  const ordinary = ORDINARY_HOURS * casualRate;
  const extra = hours - ORDINARY_HOURS;
  const firstTwo = Math.min(extra, 2);
  const rest = Math.max(0, extra - 2);
  return ordinary + firstTwo * base * 1.75 + rest * base * 2.25;
}

export function ordinaryTimeEarningsWeekly(hours, casualRate, overtime) {
  const ordinaryHours = overtime ? Math.min(hours, ORDINARY_HOURS) : hours;
  return ordinaryHours * casualRate;
}

export function scenario({
  hours,
  casualRate,
  weeks = 52,
  overtime = false,
  hasHelp = false,
  hasPrivateHospital = true,
}) {
  const weeklyGross = grossWeekly(hours, casualRate, overtime);
  const weeklyOte = ordinaryTimeEarningsWeekly(hours, casualRate, overtime);
  const withheld = paygWeekly(weeklyGross);
  const weeklyHelp = hasHelp ? stslWeekly(weeklyGross) : 0;
  const weeklyNetPayslip = weeklyGross - withheld - weeklyHelp;
  const weeklySuper = weeklyOte * SUPER_RATE;

  const yearlyGross = weeklyGross * weeks;
  const yearlyOte = weeklyOte * weeks;
  const yearlySuper = yearlyOte * SUPER_RATE;
  const tax = annualTax(yearlyGross, { hasPrivateHospital });
  const yearlyHelp = hasHelp ? helpRepayment(yearlyGross) : 0;
  const yearlyNet = yearlyGross - tax.total - yearlyHelp;

  return {
    hours,
    weeklyGross,
    weeklyTax: withheld,
    weeklyHelp,
    weeklyNetPayslip,
    weeklySuper,
    yearlyGross,
    yearlyTax: tax.total,
    yearlyIncomeTax: tax.incomeTax,
    yearlyMedicare: tax.medicare,
    yearlyMls: tax.mls,
    yearlyHelp,
    yearlyNet,
    yearlySuper,
    yearlyPackage: yearlyGross + yearlySuper,
    effectiveRate: yearlyGross === 0 ? 0 : (tax.total + yearlyHelp) / yearlyGross,
    trueWeeklyNet: weeks > 0 ? yearlyNet / weeks : 0,
  };
}
