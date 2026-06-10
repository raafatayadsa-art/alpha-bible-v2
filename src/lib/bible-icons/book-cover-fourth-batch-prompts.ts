import type { BibleBookId } from "./BibleBookIcons";
import { buildBookCoverPrompt } from "./book-cover-prompt-registry";

export const FOURTH_BATCH_BOOK_IDS: BibleBookId[] = [
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Hosea",
  "Joel",
];

export const FOURTH_BATCH_BOOK_COVER_PROMPTS = FOURTH_BATCH_BOOK_IDS.map((bookId) => ({
  bookId,
  prompt: buildBookCoverPrompt(bookId),
}));

