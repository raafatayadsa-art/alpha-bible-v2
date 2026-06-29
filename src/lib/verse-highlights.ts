import { useCallback, useEffect, useMemo, useState } from "react";
import { canUsePersonalFeaturesSync } from "@/features/auth/auth-capabilities";

export type VerseHighlightColor = "gold" | "green" | "blue" | "pink" | "yellow";

export const VERSE_HIGHLIGHT_COLORS: { id: VerseHighlightColor; bg: string; ring: string; label: string }[] = [
  { id: "pink", bg: "#fecdd3", ring: "#fb7185", label: "وردي" },
  { id: "blue", bg: "#bfdbfe", ring: "#60a5fa", label: "أزرق" },
  { id: "green", bg: "#bbf7d0", ring: "#4ade80", label: "أخضر" },
  { id: "yellow", bg: "#fef08a", ring: "#facc15", label: "أصفر" },
  { id: "gold", bg: "#fde68a", ring: "#d4af37", label: "ذهبي" },
];

const STORAGE_KEY = "ab:verse-highlights-v1";
export const VERSE_HIGHLIGHTS_CHANGED = "ab:verse-highlights-changed";

type HighlightEntry = {
  color: VerseHighlightColor;
  text?: string;
  bookName?: string;
  highlightedAt: number;
};

type Store = Record<string, HighlightEntry>;

export type HighlightedVerse = {
  id: string;
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
  text?: string;
  color: VerseHighlightColor;
  highlightedAt: number;
};

export function parseVerseKeyId(id: string): { book: string; chapter: number; verse: number } | null {
  const match = id.match(/^(.+)-(\d+)-(\d+)$/);
  if (!match) return null;
  return { book: match[1], chapter: Number(match[2]), verse: Number(match[3]) };
}

function normalizeStore(raw: unknown): Store {
  if (!raw || typeof raw !== "object") return {};
  const out: Store = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") {
      out[key] = { color: value as VerseHighlightColor, highlightedAt: 0 };
    } else if (value && typeof value === "object" && "color" in value) {
      out[key] = value as HighlightEntry;
    }
  }
  return out;
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return normalizeStore(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(VERSE_HIGHLIGHTS_CHANGED));
  void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
    scheduleUserDataSync({ delayMs: 1500, extraKey: STORAGE_KEY }),
  );
}

export function getVerseHighlight(verseId: string): VerseHighlightColor | null {
  if (!canUsePersonalFeaturesSync()) return null;
  return readStore()[verseId]?.color ?? null;
}

export function setVerseHighlight(
  verseId: string,
  color: VerseHighlightColor | null,
  meta?: { text?: string; bookName?: string },
) {
  if (!canUsePersonalFeaturesSync()) return;
  const store = readStore();
  if (!color) {
    delete store[verseId];
  } else {
    const prev = store[verseId];
    store[verseId] = {
      color,
      text: meta?.text ?? prev?.text,
      bookName: meta?.bookName ?? prev?.bookName,
      highlightedAt: Date.now(),
    };
  }
  writeStore(store);
}

export function listHighlightedVerses(): HighlightedVerse[] {
  if (!canUsePersonalFeaturesSync()) return [];
  const store = readStore();
  return Object.entries(store)
    .map(([id, entry]) => {
      const parsed = parseVerseKeyId(id);
      if (!parsed) return null;
      return {
        id,
        book: parsed.book,
        bookName: entry.bookName || parsed.book,
        chapter: parsed.chapter,
        verse: parsed.verse,
        text: entry.text,
        color: entry.color,
        highlightedAt: entry.highlightedAt || 0,
      } satisfies HighlightedVerse;
    })
    .filter((row): row is HighlightedVerse => row != null)
    .sort((a, b) => b.highlightedAt - a.highlightedAt);
}

export function useVerseHighlights() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const sync = () => setTick((t) => t + 1);
    window.addEventListener(VERSE_HIGHLIGHTS_CHANGED, sync);
    return () => window.removeEventListener(VERSE_HIGHLIGHTS_CHANGED, sync);
  }, []);

  const highlights = useMemo(() => listHighlightedVerses(), [tick]);
  const remove = useCallback((id: string) => setVerseHighlight(id, null), []);

  return { highlights, remove, count: highlights.length };
}

export function highlightStyles(color: VerseHighlightColor | null, spiritualMode: boolean) {
  if (!color) return undefined;
  const entry = VERSE_HIGHLIGHT_COLORS.find((c) => c.id === color);
  if (!entry) return undefined;
  return {
    background: spiritualMode ? `${entry.bg}22` : `${entry.bg}88`,
    borderColor: `${entry.ring}55`,
    boxShadow: `inset 0 0 0 1px ${entry.ring}33`,
  };
}

/** Light vault card surface — full highlight tint for saved highlights screen. */
export function highlightVaultCardStyle(color: VerseHighlightColor) {
  const entry = highlightColorMeta(color);
  if (!entry) return null;
  return {
    background: `linear-gradient(155deg, ${entry.bg} 0%, color-mix(in srgb, ${entry.bg} 68%, white) 52%, color-mix(in srgb, ${entry.bg} 82%, white) 100%)`,
    borderColor: `${entry.ring}88`,
    boxShadow: [
      `0 2px 4px -1px ${entry.ring}33`,
      `0 10px 28px -8px ${entry.ring}55`,
      `0 22px 44px -18px rgba(42,31,18,0.22)`,
      "inset 0 1px 0 rgba(255,255,255,0.92)",
      `inset 0 -2px 0 ${entry.ring}28`,
    ].join(", "),
    ring: entry.ring,
    bg: entry.bg,
    label: entry.label,
  };
}

export function highlightColorMeta(color: VerseHighlightColor) {
  return VERSE_HIGHLIGHT_COLORS.find((c) => c.id === color);
}
