import { useEffect, useMemo, useRef, useState } from "react";
import { X, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectSearchBarField } from "@/components/alpha/ConnectExpandableSearchBar";
import { lookupDictionary, type LookupDictionaryRow } from "@/lib/dictionary";
import { normalizeAr, rankAndDedupe } from "@/lib/dictionary-search-ranking";

/**
 * Dictionary search panel — Alpha Connect Classic + Connect glass search bar.
 * Calls `public.lookup_dictionary` and renders ranked results.
 */

/** Renders `title` with every normalized occurrence of `query` bolded. */
function HighlightedTitle({
  title,
  query,
}: {
  title: string;
  query: string;
}) {
  const q = normalizeAr(query.trim());
  if (!q) return <>{title}</>;
  const norm: string[] = [];
  for (let i = 0; i < title.length; i++) norm.push(normalizeAr(title[i]));
  const flat = norm.join("");
  const map: number[] = [];
  for (let i = 0; i < title.length; i++) {
    for (let k = 0; k < norm[i].length; k++) map.push(i);
  }
  const ranges: Array<[number, number]> = [];
  let from = 0;
  while (from <= flat.length - q.length) {
    const idx = flat.indexOf(q, from);
    if (idx === -1) break;
    const startOrig = map[idx];
    const endOrig = map[idx + q.length - 1] + 1;
    ranges.push([startOrig, endOrig]);
    from = idx + q.length;
  }
  if (ranges.length === 0) return <>{title}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([s, e], i) => {
    if (cursor < s) parts.push(title.slice(cursor, s));
    parts.push(
      <mark key={i} className="rounded bg-[#e8f2ec] px-0.5 text-[#1e3328]">
        {title.slice(s, e)}
      </mark>,
    );
    cursor = e;
  });
  if (cursor < title.length) parts.push(title.slice(cursor));
  return <>{parts}</>;
}

export function DictionarySearchDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (row: LookupDictionaryRow) => void;
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<LookupDictionaryRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (open) {
      setTerm("");
      setResults(null);
      setExpanded(false);
      reqIdRef.current++;
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    setExpanded(false);
  }, [term]);

  useEffect(() => {
    if (!open) return;
    const q = term.trim();
    const myId = ++reqIdRef.current;
    if (!q) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const rows = await lookupDictionary(q);
      if (myId !== reqIdRef.current) return;
      setResults(rows);
      setLoading(false);
    }, 280);
    return () => {
      clearTimeout(handle);
      reqIdRef.current++;
    };
  }, [term, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ranked = useMemo(
    () => (results ? rankAndDedupe(results, term, { strict: !expanded }) : []),
    [results, term, expanded],
  );

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[70] dict-sheet-backdrop transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="بحث في القاموس"
        dir="rtl"
        className={cn(
          "fixed inset-x-0 top-0 z-[71] mx-auto w-full max-w-[var(--alpha-content-max-width)]",
          "transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          open ? "translate-y-0" : "-translate-y-full",
        )}
        style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        <div className="dict-sheet-panel mx-2 overflow-hidden rounded-b-[28px]">
          <div className="grid place-items-center pt-2 pb-1">
            <span className="dict-sheet-handle h-1.5 w-12 rounded-full" />
          </div>

          <header className="flex items-center gap-2 px-3 pb-2 pt-1">
            <ConnectSearchBarField
              query={term}
              inputRef={inputRef}
              onQueryChange={setTerm}
              placeholder="ابحث عن كلمة في القاموس…"
              inputAriaLabel="بحث في القاموس"
              classicTheme
              className="min-w-0 flex-1"
              trailing={
                loading ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--neon-blue)] opacity-80" />
                ) : null
              }
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="alpha-connect-theme alpha-connect-theme--classic dict-sheet-close grid h-9 w-9 shrink-0 place-items-center rounded-full active:scale-90 transition-transform"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div
            className="overflow-y-auto px-3 pb-4 pt-1 space-y-2"
            style={{ maxHeight: "min(70vh, 560px)" }}
          >
            {!term.trim() && (
              <div className="grid place-items-center py-10 text-center">
                <Sparkles className="dict-sheet-accent h-5 w-5 opacity-80" />
                <p className="dict-sheet-muted mt-2 text-[12px]">ابدأ بكتابة كلمة للبحث في القاموس</p>
              </div>
            )}

            {term.trim() && !loading && ranked.length === 0 && (
              <div className="grid place-items-center py-10 text-center">
                <BookOpen className="dict-sheet-accent h-5 w-5 opacity-80" />
                <p className="dict-sheet-title mt-2 text-[13px] font-bold">
                  لا توجد نتيجة مطابقة لهذه الكلمة
                </p>
                {!expanded && (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="dict-sheet-btn-secondary mt-3 rounded-full px-4 py-1.5 text-[12px] font-bold active:scale-95 transition-transform"
                  >
                    البحث الموسع
                  </button>
                )}
              </div>
            )}

            {term.trim() && ranked.length > 0 && (
              <p className="dict-sheet-muted px-1 pb-1 text-[11px]">
                {expanded ? `${ranked.length} نتيجة (بحث موسّع)` : `${ranked.length} نتيجة`}
              </p>
            )}

            {ranked.map(({ row }, i) => (
              <button
                key={`${row.id ?? row.word}-${i}`}
                type="button"
                onClick={() => onSelect(row)}
                className="dict-sheet-result-btn w-full rounded-2xl p-3 text-right transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="dict-sheet-title truncate font-arabic-serif text-[17px] font-bold">
                    <HighlightedTitle title={row.word ?? ""} query={term} />
                  </p>
                  {row.category && (
                    <span className="dict-sheet-category-badge shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
                      {row.category}
                    </span>
                  )}
                </div>
                <p className="dict-sheet-body mt-1.5 line-clamp-2 font-arabic-serif text-[13.5px] leading-relaxed">
                  {row.short_meaning_ar?.trim() || "لا يوجد معنى مختصر متاح"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
