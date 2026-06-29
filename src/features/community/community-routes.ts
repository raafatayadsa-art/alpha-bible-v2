/** Canonical hub for the «مجتمعي» bottom-dock tab and share targets. */
export const COMMUNITY_HUB_PATH = "/community" as const;

export const COMMUNITY_ROUTES = {
  hub: COMMUNITY_HUB_PATH,
  friends: "/community/friends",
  discover: "/community/discover",
  groups: "/community/groups",
  addFriend: "/community/add-friend",
  spiritualRecord: "/community/spiritual-record",
  prayerRequests: "/prayer-requests",
} as const;

/** Legacy alias — old dock/docs used `/my-community` and `/church` for the hub tab. */
export const COMMUNITY_HUB_ALIASES = ["/my-community", "/my-community/"] as const;

export function isCommunityHubPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === COMMUNITY_HUB_PATH || path.startsWith(`${COMMUNITY_HUB_PATH}/`);
}
