import {
  paygWeekly,
  annualTax,
  scenario,
  helpRepayment,
} from "./tax.js";

function assertClose(actual, expected, label, tolerance = 0.02) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

assertEqual(paygWeekly(1500), 299, "PAYG $1,500");
assertEqual(paygWeekly(1800), 395, "PAYG $1,800");
assertEqual(paygWeekly(932), 116, "PAYG $932");
assertEqual(paygWeekly(1648.4), 346, "PAYG 40h week");

const tax50k = annualTax(50000);
assertClose(tax50k.incomeTax, 5520 - 250, "income tax after LITO at $50k");
assertClose(tax50k.medicare, 1000, "medicare at $50k");

assertClose(helpRepayment(80000), 1570.8, "HELP at $80k");

const forty = scenario({
  hours: 40,
  casualRate: 41.21,
  weeks: 52,
  overtime: false,
  hasHelp: false,
  hasPrivateHospital: true,
});

assertClose(forty.weeklyGross, 1648.4, "40h gross weekly");
assertClose(forty.yearlyGross, 85716.8, "40h yearly gross");
assertEqual(forty.weeklyTax, 346, "40h PAYG");
assertClose(forty.yearlyNet, 67767.42, "40h yearly net", 0.5);

const fiftyFive = scenario({
  hours: 55,
  casualRate: 41.21,
  weeks: 52,
  overtime: false,
  hasHelp: false,
  hasPrivateHospital: true,
});

assertClose(fiftyFive.weeklyGross, 2266.55, "55h gross weekly");
assertClose(fiftyFive.yearlyGross, 117860.6, "55h yearly gross");
assertEqual(fiftyFive.weeklyTax, 544, "55h PAYG");

console.log("All tax checks passed.");
console.log(
  JSON.stringify(
    [40, 45, 50, 55].map((hours) =>
      scenario({
        hours,
        casualRate: 41.21,
        weeks: 52,
        overtime: false,
        hasHelp: false,
        hasPrivateHospital: true,
      })
    ),
    null,
    2
  )
);
