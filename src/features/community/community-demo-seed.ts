import { addCommunityFriend, getCommunityFriends } from "./community-friends-store";
import {
  DEMO_COMMUNITY_COMMENTS,
  DEMO_COMMUNITY_FRIENDS,
  DEMO_COMMUNITY_MOMENTS,
  DEMO_COMMUNITY_REACTIONS,
} from "./community-demo-data";

const SEED_KEY = "ab:community-demo-preview-v2";

/** One-time seed: demo friends + feed moments for UI preview. */
export function seedDemoCommunityPreview(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_KEY)) return;

  const existingFriendIds = new Set(getCommunityFriends().map((f) => f.linkedUserId).filter(Boolean));
  for (const demo of DEMO_COMMUNITY_FRIENDS) {
    if (demo.linkedUserId && existingFriendIds.has(demo.linkedUserId)) continue;
    addCommunityFriend(demo);
  }

  void import("./community-store").then(({ mergeDemoCommunityPreview }) => {
    mergeDemoCommunityPreview({
      moments: DEMO_COMMUNITY_MOMENTS,
      comments: DEMO_COMMUNITY_COMMENTS,
      reactions: DEMO_COMMUNITY_REACTIONS,
    });
    window.localStorage.setItem(SEED_KEY, "1");
  });
}

/** Dev helper — clears seed flag so preview data can be re-applied. */
export function resetDemoCommunityPreviewSeed(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEED_KEY);
}
