import type { ChurchPost } from "@/data/church-posts";
import type { AlphaRole } from "@/features/auth/alpha-roles";
import {
  alphaRoleToChannelMemberShield,
  joinChannelViaInvite,
  patchChannelSettings,
} from "@/components/alpha/connect-channel-state";
import {
  createConnectChannel,
  patchConnectChannel,
} from "@/components/alpha/connect-channels-registry";
import { getCurrentUser } from "@/features/church/current-user";
import { assignTripOrganizerRole } from "./trip-channel-access";
import { archiveTripChannelLink, readTripChannelLink, writeTripChannelLink } from "./trip-channel-links";
import type { TripChannelLink } from "./trip-channel-types";
import { patchTripOperations } from "./trip-operations-store";

export function provisionTripChannels(input: {
  post: ChurchPost;
  churchId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRole: AlphaRole;
}): TripChannelLink {
  const existing = readTripChannelLink(input.post.id);
  if (existing) return existing;

  const tripChannel = createConnectChannel({
    name: `رحلة: ${input.post.title}`,
    topic: input.post.details?.places ?? input.post.excerpt,
    icon: "users",
    creatorId: input.creatorId,
    creatorName: input.creatorName,
    creatorAvatar: input.creatorAvatar,
    creatorRole: input.creatorRole,
  });

  patchConnectChannel(tripChannel.id, {
    kind: "trip_public",
    linkedPostId: input.post.id,
  });
  patchChannelSettings(tripChannel.id, {
    talkPermission: "admins_only",
    joinApproval: false,
    invitePolicy: "everyone",
    notifyOnJoin: true,
  });

  const organizerChannel = createConnectChannel({
    name: `تنسيق: ${input.post.title}`,
    topic: "قناة تنظيم داخلية — للمنظمين فقط",
    icon: "handshake",
    creatorId: input.creatorId,
    creatorName: input.creatorName,
    creatorAvatar: input.creatorAvatar,
    creatorRole: input.creatorRole,
  });

  patchConnectChannel(organizerChannel.id, {
    kind: "trip_organizer",
    linkedPostId: input.post.id,
  });
  patchChannelSettings(organizerChannel.id, {
    talkPermission: "admins_only",
    joinApproval: true,
    invitePolicy: "admins_only",
    notifyOnJoin: true,
  });

  assignTripOrganizerRole({
    postId: input.post.id,
    userId: input.creatorId,
    role: "owner",
  });

  patchTripOperations(input.post.id, {});

  const link: TripChannelLink = {
    postId: input.post.id,
    churchId: input.churchId,
    tripChannelId: tripChannel.id,
    organizerChannelId: organizerChannel.id,
    createdAt: new Date().toISOString(),
    createdBy: input.creatorId,
  };
  writeTripChannelLink(link);
  return link;
}

export function joinTripPublicChannel(postId: string): { ok: boolean; message: string } {
  const link = readTripChannelLink(postId);
  if (!link) return { ok: false, message: "لا توجد قناة مرتبطة بهذه الرحلة" };

  const user = getCurrentUser();
  if (!user.id) return { ok: false, message: "يجب تسجيل الدخول" };

  const result = joinChannelViaInvite(link.tripChannelId, {
    id: user.id,
    name: user.name || "عضو",
    avatar: user.avatarUrl,
    shieldRole: alphaRoleToChannelMemberShield("member"),
  });

  return { ok: result.status === "joined" || result.status === "already", message: result.message };
}

export function archiveTripChannels(postId: string) {
  const link = readTripChannelLink(postId);
  if (!link) return;
  patchConnectChannel(link.tripChannelId, { archived: true });
  patchConnectChannel(link.organizerChannelId, { archived: true });
  archiveTripChannelLink(postId);
}

export function ensureTripChannelsForPost(input: {
  post: ChurchPost;
  churchId: string;
}): TripChannelLink | null {
  if (input.post.type !== "trip") return null;
  const user = getCurrentUser();
  return provisionTripChannels({
    post: input.post,
    churchId: input.churchId,
    creatorId: user.id || "creator",
    creatorName: user.name || input.post.author,
    creatorAvatar: user.avatarUrl,
    creatorRole: "servant",
  });
}
