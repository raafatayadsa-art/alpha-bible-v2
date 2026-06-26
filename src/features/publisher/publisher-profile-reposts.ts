import type { PublisherRecord } from "./types";

const REPOSTS_KEY = "alpha:profile:publisher-reposts";
const REPOSTS_EVENT = "ab:profile-publisher-reposts";

export type ProfilePublisherRepost = {
  publisherId: string;
  publisherName: string;
  coverUrl: string | null;
  highlightTitle: string | null;
  contentId?: string | null;
  mediaUrl?: string | null;
  durationSeconds?: number | null;
  repostedAt: number;
};

function readJson<T>(fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(REPOSTS_KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(value: ProfilePublisherRepost[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REPOSTS_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(REPOSTS_EVENT));
  } catch {
    /* ignore */
  }
}

export function readProfilePublisherReposts(): ProfilePublisherRepost[] {
  return readJson<ProfilePublisherRepost[]>([]).sort((a, b) => b.repostedAt - a.repostedAt);
}

/** إعادة نشر صفحة الناشر على صفحة المستخدم — كانتشار ترنيمة على الملف الشخصي. */
export function repostPublisherToProfile(
  publisher: Pick<PublisherRecord, "id" | "name" | "logoUrl" | "coverUrl">,
  highlight?: {
    title?: string | null;
    coverUrl?: string | null;
    contentId?: string | null;
    mediaUrl?: string | null;
    durationSeconds?: number | null;
  },
): { added: boolean; total: number } {
  const list = readProfilePublisherReposts().filter((r) => r.publisherId !== publisher.id);
  const entry: ProfilePublisherRepost = {
    publisherId: publisher.id,
    publisherName: publisher.name,
    coverUrl: highlight?.coverUrl?.trim() || publisher.coverUrl?.trim() || publisher.logoUrl?.trim() || null,
    highlightTitle: highlight?.title?.trim() || null,
    contentId: highlight?.contentId?.trim() || null,
    mediaUrl: highlight?.mediaUrl?.trim() || null,
    durationSeconds: highlight?.durationSeconds ?? null,
    repostedAt: Date.now(),
  };
  const next = [entry, ...list].slice(0, 24);
  writeJson(next);
  return { added: true, total: next.length };
}

export function subscribeProfilePublisherReposts(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(REPOSTS_EVENT, handler);
  return () => window.removeEventListener(REPOSTS_EVENT, handler);
}
