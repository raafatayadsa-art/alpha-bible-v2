import { displayName } from "@/lib/bible-books";
import { expectedChapterCount } from "@/lib/bible-expected-chapters";
import { isAuthenticated } from "@/features/church/current-user";
import { getCachedMemberChurch } from "@/features/church/member-church-api";
import type { ReadingSession } from "@/lib/reading-state";
import {
  journeyChapterKey,
  readJourneyChapterMap,
  type JourneyChapterMap,
} from "@/features/bible-journey/journey-storage";
import { getCurrentUser } from "@/features/church/current-user";
import { shareToCommunity } from "./community-store";

const READING_COMPLETE_THRESHOLD = 90;
const AGPEYA_COMPLETE_THRESHOLD = 0.92;
const DEDUP_KEY = "ab:community-auto-dedup-v1";

type DedupBlob = { chapters: string[]; books: string[]; prayers: string[]; intercessions: string[] };

function readDedup(): DedupBlob {
  if (typeof window === "undefined") return { chapters: [], books: [], prayers: [], intercessions: [] };
  try {
    const raw = window.localStorage.getItem(DEDUP_KEY);
    if (!raw) return { chapters: [], books: [], prayers: [], intercessions: [] };
    const parsed = JSON.parse(raw) as DedupBlob;
    return {
      chapters: Array.isArray(parsed.chapters) ? parsed.chapters : [],
      books: Array.isArray(parsed.books) ? parsed.books : [],
      prayers: Array.isArray(parsed.prayers) ? parsed.prayers : [],
      intercessions: Array.isArray(parsed.intercessions) ? parsed.intercessions : [],
    };
  } catch {
    return { chapters: [], books: [], prayers: [], intercessions: [] };
  }
}

function writeDedup(blob: DedupBlob) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DEDUP_KEY,
    JSON.stringify({
      chapters: blob.chapters.slice(-200),
      books: blob.books.slice(-60),
      prayers: blob.prayers.slice(-40),
      intercessions: blob.intercessions.slice(-80),
    }),
  );
}

function bookDisplayName(bookRoute: string): string {
  return displayName(bookRoute) || bookRoute;
}

function isBookComplete(book: string, map: JourneyChapterMap): boolean {
  const expected = expectedChapterCount(bookDisplayName(book)) ?? expectedChapterCount(book) ?? 0;
  if (expected <= 0) return false;
  let completed = 0;
  for (let ch = 1; ch <= expected; ch += 1) {
    const rec = map[journeyChapterKey(book, ch)];
    if (rec && rec.progressPercent >= READING_COMPLETE_THRESHOLD) completed += 1;
  }
  return completed >= expected;
}

function emitAutoReadingMoment(opts: {
  book: string;
  chapter: number;
  source: "auto_chapter" | "auto_book";
  summary: string;
  reference: string;
}) {
  if (!isAuthenticated()) return;

  const user = getCurrentUser();
  const church = getCachedMemberChurch();
  const bookName = bookDisplayName(opts.book);

  shareToCommunity(
    {
      kind: "reading",
      reading: {
        reference: opts.reference,
        text: opts.summary,
        bookRoute: opts.book,
        chapter: opts.chapter,
        auto: true,
        activitySummary: opts.summary,
      },
    },
    { churchId: church?.id, churchName: church?.name, source: opts.source },
  );

  void user;
}

export function maybeEmitAgpeyaActivity(opts: {
  prayerId: string;
  title: string;
  progress: number;
  prevProgress?: number;
}): void {
  if (!isAuthenticated()) return;
  if (opts.progress < AGPEYA_COMPLETE_THRESHOLD) return;
  if ((opts.prevProgress ?? 0) >= AGPEYA_COMPLETE_THRESHOLD) return;

  const dedup = readDedup();
  if (dedup.prayers.includes(opts.prayerId)) return;

  const church = getCachedMemberChurch();
  const summary = `أتم صلاة ${opts.title} من الأجبية`;

  shareToCommunity(
    {
      kind: "agpeya",
      agpeya: {
        prayerId: opts.prayerId,
        title: opts.title,
        auto: true,
        activitySummary: summary,
      },
    },
    { churchId: church?.id, churchName: church?.name, source: "auto_agpeya" },
  );

  dedup.prayers.push(opts.prayerId);
  writeDedup(dedup);

  void import("./spiritual-record-store").then((m) => m.recordSpiritualPillarDay("agpeya"));
}

export function maybeEmitPrayerIntercessionActivity(request: {
  id: string;
  title: string;
  request: string;
  category?: string;
}): void {
  if (!isAuthenticated()) return;

  const dedup = readDedup();
  const token = `intercession-${request.id}`;
  if (dedup.intercessions.includes(token)) return;

  const church = getCachedMemberChurch();
  const summary = `صلّى من أجل: ${request.title}`;

  shareToCommunity(
    {
      kind: "prayer",
      prayer: {
        title: request.title,
        body: request.request.slice(0, 160) || summary,
        category: request.category,
        sourcePrayerId: request.id,
        activitySummary: summary,
      },
    },
    { churchId: church?.id, churchName: church?.name },
  );

  dedup.intercessions.push(token);
  writeDedup(dedup);

  void import("./spiritual-record-store").then((m) => m.recordSpiritualPillarDay("prayer"));
}

export function maybeEmitReadingActivity(session: ReadingSession, prevProgress = 0): void {
  if (!isAuthenticated()) return;
  if (session.progressPercent < READING_COMPLETE_THRESHOLD) return;
  if (prevProgress >= READING_COMPLETE_THRESHOLD) return;

  const dedup = readDedup();
  const chapterToken = journeyChapterKey(session.book, session.chapter);
  if (!dedup.chapters.includes(chapterToken)) {
    const bookName = bookDisplayName(session.book);
    emitAutoReadingMoment({
      book: session.book,
      chapter: session.chapter,
      source: "auto_chapter",
      summary: `أنهى قراءة ${bookName} — الإصحاح ${session.chapter}`,
      reference: `${bookName} ${session.chapter}`,
    });
    dedup.chapters.push(chapterToken);
  }

  const updatedMap = readJourneyChapterMap();
  if (isBookComplete(session.book, updatedMap) && !dedup.books.includes(session.book)) {
    const bookName = bookDisplayName(session.book);
    emitAutoReadingMoment({
      book: session.book,
      chapter: session.chapter,
      source: "auto_book",
      summary: `أنهى قراءة ${bookName} بالكامل`,
      reference: bookName,
    });
    dedup.books.push(session.book);
  }

  writeDedup(dedup);
}
