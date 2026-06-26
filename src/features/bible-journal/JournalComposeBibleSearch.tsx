import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { ConnectExpandableSearchBar } from "@/components/alpha/ConnectExpandableSearchBar";
import { searchContextual, type ContextualSearchResult } from "@/features/search/contextual-search";
import { booksQueryOptions } from "@/lib/bible";
import { cn } from "@/lib/utils";
import { JOURNAL_VAULT } from "./journal-vault-tokens";

/** Compact Bible 2 word search for compose sheet. */
export function JournalComposeBibleSearch() {
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
    <div dir="rtl" className="mb-3">
      <p className="mb-2 text-[10px] font-bold" style={{ color: JOURNAL_VAULT.goldMuted }}>
        بحث بالكلمة — الكتاب المقدس
      </p>
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
            placeholder="ابحث بالكلمة داخل الكتاب المقدس..."
            collapsedAriaLabel="بحث في الكتاب المقدس"
            inputAriaLabel="بحث بالكلمة داخل الكتاب المقدس"
            className={searchExpanded ? "w-full" : undefined}
          />
        </div>
      </div>

      {searchExpanded && trimmedQuery ? (
        <div className="alpha-connect-theme alpha-connect-theme--classic mt-2 space-y-1.5">
          {results.length === 0 ? (
            <p className="py-3 text-center text-[11px]" style={{ color: JOURNAL_VAULT.textMuted }}>
              لا توجد نتائج
            </p>
          ) : (
            results.slice(0, 5).map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => goToResult(result)}
                className="flex w-full items-center gap-2 rounded-xl border p-2 text-right transition active:scale-[0.98]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.92)",
                  borderColor: "rgba(231,201,122,0.28)",
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-[12px] font-extrabold" style={{ color: "#3a2a18" }}>
                    {result.title}
                  </div>
                  {result.subtitle ? (
                    <div className="line-clamp-1 text-[10px]" style={{ color: "#6a543a" }}>
                      {result.subtitle}
                    </div>
                  ) : null}
                </div>
                <ChevronLeft className="h-3.5 w-3.5 shrink-0" style={{ color: JOURNAL_VAULT.gold }} />
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
