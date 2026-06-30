import { useCallback, useState } from "react";

const STORAGE_KEY = "ab:dismissed-friend-suggestions";

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function persistDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota */
  }
}

export function useDismissedFriendSuggestions() {
  const [dismissed, setDismissed] = useState<Set<string>>(readDismissed);

  const dismiss = useCallback((userId: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(userId);
      persistDismissed(next);
      return next;
    });
  }, []);

  const isDismissed = useCallback((userId: string) => dismissed.has(userId), [dismissed]);

  return { dismiss, isDismissed };
}
