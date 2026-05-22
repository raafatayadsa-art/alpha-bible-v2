import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Home as HomeIcon,
  Search,
  Settings2,
  Type as TypeIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { chaptersQueryOptions, versesQueryOptions } from "@/lib/bible";
import { displayName } from "@/lib/bible-books";
import {
  AutoScrollControls,
  BackButton,
  BottomDock,
  HighlightedWord,
  MeaningSheet,
  ReferenceIndicator,
  type MeaningSheetData,
} from "@/components/bible";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$book/$chapter")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${params.book} ${params.chapter} — الكتاب المقدس` },
      { name: "description", content: `${params.book} الإصحاح ${params.chapter}.` },
    ],
  }),
  component: ScriptureReader,
});

/* ---------------- Glossary ---------------- */

type Kind = "person" | "place" | "prophecy" | "symbol" | "concept";

const GLOSSARY: Record<string, MeaningSheetData & { kindHint?: Kind }> = {
  الله: {
    word: "الله",
    kind: "اسم إلهي",
    kindHint: "concept",
    meaning: "الإله الواحد، خالق السموات والأرض.",
    origin: "أصل سامي مشترك يدل على الإله الأعلى.",
    firstAppearance: "تكوين 1:1",
    spiritualRole: "محور الكتاب المقدس كله، مصدر الحياة والخلاص.",
  },
  الرب: { word: "الرب", kind: "اسم إلهي", kindHint: "concept", meaning: "السيد، يهوه — الإله القدوس." },
  يسوع: {
    word: "يسوع",
    kind: "شخصية",
    kindHint: "person",
    meaning: "الذي يخلّص شعبه من خطاياهم.",
    origin: "من العبرية «يَهوشُع»: الرب يخلّص.",
    firstAppearance: "متى 1:21",
    spiritualRole: "المسيح المخلّص، الكلمة المتجسد.",
  },
  المسيح: { word: "المسيح", kind: "لقب", kindHint: "person", meaning: "الممسوح، الفادي الموعود به." },
  موسى: { word: "موسى", kind: "نبي", kindHint: "person", meaning: "نبي الخروج ومستلم الشريعة." },
  إبراهيم: { word: "إبراهيم", kind: "أب الآباء", kindHint: "person", meaning: "أبو المؤمنين، صديق الله." },
  داود: { word: "داود", kind: "ملك ونبي", kindHint: "person", meaning: "ملك إسرائيل، كاتب المزامير." },
  مريم: { word: "مريم", kind: "شخصية", kindHint: "person", meaning: "والدة المسيح، العذراء." },
  بطرس: { word: "بطرس", kind: "رسول", kindHint: "person" },
  بولس: { word: "بولس", kind: "رسول", kindHint: "person" },
  أورشليم: {
    word: "أورشليم",
    kind: "مكان",
    kindHint: "place",
    meaning: "مدينة السلام، عاصمة الإيمان.",
    firstAppearance: "يشوع 10:1",
    mapLabel: "أورشليم — يهوذا",
  },
  بيتلحم: { word: "بيتلحم", kind: "مكان", kindHint: "place", meaning: "مولد المسيح." },
  مصر: { word: "مصر", kind: "مكان", kindHint: "place" },
  جلجلة: { word: "جلجلة", kind: "مكان", kindHint: "place", meaning: "موضع الصلب." },
  النور: { word: "النور", kind: "رمز روحي", kindHint: "symbol", meaning: "حضور الله وحقّه في العالم." },
  الماء: { word: "الماء", kind: "رمز روحي", kindHint: "symbol", meaning: "الطهارة، الحياة، الروح القدس." },
  الحياة: { word: "الحياة", kind: "مفهوم", kindHint: "concept", meaning: "الحياة الأبدية في الله." },
  الروح: { word: "الروح", kind: "مفهوم إلهي", kindHint: "concept", meaning: "الروح القدس، نسمة الله." },
  القيامة: { word: "القيامة", kind: "نبوءة وحدث", kindHint: "prophecy", meaning: "قيامة المسيح من الأموات." },
  الخلاص: { word: "الخلاص", kind: "مفهوم", kindHint: "concept" },
  السلام: { word: "السلام", kind: "مفهوم", kindHint: "concept" },
  الإيمان: { word: "الإيمان", kind: "مفهوم", kindHint: "concept" },
  المحبة: { word: "المحبة", kind: "مفهوم", kindHint: "concept" },
  الملكوت: { word: "الملكوت", kind: "نبوءة", kindHint: "prophecy" },
};

