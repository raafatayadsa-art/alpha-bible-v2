import { getAlphaRoleSync, canManageChurchPosts } from "@/features/auth";
import { getCurrentUser } from "@/features/church/current-user";
import {
  hasTripOrganizerGrant,
  isAuthorizedTripReviewer,
} from "./trip-organizer-grants";
import type { ChurchPost } from "@/data/church-posts";

export function canReviewTripPosts(userId = getCurrentUser().id, churchId?: string): boolean {
  const role = getAlphaRoleSync();
  if (role === "owner" || role === "priest") return true;
  if (role === "servant") return true;
  if (churchId && isAuthorizedTripReviewer(userId, churchId)) return true;
  return false;
}

/** Priest / owner publish trips without approval queue. */
export function canPublishTripDirectly(userId = getCurrentUser().id): boolean {
  const role = getAlphaRoleSync();
  return role === "owner" || role === "priest";
}

/** Create trips, conferences, monastery visits — not broad church admin. */
export function canCreateTripContent(churchId: string, userId = getCurrentUser().id): boolean {
  if (canManageChurchPosts(getAlphaRoleSync())) return true;
  return hasTripOrganizerGrant(userId, churchId);
}

export function canGrantTripOrganizerRole(): boolean {
  const role = getAlphaRoleSync();
  return role === "owner" || role === "priest" || role === "servant";
}

/** Trip organizers must not access broad church management surfaces. */
export function isTripOrganizerOnly(churchId: string, userId = getCurrentUser().id): boolean {
  return hasTripOrganizerGrant(userId, churchId) && !canManageChurchPosts(getAlphaRoleSync());
}

export function isTripPostPublished(post: ChurchPost): boolean {
  if (post.type !== "trip") return true;
  const status = post.details?.approvalStatus;
  return !status || status === "approved";
}

export function isTripPostPending(post: ChurchPost): boolean {
  return post.type === "trip" && post.details?.approvalStatus === "pending";
}

export function filterPublicFeedPosts(posts: ChurchPost[]): ChurchPost[] {
  return posts.filter(isTripPostPublished);
}

export function filterPendingTripPosts(posts: ChurchPost[]): ChurchPost[] {
  return posts.filter(
    (p) =>
      p.type === "trip" &&
      (p.details?.approvalStatus === "pending" || p.details?.approvalStatus === "changes_requested"),
  );
}
