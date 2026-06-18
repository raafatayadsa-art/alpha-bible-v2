import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { X, MapPin, Clock, Users, BookOpen, Sparkles, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useBookAbbreviations,
  parseScriptureRef,
  fetchVerseText,
  type BookAbbrevMaps,
  type ParsedRef,
} from "@/lib/dictionary";

export type MeaningSheetPerson = {
  name: string;
  role?: string;
  meaning?: string;
  reference?: string;
};

export type MeaningSheetData = {
  word: string;
  kind?: string;
  meaning?: string;
  fullMeaning?: string;
  origin?: string;
  firstAppearance?: string;
  spiritualRole?: string;
  /** Raw scripture references — one per entry. Resolved against bible_book_abbreviations. */
  relatedVerses?: { reference: string; text?: string }[];
  relatedPeople?: MeaningSheetPerson[];
  timeline?: { year?: string; event: string }[];
  mapLabel?: string;
  /** Which tab to open by default. */
  defaultTab?: Tab;
  /** Omit "المعنى" tab when its content duplicates the people card. */
  hideMeaningTab?: boolean;
};

type Tab = "meaning" | "verses" | "people" | "map" | "timeline";

const tabs: { key: Tab; label: string; icon: typeof X }[] = [
  { key: "meaning", label: "المعنى", icon: Sparkles },
  { key: "people", label: "الأشخاص", icon: Users },
  { key: "verses", label: "الآيات", icon: BookOpen },
  { key: "map", label: "الخريطة", icon: MapPin },
  { key: "timeline", label: "الخط الزمني", icon: Clock },
];

