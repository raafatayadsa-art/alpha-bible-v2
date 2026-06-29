import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  FilePen,
  Flame,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import cardMeditation from "@/assets/home/card-meditation.jpg";
import artVerse from "@/assets/home/art-verse.jpg";
import bgWatermark from "@/features/bible-lavoble/assets/bg-watermark.jpg";
import { BackButton } from "@/components/bible";
import { CopticCross, CopticMiniCross } from "@/components/coptic";
import { HeroBadgeEmblem, HeroLedgerStylesHost } from "@/components/home/hero-card-chrome";
import { BottomDock } from "@/components/bible/BottomDock";
import { openAlphaShareSheet } from "@/lib/alpha-share-sheet";
import { displayName } from "@/lib/bible-books";
import {
  useBibleJournal,
  type BibleJournalEntry,
  type JournalKind,
} from "@/lib/bible-journal-state";
import { consumeJournalVersePrefill } from "@/lib/bible-journal-prefill";
import { chapterVerseHighlightSearch } from "@/lib/chapter-verse-highlight";
import { JournalComposeSheet } from "./JournalComposeSheet";
import { JournalBibleSearchRow } from "./JournalBibleSearchRow";
import { formatJournalAgo, JOURNAL_VAULT, resolveStudyTagLabel } from "./journal-vault-tokens";

function JournalVaultStyles() {
  return (
    <style>{`
      @keyframes journalGlyphGlow {
        0%, 100% { opacity: 0.2; filter: drop-shadow(0 0 4px rgba(143,212,255,0.3)); }
        50% { opacity: 0.5; filter: drop-shadow(0 0 10px rgba(168,232,204,0.55)); }
      }
      @keyframes journalHeroPulse {
        0%, 100% { box-shadow: 0 0 0 1px rgba(212,175,55,0.2), 0 8px 28px rgba(120,90,40,0.08); }
        50% { box-shadow: 0 0 0 1px rgba(212,175,55,0.38), 0 12px 36px rgba(120,90,40,0.14); }
      }
      @keyframes journalCardIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes journalTabGoldPulse {
        0%, 100% {
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.95),
            0 8px 20px -10px rgba(120,90,40,0.18),
            0 0 0 1px rgba(212,175,55,0.35);
        }
        50% {
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,1),
            0 12px 28px -8px rgba(212,175,55,0.28),
            0 0 0 2px rgba(212,175,55,0.55);
        }
      }
      .journal-vault-glyph { animation: journalGlyphGlow 4.5s ease-in-out infinite; }
      .journal-vault-hero { animation: journalHeroPulse 3.6s ease-in-out infinite; }
      .journal-vault-card-in { animation: journalCardIn 0.5s cubic-bezier(0.32, 0.72, 0, 1) both; }
      .journal-tab-chip--active { animation: journalTabGoldPulse 1.75s ease-in-out infinite; }
    `}</style>
  );
}

function JournalVaultBackdrop({ tab }: { tab: JournalKind }) {
  const glyphs: Array<{ g: string; top: string; delay: string; left?: string; right?: string }> = [
    { g: "Ⲁ", top: "6%", right: "8%", delay: "0s" },
    { g: "ϯ", top: "12%", left: "10%", delay: "0.8s" },
    { g: "Ⲱ", top: "20%", right: "24%", delay: "1.4s" },
    { g: "Ⲃ", top: "30%", left: "20%", delay: "2s" },
    { g: "Ⲅ", top: "40%", right: "12%", delay: "0.5s" },
    { g: "Ⲉ", top: "50%", left: "8%", delay: "1.7s" },
    { g: "Ⲁ", top: "62%", right: "30%", delay: "2.3s" },
    { g: "Ⲱ", top: "72%", left: "26%", delay: "1.1s" },
    { g: "ϯ", top: "82%", right: "16%", delay: "0.3s" },
    { g: "Ⲃ", top: "90%", left: "14%", delay: "2.6s" },
  ];

  const glow =
    tab === "meditation"
      ? "radial-gradient(ellipse 80% 50% at 70% 20%, rgba(100,200,160,0.14) 0%, transparent 60%)"
      : "radial-gradient(ellipse 80% 50% at 30% 20%, rgba(110,181,240,0.14) 0%, transparent 60%)";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <img
        src={bgWatermark}
        alt=""
        draggable={false}
        className="absolute inset-x-0 top-0 h-[55vh] w-full object-cover opacity-[0.22] mix-blend-luminosity"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,247,242,0.35) 0%, rgba(250,247,242,0.92) 45%, #FAF7F2 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-90 transition-[background] duration-700" style={{ background: glow }} />
      {glyphs.map(({ g, top, left, right, delay }, i) => (
        <span
          key={`${g}-${i}`}
          className="journal-vault-glyph hero-ledger-glyph-gold absolute select-none font-black leading-none"
          style={{ top, left, right, fontSize: "clamp(16px, 4vw, 28px)", animationDelay: delay }}
        >
          {g}
        </span>
      ))}
    </div>
  );
}

