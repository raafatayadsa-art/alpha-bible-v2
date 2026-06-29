import type { CommunityMoment } from "./community-types";

export type CommunityInterstitialVariant =
  | "prayer-counter"
  | "prayer-alarm"
  | "reading-nudge"
  | "agpeya-nudge"
  | "streak";

export type CommunityFeedItem =
  | { type: "moment"; moment: CommunityMoment }
  | { type: "interstitial"; id: string; variant: CommunityInterstitialVariant };

const VARIANTS: CommunityInterstitialVariant[] = [
  "prayer-counter",
  "prayer-alarm",
  "reading-nudge",
  "agpeya-nudge",
  "streak",
];

/** Insert a different engagement card every 2–3 posts. */
export function buildCommunityFeedItems(moments: CommunityMoment[]): CommunityFeedItem[] {
  if (!moments.length) return [];

  const items: CommunityFeedItem[] = [];
  let sinceLast = 0;
  let variantIdx = 0;

  for (let i = 0; i < moments.length; i += 1) {
    items.push({ type: "moment", moment: moments[i]! });
    sinceLast += 1;

    const isLast = i === moments.length - 1;
    const gap = variantIdx % 2 === 0 ? 2 : 3;
    if (!isLast && sinceLast >= gap) {
      items.push({
        type: "interstitial",
        id: `feed-inter-${variantIdx}-${moments[i]!.id}`,
        variant: VARIANTS[variantIdx % VARIANTS.length]!,
      });
      variantIdx += 1;
      sinceLast = 0;
    }
  }

  return items;
}
