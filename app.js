import { scenario } from "./tax.js";

const HOURS = [40, 45, 50, 55];

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const moneyExact = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
});

const els = {
  rate: document.querySelector("#rate"),
  weeks: document.querySelector("#weeks"),
  overtime: document.querySelector("#overtime"),
  help: document.querySelector("#help"),
  privateHealth: document.querySelector("#privateHealth"),
  cards: document.querySelector("#cards"),
  weeklyChart: document.querySelector("#weeklyChart"),
  yearlyChart: document.querySelector("#yearlyChart"),
  tableBody: document.querySelector("#tableBody"),
  tableNote: document.querySelector("#tableNote"),
};

function settings() {
  return {
    casualRate: Number(els.rate.value) || 41.21,
    weeks: Number(els.weeks.value) || 52,
    overtime: els.overtime.checked,
    hasHelp: els.help.checked,
    hasPrivateHospital: els.privateHealth.checked,
  };
}

function rows() {
  const opts = settings();
  return HOURS.map((hours) => scenario({ hours, ...opts }));
}

function render() {
  const data = rows();
  const opts = settings();
  const maxWeekly = Math.max(...data.map((row) => row.weeklyNetPayslip));
  const maxYearly = Math.max(...data.map((row) => row.yearlyGross));

  els.cards.innerHTML = data
    .map((row, index) => {
      const featured = index === 0 ? "featured" : "";
      const badge = index === 0 ? "Floor" : index === data.length - 1 ? "Ceiling" : "";
      return `
        <article class="card ${featured}">
          ${badge ? `<span class="badge">${badge}</span>` : ""}
          <p class="hours">${row.hours} hour week</p>
          <p class="net">${moneyExact.format(row.weeklyNetPayslip)}</p>
          <p class="label">weekly take-home</p>
          <div class="stats">
            <div class="stat"><span>Yearly salary</span><b>${money.format(row.yearlyGross)}</b></div>
            <div class="stat"><span>Yearly take-home</span><b>${money.format(row.yearlyNet)}</b></div>
            <div class="stat"><span>Super on top</span><b>${money.format(row.yearlySuper)}</b></div>
          </div>
        </article>
      `;
    })
    .join("");

  els.weeklyChart.innerHTML = data
    .map((row) => {
      const width = (row.weeklyNetPayslip / maxWeekly) * 100;
      return `
        <div class="bar-row">
          <span>${row.hours}h</span>
          <div class="track"><div class="fill mint" style="width:${width}%"></div></div>
          <strong>${moneyExact.format(row.weeklyNetPayslip)}</strong>
        </div>
      `;
    })
    .join("");

  els.yearlyChart.innerHTML = `
    <p class="legend"><span class="swatch mint"></span> take-home <span class="swatch ghost"></span> tax</p>
    ${data
      .map((row) => {
        const netPct = (row.yearlyNet / maxYearly) * 100;
        const taxPct = ((row.yearlyGross - row.yearlyNet) / maxYearly) * 100;
        return `
          <div class="bar-row">
            <span>${row.hours}h</span>
            <div class="stack">
              <div class="fill mint" style="flex:0 0 ${netPct}%"></div>
              <div class="fill ghost" style="flex:0 0 ${taxPct}%"></div>
            </div>
            <strong>${money.format(row.yearlyNet)}</strong>
          </div>
        `;
      })
      .join("")}
  `;

  els.tableBody.innerHTML = data
    .map(
      (row) => `
        <tr>
          <td>${row.hours} hours</td>
          <td>${moneyExact.format(row.weeklyGross)}</td>
          <td>${money.format(row.weeklyTax + row.weeklyHelp)}</td>
          <td>${moneyExact.format(row.weeklyNetPayslip)}</td>
          <td>${money.format(row.yearlyGross)}</td>
          <td>${money.format(row.yearlyTax + row.yearlyHelp)}</td>
          <td>${money.format(row.yearlyNet)}</td>
          <td>${money.format(row.yearlySuper)}</td>
        </tr>
      `
    )
    .join("");

  const overtimeNote = opts.overtime
    ? "Award-style overtime after 38 hours."
    : "flat casual rate, no overtime loading.";
  els.tableNote.textContent = `${opts.weeks} weeks at ${moneyExact.format(opts.casualRate)} an hour, ${overtimeNote}`;
}

for (const el of [els.rate, els.weeks, els.overtime, els.help, els.privateHealth]) {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
}

render();
