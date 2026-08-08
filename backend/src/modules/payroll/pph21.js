// PPh21 calculation helpers (PMK 168/2023 - TER method & Pasal 17 progressive)
// TER monthly effective rate tables from PMK 168/2023 (effective Jan 2024).

// [upper_bound_inclusive, rate_pct]
const TER_CATEGORY_A = [
  [5400000, 0], [5650000, 0.25], [5950000, 0.5], [6300000, 0.75],
  [6750000, 1], [7500000, 1.25], [8550000, 1.5], [9650000, 1.75],
  [10050000, 2], [10350000, 2.25], [10700000, 2.5], [11050000, 3],
  [11600000, 3.5], [12500000, 4], [13750000, 5], [15100000, 6],
  [16950000, 7], [19750000, 8], [24150000, 9], [26450000, 10],
  [28000000, 11], [30050000, 12], [32400000, 13], [35400000, 14],
  [39100000, 15], [43850000, 16], [47800000, 17], [51400000, 18],
  [56300000, 19], [62200000, 20], [68600000, 21], [77500000, 22],
  [89000000, 23], [103000000, 24], [125000000, 25], [157000000, 26],
  [206000000, 27], [337000000, 28], [454000000, 29], [550000000, 30],
  [695000000, 31], [910000000, 32], [1400000000, 33], [Infinity, 34],
];

const TER_CATEGORY_B = [
  [6200000, 0], [6500000, 0.25], [6850000, 0.5], [7300000, 0.75],
  [9200000, 1], [10750000, 1.5], [11250000, 2], [11600000, 2.5],
  [12600000, 3], [13600000, 4], [14950000, 5], [16400000, 6],
  [18450000, 7], [21850000, 8], [26000000, 9], [27700000, 10],
  [29350000, 11], [31450000, 12], [33950000, 13], [37100000, 14],
  [41100000, 15], [45800000, 16], [49500000, 17], [53800000, 18],
  [58500000, 19], [64000000, 20], [71000000, 21], [80000000, 22],
  [93000000, 23], [109000000, 24], [129000000, 25], [163000000, 26],
  [211000000, 27], [374000000, 28], [459000000, 29], [555000000, 30],
  [704000000, 31], [957000000, 32], [1405000000, 33], [Infinity, 34],
];

const TER_CATEGORY_C = [
  [6600000, 0], [6950000, 0.25], [7350000, 0.5], [7800000, 0.75],
  [8850000, 1], [9800000, 1.25], [10950000, 1.5], [11200000, 1.75],
  [12050000, 2], [12950000, 3], [14150000, 4], [15550000, 5],
  [17050000, 6], [19500000, 7], [22700000, 8], [26600000, 9],
  [28100000, 10], [30100000, 11], [32600000, 12], [35400000, 13],
  [38900000, 14], [43000000, 15], [47400000, 16], [51200000, 17],
  [55800000, 18], [60400000, 19], [66700000, 20], [74500000, 21],
  [83200000, 22], [95600000, 23], [110000000, 24], [134000000, 25],
  [169000000, 26], [221000000, 27], [390000000, 28], [463000000, 29],
  [561000000, 30], [709000000, 31], [965000000, 32], [1419000000, 33],
  [Infinity, 34],
];

// TER category by PTKP status (PMK 168/2023 pasal 5)
const TER_CATEGORY = {
  'TK0': 'A', 'TK1': 'A', 'K0': 'A',
  'TK2': 'B', 'TK3': 'B', 'K1': 'B', 'K2': 'B',
  'K3': 'C',
};

// PTKP per year (UU HPP No. 7/2021)
const PTKP = {
  'TK0': 54000000, 'TK1': 58500000, 'TK2': 63000000, 'TK3': 67500000,
  'K0': 58500000, 'K1': 63000000, 'K2': 67500000, 'K3': 72000000,
};