const ACTION_BTN =
  "inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-[11px] font-bold transition active:scale-95";

function JournalHeroTabChip({
  active,
  count,
  label,
  icon: Icon,
  accent,
  accentBright,
  bgActive,
  borderIdle,
  onSelect,
}: {
  active: boolean;
  count: number;
  label: string;
  icon: typeof FilePen;
  accent: string;
  accentBright: string;
  bgActive: string;
  borderIdle: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`relative flex min-h-[92px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[22px] border px-3 py-3 text-center transition duration-200 active:scale-[0.96] ${active ? "journal-tab-chip--active z-[1]" : "z-0"}`}
      style={
        active
          ? {
              borderColor: "rgba(212,175,55,0.55)",
              background: `linear-gradient(155deg, ${bgActive} 0%, rgba(255,255,255,0.95) 55%, rgba(250,247,242,0.98) 100%)`,
            }
          : {
              borderColor: borderIdle,
              background: "linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(245,239,228,0.88) 48%, rgba(250,247,242,0.95) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.95), 0 6px 16px -10px rgba(120,90,40,0.12)",
            }
      }
    >
      <span
        className="grid h-10 w-10 place-items-center rounded-[14px] border backdrop-blur-sm"
        style={{
          borderColor: active ? "rgba(212,175,55,0.35)" : `${accent}44`,
          background: active
            ? "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,239,228,0.85) 100%)"
            : "linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(250,247,242,0.75) 100%)",
          boxShadow: active
            ? "inset 0 1px 0 rgba(255,255,255,1), 0 4px 12px -4px rgba(212,175,55,0.25)"
            : `inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 10px -6px ${accent}22`,
        }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: active ? JOURNAL_VAULT.gold : accentBright }} strokeWidth={2} />
      </span>
      <p
        className="text-[24px] font-black tabular-nums leading-none"
        style={{ color: active ? accentBright : JOURNAL_VAULT.textMuted }}
      >
        {count}
      </p>
      <p
        className="text-[10px] font-bold leading-tight"
        style={{ color: active ? JOURNAL_VAULT.text : JOURNAL_VAULT.textMuted }}
      >
        {label}
      </p>
    </button>
  );
}

function entryRefLabel(entry: BibleJournalEntry) {
  if (!entry.book || entry.chapter == null) return null;
  const base = `${displayName(entry.bookName || entry.book)} ${entry.chapter}`;
  return entry.verse != null ? `${base}:${entry.verse}` : base;
}

function shareJournalEntry(entry: BibleJournalEntry) {
  const ref = entryRefLabel(entry);
  const title = entry.kind === "meditation" ? "تأمل روحي" : "ملاحظة دراسة";
  openAlphaShareSheet({
    title,
    body: entry.title ? `${entry.title}\n\n${entry.body}` : entry.body,
    meta: ref ?? undefined,
    imageSrc: entry.kind === "meditation" ? cardMeditation : artVerse,
    accent: entry.kind === "meditation" ? JOURNAL_VAULT.meditationAccent : JOURNAL_VAULT.noteAccent,
  });
}

