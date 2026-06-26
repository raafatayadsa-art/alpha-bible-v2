import type { PublisherContentItem } from "./types";
import { seedHeroCount } from "@/components/home/hero-card-chrome";

const STORAGE_KEY = "alpha-publisher-hero-engagement-v1";

export type HeroSlideEngagement = {
  liked: boolean;
  shared: boolean;
  likeCount: number;
  shareCount: number;
};

const QR_STORAGE_KEY = "alpha-publisher-qr-count-v1";

function readQrStore(): Record<string, number> {
  try {
    const raw = localStorage.getItem(QR_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeQrStore(store: Record<string, number>) {
  try {
    localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function readPublisherQrCount(publisherId: string): number {
  const saved = readQrStore()[publisherId];
  if (saved != null) return saved;
  return seedHeroCount(publisherId, 19);
}

export function incrementPublisherQrCount(publisherId: string): number {
  const store = readQrStore();
  const next = (store[publisherId] ?? seedHeroCount(publisherId, 19)) + 1;
  store[publisherId] = next;
  writeQrStore(store);
  return next;
}

function readStore(): Record<string, HeroSlideEngagement> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, HeroSlideEngagement>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, HeroSlideEngagement>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function defaultHeroSlideEngagement(item: PublisherContentItem): HeroSlideEngagement {
  const saved = readStore()[item.id];
  if (saved) return saved;
  return {
    liked: false,
    shared: false,
    likeCount: (item.likesCount ?? 0) + seedHeroCount(item.id, 7),
    shareCount: seedHeroCount(item.id, 11),
  };
}

export function persistHeroSlideEngagement(contentId: string, patch: Partial<HeroSlideEngagement>) {
  const store = readStore();
  const current = store[contentId] ?? { liked: false, shared: false, likeCount: 0, shareCount: 0 };
  store[contentId] = { ...current, ...patch };
  writeStore(store);
}