export function MeaningSheet({
  data,
  onClose,
}: {
  data: MeaningSheetData | null;
  onClose: () => void;
}) {
  const open = !!data;
  const [tab, setTab] = useState<Tab>("meaning");
  const [expanded, setExpanded] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const dragStart = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const abbrev = useBookAbbreviations();
  const visibleTabs = data?.hideMeaningTab ? tabs.filter((t) => t.key !== "meaning") : tabs;

  useEffect(() => {
    if (open) {
      setTab(data?.defaultTab ?? "meaning");
      setExpanded(false);
      setShowFull(false);
    }
  }, [open, data?.word, data?.defaultTab]);

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
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] dict-sheet-backdrop transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={data?.word ?? "تفاصيل الكلمة"}
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
          style={{ maxHeight: expanded ? "92vh" : "70vh" }}
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
              <h3 className="dict-sheet-title font-arabic-serif text-[20px] font-bold truncate">
                {data?.word}
              </h3>
              {data?.kind && (
                <p className="dict-sheet-kind text-[11px] font-bold">{data.kind}</p>
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

          <div dir="rtl" className="px-3">
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
              {visibleTabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-all duration-200",
                      active ? "dict-sheet-tab--active" : "dict-sheet-tab",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            dir="rtl"
            className="overflow-y-auto px-4 pt-2 pb-6"
            style={{ maxHeight: expanded ? "calc(92vh - 140px)" : "calc(70vh - 140px)" }}
          >
            {tab === "meaning" && (
              <div className="space-y-3">
                <TextBlock title="المعنى">
                  {data?.meaning || "لا توجد تفاصيل بعد."}
                </TextBlock>
                {data?.fullMeaning && (
                  <button
                    type="button"
                    onClick={() => setShowFull(true)}
                    className="dict-sheet-btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold active:scale-95 transition-all"
                  >
                    المزيد
                  </button>
                )}
              </div>
            )}

            {tab === "people" && (
              <div className="space-y-2.5">
                {(data?.relatedPeople ?? []).map((p, i) => (
                  <div
                    key={i}
                    className="dict-sheet-card rounded-2xl p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="dict-sheet-title font-arabic-serif text-[15px] font-bold truncate">
                          {p.name}
                        </p>
                        {p.role && (
                          <p className="dict-sheet-kind text-[11px] mt-0.5">{p.role}</p>
                        )}
                      </div>
                      <Users className="dict-sheet-accent h-4 w-4 shrink-0 mt-0.5" />
                    </div>
                    {p.meaning && (
                      <p className="dict-sheet-body mt-2 font-arabic-serif text-[13.5px] leading-relaxed">
                        {p.meaning}
                      </p>
                    )}
                    {p.reference && abbrev.data && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {splitRefs(p.reference).map((r, ri) => (
                          <RefChip key={ri} raw={r} maps={abbrev.data!} onNavigate={onClose} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {!(data?.relatedPeople?.length) && (
                  <Empty label="لا توجد معلومات شخصية بعد." />
                )}
              </div>
            )}

            {tab === "verses" && (
              <div className="space-y-2.5">
                {(data?.relatedVerses ?? []).map((v, i) => (
                  <RelatedVerseRow
                    key={i}
                    raw={v.reference}
                    fallbackText={v.text}
                    maps={abbrev.data ?? null}
                    onNavigate={onClose}
                  />
                ))}
                {!(data?.relatedVerses?.length) && <Empty label="لا توجد آيات مرتبطة بعد." />}
              </div>
            )}

            {tab === "timeline" && (
              <ol className="dict-sheet-timeline-line relative space-y-3 ps-4 border-s">
                {(data?.timeline ?? []).map((t, i) => (
                  <li key={i} className="relative">
                    <span className="dict-sheet-timeline-dot absolute -start-[7px] top-1.5 h-3 w-3 rounded-full" />
                    {t.year && <p className="dict-sheet-kind text-[11px] font-bold">{t.year}</p>}
                    <p className="dict-sheet-body text-[13px]">{t.event}</p>
                  </li>
                ))}
                {!(data?.timeline?.length) && <Empty label="لا يوجد تسلسل زمني بعد." />}
              </ol>
            )}

            {tab === "map" && (
              <div className="dict-sheet-map rounded-2xl border aspect-[4/3] grid place-items-center text-center">
                <div>
                  <MapPin className="dict-sheet-accent mx-auto h-6 w-6" />
                  <p className="dict-sheet-body mt-1 text-[12px] font-bold">
                    {data?.mapLabel ?? "خريطة الموقع — قريباً"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full meaning overlay */}
      <div
        onClick={() => setShowFull(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[70] dict-sheet-backdrop--deep backdrop-blur-[2px] transition-opacity duration-300",
          showFull && open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${data?.word ?? ""} — تفاصيل كاملة`}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[71] mx-auto w-full max-w-[var(--alpha-content-max-width)]",
          "transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          showFull && open ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div
          className="dict-sheet-panel mx-2 overflow-hidden rounded-t-[28px]"
          style={{ maxHeight: "92vh" }}
        >
          <div className="grid place-items-center pt-2 pb-1">
            <span className="dict-sheet-handle h-1.5 w-12 rounded-full" />
          </div>
          <header className="flex items-center justify-between gap-3 px-4 pb-3" dir="rtl">
            <h3 className="dict-sheet-title font-arabic-serif text-[20px] font-bold truncate">
              {data?.word}
            </h3>
            <button
              type="button"
              onClick={() => setShowFull(false)}
              aria-label="إغلاق"
              className="dict-sheet-close grid h-9 w-9 place-items-center rounded-full active:scale-90 transition-transform"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <div
            dir="rtl"
            className="overflow-y-auto px-4 pb-6 space-y-3"
            style={{ maxHeight: "calc(92vh - 90px)" }}
          >
            {data?.fullMeaning && (
              <TextBlock title="الشرح الكامل">{data.fullMeaning}</TextBlock>
            )}
            {data?.relatedVerses && data.relatedVerses.length > 0 && (
              <div className="space-y-2.5">
                <p className="dict-sheet-card-title text-[11px] font-bold px-1">الشواهد الكتابية</p>
                {data.relatedVerses.map((v, i) => (
                  <RelatedVerseRow
                    key={i}
                    raw={v.reference}
                    fallbackText={v.text}
                    maps={abbrev.data ?? null}
                    onNavigate={() => {
                      setShowFull(false);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function splitRefs(raw: string): string[] {
  return raw
    .split(/\r?\n|،|;|؛|,/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function RefChip({
  raw,
  maps,
  onNavigate,
}: {
  raw: string;
  maps: BookAbbrevMaps;
  onNavigate: () => void;
}) {
  const parsed = parseScriptureRef(raw, maps);
  if (!parsed) {
    return (
      <span className="dict-sheet-chip inline-flex items-center rounded-full px-2.5 py-1 text-[11px]">
        {raw}
      </span>
    );
  }
  return (
    <Link
      to="/$book/$chapter"
      params={{ book: parsed.book, chapter: String(parsed.chapter) }}
      onClick={onNavigate}
      className="dict-sheet-chip-link inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold active:scale-95 transition-all"
    >
      <ChevronLeft className="h-3 w-3" />
      {parsed.book} {parsed.chapter}
      {parsed.verse ? `:${parsed.verse}${parsed.verseEnd ? `-${parsed.verseEnd}` : ""}` : ""}
    </Link>
  );
}

function RelatedVerseRow({
  raw,
  fallbackText,
  maps,
  onNavigate,
}: {
  raw: string;
  fallbackText?: string;
  maps: BookAbbrevMaps | null;
  onNavigate: () => void;
}) {
  const parsed = maps ? parseScriptureRef(raw, maps) : null;
  const verseNum = parsed?.verse;
  const q = useQuery({
    queryKey: ["verse-text", parsed?.book, parsed?.chapter, verseNum],
    queryFn: () => fetchVerseText(parsed!.book, parsed!.chapter, verseNum!),
    enabled: !!(parsed && verseNum),
    staleTime: 60_000,
  });
  const text = q.data ?? fallbackText;

  const refLabel = parsed
    ? `${parsed.book} ${parsed.chapter}${parsed.verse ? `:${parsed.verse}${parsed.verseEnd ? `-${parsed.verseEnd}` : ""}` : ""}`
    : raw;

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="dict-sheet-card-title text-[11px] font-bold">{refLabel}</p>
        {parsed && <ChevronLeft className="dict-sheet-accent h-3.5 w-3.5 opacity-70" />}
      </div>
      {text ? (
        <p className="dict-sheet-body mt-1 font-arabic-serif text-[14px] leading-relaxed">
          {text}
        </p>
      ) : q.isLoading && parsed ? (
        <p className="dict-sheet-muted mt-1 text-[12px]">…جاري التحميل</p>
      ) : null}
    </>
  );

  if (!parsed) {
    return (
      <div className="dict-sheet-card rounded-2xl p-3">{inner}</div>
    );
  }

  return (
    <Link
      to="/$book/$chapter"
      params={{ book: parsed.book, chapter: String(parsed.chapter) }}
      onClick={onNavigate}
      className="dict-sheet-card dict-sheet-card-link block rounded-2xl p-3 active:scale-[0.99] transition-all"
    >
      {inner}
    </Link>
  );
}

function TextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dict-sheet-card rounded-2xl p-4">
      <p className="dict-sheet-card-title text-[11px] font-bold">{title}</p>
      <p className="dict-sheet-body mt-1.5 text-[14px] leading-relaxed">{children}</p>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="grid place-items-center py-10 text-center">
      <Sparkles className="dict-sheet-accent h-5 w-5 opacity-80" />
      <p className="dict-sheet-muted mt-2 text-[12px]">{label}</p>
    </div>
  );
}