function JournalActionRow({
  entry,
  onEdit,
  onRemove,
}: {
  entry: BibleJournalEntry;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const ref = entryRefLabel(entry);
  const accent = entry.kind === "meditation" ? JOURNAL_VAULT.meditationAccent : JOURNAL_VAULT.noteAccent;

  return (
    <div className="flex flex-wrap items-center justify-start gap-2 px-4 pb-4">
      <button
        type="button"
        aria-label="مشاركة"
        onClick={() => void shareJournalEntry(entry)}
        className={ACTION_BTN}
        style={{
          borderColor: "rgba(126,200,240,0.35)",
          background: "rgba(126,200,240,0.1)",
          color: JOURNAL_VAULT.noteAccentBright,
        }}
      >
        <Share2 className="h-4 w-4" />
        شارك
      </button>
      <button
        type="button"
        aria-label="تعديل"
        onClick={onEdit}
        className={ACTION_BTN}
        style={{
          borderColor: `${JOURNAL_VAULT.gold}44`,
          background: "rgba(231,201,122,0.08)",
          color: JOURNAL_VAULT.gold,
        }}
      >
        <Pencil className="h-4 w-4" />
        تعديل
      </button>
      <button
        type="button"
        aria-label="حذف"
        onClick={onRemove}
        className={ACTION_BTN}
        style={{
          borderColor: "rgba(255,120,120,0.3)",
          background: "rgba(255,80,80,0.08)",
          color: "#ff6666",
        }}
      >
        <Trash2 className="h-4 w-4" />
        حذف
      </button>
      {ref && entry.book && entry.chapter != null ? (
        <Link
          to="/$book/$chapter"
          params={{ book: entry.book, chapter: String(entry.chapter) }}
          search={chapterVerseHighlightSearch(entry.verse)}
          className={ACTION_BTN}
          style={{
            borderColor: `${accent}44`,
            background: entry.kind === "meditation" ? JOURNAL_VAULT.meditationBg : JOURNAL_VAULT.noteBg,
            color: accent,
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          فتح
        </Link>
      ) : null}
    </div>
  );
}

function JournalSpotlightCard({
  entry,
  onEdit,
  onRemove,
}: {
  entry: BibleJournalEntry;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const ref = entryRefLabel(entry);
  const isMed = entry.kind === "meditation";
  const accent = isMed ? JOURNAL_VAULT.meditationAccent : JOURNAL_VAULT.noteAccent;
  const bgImage = isMed ? cardMeditation : artVerse;

  return (
    <section
      className="journal-vault-card-in mt-5 overflow-hidden rounded-[28px] border"
      style={{ borderColor: `${accent}44` }}
    >
      <div className="relative">
        <img
          src={bgImage}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.92) saturate(0.95)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(250,247,242,0.15) 0%, rgba(250,247,242,0.72) 55%, rgba(250,247,242,0.94) 100%)",
          }}
        />
        <div className="relative z-10 p-5 text-right">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[16px]">{isMed ? "🕊" : "📖"}</span>
            <p className="text-[11px] font-bold tracking-wide" style={{ color: accent }}>
              ✦ {isMed ? "آخر تأمل" : "آخر ملاحظة"} ✦
            </p>
          </div>
          {entry.title ? (
            <h3 className="mt-3 font-arabic-serif text-[18px] font-bold" style={{ color: JOURNAL_VAULT.text }}>
              {entry.title}
            </h3>
          ) : null}
          {ref ? (
            <div className="mt-2 flex justify-end">
              <HeroBadgeEmblem label={ref} />
            </div>
          ) : null}
          {entry.prompt ? (
            <p className="mt-2 text-[10px] font-semibold italic" style={{ color: `${accent}cc` }}>
              {entry.prompt}
            </p>
          ) : null}
          <p
            className="mt-3 font-arabic-serif text-[16px] font-medium leading-[1.9] line-clamp-6"
            style={{ color: JOURNAL_VAULT.text }}
          >
            {entry.body}
          </p>
          <p className="mt-2 text-[10px]" style={{ color: JOURNAL_VAULT.textMuted }}>
            {formatJournalAgo(entry.updatedAt)}
          </p>
          <JournalActionRow entry={entry} onEdit={onEdit} onRemove={onRemove} />
        </div>
      </div>
    </section>
  );
}

