const PREFILL_KEY = "ab:journal:verse-prefill";

export type JournalVersePrefill = {
  book: string;
  bookName?: string;
  chapter: number;
  verse?: number;
  verseText?: string;
  kind?: "note" | "meditation";
};

export function stashJournalVersePrefill(data: JournalVersePrefill) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function consumeJournalVersePrefill(): JournalVersePrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PREFILL_KEY);
    return JSON.parse(raw) as JournalVersePrefill;
  } catch {
    return null;
  }
}
