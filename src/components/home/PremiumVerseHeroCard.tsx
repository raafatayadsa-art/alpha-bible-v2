import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CopticCross } from "@/components/coptic";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";
import { parseVerseReference } from "@/lib/bible-labels";
import { resolveBibleRouteBookParam } from "@/lib/bible-book-names";
import { chapterVerseHighlightSearch } from "@/lib/chapter-verse-highlight";
import { useSavedVerses, verseKey } from "@/lib/reading-state";
import {
  HeroCardTopBar,
  HeroSpiritLedgerRow,
  readHeroMap,
  readHeroSet,
  seedHeroCount,
  writeHeroMap,
  writeHeroSet,
} from "./hero-card-chrome";
import { navigateHeroCard, resolveHeroVerseLink } from "./hero-stack-data";
import { fetchTodaysDailyVerse } from "@/lib/daily-verse";
import artVerse from "@/assets/home/art-verse.jpg";

const VERSE_ACCENT = "#e7c97a";

type VerseData = {
  text: string;
  reference: string;
  bookRoute?: string;
  chapter?: number;
  verse?: number;
};

const LIKE_KEY = "alpha.verse-day.likes";
const SHARE_KEY = "alpha.verse-day.shares";
const LIKED_KEY = "alpha.verse-day.liked";

function engagementId(reference: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `${day}::${reference}`;
}

export type VerseSharePayload = {
  title: string;
  body: string;
  meta?: string;
  imageSrc: string;
  accent: string;
};

type PremiumVerseHeroCardProps = {
  linkTo?: string;
  onBrandedShare?: (payload: VerseSharePayload) => void;
  variant?: "front" | "peek";
};