function JournalEntryCard({
  entry,
  index,
  onEdit,
  onRemove,
}: {
  entry: BibleJournalEntry;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const ref = entryRefLabel(entry);
  const isMed = entry.kind === "meditation";
  const accent = isMed ? JOURNAL_VAULT.meditationAccent : JOURNAL_VAULT.noteAccent;

  return (
    <li className="journal-vault-card-in" style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}>
      <div
        className="overflow-hidden rounded-[22px] border"
        style={{
          borderColor: `${accent}33`,
          background: JOURNAL_VAULT.cardBg,
          boxShadow: `0 12px 28px -14px rgba(120,90,40,0.16), 0 0 20px ${isMed ? "rgba(100,200,160,0.08)" : "rgba(110,181,240,0.08)"}`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            opacity: 0.5,
          }}
        />
        <div className="p-4 pb-2 text-right">
          <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
            {entry.tag ? (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ background: JOURNAL_VAULT.noteBg, color: JOURNAL_VAULT.noteAccentBright }}
              >
                {resolveStudyTagLabel(entry.tag)}
              </span>
            ) : null}
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{
                background: isMed ? JOURNAL_VAULT.meditationBg : JOURNAL_VAULT.noteBg,
                color: accent,
              }}
            >
              {isMed ? "تأمل" : "ملاحظة"}
            </span>
            {ref ? (
              <span
                className="inline-flex rounded-full border px-2 py-0.5 backdrop-blur-md"
                style={{ borderColor: `${JOURNAL_VAULT.gold}44`, background: "rgba(255,255,255,0.85)" }}
              >
                <HeroBadgeEmblem label={ref} compact />
              </span>
            ) : null}
          </div>
          {entry.title ? (
            <h3 className="font-arabic-serif text-[16px] font-bold" style={{ color: JOURNAL_VAULT.text }}>
              {entry.title}
            </h3>
          ) : null}
          <p
            className="mt-2 font-arabic-serif text-[14px] font-medium leading-[1.85] line-clamp-5"
            style={{ color: JOURNAL_VAULT.text }}
          >
            {entry.body}
          </p>
          <p className="mt-2 text-[10px]" style={{ color: JOURNAL_VAULT.textMuted }}>
            {formatJournalAgo(entry.updatedAt)}
          </p>
        </div>
        <JournalActionRow entry={entry} onEdit={onEdit} onRemove={onRemove} />
      </div>
    </li>
  );
}

function JournalEmptyState({
  tab,
  onCompose,
}: {
  tab: JournalKind;
  onCompose: () => void;
}) {
  const isMed = tab === "meditation";
  const accent = isMed ? JOURNAL_VAULT.meditationAccent : JOURNAL_VAULT.noteAccent;

  return (
    <div
      className="journal-vault-hero relative mt-8 overflow-hidden rounded-[28px] border p-8 text-center"
      style={{
        borderColor: `${accent}44`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,247,242,0.92) 100%)",
      }}
    >
      <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border" style={{ borderColor: `${accent}44`, background: isMed ? JOURNAL_VAULT.meditationBg : JOURNAL_VAULT.noteBg }}>
        {isMed ? <Flame className="h-7 w-7" style={{ color: accent }} /> : <FilePen className="h-7 w-7" style={{ color: accent }} />}
      </div>
      <h2 className="font-arabic-serif text-[18px] font-bold" style={{ color: JOURNAL_VAULT.text }}>
        {isMed ? "ابدأ رحلة التأمل" : "ابدأ دفتر الدراسة"}
      </h2>
      <p className="mx-auto mt-2 max-w-[280px] text-[12px] leading-relaxed" style={{ color: JOURNAL_VAULT.textMuted }}>
        {isMed
          ? "دوّن ما يتحرك في قلبك — تأملات مرتبطة بالآيات لرحلة روحية أعمق."
          : "سجّل ملاحظاتك وأفكارك — للمراجعة والدراسة والبحث لاحقاً."}
      </p>
      <button
        type="button"
        onClick={onCompose}
        className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-bold transition active:scale-[0.98]"
        style={{
          background: `linear-gradient(180deg, ${accent} 0%, ${isMed ? "#5a9e78" : "#4a8ec8"} 100%)`,
          color: "#0a1020",
          boxShadow: `0 8px 24px ${isMed ? JOURNAL_VAULT.meditationGlow : "rgba(110,181,240,0.35)"}`,
        }}
      >
        <Plus className="h-4 w-4" />
        {isMed ? "تأمل جديد" : "ملاحظة جديدة"}
      </button>
    </div>
  );
}

