import { displayName, groupBooks } from "@/lib/bible-books";
import { expectedChapterCount, ORTHODOX_BIBLE_BOOK_COUNT, ORTHODOX_NT_BOOK_COUNT, ORTHODOX_OT_BOOK_COUNT } from "@/lib/bible-expected-chapters";
import type { ReadingSession } from "@/lib/reading-state";
import {
  journeyChapterKey,
  journeyStreakSummary,
  readJourneyChapterMap,
  readJourneyStreak,
  type JourneyChapterMap,
} from "./journey-storage";

export type BookJourneyStatus = "complete" | "in-progress" | "not-started";

export type BookJourneyItem = {
  book: string;
  bookName: string;
  testament: "old" | "new";
  status: BookJourneyStatus;
  progressPercent: number;
  completedChapters: number;
  expectedChapters: number;
};

export type BibleJourneySnapshot = {
  otPercent: number;
  ntPercent: number;
  biblePercent: number;
  completedBooks: number;
  totalBooks: number;
  otBooks: BookJourneyItem[];
  ntBooks: BookJourneyItem[];
  currentBook?: string;
  currentBookName?: string;
  currentChapter?: number;
  currentProgress: number;
  streak: ReturnType<typeof journeyStreakSummary>;
  stats: {
    versesRead: number;
    chaptersCompleted: number;
    savedVerses: number;
    notesCount: number;
  };
};

const COMPLETE_THRESHOLD = 90;

function resolveExpectedChapters(bookSlug: string, bookName: string): number {
  return expectedChapterCount(bookName) ?? expectedChapterCount(displayName(bookName)) ?? 0;
}

function bookProgress(
  bookSlug: string,
  bookName: string,
  chapterMap: JourneyChapterMap,
): Pick<BookJourneyItem, "status" | "progressPercent" | "completedChapters" | "expectedChapters"> {
  const expectedChapters = resolveExpectedChapters(bookSlug, bookName);
  if (expectedChapters <= 0) {
    return { status: "not-started", progressPercent: 0, completedChapters: 0, expectedChapters: 0 };
  }

  let progressSum = 0;
  let completedChapters = 0;
  let touched = false;

  for (let ch = 1; ch <= expectedChapters; ch += 1) {
    const rec = chapterMap[journeyChapterKey(bookSlug, ch)];
    if (!rec) continue;
    touched = true;
    progressSum += rec.progressPercent;
    if (rec.progressPercent >= COMPLETE_THRESHOLD) completedChapters += 1;
  }

  const progressPercent = Math.round(progressSum / expectedChapters);
  const status: BookJourneyStatus =
    completedChapters >= expectedChapters
      ? "complete"
      : touched
        ? "in-progress"
        : "not-started";

  return { status, progressPercent, completedChapters, expectedChapters };
}

function testamentPercent(books: BookJourneyItem[]): number {
  if (books.length === 0) return 0;
  const totalChapters = books.reduce((sum, b) => sum + b.expectedChapters, 0);
  if (totalChapters === 0) return 0;
  const weighted = books.reduce((sum, b) => sum + b.progressPercent * b.expectedChapters, 0);
  return Math.round(weighted / totalChapters);
}

function countCompletedBooks(books: BookJourneyItem[]): number {
  return books.filter((b) => b.status === "complete").length;
}

function estimateVersesRead(chapterMap: JourneyChapterMap): number {
  let total = 0;
  for (const rec of Object.values(chapterMap)) {
    if (rec.maxVerse && rec.maxVerse > 0) {
      total += rec.maxVerse;
    } else if (rec.progressPercent >= COMPLETE_THRESHOLD) {
      total += 24;
    } else {
      total += Math.round((rec.progressPercent / 100) * 24);
    }
  }
  return total;
}

function countChaptersCompleted(chapterMap: JourneyChapterMap): number {
  return Object.values(chapterMap).filter((r) => r.progressPercent >= COMPLETE_THRESHOLD).length;
}

function readNotesCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("ab:bible:journal");
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function readSavedVerseCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("ab:saved:verses");
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function buildBibleJourneySnapshot(
  books: string[],
  currentSession: ReadingSession | null,
  chapterMap: JourneyChapterMap = readJourneyChapterMap(),
): BibleJourneySnapshot {
  const grouped = groupBooks(books);
  const streak = journeyStreakSummary(readJourneyStreak());

  const mapBook = (book: string, testament: "old" | "new"): BookJourneyItem => {
    const bookName = displayName(book);
    const progress = bookProgress(book, bookName, chapterMap);
    return { book, bookName, testament, ...progress };
  };

  const otBooks = grouped.old.map((b) => mapBook(b, "old"));
  const ntBooks = grouped.neu.map((b) => mapBook(b, "new"));
  const allBooks = [...otBooks, ...ntBooks];
  const completedBooks = countCompletedBooks(allBooks);
  const totalBooks = allBooks.length || ORTHODOX_BIBLE_BOOK_COUNT;

  const otPercent = testamentPercent(otBooks);
  const ntPercent = testamentPercent(ntBooks);
  const biblePercent = testamentPercent(allBooks);

  return {
    otPercent,
    ntPercent,
    biblePercent,
    completedBooks,
    totalBooks,
    otBooks,
    ntBooks,
    currentBook: currentSession?.book,
    currentBookName: currentSession?.bookName,
    currentChapter: currentSession?.chapter,
    currentProgress: currentSession?.progressPercent ?? 0,
    streak,
    stats: {
      versesRead: estimateVersesRead(chapterMap),
      chaptersCompleted: countChaptersCompleted(chapterMap),
      savedVerses: readSavedVerseCount(),
      notesCount: readNotesCount(),
    },
  };
}

export { ORTHODOX_BIBLE_BOOK_COUNT, ORTHODOX_NT_BOOK_COUNT, ORTHODOX_OT_BOOK_COUNT };
