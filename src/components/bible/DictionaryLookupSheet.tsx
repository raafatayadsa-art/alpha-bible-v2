import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LookupDictionaryRow } from "@/lib/dictionary";

/**
 * Bottom sheet for entries returned by `public.lookup_dictionary`.
 * Uses Alpha Connect Classic palette (see `.dict-sheet-*` in styles.css).
 */
export function DictionaryLookupSheet({
  row,
  onClose,
}: {
  row: LookupDictionaryRow | null;
  onClose: () => void;
}) {
  const open = !!row;
  const [expanded, setExpanded] = useState(false);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    if (open) setExpanded(false);
  }, [open, row?.word]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const dy = e.changedTouches[0].clientY - dragStart.current;
    if (dy < -60) setExpanded(true);
    else if (dy > 80) {
      if (expanded) setExpanded(false);
      else onClose();
    }
    dragStart.current = null;
  };

  return (
    <>
      {/* Light backdrop — keep chapter readable behind (no heavy blur). */}
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
        aria-label={row?.word ?? "تفاصيل الكلمة"}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[61] mx-auto w-full max-w-[var(--alpha-content-max-width)]",
          "transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          open ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div
          className={cn(
            "dict-sheet-panel mx-2 overflow-hidden rounded-t-[28px]",
            "transition-[max-height] duration-300",
          )}
          style={{ maxHeight: expanded ? "92vh" : "72vh" }}
        >
          <div
            className="grid place-items-center pt-2 pb-1 touch-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <span className="dict-sheet-handle h-1.5 w-12 rounded-full" />
          </div>

          <header className="flex items-center justify-between gap-3 px-4 pb-3" dir="rtl">
            <div className="min-w-0">
              <h3 className="dict-sheet-title font-arabic-serif text-[22px] font-bold truncate">
                {row?.word}
              </h3>
              {row?.category && (
                <p className="dict-sheet-kind text-[11px] font-bold mt-0.5">{row.category}</p>
              )}
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
            dir="rtl"
            className="overflow-y-auto px-4 pt-1 pb-6 space-y-3"
            style={{ maxHeight: expanded ? "calc(92vh - 110px)" : "calc(72vh - 110px)" }}
          >
            <Section title="المعنى المختصر">
              {row?.short_meaning_ar?.trim() || "لا يوجد معنى مختصر متاح"}
            </Section>
          </div>

        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
  icon,
  multiline,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className="dict-sheet-card rounded-2xl p-4">
      <div className="dict-sheet-card-title flex items-center gap-1.5 text-[11px] font-bold">
        {icon}
        {title}
      </div>
      <p
        className={cn(
          "dict-sheet-body mt-1.5 text-[14px] leading-relaxed",
          multiline && "whitespace-pre-line",
        )}
      >
        {children}
      </p>
    </div>
  );
}