// Progressive Pasal 17 (UU HPP) — [upper_bound_inclusive, rate_pct]
const PROGRESSIVE = [
  [60000000, 5], [250000000, 15], [500000000, 25], [5000000000, 30], [Infinity, 35],
];

function terRate(table, grossMonthly) {
  for (const [limit, rate] of table) {
    if (grossMonthly <= limit) return rate;
  }
  return table[table.length - 1][1];
}

function progressiveTax(pkp, bands = PROGRESSIVE) {
  let remaining = pkp;
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of bands) {
    if (remaining <= 0) break;
    const band = Math.min(remaining, limit - prev);
    tax += band * (rate / 100);
    remaining -= band;
    prev = limit;
  }
  return tax;
}

/**
 * Build progressive bands from DB tax_rates rows (fallback to built-in PROGRESSIVE).
 * DB rows: { min_income, max_income, tax_rate } — tax_rate in percent.
 * Returns [[upper_inclusive, rate_pct], ...]
 */
function progressiveFromDb(rows) {
  if (!Array.isArray(rows) || !rows.length) return PROGRESSIVE;
  const bands = rows
    .filter(r => r && r.tax_rate != null)
    .map(r => [r.max_income != null ? Number(r.max_income) : Infinity, Number(r.tax_rate)])
    .sort((a, b) => a[0] - b[0]);
  if (!bands.length) return PROGRESSIVE;
  return bands;
}

/**
 * Calculate monthly PPh21 for a permanent employee.
 * @param {Object} opts
 * @param {number} opts.grossMonthly - monthly gross income (gaji bruto)
 * @param {string} opts.taxCategory - PTKP status e.g. 'TK0', 'K1'
 * @param {string} [opts.method] - 'TER' (default) or 'pasal17'
 * @param {number} [opts.iuranPensiunMonthly] - monthly pension contribution paid by employee
 * @param {Array} [opts.progressiveBands] - [[upper, rate%]] from DB tax_rates (fallback: PROGRESSIVE)
 * @returns {{amount:number, method:string, terCategory?:string, terRate?:number, detail?:Object}}
 */
function calculatePph21({ grossMonthly, taxCategory, method = 'TER', iuranPensiunMonthly = 0, progressiveBands }) {
  const status = (taxCategory || 'TK0').toUpperCase();

  if (method === 'pasal17') {
    // Monthly -> annual, apply biaya jabatan (5%, max Rp500.000/month) & PTKP, then Pasal 17.
    const biayaJabatan = Math.min(grossMonthly * 0.05, 500000);
    const netoMonthly = grossMonthly - biayaJabatan - iuranPensiunMonthly;
    const netoAnnual = netoMonthly * 12;
    const ptkp = PTKP[status] || PTKP.TK0;
    const pkp = Math.max(netoAnnual - ptkp, 0);
    const bands = progressiveBands || PROGRESSIVE;
    const taxAnnual = progressiveTax(pkp, bands);
    const amount = Math.round(taxAnnual / 12);
    return {
      amount,
      method: 'pasal17',
      detail: {
        grossAnnual: grossMonthly * 12,
        biayaJabatanMonthly: Math.round(biayaJabatan),
        iuranPensiunMonthly,
        netoMonthly: Math.round(netoMonthly),
        netoAnnual: Math.round(netoAnnual),
        ptkp,
        pkp: Math.round(pkp),
        taxAnnual: Math.round(taxAnnual),
      },
    };
  }

  // TER method (default, PMK 168/2023)
  const cat = TER_CATEGORY[status] || 'A';
  const table = cat === 'A' ? TER_CATEGORY_A : cat === 'B' ? TER_CATEGORY_B : TER_CATEGORY_C;
  const rate = terRate(table, grossMonthly);
  const amount = Math.round(grossMonthly * (rate / 100));
  return { amount, method: 'TER', terCategory: cat, terRate: rate };
}

module.exports = { calculatePph21, TER_CATEGORY, PTKP, PROGRESSIVE, progressiveFromDb };