const HIGHLIGHT_WORDS = Object.keys(GLOSSARY);

/* ---------------- Reader ---------------- */

function ScriptureReader() {
  const { book, chapter } = Route.useParams();
  const ch = Number(chapter);
  const verses = useQuery(versesQueryOptions(book, ch));
  const chapters = useQuery(chaptersQueryOptions(book));

  const [saved, setSaved] = useState(false);
  const [spiritualMode, setSpiritualMode] = useState(false);
  const [sheet, setSheet] = useState<MeaningSheetData | null>(null);
  const [progress, setProgress] = useState(0);
  const [typeOpen, setTypeOpen] = useState(false);
  const [activeVerse, setActiveVerse] = useState<string | null>(null);

  // Typography controls
  const [fontSize, setFontSize] = useState(19); // px
  const [lineHeight, setLineHeight] = useState(2.15);
  const [readingWidth, setReadingWidth] = useState(640); // px

  const articleRef = useRef<HTMLElement>(null);

  const list = chapters.data ?? [];
  const idx = list.indexOf(ch);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  const isNT = useMemo(() => {
    const name = displayName(book);
    return [
      "متى", "مرقس", "لوقا", "يوحنا", "أعمال", "رؤيا", "رومية", "كورنثوس", "غلاطية", "أفسس",
      "فيلبي", "كولوسي", "تسالونيكي", "تيموثاوس", "تيطس", "فليمون", "العبرانيين", "يعقوب",
      "بطرس", "يهوذا", "رسالة", "إنجيل",
    ].some((k) => name.includes(k));
  }, [book]);

  // Top + side progress driven by scroll position
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [book, chapter]);

  // Deep-navy cinematic dark palette; warm gold glow; subtle purple accents.
  const bgClass = spiritualMode
    ? "bg-[#070d1a] text-[#e8e2cf]"
    : "bg-[#f8efdc] text-[#3a2a18]";
  const surfaceClass = spiritualMode
    ? "bg-[#0e1a2e]/55 border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_22px_-16px_rgba(0,0,0,0.7)]"
    : "bg-white/70 border-[#efe2c4]";
  const subSurfaceClass = spiritualMode
    ? "bg-[#0c1828]/45 border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
    : "bg-white/40 border-[#efe2c4]/60";

  const totalVerses = verses.data?.length ?? 0;

  // Group verses into very soft "stanzas" of 4 for eye tracking.
  const groups = useMemo(() => {
    const items = verses.data ?? [];
    const out: typeof items[] = [];
    const size = 4;
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
  }, [verses.data]);

  return (
    <main
      dir="rtl"
      className={cn(
        "relative min-h-screen w-full overflow-x-hidden transition-colors duration-500",
        bgClass,
      )}
    >
      {/* Cinematic glow atmosphere (dark mode only) */}
      {spiritualMode && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 40% at 50% 0%, rgba(231,201,122,0.10), transparent 70%)," +
              "radial-gradient(50% 35% at 85% 30%, rgba(140,110,210,0.09), transparent 75%)," +
              "radial-gradient(70% 45% at 15% 85%, rgba(110,160,220,0.07), transparent 80%)," +
              "radial-gradient(100% 60% at 50% 100%, rgba(0,0,0,0.55), transparent 70%)",
          }}
        />
      )}

      {/* Top thin progress */}
      <div
        className="fixed inset-x-0 top-0 z-40 h-[3px]"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      >
        <div className="mx-auto h-full w-full max-w-[640px]">
          <div
            className={cn(
              "h-full rounded-r-full transition-[width] duration-150 bg-gradient-to-l from-[#e7c97a] via-[#c79356] to-[#7a4a26]",
              spiritualMode && "shadow-[0_0_10px_rgba(231,201,122,0.55)]",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* LEFT — vertical reading progress with chapter markers */}
      <VerticalProgress
        progress={progress}
        chapters={list}
        current={ch}
        book={book}
        spiritualMode={spiritualMode}
      />

      <div
        className="relative mx-auto w-full px-4 pt-[max(env(safe-area-inset-top),12px)] pb-44 transition-[max-width] duration-300"
        style={{ maxWidth: `${readingWidth}px` }}
      >
        {/* Header / Toolbar */}
        <header className="flex items-center justify-between gap-2 pt-3">
          <div className="flex items-center gap-1.5">
            <BackButton />
            <Link
              to="/bible"
              aria-label="الرئيسية للكتاب المقدس"
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-transform",
                surfaceClass,
              )}
            >
              <HomeIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="text-center min-w-0 flex-1 px-1">
            <p
              className={cn(
                "text-[10px] font-bold tracking-wider",
                spiritualMode ? "text-[#c79356]" : "text-[#b8893a]",
              )}
            >
              {isNT ? "العهد الجديد" : "العهد القديم"}
            </p>
            <h1
              className={cn(
                "font-arabic-serif text-[16px] font-bold truncate",
                spiritualMode ? "text-[#f3e6c4]" : "text-[#3a2a18]",
              )}
            >
              {displayName(book)} <span className="opacity-60">·</span> {chapter}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <ToolbarBtn label="بحث" surfaceClass={surfaceClass}>
              <Search className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn
              label={saved ? "إزالة من المحفوظات" : "حفظ"}
              surfaceClass={surfaceClass}
              onClick={() => setSaved((s) => !s)}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </ToolbarBtn>
            <ToolbarBtn
              label="إعدادات النص"
              surfaceClass={surfaceClass}
              onClick={() => setTypeOpen((o) => !o)}
            >
              <TypeIcon className="h-4 w-4" />
            </ToolbarBtn>
          </div>
        </header>

        {/* Status pill */}
        <div
          className={cn(
            "mt-3 flex items-center justify-between rounded-2xl border px-3 py-2",
            surfaceClass,
          )}
        >
          <p className="text-[11px] font-bold opacity-80">
            الإصحاح {ch}
            {list.length ? ` من ${list.length}` : ""}
          </p>
          <p className="text-[11px] font-bold tabular-nums opacity-80">{totalVerses} آية</p>
        </div>

        {/* Loading / error */}
        {verses.isLoading && (
          <p className="mt-12 text-center text-[12px] opacity-70">جاري تحميل الآيات...</p>
        )}
        {verses.error && (
          <p className="mt-12 text-center text-[12px] text-red-500">
            تعذّر التحميل: {(verses.error as Error)?.message ?? "خطأ غير معروف"}
          </p>
        )}
        {!verses.isLoading && !verses.error && totalVerses === 0 && (
          <p className="mt-12 text-center text-[12px] opacity-70">لا توجد آيات</p>
        )}

        {totalVerses > 0 && (
          <article
            ref={articleRef}
            className={cn(
              "mt-5 font-arabic-serif tracking-[0.2px] transition-[font-size,line-height] duration-200",
              spiritualMode ? "text-[#f3e6c4]" : "text-[#3a2a18]",
            )}
            style={{ fontSize: `${fontSize}px`, lineHeight, wordSpacing: "0.06em" }}
          >
            {groups.map((group, gi) => (
              <section
                key={gi}
                className={cn(
                  "mb-3 rounded-2xl border px-3.5 py-3 transition-colors",
                  subSurfaceClass,
                )}
              >
                {group.map((v, i) => {
                  const id = v?.ID ?? `${ch}-${v?.verse_number ?? `${gi}-${i}`}`;
                  const showRef = (gi * 4 + i) > 0 && (gi * 4 + i) % 7 === 3;
                  const isActive = activeVerse === String(id);
                  return (
                    <p
                      key={id}
                      onClick={() =>
                        setActiveVerse((cur) => (cur === String(id) ? null : String(id)))
                      }
                      className={cn(
                        "mb-2 last:mb-0 cursor-pointer rounded-xl px-2 py-1.5 -mx-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isActive && (spiritualMode
                          ? "bg-[#13243d]/70 scale-[1.012] shadow-[0_0_24px_-6px_rgba(231,201,122,0.35),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-[#e7c97a]/25"
                          : "bg-white/80 scale-[1.012] shadow-[0_8px_22px_-14px_rgba(120,80,30,0.45)] ring-1 ring-[#c79356]/30"),
                      )}
                    >
                      <span
                        className={cn(
                          "me-1 inline-block min-w-[1.4em] text-[10.5px] font-bold align-super tabular-nums transition-colors",
                          spiritualMode
                            ? isActive ? "text-[#f0d78c]" : "text-[#c79356]"
                            : "text-[#b8893a]",
                        )}
                        style={
                          spiritualMode && isActive
                            ? { textShadow: "0 0 8px rgba(231,201,122,0.7)" }
                            : undefined
                        }
                      >
                        {v?.verse_number ?? ""}
                      </span>
                      {renderVerse(v?.verse_text ?? "", (w, k) =>
                        setSheet(GLOSSARY[w] ?? { word: w, kind: k }),
                      )}
                      {showRef && (
                        <ReferenceIndicator
                          count={2}
                          onClick={() =>
                            setSheet({
                              word: `${displayName(book)} ${ch}:${v?.verse_number}`,
                              kind: "مراجع متقاطعة",
                              relatedVerses: [
                                { reference: "مزمور 23:1", text: "الرب راعيّ فلا يعوزني شيء." },
                                { reference: "يوحنا 14:6", text: "أنا هو الطريق والحق والحياة." },
                              ],
                            })
                          }
                        />
                      )}
                    </p>
                  );
                })}
              </section>
            ))}
          </article>
        )}

        {/* Chapter nav */}
        <nav
          className={cn(
            "mt-8 flex items-center justify-between border-t pt-5 text-[12px]",
            spiritualMode ? "border-white/10" : "border-[#efe2c4]",
          )}
        >
          {prev ? (
            <Link
              to="/$book/$chapter"
              params={{ book, chapter: String(prev) }}
              className={cn(
                "rounded-full border px-4 py-2 font-bold active:scale-95 transition-transform",
                surfaceClass,
              )}
            >
              → الإصحاح {prev}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/$book/$chapter"
              params={{ book, chapter: String(next) }}
              className={cn(
                "rounded-full border px-4 py-2 font-bold active:scale-95 transition-transform",
                surfaceClass,
              )}
            >
              الإصحاح {next} ←
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      {/* Typography popover */}
      {typeOpen && (
        <TypographyPanel
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          readingWidth={readingWidth}
          setReadingWidth={setReadingWidth}
          onClose={() => setTypeOpen(false)}
          spiritualMode={spiritualMode}
        />
      )}

      {/* Auto-scroll above the dock */}
      <AutoScrollControls
        spiritualMode={spiritualMode}
        onToggleSpiritual={() => setSpiritualMode((s) => !s)}
        bottomClass="bottom-[108px]"
      />

      {/* Persistent global navigation */}
      <BottomDock />

      <MeaningSheet data={sheet} onClose={() => setSheet(null)} />
    </main>
  );
}

