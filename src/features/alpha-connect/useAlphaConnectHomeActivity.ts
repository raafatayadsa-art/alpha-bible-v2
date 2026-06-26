import { useMemo } from "react";
import { connectListChannelsForViewer } from "@/components/alpha/connect-alpha-access";
import { getConnectChannelOnlineCount } from "@/components/alpha/connect-channels-registry";
import { getAuthUserSync } from "@/features/auth/auth-context";
import { getCurrentUser } from "@/features/church/current-user";
import { getConnectMissedCallsCount } from "./connect-call-log";
import { getConnectHomePreviewUnread } from "./connect-home-preview";
import { useAlphaConnectConversationList } from "./useAlphaConnectConversationList";

export type AlphaConnectHomeActivity = {
  unreadMessages: number;
  missedCalls: number;
  activeChannels: number;
  activityLine: string;
  hasAnyActivity: boolean;
  loading: boolean;
};

function buildActivityLine(input: {
  unreadMessages: number;
  missedCalls: number;
  activeChannels: number;
  isAuthenticated: boolean;
  hasConversations: boolean;
}): string {
  const parts: string[] = [];

  if (input.unreadMessages > 0) {
    parts.push(
      input.unreadMessages === 1
        ? "رسالة جديدة واحدة"
        : `${input.unreadMessages} رسائل جديدة`,
    );
  }

  if (input.missedCalls > 0) {
    parts.push(
      input.missedCalls === 1
        ? "مكالمة فائتة واحدة"
        : `${input.missedCalls} مكالمات فائتة`,
    );
  }

  if (parts.length > 0) return parts.join(" • ");

  if (input.activeChannels > 0) {
    return input.activeChannels === 1
      ? "قناة نشطة واحدة"
      : `${input.activeChannels} قنوات نشطة`;
  }

  if (input.isAuthenticated && input.hasConversations) {
    return "لا يوجد نشاط جديد";
  }

  return "ابدأ محادثة أو انضم إلى قناة";
}

export function useAlphaConnectHomeActivity(): AlphaConnectHomeActivity {
  const authUser = getAuthUserSync();
  const viewerId = authUser?.id ?? getCurrentUser().id ?? "creator";
  const { conversations, loading } = useAlphaConnectConversationList(Boolean(authUser?.id));

  return useMemo(() => {
    const unreadFromList = conversations.reduce((total, conv) => total + (conv.unread ?? 0), 0);
    const unreadMessages = Math.max(unreadFromList, getConnectHomePreviewUnread());
    const missedCalls = getConnectMissedCallsCount();
    const channels = connectListChannelsForViewer(viewerId);
    const activeChannels = channels.filter((channel) => getConnectChannelOnlineCount(channel.id) > 0).length;

    const activityLine = buildActivityLine({
      unreadMessages,
      missedCalls,
      activeChannels,
      isAuthenticated: Boolean(authUser?.id),
      hasConversations: conversations.length > 0,
    });

    return {
      unreadMessages,
      missedCalls,
      activeChannels,
      activityLine,
      hasAnyActivity: unreadMessages > 0 || missedCalls > 0 || activeChannels > 0,
      loading: Boolean(authUser?.id) && loading,
    };
  }, [authUser?.id, conversations, loading, viewerId]);
}
