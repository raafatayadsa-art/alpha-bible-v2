import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { SearchOverlay } from "@/components/overlays/SearchOverlay";
import { booksQueryOptions } from "@/lib/bible";
import { katamerosDayQueryOptions } from "@/features/katameros";
import { synaxariumSaintsQueryOptions } from "@/features/synaxarium";
import {
  CONTEXTUAL_SEARCH_META,
  searchContextual,
  type ContextualSearchContext,
  type ContextualSearchResult,
  type ContextualSearchScope,
} from "@/features/search/contextual-search";

export function useContextualSearch(
  scope?: ContextualSearchScope,
  context: ContextualSearchContext = {},
) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: books } = useQuery({
    ...booksQueryOptions(),
    enabled: scope === "bible",
  });

  const { data: katamerosDay } = useQuery({
    ...katamerosDayQueryOptions("today"),
    enabled: scope === "katameros",
  });

  const { data: synaxariumSaints } = useQuery({
    ...synaxariumSaintsQueryOptions(),
    enabled: scope === "synaxarium",
  });

  const mergedContext = useMemo<ContextualSearchContext>(
    () => ({
      ...context,
      books: context.books ?? books,
      katamerosReadings: context.katamerosReadings ?? katamerosDay?.readings,
      synaxariumSaints: context.synaxariumSaints ?? synaxariumSaints,
    }),
    [context, books, katamerosDay, synaxariumSaints],
  );

  const results = useMemo(() => {
    if (!scope) return [];
    return searchContextual(scope, query, mergedContext);
  }, [scope, query, mergedContext]);

  const meta = scope ? CONTEXTUAL_SEARCH_META[scope] : null;

  const openSearch = () => {
    setQuery("");
    setOpen(true);
  };

  const closeSearch = () => setOpen(false);

  const goToResult = (result: ContextualSearchResult) => {
    closeSearch();
    if (result.params) {
      void navigate({ to: result.to as never, params: result.params as never, search: result.search as never });
      return;
    }
    void navigate({ to: result.to as never, search: result.search as never });
  };

  const overlay =
    scope && meta ? (
      <SearchOverlay
        open={open}
        onClose={closeSearch}
        title={meta.title}
        placeholder={meta.placeholder}
        query={query}
        onQueryChange={setQuery}
      >
        {!query.trim() ? (
          <p className="text-center text-[12px] text-[#6a543a] py-6">ابدأ بالكتابة للبحث</p>
        ) : results.length === 0 ? (
          <p className="text-center text-[12px] text-[#6a543a] py-6">لا توجد نتائج</p>
        ) : (
          results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => goToResult(result)}
              className="w-full text-right flex items-center gap-3 rounded-2xl bg-[#faf8f3] border border-[#ead9b1] p-2.5 active:scale-[0.98] transition-transform"
            >
              {result.image ? (
                <img
                  src={result.image}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover shrink-0"
                  draggable={false}
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f3ead8] text-[#b8893a] text-[11px] font-bold">
                  Ⲁ
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
                  {result.title}
                </div>
                {result.subtitle ? (
                  <div className="text-[11px] text-[#6a543a] mt-0.5 line-clamp-2">{result.subtitle}</div>
                ) : null}
              </div>
              <ChevronLeft className="h-4 w-4 text-[#b8893a] shrink-0" />
            </button>
          ))
        )}
      </SearchOverlay>
    ) : null;

  return { open, openSearch, closeSearch, query, setQuery, results, overlay };
}
