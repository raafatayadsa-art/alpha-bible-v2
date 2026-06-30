import { Link } from "@tanstack/react-router";
import { Bookmark, ChevronLeft, Highlighter, Share2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import artVerse from "@/assets/home/art-verse.jpg";
import { BackButton } from "@/components/bible";
import { CopticCross, CopticMiniCross } from "@/components/coptic";
import { HeroBadgeEmblem, HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { BottomDock } from "@/components/bible/BottomDock";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";
import { CommunityShareButton } from "@/features/community";
import { displayName } from "@/lib/bible-books";
import { useSavedVerses, type SavedVerse } from "@/lib/reading-state";
import {
  highlightColorMeta,
  highlightVaultCardStyle,
  useVerseHighlights,
  VERSE_HIGHLIGHT_COLORS,
  type HighlightedVerse,
  type VerseHighlightColor,
} from "@/lib/verse-highlights";
import { formatSavedAgo, HIGHLIGHT_VAULT, SAVED_VAULT } from "./saved-vault-tokens";
import { chapterVerseHighlightSearch } from "@/lib/chapter-verse-highlight";

type VaultTab = "saved" | "highlights";

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

function HighlightVaultBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FFFDF9 0%, #FAF7F2 38%, #F5EFE6 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(251,113,133,0.08) 0%, transparent 55%), radial-gradient(ellipse 70% 40% at 20% 80%, rgba(96,165,250,0.06) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}

function SavedVaultBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #FFFDF9 0%, #FAF7F2 38%, #F5EFE6 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(231,201,122,0.12) 0%, transparent 55%), radial-gradient(ellipse 70% 40% at 20% 80%, rgba(184,137,58,0.06) 0%, transparent 50%)",
        }}
      />
    </div>
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
            <CommunityShareButton
              compact
              input={{
                kind: "reading",
                reading: {
                  reference: refLabel,
                  text: verse.text || refLabel,
                  bookRoute: verse.book,
                  chapter: verse.chapter,
                  verse: verse.verse,
                },
              }}
            />
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

