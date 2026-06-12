/** Coptic calendar helpers (Annian year 1742 AM — matches Katameros dataset). */

export const DEFAULT_COPTIC_YEAR = 1742;

const THOUT_1_1742_UTC = Date.UTC(2025, 8, 11);

export const COPTIC_MONTH_AR = [
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
] as const;

export function isCopticLeapYear(year: number): boolean {
  return year % 4 === 3;
}

export function copticMonthDays(year: number, month: number): number {
  if (month >= 1 && month <= 12) return 30;
  if (month === 13) return isCopticLeapYear(year) ? 6 : 5;
  throw new Error(`Invalid coptic month: ${month}`);
}

export function gregorianToCoptic(date = new Date()): {
  copticYear: number;
  copticMonth: number;
  copticDay: number;
} {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((utc - THOUT_1_1742_UTC) / 86_400_000);
  if (diffDays < 0) {
    throw new Error("Date is before supported Coptic year 1742 AM");
  }

  let remaining = diffDays;
  let month = 1;
  while (month <= 13) {
    const days = copticMonthDays(DEFAULT_COPTIC_YEAR, month);
    if (remaining < days) {
      return {
        copticYear: DEFAULT_COPTIC_YEAR,
        copticMonth: month,
        copticDay: remaining + 1,
      };
    }
    remaining -= days;
    month++;
  }

  throw new Error("Date is beyond supported Coptic year 1742 AM");
}

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toArabicIndicDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => ARABIC_INDIC_DIGITS[Number(d)] ?? d);
}

export function formatCopticDateLabel(month: number, day: number, year = DEFAULT_COPTIC_YEAR): string {
  const name = COPTIC_MONTH_AR[month] ?? String(month);
  return toArabicIndicDigits(`${day} ${name} ${year}`);
}

export function formatGregorianDateLabel(date = new Date()): string {
  const formatted = new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return toArabicIndicDigits(formatted);
}

export function buildTodayDayIds(date = new Date()): string[] {
  const { copticMonth, copticDay } = gregorianToCoptic(date);
  const ids: string[] = [];

  if (date.getDay() === 0) {
    ids.push(`sunday-${copticMonth}-${copticDay}`);
  }
  ids.push(`annual-${copticMonth}-${copticDay}`);
  ids.push("today");

  return ids;
}
