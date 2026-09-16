# BevChain take-home

A local (and GitHub Pages) dashboard for a casual BevChain start at **$41.21 an hour**, showing expected weekly take-home and yearly salary at **40, 45, 50 and 55 hours**.

Open [the live page](https://timesnapx.github.io/bevchain-take-home/) or run it locally.

## Default picture (52 weeks, no overtime, no HELP, private hospital cover)

| Hours | Gross / week | Take-home / week | Yearly salary | Yearly take-home |
| --- | ---: | ---: | ---: | ---: |
| 40 | $1,648.40 | $1,302.40 | $85,717 | $67,767 |
| 45 | $1,854.45 | $1,442.45 | $96,431 | $75,053 |
| 50 | $2,060.50 | $1,582.50 | $107,146 | $82,339 |
| 55 | $2,266.55 | $1,722.55 | $117,861 | $89,625 |

Weekly take-home uses ATO PAYG withholding scale 2 for 2026–27 (tax-free threshold claimed). Yearly take-home uses resident income tax, the low income tax offset, and the 2% Medicare levy. Employer super (12%) is shown on top and is not cash in hand.

## Run locally

```bash
python -m http.server 4173
```

Then open http://localhost:4173

## Checks

```bash
node test-tax.js
```

## Assumptions

- Australian tax resident, 2026–27 year
- Casual rate applied to every hour unless overtime is switched on
- Overtime estimate: ordinary casual rate to 38 hours, then 175% / 225% of the unloaded base
- Casuals are not paid annual leave, so yearly figures scale with the weeks-worked control
- Not tax advice and not a payslip. Shift penalties, allowances, and public holidays are not included
