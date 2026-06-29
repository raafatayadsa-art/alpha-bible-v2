import { useCallback, useEffect, useState } from "react";

export type JournalCustomOption = {
  id: string;
  label: string;
  emoji?: string;
};

const CUSTOM_ID_PREFIX = "custom:";

export function isJournalCustomOptionId(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX);
}

export function createJournalCustomOptionId(): string {
  return `${CUSTOM_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readCustomOptions(key: string): JournalCustomOption[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalCustomOption[];
    return Array.isArray(parsed) ? parsed.filter((o) => o?.id && o?.label) : [];
  } catch {
    return [];
  }
}

function writeCustomOptions(key: string, items: JournalCustomOption[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("ab:storage", { detail: { key } }));
    void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
      scheduleUserDataSync({ delayMs: 1500, extraKey: key }),
    );
  } catch {
    /* ignore */
  }
}

export const JOURNAL_CUSTOM_KEYS = {
  meditationPrompts: "ab:journal:custom:meditation-prompts",
  notePrompts: "ab:journal:custom:note-prompts",
  studyTags: "ab:journal:custom:study-tags",
} as const;

export function useJournalCustomOptions(storageKey: string) {
  const [items, setItems] = useState<JournalCustomOption[]>(() => readCustomOptions(storageKey));

  useEffect(() => {
    const sync = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (!detail || detail.key === storageKey) {
        setItems(readCustomOptions(storageKey));
      }
    };
    window.addEventListener("ab:storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ab:storage", sync);
      window.removeEventListener("storage", sync);
    };
  }, [storageKey]);

  const addCustom = useCallback(
    (label: string, emoji?: string) => {
      const trimmed = label.trim();
      if (!trimmed) return false;
      const next = [
        ...items.filter((item) => item.label !== trimmed),
        { id: createJournalCustomOptionId(), label: trimmed, emoji },
      ];
      setItems(next);
      writeCustomOptions(storageKey, next);
      return true;
    },
    [items, storageKey],
  );

  const removeCustom = useCallback(
    (id: string) => {
      if (!isJournalCustomOptionId(id)) return;
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      writeCustomOptions(storageKey, next);
    },
    [items, storageKey],
  );

  return { customItems: items, addCustom, removeCustom };
}
