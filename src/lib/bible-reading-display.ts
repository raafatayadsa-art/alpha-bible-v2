const GOSPEL_SLUGS = new Set([
  "matthew",
  "mark",
  "luke",
  "john",
  "Matthew",
  "Mark",
  "Luke",
  "John",
]);

/** Heuristic red-letter detection until verse metadata ships. */
export function isRedLetterVerse(book: string, text: string): boolean {
  if (!GOSPEL_SLUGS.has(book)) return false;
  const t = text.trim();
  if (!t) return false;
  if (/«[^»]+»/.test(t)) return true;
  return /(?:قال|يقول|قائلاً)\s+(?:الرب\s+)?يسوع|يسوع\s+(?:قال|يقول|جاوب)/u.test(t);
}

export function isGospelBook(book: string): boolean {
  return GOSPEL_SLUGS.has(book);
}
