import { createFileRoute } from "@tanstack/react-router";
import { BibleJournalPremiumScreen } from "@/features/bible-journal";
import type { JournalKind } from "@/lib/bible-journal-state";

export const Route = createFileRoute("/bible/notes")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : undefined,
    tab: search.tab === "meditation" || search.tab === "note" ? (search.tab as JournalKind) : undefined,
    compose: search.compose === "1" || search.compose === "true",
    book: typeof search.book === "string" ? search.book : undefined,
    chapter: typeof search.chapter === "string" ? search.chapter : undefined,
    verse: typeof search.verse === "string" ? search.verse : undefined,
  }),
  head: () => ({
    meta: [
      { title: "الملاحظات والتأملات — Alpha Bible" },
      { name: "description", content: "دفترك الروحي — ملاحظات الدراسة والتأملات على الكتاب المقدس." },
    ],
  }),
  component: BibleNotesPage,
});

function BibleNotesPage() {
  const { tab, compose, book, chapter, verse } = Route.useSearch();

  const chapterNum = chapter ? parseInt(chapter, 10) : undefined;
  const verseNum = verse ? parseInt(verse, 10) : undefined;

  const verseLink =
    book && chapterNum && !Number.isNaN(chapterNum)
      ? {
          book,
          chapter: chapterNum,
          verse: verseNum && !Number.isNaN(verseNum) ? verseNum : undefined,
        }
      : undefined;

  return (
    <BibleJournalPremiumScreen
      backTo="/bible"
      fromBible2
      initialTab={tab ?? "note"}
      initialCompose={compose}
      verseLink={verseLink}
    />
  );
}
