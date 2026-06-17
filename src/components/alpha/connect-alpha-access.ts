import type { AlphaRole } from "@/features/auth/alpha-roles";
import { getAlphaRoleSync } from "@/features/auth";
import {
  canManageAdmins,
  getChannelMemberRole,
  isChannelAdmin,
  type ChannelMemberRole,
} from "./connect-channel-state";
import {
  canDeleteConnectChannel,
  canManageConnectChannelLifecycle,
  getConnectChannels,
  listConnectChannelsForUser,
  type ConnectChannel,
} from "./connect-channels-registry";
import {
  getCurrentViewerUserId,
  hasAlphaPermission,
  hasOfficialTrustShield,
  isAlphaOwner,
  resolveAlphaPermissionRole,
  CONNECT_FORCE_ALPHA_OWNER,
} from "@/features/alpha-connect/alpha-permissions";

export { CONNECT_FORCE_ALPHA_OWNER };

export function viewerHasAlphaOfficialShield(userId: string): boolean {
  return hasOfficialTrustShield(userId);
}

export function connectEffectiveAlphaRole(): AlphaRole {
  if (CONNECT_FORCE_ALPHA_OWNER || isAlphaOwner()) return "owner";
  return getAlphaRoleSync();
}

export function connectCanCreateChannels(): boolean {
  const userId = getCurrentViewerUserId();
  if (hasAlphaPermission(userId, "manage_channels")) return true;
  const role = resolveAlphaPermissionRole(userId);
  return role === "priest" || role === "servant";
}

export function connectViewerChannelRole(channelId: string, userId: string): ChannelMemberRole {
  if (hasAlphaPermission(userId, "manage_channels")) return "super_admin";
  return getChannelMemberRole(channelId, userId);
}

export function connectViewerCanManageChannel(channelId: string, userId: string): boolean {
  if (hasAlphaPermission(userId, "manage_channels")) return true;
  return isChannelAdmin(getChannelMemberRole(channelId, userId));
}

export function connectViewerCanManageAdmins(channelId: string, userId: string, creatorId: string): boolean {
  if (hasAlphaPermission(userId, "manage_users")) return true;
  return canManageAdmins(getChannelMemberRole(channelId, userId), userId, creatorId);
}

export function connectViewerCanManageLifecycle(channelId: string, userId: string): boolean {
  if (hasAlphaPermission(userId, "manage_channels")) return true;
  return canManageConnectChannelLifecycle(channelId, userId);
}

export function connectViewerCanDeleteChannel(channelId: string, userId: string): boolean {
  if (isAlphaOwner(userId)) {
    return canDeleteConnectChannel(channelId, userId) || channelId.startsWith("ch-");
  }
  if (hasAlphaPermission(userId, "manage_channels")) {
    return canDeleteConnectChannel(channelId, userId);
  }
  return canDeleteConnectChannel(channelId, userId);
}

export function connectListChannelsForViewer(userId: string): ConnectChannel[] {
  if (hasAlphaPermission(userId, "manage_channels")) return getConnectChannels();
  return listConnectChannelsForUser(userId);
}
