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
          "fixed inset-0 z-[60] bg-[#06251c]/15 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="نتائج القاموس"
        dir="rtl"
        className={cn(
          "fixed inset-x-0 bottom-0 z-[61] mx-auto w-full max-w-[480px]",
          "transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          open ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div
          className={cn(
            "mx-2 overflow-hidden rounded-t-[28px] border backdrop-blur-[22px] backdrop-saturate-150",
            "bg-gradient-to-b from-[#0f3d2e]/75 via-[#0c3326]/72 to-[#07261c]/80 border-[#7af0b8]/35 text-[#eaf6ec]",
            "shadow-[0_-28px_70px_-18px_rgba(0,0,0,0.6),0_0_36px_-12px_rgba(122,240,184,0.45),inset_0_1px_0_rgba(255,255,255,0.14)]",
          )}
          style={{ maxHeight: "72vh" }}
        >
          <div className="grid place-items-center pt-2 pb-1">
            <span className="h-1.5 w-12 rounded-full bg-[#7af0b8]/50" />
          </div>

          <header className="flex items-center justify-between gap-3 px-4 pb-3">
            <div className="min-w-0">
              <h3 className="font-arabic-serif text-[17px] font-bold text-[#f4f9ee]">
                اختر النتيجة
              </h3>
              <p className="text-[11px] text-[#cfe4d5]/80 mt-0.5">
                {rows?.length ?? 0} نتيجة متاحة
              </p>
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
            className="overflow-y-auto px-3 pb-5 pt-1 space-y-2"
            style={{ maxHeight: "calc(72vh - 90px)" }}
          >
            {rows?.map((row, i) => (
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
                    {row.word}
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
