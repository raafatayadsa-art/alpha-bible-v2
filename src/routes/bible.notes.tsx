import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
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
  const router = useRouter();
  const { tab, compose, book, chapter, verse, from } = Route.useSearch();

  const chapterNum = chapter ? parseInt(chapter, 10) : undefined;
  const verseNum = verse ? parseInt(verse, 10) : undefined;

  const handleBack = useCallback(() => {
    if (from === "reader" && book && chapterNum && !Number.isNaN(chapterNum)) {
      void router.navigate({
        to: "/$book/$chapter",
        params: { book, chapter: String(chapterNum) },
      });
      return;
    }
    void router.navigate({ to: "/bible" });
  }, [router, from, book, chapterNum]);

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
      onBack={handleBack}
      fromBible2
      initialTab={tab ?? "note"}
      initialCompose={compose}
      verseLink={verseLink}
    />
  );
}
