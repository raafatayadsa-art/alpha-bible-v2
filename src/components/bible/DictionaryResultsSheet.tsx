import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LookupDictionaryRow } from "@/lib/dictionary";

/**
 * Compact picker shown when `lookup_dictionary` returns multiple entries
 * for the same surface word. User picks one → DictionaryLookupSheet opens.
 * Visual language matches DictionaryLookupSheet (light backdrop, glass card).
 */
export function DictionaryResultsSheet({
  rows,
  onSelect,
  onClose,
}: {
  rows: LookupDictionaryRow[] | null;
  onSelect: (row: LookupDictionaryRow) => void;
  onClose: () => void;
}) {
  const open = !!rows && rows.length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] dict-sheet-backdrop transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="نتائج القاموس"
        dir="rtl"
        className={cn(
          "fixed inset-x-0 bottom-0 z-[61] mx-auto w-full max-w-[var(--alpha-content-max-width)]",
          "transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          open ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div
          className="dict-sheet-panel mx-2 overflow-hidden rounded-t-[28px]"
          style={{ maxHeight: "72vh" }}
        >
          <div className="grid place-items-center pt-2 pb-1">
            <span className="dict-sheet-handle h-1.5 w-12 rounded-full" />
          </div>

          <header className="flex items-center justify-between gap-3 px-4 pb-3">
            <div className="min-w-0">
              <h3 className="dict-sheet-title font-arabic-serif text-[17px] font-bold">
                اختر النتيجة
              </h3>
              <p className="dict-sheet-muted text-[11px] mt-0.5">
                {rows?.length ?? 0} نتيجة متاحة
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="dict-sheet-close grid h-9 w-9 place-items-center rounded-full active:scale-90 transition-transform"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div
            className="overflow-y-auto px-3 pb-5 pt-1 space-y-2"
            style={{ maxHeight: "calc(72vh - 90px)" }}
          >
            {rows?.map((row, i) => (
              <button
                key={`${row.id ?? row.word}-${i}`}
                type="button"
                onClick={() => onSelect(row)}
                className={cn(
                  "dict-sheet-result-btn w-full text-right rounded-2xl p-3 transition-all active:scale-[0.99]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="dict-sheet-title font-arabic-serif text-[17px] font-bold truncate">
                    {row.word}
                  </p>
                  {row.category && (
                    <span className="dict-sheet-category-badge shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
                      {row.category}
                    </span>
                  )}
                </div>
                <p className="dict-sheet-body mt-1.5 font-arabic-serif text-[13.5px] leading-relaxed line-clamp-2">
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
