import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { booksQueryOptions } from "@/lib/bible";
import { useCurrentSession } from "@/lib/reading-state";
import { buildBibleJourneySnapshot, type BibleJourneySnapshot } from "./journey-engine";
import { JOURNEY_STORAGE_KEYS, readJourneyChapterMap } from "./journey-storage";

export function useBibleJourney(): {
  snapshot: BibleJourneySnapshot | null;
  isLoading: boolean;
} {
  const { data: books = [], isLoading } = useQuery(booksQueryOptions());
  const current = useCurrentSession();
  const [chapterMap, setChapterMap] = useState(() => readJourneyChapterMap());

  useEffect(() => {
    const sync = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (
        !detail ||
        detail.key === JOURNEY_STORAGE_KEYS.chapters ||
        detail.key === JOURNEY_STORAGE_KEYS.streak ||
        detail.key === "ab:reading:current" ||
        detail.key === "ab:bible:journal" ||
        detail.key === "ab:saved:verses"
      ) {
        setChapterMap(readJourneyChapterMap());
      }
    };
    window.addEventListener("ab:storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ab:storage", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const snapshot = useMemo(() => {
    if (!books.length) return null;
    return buildBibleJourneySnapshot(books, current, chapterMap);
  }, [books, current, chapterMap]);

  return { snapshot, isLoading };
}
