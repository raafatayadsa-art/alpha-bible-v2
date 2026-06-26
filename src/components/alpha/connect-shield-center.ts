import type { ShieldRole } from "./AlphaShield";
import {
  alphaRoleToChannelMemberShield,
  getChannelState,
  resolveChannelMemberShieldRole,
  type ChannelMember,
} from "./connect-channel-state";
import { connectEffectiveAlphaRole } from "./connect-alpha-access";
import type { ConnectChannel } from "./connect-channels-registry";
import { getCurrentUser } from "@/features/church/current-user";
import { resolvedMemberChurchName } from "@/features/church/member-church-api";
import {
  PRESENCE_LABELS,
  getPresenceStatus,
  resolvePresenceDotForUser,
} from "@/features/alpha-connect/presence";

const DEFAULT_CHURCH_NAME = "—";

const SHIELD_TYPE_LABELS: Record<ShieldRole, string> = {
  official: "Alpha الرسمي",
  priest: "درع الكاهن",
  servant: "درع الخادم",
  member: "درع العضو الموثّق",
};

const MEMBER_CHURCH_RANKS: Record<string, string> = {
  creator: "كاهن مسؤول",
  priest: "كاهن",
  p2: "قائد خدمة الشباب",
  servant: "خادم الشباب",
  p3: "عضو موثّق",
  p4: "عضو موثّق",
  alpha: "فريق Alpha",
  member: "عضو موثّق",
};

const MEMBER_JOIN_LABELS: Record<string, string> = {
  creator: "١ يناير ٢٠٢٦",
  p2: "٣ مارس ٢٠٢٦",
  p3: "١٠ فبراير ٢٠٢٦",
  p4: "١٥ يونيو ٢٠٢٦",
};

export type ShieldCenterSnapshot = {
  name: string;
  avatar: string;
  shieldRole: ShieldRole;
  shieldType: string;
  churchRank: string;
  churchName: string;
  currentChannel: string;
  joinedOn: string;
  connectionStatus: string;
};

function churchRankFor(member: ChannelMember): string {
  if (MEMBER_CHURCH_RANKS[member.id]) return MEMBER_CHURCH_RANKS[member.id]!;
  const shield = resolveChannelMemberShieldRole(member);
  if (member.role === "super_admin") return "قائد القناة";
  if (member.role === "admin") return "مسؤول القناة";
  if (shield === "priest") return "كاهن";
  if (shield === "servant") return "خادم";
  if (shield === "official") return "Alpha الرسمي";
  return "عضو موثّق";
}

function connectionStatusFor(userId: string, viewerUserId: string): string {
  const visible = resolvePresenceDotForUser(userId, viewerUserId);
  if (!visible) return "غير متصل";
  return PRESENCE_LABELS[getPresenceStatus(userId)];
}

export function buildShieldCenterSnapshot(
  channelId: string,
  channel: ConnectChannel,
  currentUserId: string,
): ShieldCenterSnapshot {
  const viewerUserId = currentUserId || getCurrentUser().id || "creator";
  const members = getChannelState(channelId).members.filter((member) => !member.blocked);
  const user = getCurrentUser();

  const viewerMember =
    members.find((member) => member.id === viewerUserId) ??
    ({
      id: viewerUserId,
      name: user.name?.trim() || "مستخدم Alpha",
      avatar: user.avatarUrl || members[0]?.avatar || "",
      role: "member" as const,
    } satisfies ChannelMember);

  const shieldRole = resolveChannelMemberShieldRole({
    ...viewerMember,
    shieldRole: viewerMember.shieldRole ?? alphaRoleToChannelMemberShield(connectEffectiveAlphaRole()),
  });

  return {
    name: viewerMember.name,
    avatar: viewerMember.avatar,
    shieldRole,
    shieldType: SHIELD_TYPE_LABELS[shieldRole],
    churchRank: churchRankFor(viewerMember),
    churchName: resolvedMemberChurchName(DEFAULT_CHURCH_NAME),
    currentChannel: channel.name,
    joinedOn: MEMBER_JOIN_LABELS[viewerUserId] ?? "١٥ يونيو ٢٠٢٦",
    connectionStatus: connectionStatusFor(viewerUserId, viewerUserId),
  };
}
