/** Coptic ↔ Gregorian helpers (Annian calendar). Phase 1 targets year 1742 AM. */

export const DEFAULT_COPTIC_YEAR = 1742;

/** Verified: 1 Thout 1742 AM = 11 September 2025 (Gregorian). */
const THOUT_1_1742 = { year: 2025, month: 9, day: 11 };

export function isCopticLeapYear(year) {
  return year % 4 === 3;
}

export function copticMonthDays(year, month) {
  if (month >= 1 && month <= 12) return 30;
  if (month === 13) return isCopticLeapYear(year) ? 6 : 5;
  throw new Error(`Invalid coptic month: ${month}`);
}

export function copticToGregorian(year, month, day) {
  if (year !== DEFAULT_COPTIC_YEAR) {
    throw new Error(`Phase 1 supports coptic year ${DEFAULT_COPTIC_YEAR} only (got ${year})`);
  }

  const totalDays = (month - 1) * 30 + (day - 1);
  const date = new Date(
    Date.UTC(THOUT_1_1742.year, THOUT_1_1742.month - 1, THOUT_1_1742.day + totalDays)
  );

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function* iterateCopticDays(year) {
  for (let month = 1; month <= 13; month++) {
    const days = copticMonthDays(year, month);
    for (let day = 1; day <= days; day++) {
      yield { coptic_year: year, coptic_month: month, coptic_day: day };
    }
  }
}

export function buildKatamarosUrl(copticYear, copticMonth, copticDay) {
  const g = copticToGregorian(copticYear, copticMonth, copticDay);
  const params = new URLSearchParams({
    c: "",
    dbl: "ar",
    iday: String(g.day),
    imonth: String(g.month),
    iyear: String(g.year),
    sm: `${copticMonth}-${copticDay}`,
    view: "reading-arabic",
  });
  return `https://st-takla.org/zJ/index.php/en-readings-katamaros?${params.toString()}`;
}

const ARABIC_MONTHS = [
  "",
  "توت",
  "بابه",
  "هاتور",
  "كيهك",
  "طوبه",
  "أمشير",
  "برمهات",
  "برموده",
  "بشنس",
  "بؤونه",
  "أبيب",
  "مسرى",
  "نسئ",
];

export function parseCopticFromPageText(text) {
  const normalized = (text || "").replace(/ـ/g, "");
  const re =
    /(\d{1,2})\s*(توت|بابه|هاتور|كيهك|طوبه|أمشير|برمهات|برموده|بشنس|بؤونه|بابون|بؤونة|أبيب|مسرا|مسرى|نسئ|نسيء)\s*(\d{4})?/u;
  const m = normalized.match(re);
  if (!m) return null;

  let monthName = m[2];
  if (monthName === "بؤونة" || monthName === "بابون") monthName = "بؤونه";
  if (monthName === "نسيء") monthName = "نسئ";
  if (monthName === "مسرا") monthName = "مسرى";

  const coptic_month = ARABIC_MONTHS.indexOf(monthName);
  if (coptic_month < 1) return null;

  return {
    coptic_day: Number(m[1]),
    coptic_month,
    coptic_year: m[3] ? Number(m[3]) : null,
    coptic_date_label_ar: normalizeCopticLabel(m[1], monthName, m[3]),
  };
}

function normalizeCopticLabel(day, month, year) {
  const base = `${day} ${month}`;
  return year ? `${base} ${year}` : base;
}

export function detectSeason(liturgicalTitle) {
  const t = liturgicalTitle || "";
  if (/الصوم الكبير/u.test(t)) return "great_lent";
  if (/الخماسين/u.test(t)) return "pentecost";
  return "ordinary";
}
