import { defaultContinueReading } from "@/features/bible-home/data/continueReading";
import type { ReadingSession } from "./reading-state";

export type ContinueReadingView = {
  reference: string;
  preview: string;
  progressPercent: number;
  ctaLabel: string;
  bookParam?: string;
  chapter?: number;
};

export type BooksCatalogRoute = "/books" | "/books-v2";

export type ContinueReadingDestination =
  | { to: "/$book/$chapter"; params: { book: string; chapter: string } }
  | { to: "/books"; search: { testament: "all" | "old" | "new" } }
  | { to: "/books-v2"; search: { testament: "old" | "new" } };

/** Shared continue-reading row — Bible 1 & Bible 2. */
export function resolveContinueReadingView(session: ReadingSession | null): ContinueReadingView {
  if (!session) {
    return {
      reference: defaultContinueReading.reference,
      preview: defaultContinueReading.preview,
      progressPercent: defaultContinueReading.progressPercent,
      ctaLabel: defaultContinueReading.ctaLabel,
      bookParam: defaultContinueReading.bookParam,
      chapter: defaultContinueReading.chapter,
    };
  }

  return {
    reference: `${session.bookName || session.book} ${session.chapter}${session.verse ? `:${session.verse}` : ""}`,
    preview: defaultContinueReading.preview,
    progressPercent: Math.min(100, Math.max(0, session.progressPercent)),
    ctaLabel: defaultContinueReading.ctaLabel,
    bookParam: session.book,
    chapter: session.chapter,
  };
}

export function hasContinueReadingTarget(view: Pick<ContinueReadingView, "bookParam" | "chapter">): boolean {
  return !!(view.bookParam && view.chapter);
}

/** Runtime CTA target — reader chapter or books catalog fallback. */
export function continueReadingDestination(
  view: Pick<ContinueReadingView, "bookParam" | "chapter">,
  opts: { booksRoute?: BooksCatalogRoute } = {},
): ContinueReadingDestination {
  const booksRoute = opts.booksRoute ?? "/books";

  if (hasContinueReadingTarget(view)) {
    return {
      to: "/$book/$chapter",
      params: { book: view.bookParam!, chapter: String(view.chapter) },
    };
  }

  if (booksRoute === "/books-v2") {
    return { to: "/books-v2", search: { testament: "new" } };
  }

  return { to: "/books", search: { testament: "all" } };
}
