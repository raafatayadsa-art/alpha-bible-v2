import type { ChurchPost, PostType } from "@/data/church-posts";
import type { ChurchDashboardPrayer } from "@/features/church/church-dashboard-api";
import { isPinned } from "@/features/church/post-store";
import { isLivePost } from "./post-card-styles";
import { upcomingMeetingPosts } from "./nav-context";

export type FeedItem =
  | { kind: "post-type"; post: ChurchPost; typeCount: number; postType: PostType }
  | { kind: "prayer-widget" }
  | { kind: "meetings-widget"; meetings: ChurchPost[] };

export type ComposeMixedFeedOpts = {
  /** Inject prayer widget after N post-type cards (member feed). */
  prayerWidgetAfterIndex?: number;
  includePrayerWidget?: boolean;
  includeMeetingsWidget?: boolean;
  prayers?: ChurchDashboardPrayer[];
};

export function groupPostsByType(posts: ChurchPost[]): Map<PostType, ChurchPost[]> {
  const map = new Map<PostType, ChurchPost[]>();
  for (const p of posts) {
    const list = map.get(p.type) ?? [];
    list.push(p);
    map.set(p.type, list);
  }
  return map;
}

/** One representative card per post type — latest (or pinned within type). */
export function pickLatestPerType(posts: ChurchPost[]): Array<{ post: ChurchPost; count: number }> {
  const now = Date.now();
  const byType = groupPostsByType(posts);
  const reps: Array<{ post: ChurchPost; count: number }> = [];

  for (const list of byType.values()) {
    if (!list.length) continue;
    const pinned = list.find((p) => isPinned(p, now));
    const rep = pinned ?? list[0];
    reps.push({ post: rep, count: list.length });
  }

  reps.sort((a, b) => {
    const pinDiff = Number(isPinned(b.post, now)) - Number(isPinned(a.post, now));
    if (pinDiff !== 0) return pinDiff;
    const liveDiff = Number(isLivePost(b.post)) - Number(isLivePost(a.post));
    if (liveDiff !== 0) return liveDiff;
    return (b.post.createdAt ?? 0) - (a.post.createdAt ?? 0);
  });

  return reps;
}

export function postsOfType(posts: ChurchPost[], type: PostType): ChurchPost[] {
  const now = Date.now();
  return posts
    .filter((p) => p.type === type)
    .sort((a, b) => {
      const pinDiff = Number(isPinned(b, now)) - Number(isPinned(a, now));
      if (pinDiff !== 0) return pinDiff;
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });
}

export function composeMixedFeed(posts: ChurchPost[], opts?: ComposeMixedFeedOpts): FeedItem[] {
  const reps = pickLatestPerType(posts);
  const items: FeedItem[] = [];
  const widgetAfter = opts?.prayerWidgetAfterIndex ?? 2;
  const includePrayer = opts?.includePrayerWidget !== false;
  const includeMeetings = opts?.includeMeetingsWidget !== false;
  const meetings = upcomingMeetingPosts(posts);
  let meetingsInserted = false;

  reps.forEach((rep, index) => {
    items.push({
      kind: "post-type",
      post: rep.post,
      typeCount: rep.count,
      postType: rep.post.type,
    });

    if (includePrayer && index + 1 === widgetAfter) {
      items.push({ kind: "prayer-widget" });
      if (includeMeetings && meetings.length > 0 && !meetingsInserted) {
        items.push({ kind: "meetings-widget", meetings });
        meetingsInserted = true;
      }
    }
  });

  if (includeMeetings && meetings.length > 0 && !meetingsInserted) {
    const insertAt = Math.min(3, items.length);
    items.splice(insertAt, 0, { kind: "meetings-widget", meetings });
  }

  return items;
}

export const POST_TYPE_ROUTE_TYPES: PostType[] = [
  "news",
  "announcement",
  "liturgy",
  "meeting",
  "wedding",
  "condolence",
  "prayer",
  "report",
  "event",
  "trip",
];

export function isValidPostTypeRoute(type: string): type is PostType {
  return (POST_TYPE_ROUTE_TYPES as string[]).includes(type);
}
