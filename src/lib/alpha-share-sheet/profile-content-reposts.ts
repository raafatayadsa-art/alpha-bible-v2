import type { AlphaShareRequest } from "@/lib/alpha-share-brand";

const REPOSTS_KEY = "alpha:profile:content-reposts";
export const PROFILE_CONTENT_REPOSTS_EVENT = "ab:profile-content-reposts";

export type ProfileContentRepost = AlphaShareRequest & {
  id: string;
  repostedAt: number;
};

function readJson(): ProfileContentRepost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REPOSTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProfileContentRepost[];
  } catch {
    return [];
  }
}

function writeJson(items: ProfileContentRepost[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REPOSTS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(PROFILE_CONTENT_REPOSTS_EVENT));
  } catch {
    /* ignore */
  }
}

export function readProfileContentReposts(): ProfileContentRepost[] {
  return readJson().sort((a, b) => b.repostedAt - a.repostedAt);
}

/** Share / broadcast content onto the user's Alpha profile page. */
export function repostContentToProfile(req: AlphaShareRequest): ProfileContentRepost {
  const item: ProfileContentRepost = {
    ...req,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    repostedAt: Date.now(),
  };
  const next = [item, ...readJson()].slice(0, 48);
  writeJson(next);
  return item;
}
