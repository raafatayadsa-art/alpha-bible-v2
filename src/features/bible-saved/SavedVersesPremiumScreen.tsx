import { Link } from "@tanstack/react-router";
import { Bookmark, ChevronLeft, Share2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import artVerse from "@/assets/home/art-verse.jpg";
import controlCenterBg from "@/assets/control-center-bg.png";
import { BackButton } from "@/components/bible";
import { CopticCross, CopticMiniCross } from "@/components/coptic";
import { HeroBadgeEmblem, HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { BottomDock } from "@/components/bible/BottomDock";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";
import { displayName } from "@/lib/bible-books";
import { useSavedVerses, type SavedVerse } from "@/lib/reading-state";
import { formatSavedAgo, SAVED_VAULT } from "./saved-vault-tokens";
import { chapterVerseHighlightSearch } from "@/lib/chapter-verse-highlight";

function SavedVaultStyles() {
  return (
    <style>{`
      @keyframes savedVaultGlyphGlow {
        0%, 100% {
          opacity: 0.22;
          filter: drop-shadow(0 0 4px rgba(231,201,122,0.35));
        }
        50% {
          opacity: 0.55;
          filter: drop-shadow(0 0 10px rgba(240,215,140,0.65));
        }
      }
      @keyframes savedVaultHeroPulse {
        0%, 100% { box-shadow: 0 0 0 1px rgba(231,201,122,0.15), 0 0 32px rgba(110,181,240,0.08); }
        50% { box-shadow: 0 0 0 1px rgba(231,201,122,0.35), 0 0 48px rgba(231,201,122,0.18); }
      }
      @keyframes savedVaultCardIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .saved-vault-glyph {
        animation: savedVaultGlyphGlow 4.5s ease-in-out infinite;
      }
      .saved-vault-glyph--delay {
        animation-delay: 2.2s;
      }
      .saved-vault-hero {
        animation: savedVaultHeroPulse 3.6s ease-in-out infinite;
      }
      .saved-vault-card-in {
        animation: savedVaultCardIn 0.5s cubic-bezier(0.32, 0.72, 0, 1) both;
      }
    `}</style>
  );
}

function SavedVaultBackdrop() {
  const smallGlyphs: Array<{ g: string; top: string; delay: string; left?: string; right?: string }> = [
    { g: "Ⲁ", top: "8%", right: "6%", delay: "0s" },
    { g: "Ⲱ", top: "14%", left: "8%", delay: "1.1s" },
    { g: "ϯ", top: "22%", right: "22%", delay: "0.6s" },
    { g: "Ⲃ", top: "32%", left: "18%", delay: "1.8s" },
    { g: "Ⲅ", top: "42%", right: "10%", delay: "2.4s" },
    { g: "Ⲉ", top: "52%", left: "6%", delay: "0.3s" },
    { g: "Ⲁ", top: "58%", right: "28%", delay: "1.5s" },
    { g: "Ⲱ", top: "68%", left: "24%", delay: "2s" },
    { g: "ϯ", top: "74%", right: "14%", delay: "0.9s" },
    { g: "Ⲃ", top: "84%", left: "12%", delay: "1.3s" },
    { g: "Ⲅ", top: "88%", right: "32%", delay: "2.7s" },
    { g: "Ⲉ", top: "18%", left: "38%", delay: "1.9s" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <img
        src={controlCenterBg}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{
          opacity: 0.88,
          filter: "brightness(1.35) contrast(1.05) saturate(0.85)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,8,20,0.55) 0%, rgba(3,2,8,0.82) 42%, rgba(3,2,8,0.96) 100%)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-screen opacity-[0.16]"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% 18%, rgba(231,201,122,0.5) 0%, transparent 62%)",
        }}
      />
      <SavedVaultStars />
      {smallGlyphs.map(({ g, top, left, right, delay }, i) => (
        <span
          key={`${g}-${i}`}
          className="saved-vault-glyph hero-ledger-glyph-gold absolute select-none font-black leading-none"
          style={{
            top,
            left,
            right,
            fontSize: "clamp(18px, 4.5vw, 32px)",
            animationDelay: delay,
          }}
        >
          {g}
        </span>
      ))}
    </div>
  );
}

function SavedVaultStars() {
  return (
    <>
      <span aria-hidden className="saved-vault-star pointer-events-none absolute left-[12%] top-[22%] h-1 w-1 rounded-full bg-[#f0d78c]" />
      <span aria-hidden className="saved-vault-star saved-vault-star--delay pointer-events-none absolute right-[18%] top-[28%] h-1.5 w-1.5 rounded-full bg-[#8fd4ff]" />
      <span aria-hidden className="saved-vault-star saved-vault-star--delay2 pointer-events-none absolute left-[28%] top-[55%] h-1 w-1 rounded-full bg-[#f0d78c]" />
      <span
        aria-hidden
        className="saved-vault-star pointer-events-none absolute right-[10%] top-[72%] h-1 w-1 rounded-full bg-[#e7c97a]/80"
        style={{ animationDelay: "0.8s" }}
      />
    </>
  );
}

function verseRefLabel(verse: SavedVerse) {
  return `${displayName(verse.bookName || verse.book)} ${verse.chapter}:${verse.verse}`;
}

function shareSavedVerse(verse: SavedVerse) {
  const refLabel = verseRefLabel(verse);
  openAlphaShareSheet({
    title: "آية محفوظة",
    body: verse.text || refLabel,
    meta: refLabel,
    imageSrc: artVerse,
    accent: SAVED_VAULT.gold,
  });
}

const VAULT_ACTION_BTN =
  "inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-[11px] font-bold transition active:scale-95";

const VAULT_STAT_CHIP =
  "flex min-h-[72px] min-w-[118px] flex-1 flex-col items-center justify-center rounded-2xl border px-5 py-3";

function SavedSpotlightCard({ verse, onRemove }: { verse: SavedVerse; onRemove: () => void }) {
  const refLabel = verseRefLabel(verse);

  const onShare = useCallback(() => shareSavedVerse(verse), [verse]);

  return (
    <section className="saved-vault-card-in mt-5 overflow-hidden rounded-[28px] border" style={{ borderColor: SAVED_VAULT.border }}>
      <div className="relative">
        <img
          src={artVerse}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.42) saturate(1.1)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,2,8,0.35) 0%, rgba(3,2,8,0.72) 55%, rgba(3,2,8,0.94) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(231,201,122,0.7) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 p-5 text-right">
          <div className="flex items-center justify-between gap-2">
            <span className="hero-ledger-glyph-gold text-[16px] font-black leading-none">Ⲁ</span>
            <p className="text-[11px] font-bold tracking-wide" style={{ color: SAVED_VAULT.gold }}>
              ✦ آخر كنز ✦
            </p>
          </div>

          <Link
            to="/$book/$chapter"
            params={{ book: verse.book, chapter: String(verse.chapter) }}
            search={chapterVerseHighlightSearch(verse.verse)}
            className="mt-3 block"
          >
            <div className="flex justify-end">
              <span
                className="inline-flex rounded-full border px-2.5 py-1 backdrop-blur-md"
                style={{ borderColor: `${SAVED_VAULT.gold}55`, background: "rgba(0,0,0,0.35)" }}
              >
                <HeroBadgeEmblem label={refLabel} />
              </span>
            </div>
            {verse.text ? (
              <p
                className="mt-3 font-arabic-serif text-[17px] font-semibold leading-[1.9] line-clamp-5"
                style={{ color: SAVED_VAULT.text }}
              >
                {verse.text}
              </p>
            ) : (
              <p className="mt-3 text-[13px]" style={{ color: SAVED_VAULT.textMuted }}>
                اضغط لفتح الإصحاح
              </p>
            )}
            <p className="mt-2 text-[10px]" style={{ color: SAVED_VAULT.textMuted }}>
              {formatSavedAgo(verse.savedAt)}
            </p>
          </Link>

          <div className="mt-4 flex flex-wrap items-center justify-start gap-2">
            <button
              type="button"
              aria-label={`مشاركة ${refLabel}`}
              onClick={onShare}
              className={VAULT_ACTION_BTN}
              style={{
                borderColor: "rgba(126,200,240,0.35)",
                background: "rgba(126,200,240,0.1)",
                color: "#8fd4ff",
              }}
            >
              <Share2 className="h-4 w-4" />
              شارك
            </button>
            <button
              type="button"
              aria-label={`إزالة ${refLabel} من المحفوظات`}
              onClick={onRemove}
              className={VAULT_ACTION_BTN}
              style={{
                borderColor: `${SAVED_VAULT.gold}44`,
                background: "rgba(231,201,122,0.08)",
                color: SAVED_VAULT.gold,
              }}
            >
              <Bookmark className="h-4 w-4 fill-current" />
              إزالة
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SavedBookFilters({
  books,
  active,
  onChange,
}: {
  books: string[];
  active: string | null;
  onChange: (book: string | null) => void;
}) {
  if (books.length < 2) return null;

  return (
    <div className="mt-5 -mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold transition active:scale-95"
          style={{
            borderColor: active === null ? `${SAVED_VAULT.gold}66` : "rgba(255,255,255,0.12)",
            background: active === null ? "rgba(231,201,122,0.14)" : "rgba(0,0,0,0.35)",
            color: active === null ? SAVED_VAULT.gold : SAVED_VAULT.textMuted,
          }}
        >
          الكل
        </button>
        {books.map((book) => (
          <button
            key={book}
            type="button"
            onClick={() => onChange(book)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold transition active:scale-95"
            style={{
              borderColor: active === book ? `${SAVED_VAULT.gold}66` : "rgba(255,255,255,0.12)",
              background: active === book ? "rgba(231,201,122,0.14)" : "rgba(0,0,0,0.35)",
              color: active === book ? SAVED_VAULT.gold : SAVED_VAULT.textMuted,
            }}
          >
            {displayName(book)}
          </button>
        ))}
      </div>
    </div>
  );
}

function SavedVerseVaultCard({
  verse,
  index,
  onRemove,
}: {
  verse: SavedVerse;
  index: number;
  onRemove: () => void;
}) {
  const refLabel = verseRefLabel(verse);
  const onShare = useCallback(() => {
    void shareSavedVerse(verse);
  }, [verse]);

  return (
    <li
      className="saved-vault-card-in"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      <div
        className="group relative overflow-hidden rounded-[22px] border"
        style={{
          borderColor: SAVED_VAULT.border,
          background: SAVED_VAULT.cardBg,
          boxShadow:
            "0 16px 36px -14px rgba(0,0,0,0.65), 0 0 0 1px rgba(231,201,122,0.08), 0 0 24px rgba(110,181,240,0.06)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(135deg, rgba(231,201,122,0.08) 0%, transparent 45%, rgba(110,181,240,0.06) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[21px]"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 28px rgba(231,201,122,0.04)",
          }}
        />

        <Link
          to="/$book/$chapter"
          params={{ book: verse.book, chapter: String(verse.chapter) }}
          search={chapterVerseHighlightSearch(verse.verse)}
          className="relative z-10 block p-4 pb-3 text-right transition active:opacity-95"
        >
          <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
            <span
              className="inline-flex rounded-full border px-2.5 py-1 backdrop-blur-md"
              style={{ borderColor: `${SAVED_VAULT.gold}55`, background: "rgba(0,0,0,0.35)" }}
            >
              <HeroBadgeEmblem label={refLabel} compact />
            </span>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold tabular-nums"
              style={{ color: SAVED_VAULT.goldMuted, background: "rgba(231,201,122,0.1)" }}
            >
              #{index + 1}
            </span>
          </div>

          {verse.text ? (
            <p
              className="font-arabic-serif text-[15px] font-medium leading-[1.85] line-clamp-4"
              style={{ color: SAVED_VAULT.text }}
            >
              {verse.text}
            </p>
          ) : (
            <p className="text-[13px]" style={{ color: SAVED_VAULT.textMuted }}>
              اضغط لفتح الإصحاح
            </p>
          )}

          <p className="mt-2 text-[10px] font-medium" style={{ color: SAVED_VAULT.textMuted }}>
            {formatSavedAgo(verse.savedAt)}
          </p>
        </Link>

        <div className="relative z-10 flex flex-wrap items-center justify-start gap-2 px-4 pb-4">
          <button
            type="button"
            aria-label={`مشاركة ${refLabel}`}
            onClick={onShare}
            className={VAULT_ACTION_BTN}
            style={{
              borderColor: "rgba(126,200,240,0.35)",
              background: "rgba(126,200,240,0.1)",
              color: "#8fd4ff",
            }}
          >
            <Share2 className="h-4 w-4" />
            شارك
          </button>
          <button
            type="button"
            aria-label={`إزالة ${refLabel} من المحفوظات`}
            onClick={onRemove}
            className={VAULT_ACTION_BTN}
            style={{
              borderColor: `${SAVED_VAULT.gold}44`,
              background: "rgba(231,201,122,0.08)",
              color: SAVED_VAULT.gold,
            }}
          >
            <Bookmark className="h-4 w-4 fill-current" />
            إزالة
          </button>
          <Link
            to="/$book/$chapter"
            params={{ book: verse.book, chapter: String(verse.chapter) }}
            search={chapterVerseHighlightSearch(verse.verse)}
            aria-label={`فتح ${refLabel}`}
            className={VAULT_ACTION_BTN}
            style={{
              borderColor: "rgba(231,201,122,0.25)",
              background: "rgba(231,201,122,0.08)",
              color: SAVED_VAULT.gold,
            }}
          >
            <ChevronLeft className="h-4 w-4 opacity-90" />
            فتح
          </Link>
        </div>
      </div>
    </li>
  );
}

function SavedVaultEmpty({ backTo }: { backTo: string }) {
  return (
    <div
      className="saved-vault-hero relative mt-8 overflow-hidden rounded-[28px] border p-8 text-center"
      style={{
        borderColor: SAVED_VAULT.border,
        background: "linear-gradient(180deg, rgba(7,4,15,0.92) 0%, rgba(3,2,8,0.88) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]" aria-hidden>
        <span className="text-[120px] font-black text-[#e7c97a]">Ⲁ</span>
      </div>
      <div
        className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border"
        style={{
          borderColor: `${SAVED_VAULT.gold}44`,
          background: "rgba(231,201,122,0.08)",
          boxShadow: "0 0 32px rgba(231,201,122,0.2)",
        }}
      >
        <Bookmark className="h-7 w-7" style={{ color: SAVED_VAULT.gold }} strokeWidth={1.8} />
      </div>
      <h2 className="relative font-arabic-serif text-[18px] font-bold" style={{ color: SAVED_VAULT.text }}>
        خزانتك فارغة
      </h2>
      <p className="relative mx-auto mt-2 max-w-[260px] text-[12px] leading-relaxed" style={{ color: SAVED_VAULT.textMuted }}>
        احفظ آية من القارئ — ستظهر هنا ككنز مضيء تستطيع العودة إليه في أي وقت.
      </p>
      <Link
        to={backTo}
        className="relative mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-bold text-[#1a1020] transition active:scale-[0.98]"
        style={{
          background: `linear-gradient(180deg, ${SAVED_VAULT.goldBright} 0%, ${SAVED_VAULT.goldMuted} 100%)`,
          boxShadow: "0 8px 24px rgba(231,201,122,0.35)",
        }}
      >
        <span className="hero-ledger-glyph-gold text-[12px] font-black">✦</span>
        ابدأ القراءة
        <span className="hero-ledger-glyph-gold text-[12px] font-black">✦</span>
      </Link>
    </div>
  );
}

export function SavedVersesPremiumScreen({
  backTo,
  fromBible2,
}: {
  backTo: string;
  fromBible2: boolean;
}) {
  const { saved, toggle } = useSavedVerses();
  const [bookFilter, setBookFilter] = useState<string | null>(null);
  const sorted = useMemo(
    () => [...saved].sort((a, b) => b.savedAt - a.savedAt),
    [saved],
  );
  const uniqueBooks = useMemo(
    () => [...new Set(sorted.map((v) => v.book))],
    [sorted],
  );
  const filtered = useMemo(
    () => (bookFilter ? sorted.filter((v) => v.book === bookFilter) : sorted),
    [sorted, bookFilter],
  );
  const spotlight = filtered[0] ?? null;
  const listVerses = filtered.length > 1 ? filtered.slice(1) : [];

  const removeVerse = useCallback(
    (verse: SavedVerse) => {
      toggle({
        book: verse.book,
        bookName: verse.bookName,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        id: verse.id,
      });
    },
    [toggle],
  );

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden" style={{ background: SAVED_VAULT.bgDeep }}>
      <HeroLedgerStylesHost />
      <SavedVaultStyles />
      <SavedVaultBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        <header
          className="sticky top-0 z-30 -mx-1 mb-2 flex items-center justify-between gap-2 rounded-2xl border px-1 py-2 backdrop-blur-xl"
          style={{
            borderColor: "rgba(231,201,122,0.18)",
            background: "rgba(5,8,20,0.72)",
            top: "max(env(safe-area-inset-top), 8px)",
          }}
        >
          <BackButton to={backTo} compact tone="dark" />
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-wide" style={{ color: SAVED_VAULT.goldMuted }}>
              ✦ ALPHA BIBLE ✦
            </p>
            <h1 className="font-arabic-serif text-[17px] font-extrabold" style={{ color: SAVED_VAULT.text }}>
              المحفوظات
            </h1>
          </div>
          <div
            className="grid h-9 w-9 place-items-center rounded-full border"
            style={{
              borderColor: `${SAVED_VAULT.gold}44`,
              background: "rgba(231,201,122,0.1)",
              color: SAVED_VAULT.gold,
            }}
          >
            <Bookmark className="h-4 w-4 fill-current" />
          </div>
        </header>

        <section
          className="saved-vault-hero relative mt-3 overflow-hidden rounded-[26px] border p-5"
          style={{
            borderColor: SAVED_VAULT.border,
            background: "linear-gradient(145deg, rgba(7,4,15,0.88) 0%, rgba(3,2,8,0.75) 100%)",
          }}
        >
          <div className="pointer-events-none absolute left-3 top-3 text-[#e7c97a]/30" aria-hidden>
            <CopticMiniCross size={14} />
          </div>
          <div className="pointer-events-none absolute right-3 top-3 text-[#e7c97a]/30" aria-hidden>
            <CopticMiniCross size={14} />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2" aria-hidden>
            <CopticCross size={16} className="text-[#e7c97a]/45" />
          </div>

          <div className="relative pt-4 text-right">
            <p className="text-[12px] font-bold" style={{ color: SAVED_VAULT.gold }}>
              خزينة الآيات
            </p>
            <p className="mt-1 font-arabic-serif text-[21px] font-extrabold leading-snug" style={{ color: SAVED_VAULT.text }}>
              كنوزك من كلمة الله
            </p>
            <p className="mt-2 max-w-[280px] text-[11px] leading-relaxed" style={{ color: SAVED_VAULT.textMuted }}>
              كل آية تحفظها تُضاء هنا — مرجع سريع لرحلتك الروحية.
            </p>

            <div className="mt-5 flex items-stretch justify-start gap-3">
              <div
                className={VAULT_STAT_CHIP}
                style={{
                  borderColor: "rgba(126,200,240,0.35)",
                  background: "rgba(126,200,240,0.08)",
                }}
              >
                <p className="text-[26px] font-black tabular-nums leading-none" style={{ color: "#8fd4ff" }}>
                  {sorted.length}
                </p>
                <p className="mt-1 text-[10px] font-semibold" style={{ color: "rgba(143,212,255,0.75)" }}>
                  آية محفوظة
                </p>
              </div>
              <div
                className={VAULT_STAT_CHIP}
                style={{
                  borderColor: `${SAVED_VAULT.gold}33`,
                  background: "rgba(231,201,122,0.06)",
                }}
              >
                <p className="text-[26px] font-black leading-none hero-ledger-glyph-gold">ⲀⲰ</p>
                <p className="mt-1 text-[10px] font-semibold" style={{ color: SAVED_VAULT.textMuted }}>
                  Alpha · Omega
                </p>
              </div>
            </div>
          </div>
        </section>

        {sorted.length === 0 ? (
          <SavedVaultEmpty backTo={backTo} />
        ) : (
          <>
            <SavedBookFilters books={uniqueBooks} active={bookFilter} onChange={setBookFilter} />

            {spotlight ? (
              <SavedSpotlightCard verse={spotlight} onRemove={() => removeVerse(spotlight)} />
            ) : null}

            {listVerses.length > 0 ? (
              <>
                <p className="mt-6 text-right text-[10px] font-bold" style={{ color: SAVED_VAULT.goldMuted }}>
                  باقي الكنوز
                </p>
                <ul className="mt-3 space-y-3.5">
                  {listVerses.map((verse, index) => (
                    <SavedVerseVaultCard
                      key={verse.id}
                      verse={verse}
                      index={index}
                      onRemove={() => removeVerse(verse)}
                    />
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}

        {sorted.length > 0 ? (
          <p
            className="mt-8 text-center text-[10px] font-medium leading-relaxed"
            style={{ color: SAVED_VAULT.textMuted }}
          >
            اضغط على الآية للقراءة · شارك أو أزل من الأزرار
          </p>
        ) : null}
      </div>

      <BottomDock />
    </main>
  );
}
