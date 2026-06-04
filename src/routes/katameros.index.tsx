import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ScrollText,
  Cross,
  Mail,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  Layers,
  X,
} from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { GlassSurface } from "@/components/bible/primitives";
import { CopticCross, CopticWatermark, CopticSeparator } from "@/components/coptic";
import { NotificationsCenter, type NotificationItem } from "@/components/overlays/NotificationsCenter";
import {
  getTodayKatameros,
  useKatamerosProgress,
  type DailyReading,
  type ReadingType,
  type ReadingStatus,
} from "@/features/katameros";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/katameros/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — القطمارس" },
      { name: "description", content: "قراءات الكنيسة القبطية لليوم: المزمور والإنجيل والبولس والكاثوليكون والإبركسيس." },
    ],
  }),
  component: KatamerosHome,
});

const READING_ICON: Record<ReadingType, typeof BookOpen> = {
  psalm: ScrollText,
  gospel: BookOpen,
  pauline: Mail,
  catholic: Cross,
  praxis: Send,
};

const READING_TONE: Record<ReadingType, string> = {
  psalm: "#6a4ab5",
  gospel: "#b8893a",
  pauline: "#3a6a9b",
  catholic: "#b8423a",
  praxis: "#3e7a55",
};

function KatamerosHome() {
  const router = useRouter();
  const day = getTodayKatameros();
  const { statusOf, setStatus, lastInProgress } = useKatamerosProgress(day.id);

  const [openId, setOpenId] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  const totalMin = useMemo(
    () => day.readings.reduce((sum, r) => sum + r.estimatedMin, 0),
    [day.readings],
  );

  const continueId = lastInProgress();
  const continueReading = continueId
    ? day.readings.find((r) => r.id === continueId)
    : null;

  const completedCount = day.readings.filter(
    (r) => statusOf(r.id) === "completed",
  ).length;

  const notifications: NotificationItem[] = [
    {
      id: "kat-today",
      title: "قراءات اليوم جاهزة",
      description: `${day.occasion} — ${day.readings.length} قراءات`,
      time: "اليوم",
      read: false,
      icon: <CopticCross size={14} />,
      onOpen: () => setNotifOpen(false),
    },
  ];

  const openReading = (id: string) => {
    setOpenId(id);
    if (statusOf(id) === "not-started") setStatus(id, "in-progress");
    requestAnimationFrame(() => {
      const el = document.getElementById(`reading-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const startAll = () => {
    const first = day.readings[0];
    if (first) openReading(first.id);
    else cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div dir="rtl" className="relative min-h-dvh bg-[#faf3e3]">
      <CopticWatermark />

      {/* Header — Back · Title · Notifications */}
      <header
        className="relative z-10 mx-auto w-full max-w-[430px] px-4 flex items-center justify-between"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: 8 }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="رجوع"
          className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center -mt-1">
          <CopticCross className="text-[#b8893a]" size={18} />
          <h1 className="font-arabic-serif text-[20px] font-extrabold text-[#3a2a18] leading-tight">
            القطمارس
          </h1>
          <p className="text-[10.5px] text-[#6a543a] -mt-0.5">قراءات الكنيسة القبطية لليوم</p>
        </div>
        <button
          type="button"
          onClick={() => setNotifOpen(true)}
          aria-label="التنبيهات"
          className="relative grid h-10 w-10 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#6a4ab5]" />
        </button>
      </header>

      <main
        className="relative z-10 mx-auto w-full max-w-[430px] px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 110px)" }}
      >
        {/* TODAY HERO */}
        <GlassSurface className="mt-3 overflow-hidden p-0 bg-white border-[#ead9b1] shadow-[0_18px_40px_-22px_rgba(120,80,30,0.55)]">
          <div className="relative p-5">
            {/* warm glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
              style={{ background: `radial-gradient(closest-side, ${day.accentHex}33, transparent)` }}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf3e1] backdrop-blur px-2.5 py-1 text-[10.5px] font-bold text-[#3a2a18] border border-[#ead9b1]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: day.accentHex }} />
                قراءات اليوم
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-[#b8893a] flex items-center gap-1 justify-end">
                  <CopticCross size={10} />
                  <span>{day.copticDate}</span>
                </div>
                <div className="text-[10.5px] text-[#6a543a] mt-0.5">{day.gregorianDate}</div>
              </div>
            </div>

            <div className="relative mt-3">
              <div className="text-[11px] text-[#6a543a]">{day.liturgicalDay}</div>
              <h2 className="font-arabic-serif text-[22px] font-extrabold text-[#3a2a18] leading-tight mt-1">
                {day.occasion}
              </h2>
            </div>

            <div className="relative mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[11px] text-[#6a543a]">
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-[#b8893a]" />
                  {day.readings.length} قراءات
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#b8893a]" />
                  {totalMin} دقائق
                </span>
              </div>
              <button
                type="button"
                onClick={startAll}
                className="inline-flex items-center gap-2 rounded-full text-white px-4 h-10 text-[12px] font-bold shadow-[0_10px_22px_-10px_rgba(106,74,181,0.65)] active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(to left, ${day.accentHex}, #8c6fd1)`,
                }}
              >
                <BookOpen className="h-4 w-4" />
                ابدأ القراءات
              </button>
            </div>
          </div>
        </GlassSurface>

        {/* CONTINUE READING (only if applicable) */}
        {continueReading && (
          <button
            type="button"
            onClick={() => openReading(continueReading.id)}
            className="mt-3 w-full text-right rounded-2xl bg-white border border-[#ead9b1] p-3 flex items-center gap-3 shadow-[0_8px_18px_-14px_rgba(120,80,30,0.5)] active:scale-[0.99] transition-transform"
          >
            <div
              className="grid h-10 w-10 place-items-center rounded-xl text-white shrink-0"
              style={{ background: READING_TONE[continueReading.type] }}
            >
              <PlayCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-bold text-[#b8893a]">متابعة القراءة</div>
              <div className="font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
                {continueReading.title} — {continueReading.reference}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#6a543a]" />
          </button>
        )}

        {/* READINGS */}
        <h3 className="mt-5 mb-2 px-1 font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] flex items-center gap-2">
          <span className="text-[#b8893a]/70 text-[12px]">Ⲁ</span>
          القراءات
          <span className="flex-1 h-px bg-[#ead9b1]" />
          <span className="text-[#b8893a]/70 text-[12px]">Ⲱ</span>
        </h3>

        <div ref={cardsRef} className="space-y-2.5">
          {day.readings.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#ead9b1] p-6 text-center text-[12px] text-[#6a543a]">
              لا توجد قراءات لهذا اليوم بعد.
            </div>
          ) : (
            day.readings.map((r) => (
              <ReadingCard
                key={r.id}
                reading={r}
                status={statusOf(r.id)}
                expanded={openId === r.id}
                onOpen={() => openReading(r.id)}
                onClose={() => setOpenId(null)}
                onComplete={() => {
                  setStatus(r.id, "completed");
                  setOpenId(null);
                }}
              />
            ))
          )}
        </div>

        <CopticSeparator />

        {/* DAILY SUMMARY */}
        <GlassSurface className="p-4 bg-white border-[#ead9b1] shadow-[0_10px_24px_-20px_rgba(120,80,30,0.5)]">
          <h3 className="font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#b8893a]" />
            ملخص اليوم
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SummaryCell label="عدد القراءات" value={`${day.readings.length}`} />
            <SummaryCell label="الوقت المتوقع" value={`${totalMin} د`} />
            <SummaryCell label="مكتمل" value={`${completedCount}/${day.readings.length}`} />
          </div>
          <div className="mt-3 text-[11.5px] text-[#6a543a] text-center">
            <span className="font-bold text-[#3a2a18]">المناسبة:</span> {day.occasion}
          </div>
        </GlassSurface>

        {/* TIMELINE */}
        <h3 className="mt-5 mb-2 px-1 font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] flex items-center gap-2">
          <span className="text-[#b8893a]/70 text-[12px]">Ⲁ</span>
          تسلسل قراءات اليوم
          <span className="flex-1 h-px bg-[#ead9b1]" />
          <span className="text-[#b8893a]/70 text-[12px]">Ⲱ</span>
        </h3>
        <GlassSurface className="p-4 bg-white border-[#ead9b1] shadow-[0_10px_24px_-20px_rgba(120,80,30,0.5)]">
          <ol className="space-y-2">
            {day.readings.map((r, idx) => {
              const Icon = READING_ICON[r.type];
              const tone = READING_TONE[r.type];
              const st = statusOf(r.id);
              return (
                <li key={r.id} className="flex items-center gap-3">
                  <div
                    className="relative grid h-9 w-9 place-items-center rounded-full text-white shrink-0"
                    style={{ background: tone }}
                  >
                    <Icon className="h-4 w-4" />
                    {idx < day.readings.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute top-full mt-0.5 h-3 w-px"
                        style={{ background: `${tone}55` }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a2a18] leading-tight">
                      {r.title}
                    </div>
                    <div className="text-[10.5px] text-[#6a543a] mt-0.5">{r.reference}</div>
                  </div>
                  <StatusBadge status={st} />
                </li>
              );
            })}
          </ol>
        </GlassSurface>

        {/* RELATED CONTENT */}
        <h3 className="mt-5 mb-2 px-1 font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] flex items-center gap-2">
          <span className="text-[#b8893a]/70 text-[12px]">Ⲁ</span>
          محتوى مرتبط
          <span className="flex-1 h-px bg-[#ead9b1]" />
          <span className="text-[#b8893a]/70 text-[12px]">Ⲱ</span>
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {day.related.map((item) => {
            const tone =
              item.kind === "synaxarium" ? "#6a4ab5" :
              item.kind === "feast" ? "#b8423a" :
              item.kind === "prayer" ? "#3e7a55" : "#3a6a9b";
            const Icon =
              item.kind === "synaxarium" ? CopticCross :
              item.kind === "feast" ? Sparkles :
              item.kind === "prayer" ? BookOpen : ScrollText;
            const content = (
              <GlassSurface className="p-3 bg-white border-[#ead9b1] shadow-[0_8px_18px_-14px_rgba(120,80,30,0.5)] h-full">
                <div className="flex items-center gap-2">
                  <div
                    className="grid h-8 w-8 place-items-center rounded-lg text-white"
                    style={{ background: tone }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-arabic-serif text-[12.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-[10.5px] text-[#6a543a] mt-0.5 line-clamp-1">{item.subtitle}</div>
                    )}
                  </div>
                </div>
              </GlassSurface>
            );
            return item.to ? (
              <Link
                key={item.id}
                to={item.to as any}
                className="block active:scale-[0.98] transition-transform"
              >
                {content}
              </Link>
            ) : (
              <div key={item.id} className="opacity-90">{content}</div>
            );
          })}
        </div>

        {/* Alpha footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[#b8893a]/70 font-bold tracking-widest">
          <span>Ⲁ</span>
          <span className="h-px w-10 bg-[#ead9b1]" />
          <span>ALPHA · القطمارس</span>
          <span className="h-px w-10 bg-[#ead9b1]" />
          <span>Ⲱ</span>
        </div>
      </main>

      <BottomDock />

      <NotificationsCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
      />
    </div>
  );
}

/* ---------- subcomponents ---------- */

function StatusBadge({ status }: { status: ReadingStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f3ec] border border-[#bcdcc9] text-[#1f6e54] text-[10px] font-bold px-2 h-6">
        <CheckCircle2 className="h-3 w-3" />
        مكتمل
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fbf3e1] border border-[#ead9b1] text-[#8a6322] text-[10px] font-bold px-2 h-6">
        <PlayCircle className="h-3 w-3" />
        قيد القراءة
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#ead9b1] text-[#6a543a] text-[10px] font-bold px-2 h-6">
      <Circle className="h-3 w-3" />
      ابدأ
    </span>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#fbf3e1] border border-[#ead9b1] p-2.5 text-center">
      <div className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] leading-none">{value}</div>
      <div className="text-[10px] text-[#6a543a] mt-1">{label}</div>
    </div>
  );
}

function ReadingCard({
  reading,
  status,
  expanded,
  onOpen,
  onClose,
  onComplete,
}: {
  reading: DailyReading;
  status: ReadingStatus;
  expanded: boolean;
  onOpen: () => void;
  onClose: () => void;
  onComplete: () => void;
}) {
  const Icon = READING_ICON[reading.type];
  const tone = READING_TONE[reading.type];

  return (
    <div id={`reading-${reading.id}`} className="scroll-mt-4">
      <GlassSurface className="p-0 bg-white border-[#ead9b1] shadow-[0_10px_24px_-20px_rgba(120,80,30,0.5)] overflow-hidden transition-shadow duration-300 [@media(hover:hover)]:hover:shadow-[0_18px_32px_-22px_rgba(120,80,30,0.55)]">
        <div className="flex items-center gap-3 p-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-xl text-white shrink-0 shadow-[0_6px_14px_-8px_rgba(0,0,0,0.35)]"
            style={{ background: tone }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-arabic-serif text-[14.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
              {reading.title}
            </div>
            <div className="text-[11px] text-[#6a543a] mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="font-bold" style={{ color: tone }}>{reading.reference}</span>
              <span className="text-[#ead9b1]">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {reading.estimatedMin === 1 ? "دقيقة" : `${reading.estimatedMin} دقائق`}
              </span>
              <span className="text-[#ead9b1]">·</span>
              <span>{reading.source}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={status} />
            <button
              type="button"
              onClick={expanded ? onClose : onOpen}
              aria-expanded={expanded}
              className={cn(
                "inline-flex items-center gap-1 rounded-full text-white text-[10.5px] font-bold h-7 px-2.5 active:scale-95 transition-transform",
              )}
              style={{ background: tone }}
            >
              {expanded ? (
                <>
                  <X className="h-3 w-3" />
                  إغلاق
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  فتح
                </>
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-[#ead9b1] bg-[#fbf6e6] px-4 py-4 animate-fade-in">
            <p
              className="font-arabic-serif text-[14.5px] text-[#3a2a18] leading-[2] whitespace-pre-wrap text-right"
            >
              {reading.body}
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] text-[11px] font-bold h-8 px-3 active:scale-95 transition-transform"
              >
                لاحقاً
              </button>
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center gap-1.5 rounded-full text-white text-[11px] font-bold h-8 px-3 active:scale-95 transition-transform shadow-[0_8px_18px_-10px_rgba(31,110,84,0.6)]"
                style={{ background: "linear-gradient(to left, #1f6e54, #3eb482)" }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                إنهاء القراءة
              </button>
            </div>
          </div>
        )}
      </GlassSurface>
    </div>
  );
}
