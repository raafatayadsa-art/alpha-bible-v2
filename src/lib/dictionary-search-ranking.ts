/**
 * Pure ranking + dedupe layer for dictionary search results.
 * Extracted from DictionarySearchDialog so it is unit-testable without
 * pulling in React / Supabase. No side effects.
 */

export type LookupRow = {
  id?: number | string;
  word: string;
  category?: string | null;
  short_meaning_ar?: string | null;
  arabic_content?: string | null;
};

export type Ranked<T extends LookupRow = LookupRow> = {
  row: T;
  score: number;
  /** 0 exact, 1 starts-with, 2 contains, 3 description, 4 fuzzy */
  bucket: 0 | 1 | 2 | 3 | 4;
};

const ENTITY_BOOST_RE =
  /(person|place|tribe|nation|object|theolog|نبي|رسول|قديس|ملك|كاهن|شخص|سبط|قبيله|مدين|قري|نهر|جبل|بحر|ارض|تابوت|هيكل|مذبح|لاهوت|عقيده)/i;

/** Local copy of Arabic normalization — kept side-effect free for tests. */
export function normalizeAr(s: string): string {
  if (!s) return "";
  return s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\u0600-\u06FF\s]/g, "")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[b.length];
}

export function rankAndDedupe<T extends LookupRow>(
  rows: T[],
  rawQuery: string,
): Ranked<T>[] {
  const q = normalizeAr(rawQuery.trim());
  if (!q || !rows?.length) return [];

  const ranked: Ranked<T>[] = [];
  for (const row of rows) {
    const title = (row.word ?? "").toString();
    const titleN = normalizeAr(title);
    const meaningN = normalizeAr(
      (row.short_meaning_ar ?? row.arabic_content ?? "").toString(),
    );

    let bucket: Ranked["bucket"];
    if (titleN === q) bucket = 0;
    else if (titleN.startsWith(q)) bucket = 1;
    else if (titleN.includes(q)) bucket = 2;
    else if (meaningN.includes(q)) bucket = 3;
    else bucket = 4;

    let score = bucket * 10;
    if (row.category && ENTITY_BOOST_RE.test(row.category)) score -= 0.4;
    // Shorter titles rank higher within the same bucket.
    score += Math.min(titleN.length, 40) / 100;

    if (bucket === 4) {
      const d = levenshtein(q, titleN.slice(0, q.length + 2));
      const tol = q.length <= 4 ? 1 : q.length <= 7 ? 2 : 3;
      if (d > tol) continue;
      score += d;
    }

    ranked.push({ row, score, bucket });
  }

  const hasPrecise = ranked.some((r) => r.bucket <= 2);
  const filtered = hasPrecise ? ranked.filter((r) => r.bucket <= 3) : ranked;

  filtered.sort((a, b) => a.score - b.score);

  const seen = new Set<string>();
  const out: Ranked<T>[] = [];
  for (const r of filtered) {
    const titleN = normalizeAr((r.row.word ?? "").toString());
    const meaningN = normalizeAr(
      (r.row.short_meaning_ar ?? r.row.arabic_content ?? "").toString(),
    ).slice(0, 40);
    const key = `${titleN}|${meaningN}`;
    if (seen.has(titleN)) continue;
    if (seen.has(key)) continue;
    seen.add(titleN);
    seen.add(key);
    out.push(r);
  }
  return out;
}
