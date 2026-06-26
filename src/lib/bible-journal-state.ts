import { useCallback, useEffect, useState } from "react";

export type JournalKind = "note" | "meditation";

export type StudyTag = "study" | "application" | "prayer" | "question";

export type BibleJournalEntry = {
  id: string;
  kind: JournalKind;
  title?: string;
  body: string;
  book?: string;
  bookName?: string;
  chapter?: number;
  verse?: number;
  verseText?: string;
  prompt?: string;
  tag?: StudyTag | string;
  createdAt: number;
  updatedAt: number;
};

const KEY = "ab:bible:journal";

function read<T>(fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("ab:storage", { detail: { key: KEY } }));
  } catch {
    /* ignore */
  }
}

function useJournalList(): [BibleJournalEntry[], (v: BibleJournalEntry[]) => void] {
  const [list, setList] = useState<BibleJournalEntry[]>(() => read([]));
  useEffect(() => {
    const sync = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (!detail || detail.key === KEY) setList(read([]));
    };
    window.addEventListener("ab:storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ab:storage", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const setAndPersist = useCallback((v: BibleJournalEntry[]) => {
    setList(v);
    write(v);
  }, []);
  return [list, setAndPersist];
}

export function journalEntryId() {
  return `journal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useBibleJournal() {
  const [entries, setEntries] = useJournalList();

  const upsert = useCallback(
    (entry: BibleJournalEntry) => {
      const exists = entries.some((e) => e.id === entry.id);
      const next = exists
        ? entries.map((e) => (e.id === entry.id ? entry : e))
        : [entry, ...entries];
      setEntries(next);
      return entry;
    },
    [entries, setEntries],
  );

  const remove = useCallback(
    (id: string) => {
      setEntries(entries.filter((e) => e.id !== id));
    },
    [entries, setEntries],
  );

  const notes = entries.filter((e) => e.kind === "note");
  const meditations = entries.filter((e) => e.kind === "meditation");

  return { entries, notes, meditations, upsert, remove };
}
