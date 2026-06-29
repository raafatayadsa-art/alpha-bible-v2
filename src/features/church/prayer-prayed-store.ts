const STORAGE_KEY = "ab:prayer-prayed-ids-v1";

export function readPrayedRequestIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function writePrayedRequestIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function markPrayedRequest(id: string, prayed: boolean) {
  const next = readPrayedRequestIds();
  if (prayed) next.add(id);
  else next.delete(id);
  writePrayedRequestIds(next);
  return next;
}
