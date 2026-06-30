import { CHURCH_POSTS } from "@/data/church-posts";
import type { ProfileCollectionEntry, ProfileCollectionItem } from "./types";

const STORAGE_KEY = "ab:profile:collection";

const SEED: ProfileCollectionItem[] = [
  {
    id: "col-1",
    refType: "church_post",
    refId: "feast-cross",
    addedByName: "مينا عاطف",
    addedAgo: "منذ ٣ أيام",
    addedAt: Date.now() - 3 * 86_400_000,
  },
  {
    id: "col-2",
    refType: "church_post",
    refId: "trip-monastery",
    addedByName: "مينا عاطف",
    addedAgo: "منذ أسبوع",
    addedAt: Date.now() - 7 * 86_400_000,
  },
];

function readRaw(): ProfileCollectionItem[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    const parsed = JSON.parse(raw) as ProfileCollectionItem[];
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

function resolvePost(refId: string) {
  return CHURCH_POSTS.find((p) => p.id === refId) ?? null;
}

/** Profile stores references — live post data is resolved at read time. */
export function getProfileCollection(): ProfileCollectionEntry[] {
  return readRaw()
    .map((item) => ({
      ...item,
      post: item.refType === "church_post" ? resolvePost(item.refId) : null,
    }))
    .filter((item) => item.post != null);
}

export function addChurchPostToProfile(refId: string, addedByName: string): void {
  if (typeof window === "undefined") return;
  const items = readRaw().filter((i) => i.refId !== refId);
  items.unshift({
    id: `col-${Date.now()}`,
    refType: "church_post",
    refId,
    addedByName,
    addedAgo: "الآن",
    addedAt: Date.now(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
