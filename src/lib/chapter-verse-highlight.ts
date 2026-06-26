/** Search params for chapter reader — pulse-highlight target verse for 5s. */
export function chapterVerseHighlightSearch(verse?: number) {
  if (verse == null || Number.isNaN(verse)) return undefined;
  return { verse: String(verse) };
}

export const VERSE_PULSE_DURATION_MS = 5_000;
