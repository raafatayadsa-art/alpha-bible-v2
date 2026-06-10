import type { BibleBookId } from "./BibleBookIcons";
import { buildBookCoverPrompt } from "./book-cover-prompt-registry";

export const SECOND_BATCH_BOOK_IDS: BibleBookId[] = [
  "Joshua",
  "Ruth",
  "Daniel",
  "Proverbs",
  "Ecclesiastes",
  "SongOfSolomon",
  "Romans",
  "Galatians",
  "Philippians",
  "1John",
];

export const SECOND_BATCH_BOOK_COVER_PROMPTS = SECOND_BATCH_BOOK_IDS.map((bookId) => ({
  bookId,
  prompt: buildBookCoverPrompt(bookId),
}));

