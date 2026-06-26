import type { ChurchPost } from "@/data/church-posts";

export type ChurchFeedNavContext =
  | { scope: "member" }
  | { scope: "public"; placeId: string };

export const MEMBER_NAV: ChurchFeedNavContext = { scope: "member" };

export function publicNav(placeId: string): ChurchFeedNavContext {
  return { scope: "public", placeId };
}

export function upcomingMeetingPosts(posts: ChurchPost[], limit = 4): ChurchPost[] {
  return posts.filter((p) => p.type === "meeting" || p.type === "liturgy").slice(0, limit);
}
