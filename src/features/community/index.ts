import { toast } from "sonner";
import { isAuthenticated } from "@/features/church/current-user";
import { getCachedMemberChurch } from "@/features/church/member-church-api";
import { shareToCommunity } from "./community-store";
import type { ShareToCommunityInput } from "./community-types";

export function shareSpiritualMomentToCommunity(input: ShareToCommunityInput): boolean {
  if (!isAuthenticated()) {
    toast.error("سجّل الدخول لمشاركة النشاط مع المجتمع");
    return false;
  }

  const church = getCachedMemberChurch();
  const moment = shareToCommunity(input, {
    churchId: church?.id,
    churchName: church?.name,
  });

  if (!moment) {
    toast.error("تعذّرت المشاركة — تحقق من المحتوى");
    return false;
  }

  toast.success("تمت المشاركة مع المجتمع الكنسي");
  return true;
}

export { COMMUNITY_HUB_PATH, COMMUNITY_ROUTES, isCommunityHubPath } from "./community-routes";
export { CommunityShareButton } from "./CommunityShareButton";
export { CommunityScreen } from "./CommunityScreen";
export { CommunityAddFriendScreen } from "./CommunityAddFriendScreen";
export { CommunityFriendsScreen } from "./CommunityFriendsScreen";
export { CommunityGroupsScreen } from "./CommunityGroupsScreen";
export { CommunitySpiritualRecordScreen } from "./CommunitySpiritualRecordScreen";
export { CommunityActionFab } from "./CommunityActionFab";
export { CommunityFabCoachMark } from "./CommunityFabCoachMark";
export { CommunityHubLinks } from "./CommunityHubLinks";
export { CommunitySentRequests } from "./CommunitySentRequests";
export { bootstrapCommunityRealtime } from "./community-realtime";
export * from "./spiritual-record-store";
export { useSpiritualRecord } from "./spiritual-record-store";
export { CommunityMomentCard } from "./CommunityMomentCard";
export { CommunityEngagementBar } from "./CommunityEngagementBar";
export * from "./community-types";
export * from "./community-store";
export { syncCommunityFeed } from "./community-store";
export * from "./community-api";
export * from "./community-friends-store";
export { CommunityPendingRequests } from "./CommunityPendingRequests";
export * from "./community-friends-api";
export { usePullToRefresh } from "./use-pull-to-refresh";
export { maybeEmitReadingActivity, maybeEmitAgpeyaActivity, maybeEmitPrayerIntercessionActivity } from "./community-auto-activity";
