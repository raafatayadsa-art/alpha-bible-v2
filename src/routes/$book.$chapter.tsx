import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Menu, Search } from "lucide-react";
import { chaptersQueryOptions, versesQueryOptions } from "@/lib/bible";
import { displayName } from "@/lib/bible-books";
import {
  AutoScrollControls,
  BackButton,
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

// Demo glossary — replaced with real data later.
const GLOSSARY: Record<string, MeaningSheetData> = {
  "الله": {
    word: "الله",
    kind: "اسم إلهي",
    meaning: "الإله الواحد، خالق السموات والأرض.",
    origin: "أصل سامي مشترك يدل على الإله الأعلى.",
    firstAppearance: "تكوين 1:1",
    spiritualRole: "محور الكتاب المقدس كله، مصدر الحياة والخلاص.",
  },
  "يسوع": {
    word: "يسوع",
    kind: "شخصية",
    meaning: "الذي يخلّص شعبه من خطاياهم.",
    origin: "من العبرية ‹يَهوشُع›: الرب يخلّص.",
    firstAppearance: "متى 1:21",
    spiritualRole: "المسيح المخلّص، الكلمة المتجسد.",
    relatedPeople: [
      { name: "مريم العذراء", role: "والدته" },
      { name: "يوحنا المعمدان", role: "السابق" },
    ],
  },
  "أورشليم": {
    word: "أورشليم",
    kind: "مكان",
    meaning: "مدينة السلام، عاصمة الإيمان.",
    firstAppearance: "يشوع 10:1",
    mapLabel: "أورشليم — يهوذا",
    timeline: [
      { year: "~1000 ق.م", event: "داود يجعلها عاصمة المملكة." },
      { year: "33 م", event: "صلب وقيامة المسيح." },
    ],
  },
};

const HIGHLIGHT_WORDS = Object.keys(GLOSSARY);

function ScriptureReader() {
  const { book, chapter } = Route.useParams();
  const ch = Number(chapter);
  const verses = useQuery(versesQueryOptions(book, ch));
  const chapters = useQuery(chaptersQueryOptions(book));

  const [saved, setSaved] = useState(false);
  const [spiritualMode, setSpiritualMode] = useState(false);
  const [sheet, setSheet] = useState<MeaningSheetData | null>(null);
  const [progress, setProgress] = useState(0);
  const articleRef = useRef<HTMLElement>(null);

  const list = chapters.data ?? [];
  const idx = list.indexOf(ch);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const isNT = useMemo(() => {
    const name = displayName(book);
    return (
      ["متى", "مرقس", "لوقا", "يوحنا", "أعمال", "رؤيا", "رومية", "كورنثوس", "غلاطية", "أفسس",
       "فيلبي", "كولوسي", "تسالونيكي", "تيموثاوس", "تيطس", "فليمون", "العبرانيين", "يعقوب",
       "بطرس", "يهوذا", "رسالة", "إنجيل"]
        .some((k) => name.includes(k))
    );
  }, [book]);

  // Top progress bar driven by scroll position.
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

  const bgClass = spiritualMode
    ? "bg-[#1a1410] text-[#f3e6c4]"
    : "bg-[#f8efdc] text-[#3a2a18]";
  const surfaceClass = spiritualMode
    ? "bg-white/[0.04] border-white/10"
    : "bg-white/70 border-[#efe2c4]";

  return (
    <main dir="rtl" className={cn("relative min-h-screen w-full overflow-x-hidden transition-colors duration-500", bgClass)}>
      {/* Top thin progress bar */}
      <div
        className="fixed inset-x-0 top-0 z-40 h-[3px]"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      >
        <div className="mx-auto h-full w-full max-w-[640px]">
          <div className="h-full w-full bg-transparent">
            <div
              className="h-full rounded-r-full bg-gradient-to-l from-[#e7c97a] via-[#c79356] to-[#7a4a26] transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[640px] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-40">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 pt-3">
          <BackButton />
          <div className="text-center min-w-0">
            <p className={cn("text-[10px] font-bold tracking-wider", spiritualMode ? "text-[#c79356]" : "text-[#b8893a]")}>
              {isNT ? "العهد الجديد" : "العهد القديم"}
            </p>
            <h1 className={cn("font-arabic-serif text-[17px] font-bold truncate", spiritualMode ? "text-[#f3e6c4]" : "text-[#3a2a18]")}>
              {displayName(book)} <span className="opacity-60">·</span> {chapter}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="بحث"
              className={cn("grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-transform", surfaceClass)}
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={saved ? "إزالة من المحفوظات" : "حفظ"}
              onClick={() => setSaved((s) => !s)}
              className={cn("grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-transform", surfaceClass)}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="القائمة"
              className={cn("grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-transform", surfaceClass)}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Reading status */}
        <div
          className={cn(
            "mt-4 flex items-center justify-between rounded-2xl border px-3 py-2",
            surfaceClass,
          )}
        >
          <p className="text-[11px] font-bold opacity-80">
            الإصحاح {ch}{list.length ? ` من ${list.length}` : ""}
          </p>
          <p className="text-[11px] font-bold tabular-nums opacity-80">
            {(verses.data?.length ?? 0)} آية
          </p>
        </div>

        {/* Verses */}
        {verses.isLoading && (
          <p className="mt-12 text-center text-[12px] opacity-70">جاري تحميل الآيات...</p>
        )}
        {verses.error && (
          <p className="mt-12 text-center text-[12px] text-red-500">
            تعذّر التحميل: {(verses.error as Error)?.message ?? "خطأ غير معروف"}
          </p>
        )}
        {!verses.isLoading && !verses.error && (verses.data?.length ?? 0) === 0 && (
          <p className="mt-12 text-center text-[12px] opacity-70">لا توجد آيات</p>
        )}

        {(verses.data?.length ?? 0) > 0 && (
          <article
            ref={articleRef}
            className={cn(
              "mt-6 font-arabic-serif text-[19px] leading-[2.15] tracking-[0.2px]",
              spiritualMode ? "text-[#f3e6c4]" : "text-[#3a2a18]",
            )}
            style={{ wordSpacing: "0.06em" }}
          >
            {verses.data?.map((v, i) => {
              const id = v?.ID ?? `${ch}-${v?.verse_number ?? i}`;
              const showRef = i > 0 && i % 7 === 3; // sparse cross-refs
              return (
                <p key={id} className="mb-3.5">
                  <span
                    className={cn(
                      "me-1 inline-block min-w-[1.4em] text-[10.5px] font-bold align-super tabular-nums",
                      spiritualMode ? "text-[#c79356]" : "text-[#b8893a]",
                    )}
                  >
                    {v?.verse_number ?? ""}
                  </span>
                  {renderVerse(v?.verse_text ?? "", (w, kind) =>
                    setSheet(GLOSSARY[w] ?? { word: w, kind })
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
          </article>
        )}

        {/* Chapter nav */}
        <nav className={cn("mt-10 flex items-center justify-between border-t pt-5 text-[12px]", spiritualMode ? "border-white/10" : "border-[#efe2c4]")}>
          {prev ? (
            <Link
              to="/$book/$chapter"
              params={{ book, chapter: String(prev) }}
              className={cn("rounded-full border px-4 py-2 font-bold active:scale-95 transition-transform", surfaceClass)}
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
              className={cn("rounded-full border px-4 py-2 font-bold active:scale-95 transition-transform", surfaceClass)}
            >
              الإصحاح {next} ←
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      <AutoScrollControls
        spiritualMode={spiritualMode}
        onToggleSpiritual={() => setSpiritualMode((s) => !s)}
      />

      <MeaningSheet data={sheet} onClose={() => setSheet(null)} />
    </main>
  );
}

/** Tokenize verse text and wrap any glossary words in <HighlightedWord />. */
function renderVerse(text: string, onSelect: (w: string, kind?: string) => void): React.ReactNode {
  if (!text) return null;
  // Build a regex of glossary words (longest first).
  const words = [...HIGHLIGHT_WORDS].sort((a, b) => b.length - a.length);
  if (!words.length) return text;
  const pattern = new RegExp(`(${words.map((w) => escapeReg(w)).join("|")})`, "g");
  const parts = text.split(pattern);
  return parts.map((p, i) => {
    if (words.includes(p)) {
      const kind = p === "أورشليم" ? "place" : p === "يسوع" ? "person" : "concept";
      return (
        <HighlightedWord key={i} kind={kind as any} onSelect={() => onSelect(p, kind)}>
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
