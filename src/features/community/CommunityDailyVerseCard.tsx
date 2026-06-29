import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { CopticCross } from "@/components/coptic";
import { isAuthenticated } from "@/features/church/current-user";
import { getCachedMemberChurch } from "@/features/church/member-church-api";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";
import { parseVerseReference } from "@/lib/bible-labels";
import { resolveBibleRouteBookParam } from "@/lib/bible-book-names";
import { chapterVerseHighlightSearch } from "@/lib/chapter-verse-highlight";
import { fetchTodaysDailyVerse } from "@/lib/daily-verse";
import { shareToCommunity } from "./community-store";
import { COMMUNITY_HUB_PATH } from "./community-routes";
import artVerse from "@/assets/home/art-verse.jpg";

const VERSE_ACCENT = "var(--alpha-gold)";

export function CommunityDailyVerseCard() {
  const navigate = useNavigate();
  const [text, setText] = useState("أَنْتُمْ نُورُ الْعَالَمِ");
  const [reference, setReference] = useState("متى 5:14");
  const [bookRoute, setBookRoute] = useState<string | undefined>();
  const [chapter, setChapter] = useState<number | undefined>();
  const [verse, setVerse] = useState<number | undefined>();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const daily = await fetchTodaysDailyVerse();
        if (!cancelled && daily) {
          setText(daily.text);
          setReference(daily.reference);
          setBookRoute(daily.bookRoute);
          setChapter(daily.chapter);
          setVerse(daily.verse);
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const parsed = useMemo(() => parseVerseReference(reference), [reference]);
  const readerBook = bookRoute ?? (parsed ? resolveBibleRouteBookParam(parsed.book) : undefined);
  const readerChapter = chapter ?? parsed?.chapter;
  const readerVerse = verse ?? parsed?.verse;

  const sharePayload = useMemo(
    () => ({
      title: "آية اليوم",
      body: text,
      meta: reference,
      imageSrc: artVerse,
      accent: VERSE_ACCENT,
    }),
    [reference, text],
  );

  const openVerse = useCallback(() => {
    if (readerBook && readerChapter && readerVerse) {
      void navigate({
        to: "/$book/$chapter",
        params: { book: readerBook, chapter: String(readerChapter) },
        search: chapterVerseHighlightSearch(readerVerse),
      });
      return;
    }
    void navigate({ to: "/bible" });
  }, [navigate, readerBook, readerChapter, readerVerse]);

  const shareToCommunityFeed = useCallback(() => {
    if (parsed && readerBook && isAuthenticated()) {
      const church = getCachedMemberChurch();
      const moment = shareToCommunity(
        {
          kind: "reading",
          reading: {
            reference,
            text,
            bookRoute: readerBook,
            chapter: parsed.chapter,
            verse: parsed.verse,
          },
        },
        { churchId: church?.id, churchName: church?.name },
      );
      if (moment) toast.success("تمت المشاركة مع المجتمع");
    }
    void navigate({ to: COMMUNITY_HUB_PATH });
  }, [navigate, parsed, readerBook, reference, text]);

  return (
    <article
      className="alpha-home-daily-card relative h-[168px] w-full cursor-pointer overflow-hidden border active:scale-[0.995] transition-transform"
      style={{
        borderRadius: "var(--alpha-radius-card)",
        borderColor: "color-mix(in srgb, var(--alpha-gold) 42%, transparent)",
        boxShadow: "var(--alpha-shadow-hero)",
      }}
      onClick={openVerse}
      role="button"
      tabIndex={0}
      aria-label="آية اليوم — افتح في الكتاب المقدس"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openVerse();
        }
      }}
    >
      <img
        src={artVerse}
        alt=""
        draggable={false}
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover object-[center_32%] alpha-media-polish"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.72) 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 pt-3">
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md"
          style={{ borderColor: `${VERSE_ACCENT}66`, background: "rgba(0,0,0,0.35)" }}
        >
          <CopticCross size={10} className="text-[#f0d78c]" />
          آية اليوم
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="مشاركة على مجتمعي"
            onClick={(e) => {
              e.stopPropagation();
              shareToCommunityFeed();
            }}
            className="rounded-full border border-[#1f8a5a]/45 bg-[#1f8a5a]/20 px-2.5 py-1 text-[10px] font-extrabold text-[#8ef0b8] backdrop-blur-md active:scale-95"
          >
            مجتمعي
          </button>
          <button
            type="button"
            aria-label="مشاركة"
            onClick={(e) => {
              e.stopPropagation();
              openAlphaShareSheet(sharePayload);
            }}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md active:scale-95"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-3.5 pt-10 text-right">
        <p
          className="font-arabic-serif text-[15px] font-bold leading-[1.65] text-white line-clamp-2"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.85)" }}
        >
          {text}
        </p>
        <p className="mt-1 text-[11px] font-extrabold" style={{ color: VERSE_ACCENT }}>
          {reference}
        </p>
      </div>
    </article>
  );
}
