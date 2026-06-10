import type { BibleBookId } from "./BibleBookIcons";
import { buildBookCoverPrompt } from "./book-cover-prompt-registry";

export const SEVENTH_BATCH_BOOK_IDS: BibleBookId[] = [
  "Hebrews",
  "James",
  "1Peter",
  "2Peter",
  "2John",
  "3John",
  "Jude",
];

export const SEVENTH_BATCH_BOOK_COVER_PROMPTS = SEVENTH_BATCH_BOOK_IDS.map((bookId) => ({
  bookId,
  prompt: buildBookCoverPrompt(bookId),
}));