export function PremiumVerseHeroCard({
  linkTo = "/bible",
  onBrandedShare,
  variant = "front",
}: PremiumVerseHeroCardProps) {
  const navigate = useNavigate();
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [meditations, setMeditations] = useState(0);
  const [broadcasts, setBroadcasts] = useState(0);
  const [meditated, setMeditated] = useState(false);
  const { isSaved, toggle } = useSavedVerses();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const daily = await fetchTodaysDailyVerse();
        if (!cancelled && daily) {
          setVerse({
            text: daily.text,
            reference: daily.reference,
            bookRoute: daily.bookRoute,
            chapter: daily.chapter,
            verse: daily.verse,
          });
          return;
        }
      } catch {
        /* fallback below */
      }

      try {
        const { data: bv } = await supabase
          .from("bible_verses")
          .select("book_name,chapter_number,verse_number,verse_text")
          .eq("book_name", "سفر المزامير")
          .eq("chapter_number", 46)
          .eq("verse_number", 1)
          .maybeSingle();
        if (!cancelled && bv) {
          const row = bv as {
            book_name: string;
            chapter_number: number;
            verse_number: number;
            verse_text: string;
          };
          setVerse({
            text: row.verse_text,
            reference: `مزامير ${row.chapter_number}:${row.verse_number}`,
            bookRoute: row.book_name,
            chapter: row.chapter_number,
            verse: row.verse_number,
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const body = verse?.text ?? "رَبَّنَا هُوَ مَلْجَأنَا وَقُوَّتَنَا، عَوْنًا فِي الضِّيقَاتِ جِدًّا.";
  const ref = verse?.reference || "مزامير 46:1";
  const eid = useMemo(() => engagementId(ref), [ref]);

  useEffect(() => {
    const likeMap = readHeroMap(LIKE_KEY);
    const shareMap = readHeroMap(SHARE_KEY);
    const likedSet = readHeroSet(LIKED_KEY);
    setMeditations((likeMap[eid] ?? 0) + seedHeroCount(ref, 7));
    setBroadcasts((shareMap[eid] ?? 0) + seedHeroCount(ref, 13));
    setMeditated(likedSet.has(eid));
  }, [eid, ref]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const parsed = parseVerseReference(ref);
  const readerBook = verse?.bookRoute ?? (parsed ? resolveBibleRouteBookParam(parsed.book) : undefined);
  const readerChapter = verse?.chapter ?? parsed?.chapter;
  const readerVerse = verse?.verse ?? parsed?.verse;
  const saveId = parsed ? verseKey(readerBook ?? parsed.book, parsed.chapter, parsed.verse) : `verse-day:${ref}`;
  const saved = isSaved(saveId);

  const sharePayload: VerseSharePayload = useMemo(
    () => ({ title: "آية اليوم", body, meta: ref, imageSrc: artVerse, accent: VERSE_ACCENT }),
    [body, ref],
  );

  const onToggleSaved = useCallback(() => {
    if (!parsed || !readerBook) {
      setToast("تعذّر حفظ الآية — مرجع غير واضح");
      return;
    }
    toggle({
      book: readerBook,
      bookName: readerBook,
      chapter: parsed.chapter,
      verse: parsed.verse,
      text: body,
      id: saveId,
    });
    setToast(saved ? "تمت إزالة الآية" : "تم حفظ الآية");
  }, [parsed, toggle, body, saveId, saved, readerBook]);

  const onToggleMeditation = useCallback(() => {
    const likeMap = readHeroMap(LIKE_KEY);
    const likedSet = readHeroSet(LIKED_KEY);
    const base = seedHeroCount(ref, 7);
    if (meditated) {
      likeMap[eid] = Math.max(0, (likeMap[eid] ?? 0) - 1);
      likedSet.delete(eid);
      setMeditated(false);
      setMeditations(base + (likeMap[eid] ?? 0));
    } else {
      likeMap[eid] = (likeMap[eid] ?? 0) + 1;
      likedSet.add(eid);
      setMeditated(true);
      setMeditations(base + likeMap[eid]);
    }
    writeHeroMap(LIKE_KEY, likeMap);
    writeHeroSet(LIKED_KEY, likedSet);
  }, [meditated, eid, ref]);

  const onShare = useCallback(() => {
    const shareMap = readHeroMap(SHARE_KEY);
    const base = seedHeroCount(ref, 13);
    shareMap[eid] = (shareMap[eid] ?? 0) + 1;
    writeHeroMap(SHARE_KEY, shareMap);
    setBroadcasts(base + shareMap[eid]);

    if (onBrandedShare) {
      onBrandedShare(sharePayload);
      return;
    }
    openAlphaShareSheet(sharePayload);
  }, [eid, onBrandedShare, sharePayload, ref]);

  const isPeek = variant === "peek";
  const isFront = variant === "front";
  const cardHeight = isPeek ? 228 : 268;

  const onOpenVerse = useCallback(() => {
    if (!isFront) return;
    if (readerBook && readerChapter && readerVerse) {
      void navigate({
        to: "/$book/$chapter",
        params: { book: readerBook, chapter: String(readerChapter) },
        search: chapterVerseHighlightSearch(readerVerse),
      });
      return;
    }
    navigateHeroCard(navigate, resolveHeroVerseLink(ref, { to: "/bible" }));
  }, [isFront, navigate, readerBook, readerChapter, readerVerse, ref]);

  return (
    <div className="relative">
      <article
        role={linkTo && variant === "front" ? "button" : undefined}
        tabIndex={linkTo && variant === "front" ? 0 : undefined}
        onClick={(e) => {
          if (isPeek) return;
          if ((e.target as HTMLElement).closest("button, [data-hero-ledger='broadcast']")) return;
          onOpenVerse();
        }}
        onKeyDown={(e) => {
          if (isPeek || !linkTo) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenVerse();
          }
        }}
        aria-label={linkTo && variant === "front" ? "آية اليوم — افتح الكتاب المقدس" : "آية اليوم"}
        className={`relative w-full overflow-hidden rounded-[26px] border ${linkTo && variant === "front" ? "cursor-pointer" : ""}`}
        style={{
          height: cardHeight,
          borderRadius: isPeek ? 22 : 26,
          borderColor: "rgba(231,201,122,0.42)",
          background: "#07040f",
          boxShadow: isPeek
            ? "0 16px 36px -14px rgba(0,0,0,0.5)"
            : "0 24px 48px -14px rgba(0,0,0,0.72), 0 0 0 1px rgba(231,201,122,0.14), 0 0 36px rgba(231,201,122,0.1)",
        }}
      >
        <img
          src={artVerse}
          alt=""
          draggable={false}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.02) 32%, rgba(0,0,0,0.08) 58%, rgba(0,0,0,0.78) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[25px]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 32px rgba(231,201,122,0.08)" }}
        />

        <HeroCardTopBar
          badge="آية اليوم"
          accent={VERSE_ACCENT}
          saved={saved}
          compact={isPeek}
          hideShare
          saveLabel={saved ? "إزالة الحفظ" : "حفظ الآية"}
          onToggleSave={onToggleSaved}
        />

        <div className={`absolute inset-x-0 bottom-0 z-10 px-4 ${isPeek ? "pb-3 pt-12" : "pb-3 pt-14"}`}>
          <p
            className={`font-arabic-serif text-right font-bold text-white line-clamp-3 ${
              isPeek ? "text-[13px] leading-[1.65]" : "text-[17.5px] leading-[1.68]"
            }`}
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.9)" }}
          >
            {body}
          </p>

          {!isPeek ? (
          <>
          <div className="mt-1.5 flex items-center justify-end gap-2">
            <span aria-hidden className="h-px flex-1 max-w-[40px] bg-gradient-to-l from-[#e7c97a]/60 to-transparent" />
            <p className="text-[11px] font-extrabold tracking-wide" style={{ color: VERSE_ACCENT }}>
              {ref}
            </p>
            <CopticCross size={8} className="text-[#e7c97a]/70" />
          </div>

          <HeroSpiritLedgerRow
            accent={VERSE_ACCENT}
            meditations={meditations}
            broadcasts={broadcasts}
            meditated={meditated}
            onMeditate={onToggleMeditation}
            onBroadcast={() => void onShare()}
          />
          </>
          ) : (
            <p className="mt-1 text-right text-[10px] font-extrabold" style={{ color: VERSE_ACCENT }}>
              {ref}
            </p>
          )}
        </div>
      </article>

      {toast ? (
        <p className="absolute -bottom-7 inset-x-0 text-center text-[11px] font-bold text-[#7a4a26] animate-in fade-in">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
