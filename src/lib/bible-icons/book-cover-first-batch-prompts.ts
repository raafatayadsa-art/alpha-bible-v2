import type { BibleBookId } from "./BibleBookIcons";
import { buildBookCoverPrompt } from "./book-cover-prompt-registry";

export const FIRST_BATCH_BOOK_IDS: BibleBookId[] = [
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Genesis",
  "Exodus",
  "Psalms",
  "Isaiah",
  "Revelation",
];

export const FIRST_BATCH_BOOK_COVER_PROMPTS = FIRST_BATCH_BOOK_IDS.map((bookId) => ({
  bookId,
  prompt: buildBookCoverPrompt(bookId),
}));

