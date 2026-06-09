import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useContextualSearch } from "@/hooks/useContextualSearch";

type BibleSearchContextValue = ReturnType<typeof useContextualSearch>;

const BibleSearchContext = createContext<BibleSearchContextValue | null>(null);

export function BibleSearchProvider({ children }: { children: ReactNode }) {
  const bibleSearch = useContextualSearch("bible");
  const openBibleSearchFromNav = useRouterState({
    select: (s) =>
      Boolean((s.location.state as { openBibleSearch?: boolean } | undefined)?.openBibleSearch),
  });

  useEffect(() => {
    if (openBibleSearchFromNav) {
      bibleSearch.openSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBibleSearchFromNav]);

  return (
    <BibleSearchContext.Provider value={bibleSearch}>
      {children}
      {bibleSearch.overlay}
    </BibleSearchContext.Provider>
  );
}

export function useBibleSearch() {
  const ctx = useContext(BibleSearchContext);
  if (!ctx) {
    throw new Error("useBibleSearch must be used within BibleSearchProvider");
  }
  return ctx;
}
