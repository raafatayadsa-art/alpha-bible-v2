import newsCandle from "@/assets/home/news-candle.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import newsMass from "@/assets/home/news-mass.jpg";
import cardChildren from "@/assets/home/card-children.jpg";
import heavenlyChurch from "@/assets/home/heavenly-church.png";
import cardAgpeya from "@/assets/home/card-agpeya.jpg";
import cardChurch from "@/assets/home/card-church.jpg";
import dailyPrayer from "@/assets/home/daily-prayer.jpg";
import heroChurchPremium from "@/assets/home/hero-church-premium.jpg";
import artFeast from "@/assets/home/art-feast.jpg";
import artSaint from "@/assets/home/art-saint.jpg";
import cardSynaxarium from "@/assets/home/card-synaxarium.jpg";
import artReadings from "@/assets/home/art-readings.jpg";
import feastHolyLight from "@/assets/feasts/feast-holy-light.jpg";
import feastCrucifixion from "@/assets/feasts/feast-crucifixion.jpg";
import agpeyaHeader from "@/assets/agpeya/header-still.jpg";
import dailyHymn from "@/assets/home/daily-hymn.jpg";
import cardMeditation from "@/assets/home/card-meditation.jpg";
import cardKatameros from "@/assets/home/card-katameros.jpg";
import cardBible from "@/assets/home/card-bible.jpg";
import dailyMeditation from "@/assets/home/daily-meditation.jpg";
import saintAntony from "@/assets/synaxarium/saint-antony.jpg";
import saintShenouda from "@/assets/synaxarium/saint-shenouda.jpg";
import feastCovenant from "@/assets/feasts/feast-covenant.jpg";
import artVerse from "@/assets/home/art-verse.jpg";
import feastEmptyTomb from "@/assets/feasts/feast-empty-tomb.jpg";
import feastThomas from "@/assets/feasts/feast-thomas.jpg";
import type { ChurchPost, PostType } from "@/data/church-posts";

/** Builder / auto-image category — each has a unique primary fallback. */
export type ImageCategoryKey =
  | "news"
  | "announcement"
  | "liturgy"
  | "meeting"
  | "event"
  | "report"
  | "prayer"
  | "trip"
  | "wedding-full"
  | "wedding-half"
  | "condolence"
  | "fortyDay"
  | "annual"
  | "live";

/**
 * Premium Coptic Orthodox image pools — no shared primary across categories.
 * Deterministic pick per post id keeps the same cover after reload.
 */
const IMAGE_POOLS: Record<ImageCategoryKey, readonly string[]> = {
  news: [heroChurchPremium, cardChurch, artFeast, artSaint, cardSynaxarium],
  announcement: [artReadings, heroChurchPremium, cardChurch, newsMass],
  liturgy: [newsMass, feastHolyLight, feastCrucifixion, agpeyaHeader, cardAgpeya],
  meeting: [newsYouth, cardChildren, artReadings],
  event: [dailyHymn, cardMeditation, newsYouth],
  report: [cardKatameros, cardBible, artReadings],
  prayer: [dailyPrayer, dailyMeditation, cardAgpeya],
  trip: [saintAntony, saintShenouda, heavenlyChurch],
  "wedding-full": [artFeast, cardChildren, feastCovenant],
  "wedding-half": [feastCovenant, cardChildren, artVerse],
  condolence: [newsCandle, feastEmptyTomb, dailyMeditation],
  fortyDay: [dailyMeditation, newsCandle, artSaint],
  annual: [artSaint, dailyMeditation, feastThomas],
  live: [heavenlyChurch, heroChurchPremium, newsMass],
};

/** Unique fallback per category — never reused as primary for another category. */
const PRIMARY_FALLBACK: Record<ImageCategoryKey, string> = {
  news: heroChurchPremium,
  announcement: artReadings,
  liturgy: newsMass,
  meeting: newsYouth,
  event: dailyHymn,
  report: cardKatameros,
  prayer: dailyPrayer,
  trip: saintAntony,
  "wedding-full": artFeast,
  "wedding-half": feastCovenant,
  condolence: newsCandle,
  fortyDay: dailyMeditation,
  annual: artSaint,
  live: heavenlyChurch,
};

const TYPE_DEFAULT_CATEGORY: Record<PostType, ImageCategoryKey> = {
  news: "news",
  announcement: "announcement",
  liturgy: "liturgy",
  meeting: "meeting",
  event: "event",
  report: "report",
  prayer: "prayer",
  trip: "trip",
  wedding: "wedding-full",
  condolence: "condolence",
};

