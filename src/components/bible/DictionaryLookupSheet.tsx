import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, BookOpen, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LookupDictionaryRow } from "@/lib/dictionary";

/**
 * Bottom sheet for entries returned by `public.lookup_dictionary`.
 * Uses the same Alpha glass aesthetic as MeaningSheet but with a LIGHT
 * backdrop (per spec: no heavy blur on the chapter behind).
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
          "fixed inset-0 z-[60] bg-[#06251c]/15 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={row?.word ?? "تفاصيل الكلمة"}
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
            "shadow-[0_-28px_70px_-18px_rgba(0,0,0,0.6),0_0_36px_-12px_rgba(122,240,184,0.45),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_40px_-20px_rgba(122,240,184,0.18)]",
            "transition-[max-height] duration-300",
          )}
          style={{ maxHeight: expanded ? "92vh" : "72vh" }}
        >
          <div
            className="grid place-items-center pt-2 pb-1 touch-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <span className="h-1.5 w-12 rounded-full bg-[#7af0b8]/50" />
          </div>

          <header className="flex items-center justify-between gap-3 px-4 pb-3" dir="rtl">
            <div className="min-w-0">
              <h3 className="font-arabic-serif text-[22px] font-bold text-[#f4f9ee] truncate">
                {row?.word}
              </h3>
              {row?.category && (
                <p className="text-[11px] font-bold text-[#e7c97a] mt-0.5">{row.category}</p>
              )}
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
            dir="rtl"
            className="overflow-y-auto px-4 pt-1 pb-6 space-y-3"
            style={{ maxHeight: expanded ? "calc(92vh - 110px)" : "calc(72vh - 110px)" }}
          >
            {row?.short_meaning_ar && (
              <Section title="المعنى المختصر">{row.short_meaning_ar}</Section>
            )}
            {row?.arabic_content && (
              <Section title="الشرح بالعربية" multiline>
                {row.arabic_content}
              </Section>
            )}
            <LangPair label="العبرية" value={row?.hebrew_content} />
            <LangPair label="اليونانية" value={row?.greek_content} />
            <LangPair label="السريانية / الآرامية" value={row?.syriac_aramaic_content} />
            <LangPair label="اللاتينية" value={row?.latin_content} />
            <LangPair label="الإنجليزية" value={row?.english_content} ltr />

            {row?.bible_references && (
              <Section title="الشواهد الكتابية" icon={<BookOpen className="h-3.5 w-3.5" />}>
                <span className="whitespace-pre-line">{row.bible_references}</span>
              </Section>
            )}

            {row?.source_url && (
              <a
                href={row.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#7af0b8]/50 bg-[#0a2a20]/60 px-4 py-2 text-[12px] font-bold text-[#e7c97a] hover:border-[#7af0b8]/80 active:scale-95 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                المصدر
              </a>
            )}
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
    <div className="rounded-2xl bg-[#0a2a20]/45 border border-[#7af0b8]/20 p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#e7c97a]">
        {icon}
        {title}
      </div>
      <p
        className={cn(
          "mt-1.5 text-[14px] leading-relaxed text-[#eaf6ec]",
          multiline && "whitespace-pre-line",
        )}
      >
        {children}
      </p>
    </div>
  );
}

function LangPair({ label, value, ltr }: { label: string; value?: string | null; ltr?: boolean }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-[#0a2a20]/40 border border-[#7af0b8]/15 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#e7c97a]">
        <Languages className="h-3 w-3" />
        {label}
      </div>
      <p
        dir={ltr ? "ltr" : undefined}
        className="mt-1 text-[13.5px] leading-relaxed text-[#eaf6ec]"
      >
        {value}
      </p>
    </div>
  );
}
