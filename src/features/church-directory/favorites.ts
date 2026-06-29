const FAVORITES_KEY = "alpha:church-directory:favorites";

export function readFavoriteChurchIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavoriteChurch(id: string): boolean {
  return readFavoriteChurchIds().includes(id);
}

export function toggleFavoriteChurch(id: string): boolean {
  if (typeof window === "undefined") return false;
  const set = new Set(readFavoriteChurchIds());
  const next = set.has(id);
  if (next) set.delete(id);
  else set.add(id);
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...set]));
  window.dispatchEvent(new CustomEvent("ab:church-directory-favorites"));
  void import("@/lib/user-sync-scheduler").then(({ scheduleUserDataSync }) =>
    scheduleUserDataSync({ delayMs: 1500, extraKey: FAVORITES_KEY }),
  );
  return !next;
}