function SavedVaultEmpty({ backTo, tab, light }: { backTo: string; tab: VaultTab; light?: boolean }) {
  const isHighlights = tab === "highlights";
  const useLight = light ?? isHighlights;
  return (
    <div
      className="saved-vault-hero relative mt-8 overflow-hidden rounded-[28px] border p-8 text-center"
      style={{
        borderColor: useLight ? HIGHLIGHT_VAULT.border : SAVED_VAULT.border,
        background: useLight
          ? "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,239,228,0.88) 100%)"
          : "linear-gradient(180deg, rgba(7,4,15,0.92) 0%, rgba(3,2,8,0.88) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]" aria-hidden>
        <span className="text-[120px] font-black" style={{ color: useLight ? HIGHLIGHT_VAULT.gold : "#e7c97a" }}>
          Ⲁ
        </span>
      </div>
      <div
        className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border"
        style={{
          borderColor: isHighlights ? "rgba(251,113,133,0.35)" : `${SAVED_VAULT.gold}44`,
          background: isHighlights ? "rgba(254,205,211,0.55)" : "rgba(231,201,122,0.08)",
          boxShadow: isHighlights ? "0 0 32px rgba(251,113,133,0.18)" : "0 0 32px rgba(231,201,122,0.2)",
        }}
      >
        {isHighlights ? (
          <Highlighter className="h-7 w-7" style={{ color: "#fb7185" }} strokeWidth={1.8} />
        ) : (
          <Bookmark className="h-7 w-7" style={{ color: SAVED_VAULT.gold }} strokeWidth={1.8} />
        )}
      </div>
      <h2
        className="relative font-arabic-serif text-[18px] font-bold"
        style={{ color: useLight ? HIGHLIGHT_VAULT.text : SAVED_VAULT.text }}
      >
        {isHighlights ? "لا آيات ملوّنة بعد" : "خزانتك فارغة"}
      </h2>
      <p
        className="relative mx-auto mt-2 max-w-[260px] text-[12px] leading-relaxed"
        style={{ color: useLight ? HIGHLIGHT_VAULT.textMuted : SAVED_VAULT.textMuted }}
      >
        {isHighlights
          ? "اضغط على أي آية في القارئ واختر لوناً — ستظهر هنا مرتّبة حسب آخر تمييز."
          : "احفظ آية من القارئ — ستظهر هنا ككنز مضيء تستطيع العودة إليه في أي وقت."}
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

function SavedVaultTabChip({
  active,
  count,
  label,
  accent,
  onSelect,
  lightMode = false,
}: {
  active: boolean;
  count: number;
  label: string;
  accent: string;
  onSelect: () => void;
  lightMode?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "flex min-h-[72px] min-w-[118px] flex-1 flex-col items-center justify-center rounded-2xl border px-4 py-3 transition active:scale-[0.98] " +
        (active ? "saved-vault-hero" : "")
      }
      style={{
        borderColor: active ? `${accent}66` : lightMode ? HIGHLIGHT_VAULT.cardBorder : "rgba(255,255,255,0.12)",
        background: active ? `${accent}18` : lightMode ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.35)",
      }}
    >
      <p
        className="text-[26px] font-black tabular-nums leading-none"
        style={{ color: active ? accent : lightMode ? HIGHLIGHT_VAULT.textMuted : SAVED_VAULT.textMuted }}
      >
        {count}
      </p>
      <p
        className="mt-1 text-[10px] font-semibold"
        style={{ color: active ? accent : lightMode ? HIGHLIGHT_VAULT.textMuted : SAVED_VAULT.textMuted }}
      >
        {label}
      </p>
    </button>
  );
}

function HighlightColorFilters({
  active,
  onChange,
  lightMode = true,
}: {
  active: VerseHighlightColor | null;
  onChange: (color: VerseHighlightColor | null) => void;
  lightMode?: boolean;
}) {
  const muted = lightMode ? HIGHLIGHT_VAULT.textMuted : SAVED_VAULT.textMuted;
  const gold = lightMode ? HIGHLIGHT_VAULT.gold : SAVED_VAULT.gold;
  return (
    <div className="mt-5 -mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className="shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold transition active:scale-95"
          style={{
            borderColor: active === null ? `${gold}66` : lightMode ? HIGHLIGHT_VAULT.cardBorder : "rgba(255,255,255,0.12)",
            background: active === null ? "rgba(231,201,122,0.18)" : lightMode ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.35)",
            color: active === null ? gold : muted,
          }}
        >
          كل الألوان
        </button>
        {VERSE_HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold transition active:scale-95"
            style={{
              borderColor: active === c.id ? `${c.ring}88` : lightMode ? `${c.ring}33` : "rgba(255,255,255,0.12)",
              background: active === c.id ? `${c.bg}88` : lightMode ? `${c.bg}44` : "rgba(0,0,0,0.35)",
              color: active === c.id ? c.ring : muted,
            }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.ring }} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function highlightedRefLabel(verse: HighlightedVerse) {
  return `${displayName(verse.bookName || verse.book)} ${verse.chapter}:${verse.verse}`;
}

function shareHighlightedVerse(verse: HighlightedVerse) {
  const refLabel = highlightedRefLabel(verse);
  openAlphaShareSheet({
    title: "آية ملوّنة",
    body: verse.text || refLabel,
    meta: refLabel,
    imageSrc: artVerse,
    accent: highlightColorMeta(verse.color)?.ring ?? SAVED_VAULT.gold,
  });
}

function HighlightVerseRefBadge({ label, ring }: { label: string; ring: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md"
      style={{
        borderColor: `${ring}55`,
        background: "linear-gradient(145deg, rgba(42,31,18,0.88) 0%, rgba(42,31,18,0.72) 100%)",
        boxShadow: "0 6px 16px -8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
      }}
    >
      <span aria-hidden className="hero-ledger-glyph-gold select-none text-[9px] font-black leading-none">
        ✦
      </span>
      <span className="text-[10px] font-extrabold leading-none text-[#FFF8EC]">{label}</span>
      <span aria-hidden className="hero-ledger-glyph-gold select-none text-[9px] font-black leading-none">
        ✦
      </span>
    </span>
  );
}

function HighlightedSpotlightCard({ verse, onRemove }: { verse: HighlightedVerse; onRemove: () => void }) {
  const refLabel = highlightedRefLabel(verse);
  const surface = highlightVaultCardStyle(verse.color);
  const onShare = useCallback(() => shareHighlightedVerse(verse), [verse]);
  if (!surface) return null;

  return (
    <section
      className="saved-vault-card-in relative mt-5 overflow-hidden rounded-[28px] border-2 backdrop-blur-sm"
      style={{
        borderColor: surface.borderColor,
        background: surface.background,
        boxShadow: surface.boxShadow,
        transform: "translateY(-1px)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-8 opacity-60"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-4 top-4 w-1 rounded-full"
        style={{ right: 10, background: surface.ring, opacity: 0.55, boxShadow: `0 0 12px ${surface.ring}66` }}
      />
      <div className="relative p-5 text-right">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border bg-white/55 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm"
            style={{ borderColor: `${surface.ring}55`, color: surface.ring }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: surface.ring }} />
            {surface.label}
          </span>
          <p className="text-[11px] font-bold tracking-wide" style={{ color: HIGHLIGHT_VAULT.gold }}>
            ✦ آخر تمييز ✦
          </p>
        </div>
        <Link
          to="/$book/$chapter"
          params={{ book: verse.book, chapter: String(verse.chapter) }}
          search={chapterVerseHighlightSearch(verse.verse)}
          className="mt-3 block"
        >
          <div className="flex justify-end">
            <HighlightVerseRefBadge label={refLabel} ring={surface.ring} />
          </div>
          {verse.text ? (
            <p
              className="mt-3 font-arabic-serif text-[16px] font-medium leading-[1.9] line-clamp-4"
              style={{ color: HIGHLIGHT_VAULT.text }}
            >
              {verse.text}
            </p>
          ) : (
            <p className="mt-3 text-[13px]" style={{ color: HIGHLIGHT_VAULT.textMuted }}>
              اضغط لفتح الإصحاح
            </p>
          )}
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-start gap-2">
          <button
            type="button"
            onClick={onShare}
            className={VAULT_ACTION_BTN}
            style={{
              borderColor: "rgba(91,143,209,0.35)",
              background: "rgba(255,255,255,0.65)",
              color: "#4a7eb8",
            }}
          >
            <Share2 className="h-4 w-4" /> شارك
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`إزالة التمييز عن ${refLabel}`}
            className={VAULT_ACTION_BTN}
            style={{
              borderColor: "rgba(220,80,80,0.35)",
              background: "rgba(255,255,255,0.65)",
              color: "#c0392b",
            }}
          >
            إزالة اللون
          </button>
        </div>
      </div>
    </section>
  );
}

function HighlightedVerseVaultCard({ verse, index, onRemove }: { verse: HighlightedVerse; index: number; onRemove: () => void }) {
  const refLabel = highlightedRefLabel(verse);
  const surface = highlightVaultCardStyle(verse.color);
  const onShare = useCallback(() => shareHighlightedVerse(verse), [verse]);
  if (!surface) return null;

  return (
    <li className="saved-vault-card-in" style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}>
      <div
        className="group relative overflow-hidden rounded-[22px] border-2 backdrop-blur-sm transition-transform active:scale-[0.995]"
        style={{
          borderColor: surface.borderColor,
          background: surface.background,
          boxShadow: surface.boxShadow,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-6 opacity-55"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-3 top-3 w-1 rounded-full"
          style={{ right: 8, background: surface.ring, opacity: 0.5, boxShadow: `0 0 10px ${surface.ring}55` }}
        />
        <Link
          to="/$book/$chapter"
          params={{ book: verse.book, chapter: String(verse.chapter) }}
          search={chapterVerseHighlightSearch(verse.verse)}
          className="relative z-10 block p-4 pb-3 text-right transition active:opacity-95"
        >
          <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full border bg-white/55 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm"
              style={{ borderColor: `${surface.ring}55`, color: surface.ring }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: surface.ring }} />
              {surface.label}
            </span>
            <HighlightVerseRefBadge label={refLabel} ring={surface.ring} />
          </div>
          {verse.text ? (
            <p
              className="font-arabic-serif text-[15px] font-medium leading-[1.85] line-clamp-4"
              style={{ color: HIGHLIGHT_VAULT.text }}
            >
              {verse.text}
            </p>
          ) : (
            <p className="text-[13px]" style={{ color: HIGHLIGHT_VAULT.textMuted }}>
              اضغط لفتح الإصحاح
            </p>
          )}
          {verse.highlightedAt ? (
            <p className="mt-2 text-[10px] font-medium" style={{ color: HIGHLIGHT_VAULT.textMuted }}>
              {formatSavedAgo(verse.highlightedAt)}
            </p>
          ) : null}
        </Link>
        <div
          className="relative z-10 flex flex-wrap items-center justify-start gap-2 border-t border-white/45 px-4 py-3"
        >
          <button
            type="button"
            onClick={onShare}
            className={VAULT_ACTION_BTN}
            style={{
              borderColor: "rgba(91,143,209,0.35)",
              background: "rgba(255,255,255,0.65)",
              color: "#4a7eb8",
            }}
          >
            <Share2 className="h-4 w-4" /> شارك
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`إزالة التمييز عن ${refLabel}`}
            className={VAULT_ACTION_BTN}
            style={{
              borderColor: "rgba(220,80,80,0.35)",
              background: "rgba(255,255,255,0.65)",
              color: "#c0392b",
            }}
          >
            إزالة
          </button>
          <Link
            to="/$book/$chapter"
            params={{ book: verse.book, chapter: String(verse.chapter) }}
            search={chapterVerseHighlightSearch(verse.verse)}
            aria-label={`فتح ${refLabel}`}
            className={VAULT_ACTION_BTN}
            style={{
              borderColor: `${surface.ring}44`,
              background: "rgba(255,255,255,0.65)",
              color: surface.ring,
            }}
          >
            <ChevronLeft className="h-4 w-4 opacity-90" /> فتح
          </Link>
        </div>
      </div>
    </li>
  );
}

export function SavedVersesPremiumScreen({
  backTo,
  fromBible2,
  initialTab = "saved",
}: {
  backTo: string;
  fromBible2: boolean;
  initialTab?: VaultTab;
}) {
  const { saved, toggle } = useSavedVerses();
  const { highlights, remove: removeHighlight } = useVerseHighlights();
  const [tab, setTab] = useState<VaultTab>(initialTab);
  const [bookFilter, setBookFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<VerseHighlightColor | null>(null);

  const sortedSaved = useMemo(() => [...saved].sort((a, b) => b.savedAt - a.savedAt), [saved]);
  const filteredSaved = useMemo(
    () => (bookFilter ? sortedSaved.filter((v) => v.book === bookFilter) : sortedSaved),
    [sortedSaved, bookFilter],
  );
  const savedUniqueBooks = useMemo(() => [...new Set(sortedSaved.map((v) => v.book))], [sortedSaved]);
  const savedSpotlight = filteredSaved[0] ?? null;
  const savedListVerses = filteredSaved.length > 1 ? filteredSaved.slice(1) : [];

  const filteredHighlights = useMemo(
    () => (colorFilter ? highlights.filter((v) => v.color === colorFilter) : highlights),
    [highlights, colorFilter],
  );
  const highlightSpotlight = filteredHighlights[0] ?? null;
  const highlightListVerses = filteredHighlights.length > 1 ? filteredHighlights.slice(1) : [];

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

  const isHighlightsTab = tab === "highlights";
  const activeCount = isHighlightsTab ? filteredHighlights.length : sortedSaved.length;
  const isEmpty = isHighlightsTab ? highlights.length === 0 : sortedSaved.length === 0;

  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden transition-colors duration-300"
      style={{ background: isHighlightsTab ? HIGHLIGHT_VAULT.bgDeep : SAVED_VAULT.bgDeep }}
    >
      <HeroLedgerStylesHost />
      <SavedVaultStyles />
      {isHighlightsTab ? <HighlightVaultBackdrop /> : <SavedVaultBackdrop />}

      <div className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        <header
          className="sticky top-0 z-30 -mx-1 mb-2 flex items-center justify-between gap-2 rounded-2xl border px-1 py-2 backdrop-blur-xl transition-colors duration-300"
          style={{
            borderColor: HIGHLIGHT_VAULT.border,
            background: "rgba(250,247,242,0.92)",
            top: "max(env(safe-area-inset-top), 8px)",
          }}
        >
          <BackButton to={backTo} compact tone="light" />
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-wide text-[#B8893A]">✦ ALPHA BIBLE ✦</p>
            <h1 className="font-arabic-serif text-[17px] font-extrabold text-[#2A1F12]">
              {isHighlightsTab ? "الآيات الملوّنة" : "المحفوظات"}
            </h1>
          </div>
          <div
            className="grid h-9 w-9 place-items-center rounded-full border"
            style={{
              borderColor: isHighlightsTab ? "rgba(251,113,133,0.35)" : `${SAVED_VAULT.gold}44`,
              background: isHighlightsTab ? "rgba(254,205,211,0.45)" : "rgba(231,201,122,0.1)",
              color: isHighlightsTab ? "#fb7185" : SAVED_VAULT.gold,
            }}
          >
            {isHighlightsTab ? (
              <Highlighter className="h-4 w-4" style={{ color: "#fb7185" }} />
            ) : (
              <Bookmark className="h-4 w-4 fill-current" />
            )}
          </div>
        </header>

        <section
          className="saved-vault-hero relative mt-3 overflow-hidden rounded-[26px] border p-5 transition-colors duration-300"
          style={{
            borderColor: isHighlightsTab ? HIGHLIGHT_VAULT.border : SAVED_VAULT.border,
            background: isHighlightsTab
              ? "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,239,228,0.88) 100%)"
              : "linear-gradient(145deg, rgba(7,4,15,0.88) 0%, rgba(3,2,8,0.75) 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute left-3 top-3"
            style={{ color: isHighlightsTab ? "rgba(212,175,55,0.25)" : "rgba(231,201,122,0.3)" }}
            aria-hidden
          >
            <CopticMiniCross size={14} />
          </div>
          <div
            className="pointer-events-none absolute right-3 top-3"
            style={{ color: isHighlightsTab ? "rgba(212,175,55,0.25)" : "rgba(231,201,122,0.3)" }}
            aria-hidden
          >
            <CopticMiniCross size={14} />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2" aria-hidden>
            <CopticCross size={16} className={isHighlightsTab ? "text-[#e7c97a]/45" : "text-[#e7c97a]/45"} />
          </div>

          <div className="relative pt-4 text-right">
            <p
              className="text-[12px] font-bold"
              style={{ color: isHighlightsTab ? HIGHLIGHT_VAULT.gold : SAVED_VAULT.gold }}
            >
              {isHighlightsTab ? "لوحة الألوان" : "خزينة الآيات"}
            </p>
            <p
              className="mt-1 font-arabic-serif text-[21px] font-extrabold leading-snug"
              style={{ color: isHighlightsTab ? HIGHLIGHT_VAULT.text : SAVED_VAULT.text }}
            >
              {isHighlightsTab ? "آياتك بالألوان التي اخترتها" : "كنوزك من كلمة الله"}
            </p>
            <p
              className="mt-2 max-w-[280px] text-[11px] leading-relaxed"
              style={{ color: isHighlightsTab ? HIGHLIGHT_VAULT.textMuted : SAVED_VAULT.textMuted }}
            >
              {isHighlightsTab
                ? "كل آية تظهر بلون تمييزها — مرجع بصري سريع لدراستك."
                : "كل آية تحفظها تُضاء هنا — مرجع سريع لرحلتك الروحية."}
            </p>

            <div className="mt-5 flex items-stretch justify-start gap-3">
              <SavedVaultTabChip
                active={tab === "saved"}
                count={sortedSaved.length}
                label="آيات محفوظة"
                accent="#8fd4ff"
                lightMode={isHighlightsTab}
                onSelect={() => {
                  setTab("saved");
                  setColorFilter(null);
                }}
              />
              <SavedVaultTabChip
                active={tab === "highlights"}
                count={highlights.length}
                label="آيات ملوّنة"
                accent="#fb7185"
                lightMode={isHighlightsTab}
                onSelect={() => {
                  setTab("highlights");
                  setBookFilter(null);
                }}
              />
            </div>
          </div>
        </section>

        {isEmpty ? (
          <SavedVaultEmpty backTo={backTo} tab={tab} light={isHighlightsTab} />
        ) : isHighlightsTab ? (
          <>
            <HighlightColorFilters active={colorFilter} onChange={setColorFilter} lightMode />
            {filteredHighlights.length === 0 ? (
              <p className="mt-8 text-center text-[12px]" style={{ color: HIGHLIGHT_VAULT.textMuted }}>
                لا آيات بهذا اللون
              </p>
            ) : (
              <>
                {highlightSpotlight ? (
                  <HighlightedSpotlightCard verse={highlightSpotlight} onRemove={() => removeHighlight(highlightSpotlight.id)} />
                ) : null}
                {highlightListVerses.length > 0 ? (
                  <>
                    <p className="mt-6 text-right text-[10px] font-bold" style={{ color: HIGHLIGHT_VAULT.goldMuted }}>
                      باقي التمييزات
                    </p>
                    <ul className="mt-3 space-y-3.5">
                      {highlightListVerses.map((verse, index) => (
                        <HighlightedVerseVaultCard
                          key={verse.id}
                          verse={verse}
                          index={index}
                          onRemove={() => removeHighlight(verse.id)}
                        />
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            )}
          </>
        ) : (
          <>
            <SavedBookFilters books={savedUniqueBooks} active={bookFilter} onChange={setBookFilter} />
            {savedSpotlight ? (
              <SavedSpotlightCard verse={savedSpotlight} onRemove={() => removeVerse(savedSpotlight)} />
            ) : null}
            {savedListVerses.length > 0 ? (
              <>
                <p className="mt-6 text-right text-[10px] font-bold" style={{ color: SAVED_VAULT.goldMuted }}>
                  باقي الكنوز
                </p>
                <ul className="mt-3 space-y-3.5">
                  {savedListVerses.map((verse, index) => (
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

        {!isEmpty && activeCount > 0 ? (
          <p
            className="mt-8 text-center text-[10px] font-medium leading-relaxed"
            style={{ color: isHighlightsTab ? HIGHLIGHT_VAULT.textMuted : SAVED_VAULT.textMuted }}
          >
            {isHighlightsTab
              ? "اضغط على الآية للقراءة · شارك أو أزل اللون"
              : "اضغط على الآية للقراءة · شارك أو أزل من الأزرار"}
          </p>
        ) : null}
      </div>

      <BottomDock />
    </main>
  );
}
