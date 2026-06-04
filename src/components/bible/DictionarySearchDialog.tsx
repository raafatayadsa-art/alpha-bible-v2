import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { lookupDictionary, type LookupDictionaryRow } from "@/lib/dictionary";
import { normalizeAr, rankAndDedupe } from "@/lib/dictionary-search-ranking";

/**
 * Premium glass search dialog. Calls `public.lookup_dictionary` and
 * renders results as Alpha-styled cards. Ranking logic lives in
 * `@/lib/dictionary-search-ranking` (unit-tested).
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
  // Walk the original title char-by-char, building a parallel normalized
  // string. When the normalized window matches `q`, mark the original
  // span as highlighted.
  const norm: string[] = [];
  for (let i = 0; i < title.length; i++) norm.push(normalizeAr(title[i]));
  const flat = norm.join("");
  // Map each normalized position back to its original index.
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
      <mark
        key={i}
        className="bg-[#7af0b8]/25 text-[#f4f9ee] rounded px-0.5"
      >
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
  const inputRef = useRef<HTMLInputElement>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (open) {
      setTerm("");
      setResults(null);
      reqIdRef.current++;
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

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
    () => (results ? rankAndDedupe(results, term) : []),
    [results, term],
  );

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[70] bg-[#06251c]/25 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="بحث في القاموس"
        dir="rtl"
        className={cn(
          "fixed inset-x-0 top-0 z-[71] mx-auto w-full max-w-[480px]",
          "transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          open ? "translate-y-0" : "-translate-y-full",
        )}
        style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        <div
          className={cn(
            "mx-2 overflow-hidden rounded-b-[28px] border backdrop-blur-[22px] backdrop-saturate-150",
            "bg-gradient-to-b from-[#0f3d2e]/78 via-[#0c3326]/74 to-[#07261c]/80 border-[#7af0b8]/35 text-[#eaf6ec]",
            "shadow-[0_28px_70px_-18px_rgba(0,0,0,0.6),0_0_36px_-12px_rgba(122,240,184,0.45),inset_0_1px_0_rgba(255,255,255,0.14)]",
          )}
        >
          <header className="flex items-center gap-2 px-3 pt-3 pb-2">
            <div className="flex-1 flex items-center gap-2 rounded-full border border-[#7af0b8]/40 bg-[#0a2a20]/55 px-3 py-2">
              <Search className="h-4 w-4 text-[#e7c97a] shrink-0" />
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="ابحث عن كلمة في القاموس…"
                className="flex-1 bg-transparent outline-none text-[14.5px] font-arabic-serif text-[#f4f9ee] placeholder:text-[#cfe4d5]/55"
              />
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7af0b8]" />}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 border border-[#7af0b8]/30 text-[#eaf6ec] active:scale-90 transition-transform"
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
                <Sparkles className="h-5 w-5 text-[#c79356]" />
                <p className="mt-2 text-[12px] text-[#cfe4d5]">
                  ابدأ بكتابة كلمة للبحث في القاموس
                </p>
              </div>
            )}

            {term.trim() && !loading && ranked.length === 0 && (
              <div className="grid place-items-center py-10 text-center">
                <BookOpen className="h-5 w-5 text-[#c79356]" />
                <p className="mt-2 text-[13px] font-bold text-[#eaf6ec]">لا توجد نتائج</p>
                <p className="mt-1 text-[11.5px] text-[#cfe4d5]/80">
                  جرّب صيغة أخرى أو كلمة مختلفة
                </p>
              </div>
            )}

            {term.trim() && ranked.length > 0 && (
              <p className="px-1 pb-1 text-[11px] text-[#cfe4d5]/70">
                {ranked.length} نتيجة
              </p>
            )}

            {ranked.map(({ row }, i) => (
              <button
                key={`${row.id ?? row.word}-${i}`}
                type="button"
                onClick={() => onSelect(row)}
                className={cn(
                  "w-full text-right rounded-2xl border p-3 transition-all active:scale-[0.99]",
                  "bg-gradient-to-b from-[#0a2a20]/60 to-[#07241b]/60 border-[#7af0b8]/30",
                  "hover:border-[#7af0b8]/60 hover:shadow-[0_0_22px_-8px_rgba(122,240,184,0.55)]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-arabic-serif text-[17px] font-bold text-[#f4f9ee] truncate">
                    <HighlightedTitle title={row.word ?? ""} query={term} />
                  </p>
                  {row.category && (
                    <span className="shrink-0 rounded-full bg-[#7af0b8]/12 border border-[#7af0b8]/30 px-2 py-0.5 text-[10px] font-bold text-[#e7c97a]">
                      {row.category}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-arabic-serif text-[13.5px] leading-relaxed text-[#d6ecdc] line-clamp-2">
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
