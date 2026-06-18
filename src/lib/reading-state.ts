import { useCallback, useEffect, useState } from "react";

/* ---------- Types ---------- */

export type ReadingSession = {
  book: string;
  bookName: string;
  chapter: number;
  verse?: number;
  progressPercent: number;
  scrollY: number;
  lastOpenedAt: number;
};

export type SavedVerse = {
  id: string; // `${book}-${chapter}-${verse}`
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
  text?: string;
  savedAt: number;
};

export type TypographyPrefs = {
  fontSize: number;
  lineHeight: number;
  readingWidth: number;
};

const KEYS = {
  current: "ab:reading:current",
  recent: "ab:reading:recent",
  saved: "ab:saved:verses",
  savedChapters: "ab:saved:chapters",
  typo: "ab:reader:typography",
};

const DEFAULT_TYPO: TypographyPrefs = {
  fontSize: 19,
  lineHeight: 2.15,
  readingWidth: 640,
};

/* ---------- Generic LS helpers ---------- */

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ab:storage", { detail: { key } }));
  } catch {
    /* ignore */
  }
}

function useLSValue<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    const sync = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (!detail || detail.key === key) setVal(read(key, fallback));
    };
    window.addEventListener("ab:storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ab:storage", sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);
  const setAndPersist = useCallback(
    (v: T) => {
      setVal(v);
      write(key, v);
    },
    [key],
  );
  return [val, setAndPersist];
}

/* ---------- Typography prefs ---------- */

export function useTypographyPrefs() {
  const [prefs, setPrefs] = useLSValue<TypographyPrefs>(KEYS.typo, DEFAULT_TYPO);
  const reset = useCallback(() => setPrefs(DEFAULT_TYPO), [setPrefs]);
  return { prefs, setPrefs, reset };
}

/* ---------- Saved verses ---------- */

export function verseKey(book: string, chapter: number, verse: number) {
  return `${book}-${chapter}-${verse}`;
}

export function chapterKey(book: string, chapter: number) {
  return `${book}-${chapter}`;
}

export type SavedChapter = {
  id: string;
  book: string;
  bookName: string;
  chapter: number;
  savedAt: number;
};

export function useSavedChapters() {
  const [list, setList] = useLSValue<SavedChapter[]>(KEYS.savedChapters, []);

  const isChapterSaved = useCallback(
    (id: string) => list.some((c) => c.id === id),
    [list],
  );

  const toggleChapter = useCallback(
    (c: Omit<SavedChapter, "savedAt" | "id"> & { id?: string }) => {
      const id = c.id ?? chapterKey(c.book, c.chapter);
      const exists = list.some((x) => x.id === id);
      const next = exists
        ? list.filter((x) => x.id !== id)
        : [{ ...c, id, savedAt: Date.now() } as SavedChapter, ...list];
      setList(next);
      return !exists;
    },
    [list, setList],
  );

  return { savedChapters: list, isChapterSaved, toggleChapter };
}

export function useSavedVerses() {
  const [list, setList] = useLSValue<SavedVerse[]>(KEYS.saved, []);

  const isSaved = useCallback(
    (id: string) => list.some((v) => v.id === id),
    [list],
  );

  const toggle = useCallback(
    (v: Omit<SavedVerse, "savedAt" | "id"> & { id?: string }) => {
      const id = v.id ?? verseKey(v.book, v.chapter, v.verse);
      const exists = list.some((x) => x.id === id);
      const next = exists
        ? list.filter((x) => x.id !== id)
        : [{ ...v, id, savedAt: Date.now() } as SavedVerse, ...list];
      setList(next);
      return !exists;
    },
    [list, setList],
  );

  return { saved: list, isSaved, toggle };
}

/* ---------- Reading session (current + recent) ---------- */

export function useCurrentSession() {
  const [session] = useLSValue<ReadingSession | null>(KEYS.current, null);
  return session;
}

export function useRecentSessions() {
  const [recent] = useLSValue<ReadingSession[]>(KEYS.recent, []);
  return recent;
}

export function updateSession(s: ReadingSession) {
  write(KEYS.current, s);
  const recent = read<ReadingSession[]>(KEYS.recent, []);
  const filtered = recent.filter(
    (r) => !(r.book === s.book && r.chapter === s.chapter),
  );
  const next = [s, ...filtered].slice(0, 6);
  write(KEYS.recent, next);
}
