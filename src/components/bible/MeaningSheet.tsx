import { useEffect, useRef, useState } from "react";
import { X, MapPin, Clock, Users, BookOpen, Sparkles, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type MeaningSheetData = {
  word: string;
  kind?: string;
  meaning?: string;
  origin?: string;
  firstAppearance?: string;
  spiritualRole?: string;
  relatedVerses?: { reference: string; text: string }[];
  relatedPeople?: { name: string; role?: string }[];
  timeline?: { year?: string; event: string }[];
  mapLabel?: string;
};

type Tab = "overview" | "verses" | "map" | "timeline" | "people" | "meaning";

const tabs: { key: Tab; label: string; icon: typeof X }[] = [
  { key: "overview", label: "نظرة عامة", icon: Layers },
  { key: "meaning", label: "المعنى", icon: Sparkles },
  { key: "verses", label: "الآيات", icon: BookOpen },
  { key: "people", label: "أشخاص", icon: Users },
  { key: "timeline", label: "تسلسل", icon: Clock },
  { key: "map", label: "خريطة", icon: MapPin },
];

export function MeaningSheet({
  data,
  onClose,
}: {
  data: MeaningSheetData | null;
  onClose: () => void;
}) {
  const open = !!data;
  const [tab, setTab] = useState<Tab>("overview");
  const [expanded, setExpanded] = useState(false);
  const dragStart = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTab("overview");
      setExpanded(false);
    }
  }, [open, data?.word]);

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
          "fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px] transition-opacity duration-300",
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
            "mx-2 overflow-hidden rounded-t-[28px] border backdrop-blur-3xl",
            // Emerald transparent glass — clearly separated from beige reader & navy dark mode
            "bg-gradient-to-b from-[#0f3a2c]/72 to-[#0a2620]/78 border-[#7af0b8]/30 text-[#eaf6ec]",
            "shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.7),0_0_28px_-6px_rgba(62,180,130,0.45),inset_0_1px_0_rgba(255,255,255,0.07)]",
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
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors",
                      active
                        ? "bg-gradient-to-br from-[#7af0b8] to-[#1f8a64] border-[#7af0b8]/50 text-[#08231b] shadow-[0_6px_14px_-8px_rgba(62,180,130,0.7)]"
                        : "bg-white/8 border-[#7af0b8]/20 text-[#eaf6ec]",
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
            {tab === "overview" && <OverviewBlock data={data} />}
            {tab === "meaning" && (
              <TextBlock title="المعنى والأصل">
                {data?.meaning || data?.origin || "لا توجد تفاصيل بعد."}
              </TextBlock>
            )}
            {tab === "verses" && (
              <div className="space-y-2.5">
                {(data?.relatedVerses ?? []).map((v, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/70 border border-[#efe2c4] p-3"
                  >
                    <p className="text-[11px] font-bold text-[#e7c97a]">{v.reference}</p>
                    <p className="mt-1 font-arabic-serif text-[14px] leading-relaxed text-[#eaf6ec]">
                      {v.text}
                    </p>
                  </div>
                ))}
                {!(data?.relatedVerses?.length) && <Empty label="لا توجد آيات مرتبطة بعد." />}
              </div>
            )}
            {tab === "people" && (
              <div className="space-y-2">
                {(data?.relatedPeople ?? []).map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl bg-white/70 border border-[#efe2c4] p-3"
                  >
                    <div>
                      <p className="text-[13px] font-bold text-[#eaf6ec]">{p.name}</p>
                      {p.role && <p className="text-[11px] text-[#cfe4d5]">{p.role}</p>}
                    </div>
                    <Users className="h-4 w-4 text-[#e7c97a]" />
                  </div>
                ))}
                {!(data?.relatedPeople?.length) && <Empty label="لا توجد أشخاص مرتبطون بعد." />}
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

function OverviewBlock({ data }: { data: MeaningSheetData | null }) {
  if (!data) return null;
  const items = [
    { label: "المعنى", value: data.meaning },
    { label: "الأصل", value: data.origin },
    { label: "أول ظهور", value: data.firstAppearance },
    { label: "الدور الروحي", value: data.spiritualRole },
  ].filter((x) => x.value);
  if (!items.length) return <Empty label="لا تتوفر تفاصيل بعد." />;
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl bg-white/70 border border-[#efe2c4] p-3">
          <p className="text-[11px] font-bold text-[#e7c97a]">{it.label}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-[#eaf6ec]">{it.value}</p>
        </div>
      ))}
    </div>
  );
}

function TextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-[#efe2c4] p-4">
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
