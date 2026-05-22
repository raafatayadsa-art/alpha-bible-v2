import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Home as HomeIcon,
  Search,
  Type as TypeIcon,
  ChevronUp,
  ChevronDown,
  RotateCcw,
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
  VerseSkeleton,
  type MeaningSheetData,
} from "@/components/bible";
import {
  updateSession,
  useSavedVerses,
  useTypographyPrefs,
  verseKey,
} from "@/lib/reading-state";
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

  const [spiritualMode, setSpiritualMode] = useState(false);
  const [sheet, setSheet] = useState<MeaningSheetData | null>(null);
  const [progress, setProgress] = useState(0);
  const [typeOpen, setTypeOpen] = useState(false);
  const [activeVerse, setActiveVerse] = useState<string | null>(null);

  // Persistent typography prefs
  const { prefs, setPrefs, reset: resetPrefs } = useTypographyPrefs();
  const { fontSize, lineHeight, readingWidth } = prefs;
  const setFontSize = (n: number) => setPrefs({ ...prefs, fontSize: n });
  const setLineHeight = (n: number) => setPrefs({ ...prefs, lineHeight: n });
  const setReadingWidth = (n: number) => setPrefs({ ...prefs, readingWidth: n });

  // Saved verses
  const { isSaved, toggle: toggleSaved } = useSavedVerses();

  const articleRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const visibleVerseRef = useRef<number | undefined>(undefined);
  const lastSavedAt = useRef(0);

  const list = chapters.data ?? [];
  const idx = list.indexOf(ch);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  const bookName = displayName(book);

  const isNT = useMemo(() => {
    return [
      "متى", "مرقس", "لوقا", "يوحنا", "أعمال", "رؤيا", "رومية", "كورنثوس", "غلاطية", "أفسس",
      "فيلبي", "كولوسي", "تسالونيكي", "تيموثاوس", "تيطس", "فليمون", "العبرانيين", "يعقوب",
      "بطرس", "يهوذا", "رسالة", "إنجيل",
    ].some((k) => bookName.includes(k));
  }, [bookName]);

  // Smooth scroll-driven progress: rAF + EMA easing toward target.
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.max(0, Math.min(100, (window.scrollY / max) * 100)) : 0;
      targetProgress.current = pct;
      if (rafRef.current == null) {
        const tick = () => {
          const diff = targetProgress.current - currentProgress.current;
          currentProgress.current += diff * 0.18; // smooth easing
          const done = Math.abs(diff) < 0.05;
          if (done) {
            currentProgress.current = targetProgress.current;
            setProgress(currentProgress.current);
            rafRef.current = null;
            return;
          }
          setProgress(currentProgress.current);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [book, chapter]);

  // Track currently visible verse and auto-highlight it (immersive auto-scroll focus).
  useEffect(() => {
    if (!verses.data?.length) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-verse-num]"),
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const n = Number((visible.target as HTMLElement).dataset.verseNum);
          if (n) {
            visibleVerseRef.current = n;
            const id = verseKey(book, ch, n);
            setActiveVerse((cur) => (cur === id ? cur : id));
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [verses.data, book, ch]);

  // Persist reading session (throttled) + restore scroll on first load.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (!verses.data?.length) return;
    if (restoredRef.current) return;
    restoredRef.current = true;
    // Restore scroll if the saved session matches this book/chapter
    try {
      const raw = localStorage.getItem("ab:reading:current");
      if (raw) {
        const s = JSON.parse(raw) as { book: string; chapter: number; scrollY: number };
        if (s && s.book === book && s.chapter === ch && s.scrollY > 0) {
          requestAnimationFrame(() => window.scrollTo(0, s.scrollY));
        }
      }
    } catch {
      /* ignore */
    }
  }, [verses.data, book, ch]);

  useEffect(() => {
    if (!verses.data?.length) return;
    const save = () => {
      const now = Date.now();
      if (now - lastSavedAt.current < 1200) return;
      lastSavedAt.current = now;
      updateSession({
        book,
        bookName,
        chapter: ch,
        verse: visibleVerseRef.current,
        progressPercent: targetProgress.current,
        scrollY: window.scrollY,
        lastOpenedAt: now,
      });
    };
    save();
    const onScroll = () => save();
    const onHide = () => {
      lastSavedAt.current = 0;
      save();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      onHide();
    };
  }, [verses.data, book, bookName, ch]);

  // Palette
  const bgClass = spiritualMode
    ? "bg-[#0b1830] text-[#e8e2cf]"
    : "bg-[#f8efdc] text-[#3a2a18]";
  const surfaceClass = spiritualMode
    ? "bg-[#11223a]/60 border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_22px_-16px_rgba(0,0,0,0.7)]"
    : "bg-white/70 border-[#efe2c4]";
  const verseCardClass = spiritualMode
    ? "bg-[#11223a]/55 border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_6px_18px_-14px_rgba(0,0,0,0.6)]"
    : "bg-white/65 border-[#efe2c4]/80 shadow-[0_6px_18px_-14px_rgba(120,80,30,0.30)]";

  const totalVerses = verses.data?.length ?? 0;

  // Keep the bottom dock always visible for stable navigation.
  const chromeHidden = false;


  return (
    <main
      dir="rtl"
      className={cn(
        "relative min-h-screen w-full overflow-x-hidden transition-colors duration-500",
        bgClass,
      )}
    >
      {/* Soft cloud atmosphere — light mode parchment haze */}
      {!spiritualMode && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(80% 40% at 50% -5%, rgba(255,240,205,0.55), transparent 70%)," +
              "radial-gradient(60% 35% at 15% 25%, rgba(255,230,180,0.32), transparent 75%)," +
              "radial-gradient(55% 35% at 85% 60%, rgba(214,168,98,0.16), transparent 75%)," +
              "radial-gradient(90% 40% at 50% 105%, rgba(168,120,42,0.10), transparent 70%)",
          }}
        />
      )}

      {/* Cinematic dark cloud atmosphere — layered navy haze + soft spiritual bloom */}
      {spiritualMode && (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background:
                "radial-gradient(70% 45% at 50% -5%, rgba(231,201,122,0.13), transparent 70%)," +
                "radial-gradient(55% 40% at 85% 25%, rgba(140,110,210,0.09), transparent 75%)," +
                "radial-gradient(70% 45% at 15% 80%, rgba(62,180,130,0.08), transparent 80%)," +
                "radial-gradient(60% 35% at 50% 50%, rgba(110,160,220,0.05), transparent 75%)," +
                "radial-gradient(120% 70% at 50% 110%, rgba(0,0,0,0.65), transparent 65%)",
            }}
          />
          {/* drifting cloud diffusion layer */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 mix-blend-screen opacity-[0.18] animate-[abFog_28s_ease-in-out_infinite_alternate]"
            style={{
              background:
                "radial-gradient(40% 30% at 30% 40%, rgba(180,200,230,0.35), transparent 70%)," +
                "radial-gradient(35% 25% at 70% 65%, rgba(160,180,220,0.30), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </>
      )}

      {/* Top thin progress */}
      <div
        className="fixed inset-x-0 top-0 z-40 h-[2px]"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      >
        <div className="mx-auto h-full w-full max-w-[640px]">
          <div
            className={cn(
              "h-full rounded-r-full bg-gradient-to-l from-[#3e8a6e] via-[#2f7359] to-[#1f5e4a]",
              spiritualMode && "shadow-[0_0_10px_rgba(62,138,110,0.55)]",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* LEFT — elegant vertical reading rail */}
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
            <BackButton compact tone={spiritualMode ? "dark" : "light"} />
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
              {bookName} <span className="opacity-60">·</span> {chapter}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <ToolbarBtn label="بحث" surfaceClass={surfaceClass}>
              <Search className="h-4 w-4" />
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
          <p className="text-[11px] font-bold tabular-nums opacity-80">
            {totalVerses ? `${totalVerses} آية` : ""}
          </p>
        </div>

        {/* Loading / error */}
        {verses.isLoading && <VerseSkeleton count={6} />}
        {verses.error && (
          <p className="mt-12 text-center text-[12px] text-red-500">
            تعذّر التحميل: {(verses.error as Error)?.message ?? "خطأ غير معروف"}
          </p>
        )}

        {!verses.isLoading && !verses.error && totalVerses > 0 && (
          <article
            ref={articleRef}
            className={cn(
              "mt-5 font-arabic-serif tracking-[0.2px] transition-[font-size,line-height] duration-200 space-y-3.5",
              spiritualMode ? "text-[#f3e6c4]" : "text-[#3a2a18]",
            )}
            style={{ fontSize: `${fontSize}px`, lineHeight, wordSpacing: "0.06em" }}
          >
            {verses.data!.map((v, i) => {
              const num = v?.verse_number ?? i + 1;
              const id = verseKey(book, ch, num);
              const isActive = activeVerse === id;
              const saved = isSaved(id);
              const showRef = i > 0 && i % 7 === 3;
              return (
                <VerseCard
                  key={id}
                  num={num}
                  text={v?.verse_text ?? ""}
                  isActive={isActive}
                  saved={saved}
                  spiritualMode={spiritualMode}
                  surfaceClass={verseCardClass}
                  onTap={() => setActiveVerse(id)}
                  onToggleSave={() =>
                    toggleSaved({
                      book,
                      bookName,
                      chapter: ch,
                      verse: num,
                      text: v?.verse_text ?? "",
                    })
                  }
                  onSelectWord={(w, k) => setSheet(GLOSSARY[w] ?? { word: w, kind: k })}
                  showRef={showRef}
                  onOpenRef={() =>
                    setSheet({
                      word: `${bookName} ${ch}:${num}`,
                      kind: "مراجع متقاطعة",
                      relatedVerses: [
                        { reference: "مزمور 23:1", text: "الرب راعيّ فلا يعوزني شيء." },
                        { reference: "يوحنا 14:6", text: "أنا هو الطريق والحق والحياة." },
                      ],
                    })
                  }
                />
              );
            })}
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

      {/* Typography sheet */}
      {typeOpen && (
        <TypographySheet
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          readingWidth={readingWidth}
          setReadingWidth={setReadingWidth}
          onReset={resetPrefs}
          onClose={() => setTypeOpen(false)}
          spiritualMode={spiritualMode}
        />
      )}

      {/* Auto-scroll above the dock — manages its own 5s visibility overlay */}
      <AutoScrollControls
        spiritualMode={spiritualMode}
        onToggleSpiritual={() => setSpiritualMode((s) => !s)}
        bottomClass="bottom-[96px]"
      />

      {/* Persistent global navigation */}
      <BottomDock hidden={chromeHidden} />

      <MeaningSheet data={sheet} onClose={() => setSheet(null)} />
    </main>
  );
}

/* ---------------- Verse Card ---------------- */

function VerseCard({
  num,
  text,
  isActive,
  saved,
  spiritualMode,
  surfaceClass,
  onTap,
  onToggleSave,
  onSelectWord,
  showRef,
  onOpenRef,
}: {
  num: number;
  text: string;
  isActive: boolean;
  saved: boolean;
  spiritualMode: boolean;
  surfaceClass: string;
  onTap: () => void;
  onToggleSave: () => void;
  onSelectWord: (w: string, k?: string) => void;
  showRef: boolean;
  onOpenRef: () => void;
}) {
  return (
    <div
      data-verse-num={num}
      onClick={onTap}
      className={cn(
        "group relative cursor-pointer rounded-2xl border px-3.5 py-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        surfaceClass,
        isActive && (spiritualMode
          ? "scale-[1.015] border-[#7af0b8]/35 ring-1 ring-[#7af0b8]/30 shadow-[0_0_28px_-4px_rgba(122,240,184,0.40),0_0_60px_-20px_rgba(62,180,130,0.45)]"
          : "scale-[1.012] ring-1 ring-[#3eb482]/45 shadow-[0_10px_24px_-14px_rgba(31,110,84,0.45)]"),
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "shrink-0 mt-0.5 min-w-[18px] text-center text-[15px] font-extrabold tabular-nums font-arabic-serif leading-none pt-[2px]",
            spiritualMode ? "text-[#f0d78c]" : "text-[#a87a35]",
          )}
        >
          {num}
        </span>
        <p className="flex-1 min-w-0">
          {renderVerse(text, onSelectWord)}
          {showRef && <ReferenceIndicator count={2} onClick={(e?: any) => { e?.stopPropagation?.(); onOpenRef(); }} />}
        </p>
        <button
          type="button"
          aria-label={saved ? "إزالة من المحفوظات" : "حفظ الآية"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={cn(
            "shrink-0 grid h-7 w-7 place-items-center rounded-full border transition-all active:scale-90",
            saved
              ? spiritualMode
                ? "bg-[#e7c97a]/20 border-[#e7c97a]/45 text-[#f0d78c]"
                : "bg-gradient-to-br from-[#fff1c7] to-[#e7c07a] border-transparent text-[#7a4a26]"
              : spiritualMode
                ? "bg-white/5 border-white/10 text-[#c79356] opacity-70 group-hover:opacity-100"
                : "bg-white/70 border-[#efe2c4] text-[#b8893a] opacity-70 group-hover:opacity-100",
          )}
        >
          {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
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
  // sparse markers: first, last, current
  const markers = useMemo(() => {
    if (!chapters.length) return [] as number[];
    const set = new Set<number>([chapters[0], chapters[chapters.length - 1], current]);
    return chapters.filter((c) => set.has(c));
  }, [chapters, current]);

  return (
    <div
      className="fixed left-2 top-1/2 z-30 -translate-y-1/2 select-none"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      aria-hidden
    >
      <div
        className={cn(
          "relative rounded-full border backdrop-blur-xl px-1 py-3",
          spiritualMode
            ? "bg-[#0a1626]/45 border-[#3eb482]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_18px_-6px_rgba(62,180,130,0.35)]"
            : "bg-white/55 border-white/70 shadow-[0_8px_18px_-14px_rgba(31,94,74,0.30),inset_0_1px_0_rgba(255,255,255,0.85)]",
        )}
      >
        {/* tall ultra-thin rail (~70vh) */}
        <div
          className={cn(
            "relative w-[2px] rounded-full overflow-visible mx-auto",
            spiritualMode ? "bg-white/10" : "bg-[#1f5e4a]/12",
          )}
          style={{ height: "min(70vh, 520px)" }}
        >
          {/* neon green filled progress */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 rounded-full transition-[height] duration-200 ease-out",
              spiritualMode
                ? "bg-gradient-to-b from-[#7af0b8] via-[#3eb482] to-[#1f8a64] shadow-[0_0_8px_rgba(62,180,130,0.7)]"
                : "bg-gradient-to-b from-[#3eb482] to-[#1f6e54]",
            )}
            style={{ height: `${Math.max(0, Math.min(100, progress))}%` }}
          />

          {/* sparse markers */}
          {markers.map((c) => {
            const i = chapters.indexOf(c);
            const top = chapters.length > 1 ? (i / (chapters.length - 1)) * 100 : 0;
            const active = c === current;
            if (active) return null;
            return (
              <Link
                key={c}
                to="/$book/$chapter"
                params={{ book, chapter: String(c) }}
                aria-label={`الإصحاح ${c}`}
                className="absolute -translate-x-1/2 left-1/2"
                style={{ top: `${top}%` }}
              >
                <span
                  className={cn(
                    "block h-[3px] w-[3px] rounded-full",
                    spiritualMode ? "bg-white/40" : "bg-[#1f5e4a]/30",
                  )}
                />
              </Link>
            );
          })}

          {/* active reading position — neon green dot */}
          <div
            className="absolute -translate-x-1/2 left-1/2 transition-[top] duration-200 ease-out"
            style={{ top: `${Math.max(0, Math.min(100, progress))}%` }}
          >
            <span
              className={cn(
                "block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#7af0b8] to-[#1f8a64]",
                spiritualMode
                  ? "shadow-[0_0_14px_rgba(122,240,184,0.95),0_0_28px_rgba(62,180,130,0.55)] ring-1 ring-[#7af0b8]/55"
                  : "shadow-[0_0_8px_rgba(62,138,110,0.55)] ring-2 ring-white/80",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Typography Sheet ---------------- */

function TypographySheet({
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  readingWidth,
  setReadingWidth,
  onReset,
  onClose,
  spiritualMode,
}: {
  fontSize: number;
  setFontSize: (n: number) => void;
  lineHeight: number;
  setLineHeight: (n: number) => void;
  readingWidth: number;
  setReadingWidth: (n: number) => void;
  onReset: () => void;
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
          "fixed left-1/2 -translate-x-1/2 z-50 w-[min(92vw,340px)] rounded-3xl border p-3 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-300",
          "bottom-[150px]",
          spiritualMode
            ? "bg-[#0b1a2c]/55 border-[#e7c97a]/22 text-[#e8e2cf] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85),0_0_28px_-10px_rgba(231,201,122,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "bg-white/55 border-white/70 text-[#3a2a18] shadow-[0_20px_50px_-18px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]",
        )}
        role="dialog"
        aria-label="إعدادات النص"
      >
        <div className="flex items-center justify-between mb-2 px-0.5">
          <p className="text-[11.5px] font-extrabold tracking-wide opacity-90">إعدادات القراءة</p>
          <button
            type="button"
            onClick={onReset}
            aria-label="إعادة ضبط"
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold active:scale-95 transition-transform",
              spiritualMode
                ? "bg-white/5 border-white/10 text-[#f3e6c4]"
                : "bg-white/70 border-[#efe2c4] text-[#3a2a18]",
            )}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            ضبط
          </button>
        </div>

        <SliderRow
          label="حجم الخط"
          value={fontSize}
          min={14}
          max={28}
          step={1}
          onChange={setFontSize}
          display={`${fontSize}px`}
          spiritualMode={spiritualMode}
        />
        <SliderRow
          label="السطور"
          value={lineHeight}
          min={1.6}
          max={2.8}
          step={0.05}
          onChange={(v) => setLineHeight(+v.toFixed(2))}
          display={lineHeight.toFixed(2)}
          spiritualMode={spiritualMode}
        />
        <SliderRow
          label="العرض"
          value={readingWidth}
          min={420}
          max={800}
          step={20}
          onChange={setReadingWidth}
          display={`${readingWidth}px`}
          spiritualMode={spiritualMode}
        />
      </div>
    </>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  spiritualMode,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  display: string;
  spiritualMode: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-2 rounded-2xl border px-2.5 py-1.5",
        spiritualMode
          ? "bg-white/[0.04] border-white/[0.08]"
          : "bg-white/55 border-[#efe2c4]",
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-bold opacity-80">{label}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="تقليل"
            onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
            className={cn(
              "grid h-5 w-5 place-items-center rounded-full border active:scale-90 transition-transform",
              spiritualMode ? "bg-white/10 border-white/15 text-[#f3e6c4]" : "bg-white/80 border-[#efe2c4] text-[#3a2a18]",
            )}
          >
            <ChevronDown className="h-2.5 w-2.5" />
          </button>
          <span className="min-w-[40px] text-center text-[10.5px] font-bold tabular-nums">
            {display}
          </span>
          <button
            type="button"
            aria-label="زيادة"
            onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
            className={cn(
              "grid h-5 w-5 place-items-center rounded-full border active:scale-90 transition-transform",
              spiritualMode ? "bg-white/10 border-white/15 text-[#f3e6c4]" : "bg-white/80 border-[#efe2c4] text-[#3a2a18]",
            )}
          >
            <ChevronUp className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="w-full h-1 accent-[#3eb482]"
      />
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