/* ---------------- Toolbar button ---------------- */

function ToolbarBtn({
  children,
  label,
  surfaceClass,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  surfaceClass: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-transform",
        surfaceClass,
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- Vertical reading progress ---------------- */

function VerticalProgress({
  progress,
  chapters,
  current,
  book,
  spiritualMode,
}: {
  progress: number;
  chapters: number[];
  current: number;
  book: string;
  spiritualMode: boolean;
}) {
  // Show up to 12 markers around the current chapter.
  const window = useMemo(() => {
    if (!chapters.length) return [] as number[];
    const max = 12;
    if (chapters.length <= max) return chapters;
    const i = Math.max(0, chapters.indexOf(current));
    const half = Math.floor(max / 2);
    let start = Math.max(0, i - half);
    let end = Math.min(chapters.length, start + max);
    start = Math.max(0, end - max);
    return chapters.slice(start, end);
  }, [chapters, current]);

  return (
    <div
      className="fixed left-2 top-1/2 z-40 -translate-y-1/2 select-none"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      aria-hidden
    >
      <div
        className={cn(
          "flex flex-col items-center gap-1.5 rounded-full border px-1.5 py-2 backdrop-blur-xl",
          spiritualMode
            ? "bg-white/[0.05] border-white/10"
            : "bg-[#fbf3e1]/70 border-white/70 shadow-[0_8px_18px_-12px_rgba(120,80,30,0.35),inset_0_1px_0_rgba(255,255,255,0.7)]",
        )}
      >
        {/* progress fill */}
        <div className="relative h-40 w-1 rounded-full bg-[#ecdcb6]/60 overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-[#e7c97a] via-[#c79356] to-[#7a4a26] transition-[height] duration-300"
            style={{ height: `${Math.max(2, progress)}%` }}
          />
        </div>
        {/* chapter dots */}
        <div className="mt-1 flex flex-col items-center gap-1">
          {window.map((c) => {
            const active = c === current;
            return (
              <Link
                key={c}
                to="/$book/$chapter"
                params={{ book, chapter: String(c) }}
                aria-label={`الإصحاح ${c}`}
                className="group block"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-200",
                    active
                      ? "h-2.5 w-2.5 bg-gradient-to-br from-[#e7c97a] to-[#a87a35] ring-2 ring-[#fbf3e1] shadow-[0_0_8px_rgba(231,201,122,0.7)]"
                      : "h-1.5 w-1.5 bg-[#c79356]/40 group-hover:bg-[#c79356]",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Typography panel ---------------- */

function TypographyPanel({
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  readingWidth,
  setReadingWidth,
  onClose,
  spiritualMode,
}: {
  fontSize: number;
  setFontSize: (n: number) => void;
  lineHeight: number;
  setLineHeight: (n: number) => void;
  readingWidth: number;
  setReadingWidth: (n: number) => void;
  onClose: () => void;
  spiritualMode: boolean;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-transparent"
      />
      <div
        dir="rtl"
        className={cn(
          "fixed left-1/2 top-[64px] z-50 w-[88%] max-w-[360px] -translate-x-1/2 rounded-3xl border p-4 backdrop-blur-2xl shadow-[0_18px_40px_-18px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.8)]",
          spiritualMode
            ? "bg-[#1a1410]/90 border-white/10 text-[#f3e6c4]"
            : "bg-[#fbf3e1]/95 border-white/70 text-[#3a2a18]",
        )}
        role="dialog"
        aria-label="إعدادات النص"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-extrabold tracking-wide">إعدادات القراءة</p>
          <Settings2 className="h-3.5 w-3.5 opacity-60" />
        </div>

        <Stepper
          label="حجم الخط"
          value={`${fontSize}`}
          onDec={() => setFontSize(Math.max(14, fontSize - 1))}
          onInc={() => setFontSize(Math.min(28, fontSize + 1))}
        />
        <Stepper
          label="المسافة بين السطور"
          value={lineHeight.toFixed(2)}
          onDec={() => setLineHeight(Math.max(1.6, +(lineHeight - 0.1).toFixed(2)))}
          onInc={() => setLineHeight(Math.min(2.8, +(lineHeight + 0.1).toFixed(2)))}
        />
        <Stepper
          label="عرض القراءة"
          value={`${readingWidth}px`}
          onDec={() => setReadingWidth(Math.max(420, readingWidth - 40))}
          onInc={() => setReadingWidth(Math.min(800, readingWidth + 40))}
        />

        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] opacity-70">
          <span>Aa</span>
          <span className="text-[14px]">Aa</span>
        </div>
      </div>
    </>
  );
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2 rounded-2xl bg-white/40 dark:bg-white/[0.04] border border-white/60 px-3 py-2">
      <p className="text-[12px] font-bold">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDec}
          aria-label="تقليل"
          className="grid h-7 w-7 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[44px] text-center text-[11px] font-bold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={onInc}
          aria-label="زيادة"
          className="grid h-7 w-7 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Verse renderer ---------------- */

function renderVerse(
  text: string,
  onSelect: (w: string, kind?: string) => void,
): React.ReactNode {
  if (!text) return null;
  const words = [...HIGHLIGHT_WORDS].sort((a, b) => b.length - a.length);
  if (!words.length) return text;
  const pattern = new RegExp(`(${words.map((w) => escapeReg(w)).join("|")})`, "g");
  const parts = text.split(pattern);
  return parts.map((p, i) => {
    if (words.includes(p)) {
      const meta = GLOSSARY[p];
      const kind = (meta?.kindHint ?? "concept") as Kind;
      return (
        <HighlightedWord key={i} kind={kind} onSelect={() => onSelect(p, meta?.kind)}>
          {p}
        </HighlightedWord>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
