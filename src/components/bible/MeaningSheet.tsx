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
  const dragStart = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const abbrev = useBookAbbreviations();

  useEffect(() => {
    if (open) {
      setTab(data?.defaultTab ?? "meaning");
      setExpanded(false);
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
          "fixed inset-0 z-[60] bg-[#06251c]/25 backdrop-blur-[5px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={data?.word ?? "تفاصيل الكلمة"}
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
            "bg-gradient-to-b from-[#0f3d2e]/72 via-[#0c3326]/70 to-[#07261c]/78 border-[#7af0b8]/35 text-[#eaf6ec]",
            "shadow-[0_-28px_70px_-18px_rgba(0,0,0,0.6),0_0_36px_-12px_rgba(122,240,184,0.45),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_40px_-20px_rgba(122,240,184,0.18)]",
            "transition-[max-height] duration-300",
          )}
          style={{ maxHeight: expanded ? "92vh" : "70vh" }}
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
              <h3 className="font-arabic-serif text-[20px] font-bold text-[#f4f9ee] truncate">
                {data?.word}
              </h3>
              {data?.kind && (
                <p className="text-[11px] font-bold text-[#e7c97a]">{data.kind}</p>
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

          <div dir="rtl" className="px-3">
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-all duration-200",
                      active
                        ? "bg-gradient-to-br from-[#9affcc] via-[#5ee6a4] to-[#1f8a64] border-[#caffe2] text-[#04190f] ring-1 ring-[#a8ffd1]/60 shadow-[0_0_22px_-2px_rgba(122,240,184,0.9),0_0_44px_-10px_rgba(94,230,164,0.55),inset_0_1px_0_rgba(255,255,255,0.55)] scale-[1.02]"
                        : "bg-[#0a2a20]/55 border-[#7af0b8]/30 text-[#d6ecdc] hover:text-[#eaf6ec] hover:border-[#7af0b8]/50",
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
              <TextBlock title="المعنى">
                {data?.meaning || "لا توجد تفاصيل بعد."}
              </TextBlock>
            )}

            {tab === "people" && (
              <div className="space-y-2.5">
                {(data?.relatedPeople ?? []).map((p, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-[#0a2a20]/45 border border-[#7af0b8]/20 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-arabic-serif text-[15px] font-bold text-[#f4f9ee] truncate">
                          {p.name}
                        </p>
                        {p.role && (
                          <p className="text-[11px] text-[#e7c97a] mt-0.5">{p.role}</p>
                        )}
                      </div>
                      <Users className="h-4 w-4 text-[#e7c97a] shrink-0 mt-0.5" />
                    </div>
                    {p.meaning && (
                      <p className="mt-2 font-arabic-serif text-[13.5px] leading-relaxed text-[#eaf6ec]">
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
              <ol className="relative space-y-3 ps-4 border-s border-[#e7c97a]/60">
                {(data?.timeline ?? []).map((t, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-[7px] top-1.5 h-3 w-3 rounded-full bg-[#c79356] ring-2 ring-[#fbf3e1]" />
                    {t.year && <p className="text-[11px] font-bold text-[#e7c97a]">{t.year}</p>}
                    <p className="text-[13px] text-[#eaf6ec]">{t.event}</p>
                  </li>
                ))}
                {!(data?.timeline?.length) && <Empty label="لا يوجد تسلسل زمني بعد." />}
              </ol>
            )}

            {tab === "map" && (
              <div className="rounded-2xl border border-[#efe2c4] bg-gradient-to-br from-[#eef3e6] via-[#dfe9d0] to-[#bcd0a7] aspect-[4/3] grid place-items-center text-center">
                <div>
                  <MapPin className="mx-auto h-6 w-6 text-[#4a6741]" />
                  <p className="mt-1 text-[12px] font-bold text-[#3a4d2a]">
                    {data?.mapLabel ?? "خريطة الموقع — قريباً"}
                  </p>
                </div>
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
      <span className="inline-flex items-center rounded-full border border-[#7af0b8]/25 bg-[#0a2a20]/40 px-2.5 py-1 text-[11px] text-[#cfe4d5]">
        {raw}
      </span>
    );
  }
  return (
    <Link
      to="/$book/$chapter"
      params={{ book: parsed.book, chapter: String(parsed.chapter) }}
      onClick={onNavigate}
      className="inline-flex items-center gap-1 rounded-full border border-[#7af0b8]/40 bg-[#0a2a20]/55 px-2.5 py-1 text-[11px] font-bold text-[#e7c97a] hover:border-[#7af0b8]/70 active:scale-95 transition-all"
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
        <p className="text-[11px] font-bold text-[#e7c97a]">{refLabel}</p>
        {parsed && <ChevronLeft className="h-3.5 w-3.5 text-[#7af0b8]/70" />}
      </div>
      {text ? (
        <p className="mt-1 font-arabic-serif text-[14px] leading-relaxed text-[#eaf6ec]">
          {text}
        </p>
      ) : q.isLoading && parsed ? (
        <p className="mt-1 text-[12px] text-[#cfe4d5]/70">…جاري التحميل</p>
      ) : null}
    </>
  );

  if (!parsed) {
    return (
      <div className="rounded-2xl bg-[#0a2a20]/45 border border-[#7af0b8]/20 p-3">{inner}</div>
    );
  }

  return (
    <Link
      to="/$book/$chapter"
      params={{ book: parsed.book, chapter: String(parsed.chapter) }}
      onClick={onNavigate}
      className="block rounded-2xl bg-[#0a2a20]/45 border border-[#7af0b8]/25 p-3 hover:border-[#7af0b8]/55 active:scale-[0.99] transition-all"
    >
      {inner}
    </Link>
  );
}

function TextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#0a2a20]/45 border border-[#7af0b8]/20 p-4">
      <p className="text-[11px] font-bold text-[#e7c97a]">{title}</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[#eaf6ec]">{children}</p>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="grid place-items-center py-10 text-center">
      <Sparkles className="h-5 w-5 text-[#c79356]" />
      <p className="mt-2 text-[12px] text-[#cfe4d5]">{label}</p>
    </div>
  );
}