const CATEGORY_TO_TYPE: Record<string, PostType> = {
  news: "news",
  announcement: "announcement",
  liturgy: "liturgy",
  meeting: "meeting",
  trip: "trip",
  "wedding-full": "wedding",
  "wedding-half": "wedding",
  condolence: "condolence",
  fortyDay: "condolence",
  annual: "condolence",
  report: "report",
  prayer: "prayer",
  event: "event",
  live: "news",
};

/** Legacy export — unique primary per PostType. */
export const DEFAULT_POST_IMAGES: Record<PostType, string> = {
  news: PRIMARY_FALLBACK.news,
  announcement: PRIMARY_FALLBACK.announcement,
  liturgy: PRIMARY_FALLBACK.liturgy,
  meeting: PRIMARY_FALLBACK.meeting,
  event: PRIMARY_FALLBACK.event,
  report: PRIMARY_FALLBACK.report,
  prayer: PRIMARY_FALLBACK.prayer,
  trip: PRIMARY_FALLBACK.trip,
  wedding: PRIMARY_FALLBACK["wedding-full"],
  condolence: PRIMARY_FALLBACK.condolence,
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function resolveCategoryFromPost(
  post: Pick<ChurchPost, "type" | "details">,
): ImageCategoryKey {
  const et = post.details?.eventType;
  if (post.type === "condolence") {
    if (et === "أربعين") return "fortyDay";
    if (et === "ذكرى سنوية") return "annual";
    return "condolence";
  }
  if (post.type === "wedding") {
    if (et === "نصف إكليل") return "wedding-half";
    return "wedding-full";
  }
  return TYPE_DEFAULT_CATEGORY[post.type] ?? "news";
}

export function getPrimaryFallback(category: ImageCategoryKey): string {
  return PRIMARY_FALLBACK[category] ?? cardChurch;
}

export function getDefaultPostImage(type: PostType): string {
  return PRIMARY_FALLBACK[TYPE_DEFAULT_CATEGORY[type]] ?? cardChurch;
}

export function getFallbackPostImage(
  post: Pick<ChurchPost, "type" | "details">,
): string {
  return getPrimaryFallback(resolveCategoryFromPost(post));
}

export function isValidPostImage(src: string | null | undefined): boolean {
  if (!src || typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return false;
  if (trimmed.startsWith("data:") && trimmed.length < 32) return false;
  return true;
}

export function isUserUploadedImage(src: string): boolean {
  return src.trim().startsWith("data:");
}

export function isImageAllowedForCategory(
  src: string,
  category: ImageCategoryKey,
): boolean {
  if (isUserUploadedImage(src)) return true;
  return IMAGE_POOLS[category].includes(src);
}

/** Stable auto image for a category + post id (same id → same image after reload). */
export function assignCategoryImage(
  category: ImageCategoryKey,
  postId: string,
): string {
  const pool = IMAGE_POOLS[category];
  if (!pool.length) return getPrimaryFallback(category);
  return pool[hashSeed(`${category}:${postId}`) % pool.length];
}

export function assignPostImage(
  post: Pick<ChurchPost, "id" | "type" | "details">,
): string {
  return assignCategoryImage(resolveCategoryFromPost(post), post.id);
}

/**
 * Persisted image wins if valid and matches the post category (or user upload).
 * Otherwise assign a stable category-appropriate image.
 */
export function ensurePostImageStored(post: ChurchPost): ChurchPost {
  const category = resolveCategoryFromPost(post);
  if (
    isValidPostImage(post.image) &&
    isImageAllowedForCategory(post.image, category)
  ) {
    return post;
  }
  return { ...post, image: assignCategoryImage(category, post.id) };
}

export function resolvePostImageSrc(
  image: string | null | undefined,
  post: Pick<ChurchPost, "id" | "type" | "details">,
): string {
  const category = resolveCategoryFromPost(post);
  if (isValidPostImage(image) && isImageAllowedForCategory(image!, category)) {
    return image!.trim();
  }
  return assignCategoryImage(category, post.id);
}

export function resolvePostImage(
  post: Pick<ChurchPost, "image" | "id" | "type" | "details">,
): string {
  return resolvePostImageSrc(post.image, post);
}

/** Auto image for the post builder — stable preview per category until publish assigns post id. */
export function generatePostImage(
  categoryKey: string,
  postId?: string,
): string {
  const category = (categoryKey in IMAGE_POOLS
    ? categoryKey
    : CATEGORY_TO_TYPE[categoryKey]
      ? TYPE_DEFAULT_CATEGORY[CATEGORY_TO_TYPE[categoryKey]]
      : "news") as ImageCategoryKey;
  const seed = postId ?? `preview:${categoryKey}`;
  return assignCategoryImage(category, seed);
}
