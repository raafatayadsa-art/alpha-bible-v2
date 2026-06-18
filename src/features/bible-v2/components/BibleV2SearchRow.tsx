import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { ConnectExpandableSearchBar } from "@/components/alpha/ConnectExpandableSearchBar";
import { searchContextual, type ContextualSearchResult } from "@/features/search/contextual-search";
import { booksQueryOptions } from "@/lib/bible";
import { cn } from "@/lib/utils";
import { bibleV2Tokens } from "../tokens";

export function BibleV2SearchRow() {
  const navigate = useNavigate();
  const { data: books } = useQuery(booksQueryOptions());
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => searchContextual("bible", searchQuery, { books }),
    [searchQuery, books],
  );

  const collapseSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchQuery("");
  }, []);

  const goToResult = useCallback(
    (result: ContextualSearchResult) => {
      collapseSearch();
      if (result.params) {
        void navigate({ to: result.to as never, params: result.params as never, search: result.search as never });
        return;
      }
      void navigate({ to: result.to as never, search: result.search as never });
    },
    [collapseSearch, navigate],
  );

  const submitSearch = useCallback(() => {
    const first = results[0];
    if (first) goToResult(first);
  }, [results, goToResult]);

  const trimmedQuery = searchQuery.trim();

  return (
    <div dir="rtl" className="mx-4 mt-4">
      <div className="flex min-w-0 justify-start">
        <div className={cn("flex min-w-0 justify-end", searchExpanded ? "w-full flex-1" : "shrink-0")}>
          <ConnectExpandableSearchBar
            expanded={searchExpanded}
            query={searchQuery}
            inputRef={searchInputRef}
            onExpand={() => setSearchExpanded(true)}
            onCollapse={collapseSearch}
            onQueryChange={setSearchQuery}
            onSubmit={submitSearch}
            classicTheme
            placeholder="ابحث في الكتاب المقدس..."
            collapsedAriaLabel="بحث في الكتاب المقدس"
            inputAriaLabel="بحث في الكتاب المقدس"
          />
        </div>
      </div>

      {searchExpanded && trimmedQuery ? (
        <div className="alpha-connect-theme alpha-connect-theme--classic mt-2.5 space-y-2">
          {results.length === 0 ? (
            <p
              className="py-4 text-center text-[12px] font-medium"
              style={{ color: bibleV2Tokens.textMuted }}
            >
              لا توجد نتائج
            </p>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => goToResult(result)}
                className="flex w-full items-center gap-3 rounded-2xl border p-2.5 text-right transition-transform active:scale-[0.98]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.88)",
                  borderColor: bibleV2Tokens.cardBorder,
                  boxShadow: `0 8px 20px -12px ${bibleV2Tokens.shadowWarm}`,
                }}
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[11px] font-bold"
                  style={{
                    backgroundColor: bibleV2Tokens.champagne,
                    color: bibleV2Tokens.goldDeep,
                  }}
                >
                  Ⲁ
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="line-clamp-1 text-[13px] font-extrabold leading-tight"
                    style={{ color: bibleV2Tokens.textPrimary }}
                  >
                    {result.title}
                  </div>
                  {result.subtitle ? (
                    <div
                      className="mt-0.5 line-clamp-2 text-[11px]"
                      style={{ color: bibleV2Tokens.textMuted }}
                    >
                      {result.subtitle}
                    </div>
                  ) : null}
                </div>
                <ChevronLeft className="h-4 w-4 shrink-0" style={{ color: bibleV2Tokens.goldDeep }} />
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