export function BibleJournalPremiumScreen({
  onBack,
  fromBible2,
  initialTab = "note",
  initialCompose = false,
  verseLink,
}: {
  onBack: () => void;
  fromBible2: boolean;
  initialTab?: JournalKind;
  initialCompose?: boolean;
  verseLink?: {
    book: string;
    bookName?: string;
    chapter: number;
    verse?: number;
    verseText?: string;
  };
}) {
  const { notes, meditations, upsert, remove } = useBibleJournal();
  const [tab, setTab] = useState<JournalKind>(initialTab);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(initialCompose);
  const [editEntry, setEditEntry] = useState<BibleJournalEntry | null>(null);
  const [resolvedVerseLink, setResolvedVerseLink] = useState(verseLink);
  const [lockReference, setLockReference] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const prefill = consumeJournalVersePrefill();
    if (prefill) {
      setResolvedVerseLink({
        book: prefill.book,
        bookName: prefill.bookName,
        chapter: prefill.chapter,
        verse: prefill.verse,
        verseText: prefill.verseText,
      });
      setLockReference(true);
      if (prefill.kind) setTab(prefill.kind);
      setComposeOpen(true);
    } else if (verseLink) {
      setResolvedVerseLink(verseLink);
    }
  }, [verseLink]);

  const list = tab === "meditation" ? meditations : notes;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter(
      (e) =>
        e.body.toLowerCase().includes(q) ||
        (e.title?.toLowerCase().includes(q) ?? false) ||
        (e.prompt?.toLowerCase().includes(q) ?? false) ||
        (entryRefLabel(e)?.toLowerCase().includes(q) ?? false),
    );
  }, [list, search]);

  const spotlight = filtered[0] ?? null;
  const rest = filtered.length > 1 ? filtered.slice(1) : [];

  const openCompose = useCallback((kind?: JournalKind) => {
    setEditEntry(null);
    setLockReference(false);
    setResolvedVerseLink(undefined);
    if (kind) setTab(kind);
    setComposeOpen(true);
  }, []);

  const openEdit = useCallback((entry: BibleJournalEntry) => {
    setEditEntry(entry);
    setLockReference(false);
    setTab(entry.kind);
    setComposeOpen(true);
  }, []);

  const handleSave = useCallback(
    (entry: BibleJournalEntry) => {
      upsert(entry);
      setTab(entry.kind);
    },
    [upsert],
  );

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-alpha-base text-alpha">
      <HeroLedgerStylesHost />
      <JournalVaultStyles />
      <JournalVaultBackdrop tab={tab} />

      <div className="relative z-10 mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        <header
          className="sticky top-0 z-30 -mx-1 mb-2 flex items-center justify-between gap-2 rounded-2xl border px-1 py-2 backdrop-blur-xl"
          style={{
            borderColor: "rgba(212,175,55,0.28)",
            background: "rgba(250,247,242,0.92)",
            top: "max(env(safe-area-inset-top), 8px)",
          }}
        >
          <BackButton onBack={onBack} compact tone="light" />
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-wide" style={{ color: JOURNAL_VAULT.gold }}>
              ✦ ALPHA BIBLE ✦
            </p>
            <h1 className="font-arabic-serif text-[17px] font-extrabold" style={{ color: JOURNAL_VAULT.text }}>
              الملاحظات والتأملات
            </h1>
          </div>
          <button
            type="button"
            aria-label="تدوين جديد"
            onClick={() => openCompose(tab)}
            className="grid h-9 w-9 place-items-center rounded-full border transition active:scale-95"
            style={{
              borderColor: `${JOURNAL_VAULT.gold}44`,
              background: "rgba(231,201,122,0.12)",
              color: JOURNAL_VAULT.gold,
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </header>

        <section
          className="journal-vault-hero relative mt-3 overflow-hidden rounded-[26px] border p-5"
          style={{
            borderColor: JOURNAL_VAULT.border,
            background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,239,228,0.88) 100%)",
          }}
        >
          <div className="pointer-events-none absolute left-3 top-3 text-[#7ec8f0]/30" aria-hidden>
            <CopticMiniCross size={14} />
          </div>
          <div className="pointer-events-none absolute right-3 top-3 text-[#a8e8cc]/30" aria-hidden>
            <CopticMiniCross size={14} />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2" aria-hidden>
            <CopticCross size={16} className="text-[#e7c97a]/45" />
          </div>

          <div className="relative pt-4 text-right">
            <p className="text-[12px] font-bold" style={{ color: JOURNAL_VAULT.gold }}>
              دفترك الروحي
            </p>
            <p className="mt-1 font-arabic-serif text-[21px] font-extrabold leading-snug" style={{ color: JOURNAL_VAULT.text }}>
              للدراسة · للتأمل · للنمو
            </p>
            <p className="mt-2 max-w-[300px] text-[11px] leading-relaxed" style={{ color: JOURNAL_VAULT.textMuted }}>
              مساحة هادئة لتدوين ما تتعلمه وتتأمل فيه — مرجع شخصي ينمو معك.
            </p>

            <div className="mt-5 flex items-stretch justify-start gap-3">
              <JournalHeroTabChip
                active={tab === "note"}
                count={notes.length}
                label="ملاحظات الدراسة"
                icon={FilePen}
                accent={JOURNAL_VAULT.noteAccent}
                accentBright={JOURNAL_VAULT.noteAccentBright}
                bgActive="rgba(110,181,240,0.18)"
                borderIdle="rgba(110,181,240,0.28)"
                onSelect={() => setTab("note")}
              />
              <JournalHeroTabChip
                active={tab === "meditation"}
                count={meditations.length}
                label="التأملات"
                icon={Flame}
                accent={JOURNAL_VAULT.meditationAccent}
                accentBright={JOURNAL_VAULT.meditationAccentBright}
                bgActive="rgba(100,200,160,0.16)"
                borderIdle="rgba(100,200,160,0.28)"
                onSelect={() => setTab("meditation")}
              />
            </div>
          </div>
        </section>

        <JournalBibleSearchRow />

        <p className="mt-4 text-[10px] font-bold" style={{ color: JOURNAL_VAULT.goldMuted }}>
          {tab === "meditation" ? "بحث في تأملاتك" : "بحث في ملاحظاتك"}
        </p>
        <div
          className="mt-2 flex items-center gap-2 rounded-2xl border bg-white/80 px-3 py-2.5"
          style={{ borderColor: "rgba(212,175,55,0.28)" }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: JOURNAL_VAULT.textMuted }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "meditation" ? "ابحث في تأملاتك…" : "ابحث في ملاحظاتك…"}
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: JOURNAL_VAULT.text }}
          />
        </div>

        {filtered.length === 0 ? (
          search.trim() ? (
            <p className="mt-10 text-center text-[13px]" style={{ color: JOURNAL_VAULT.textMuted }}>
              لا نتائج لـ «{search}»
            </p>
          ) : (
            <JournalEmptyState tab={tab} onCompose={() => openCompose(tab)} />
          )
        ) : (
          <>
            {spotlight ? (
              <JournalSpotlightCard
                entry={spotlight}
                onEdit={() => openEdit(spotlight)}
                onRemove={() => remove(spotlight.id)}
              />
            ) : null}
            {rest.length > 0 ? (
              <>
                <p className="mt-6 text-right text-[10px] font-bold" style={{ color: JOURNAL_VAULT.gold }}>
                  {tab === "meditation" ? "تأملات سابقة" : "ملاحظات سابقة"}
                </p>
                <ul className="mt-3 space-y-3.5">
                  {rest.map((entry, index) => (
                    <JournalEntryCard
                      key={entry.id}
                      entry={entry}
                      index={index}
                      onEdit={() => openEdit(entry)}
                      onRemove={() => remove(entry.id)}
                    />
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}

        {filtered.length > 0 ? (
          <p className="mt-8 text-center text-[10px] font-medium" style={{ color: JOURNAL_VAULT.textMuted }}>
            شارك · عدّل · احذف — الأزرار على اليمين
          </p>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="تدوين جديد"
        onClick={() => openCompose(tab)}
        className="fixed z-50 grid h-14 w-14 place-items-center rounded-full border shadow-lg transition active:scale-95"
        style={{
          right: "max(16px, env(safe-area-inset-right))",
          bottom: "calc(88px + env(safe-area-inset-bottom))",
          borderColor: `${JOURNAL_VAULT.gold}55`,
          background: `linear-gradient(180deg, ${JOURNAL_VAULT.gold} 0%, #b8893a 100%)`,
          color: "#1a1020",
          boxShadow: "0 8px 32px rgba(231,201,122,0.4)",
        }}
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <JournalComposeSheet
        open={composeOpen}
        kind={tab}
        entry={editEntry}
        verseLink={lockReference ? resolvedVerseLink : undefined}
        lockReference={lockReference}
        onClose={() => {
          setComposeOpen(false);
          setEditEntry(null);
          setLockReference(false);
        }}
        onSave={handleSave}
      />

      <BottomDock />
    </main>
  );
}
