import type { BibleBookId } from "./BibleBookIcons";
import { buildBookCoverPrompt } from "./book-cover-prompt-registry";

export const THIRD_BATCH_BOOK_IDS: BibleBookId[] = [
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Judges",
  "1Samuel",
  "2Samuel",
  "1Kings",
  "2Kings",
  "1Chronicles",
  "2Chronicles",
];

export const THIRD_BATCH_BOOK_COVER_PROMPTS = THIRD_BATCH_BOOK_IDS.map((bookId) => ({
  bookId,
  prompt: buildBookCoverPrompt(bookId),
}));

