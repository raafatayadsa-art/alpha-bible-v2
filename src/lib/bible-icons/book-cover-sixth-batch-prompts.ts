import type { BibleBookId } from "./BibleBookIcons";
import { buildBookCoverPrompt } from "./book-cover-prompt-registry";

export const SIXTH_BATCH_BOOK_IDS: BibleBookId[] = [
  "1Corinthians",
  "2Corinthians",
  "Ephesians",
  "Colossians",
  "1Thessalonians",
  "2Thessalonians",
  "1Timothy",
  "2Timothy",
  "Titus",
  "Philemon",
];

export const SIXTH_BATCH_BOOK_COVER_PROMPTS = SIXTH_BATCH_BOOK_IDS.map((bookId) => ({
  bookId,
  prompt: buildBookCoverPrompt(bookId),
}));

