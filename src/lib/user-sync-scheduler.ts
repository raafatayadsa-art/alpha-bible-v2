/** Thin entry for scheduling cloud sync — safe to import from any localStorage writer. */

export function touchUserSyncExtraKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    const metaKey = "ab:user-sync-extra-meta";
    const raw = window.localStorage.getItem(metaKey);
    const meta = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    meta[key] = Date.now();
    window.localStorage.setItem(metaKey, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

export function scheduleUserDataSync(opts?: { delayMs?: number; debounced?: boolean; extraKey?: string }) {
  if (opts?.extraKey) touchUserSyncExtraKey(opts.extraKey);
  void import("@/lib/user-progress-sync").then((m) => {
    if (opts?.debounced) m.scheduleUserProgressPushDebounced(opts?.delayMs ?? 6000);
    else m.scheduleUserProgressPush(opts?.delayMs ?? 2500);
  });
}

export function flushUserDataSync() {
  void import("@/lib/user-progress-sync").then((m) => m.flushUserProgressPush());
}
