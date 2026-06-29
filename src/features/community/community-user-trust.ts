import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { DEMO_COMMUNITY_FRIENDS } from "./community-demo-data";

const DEMO_ROLES: Record<string, ShieldRole> = {
  "demo-friend-mina": "servant",
  "demo-friend-marina": "servant",
  "demo-friend-ahmed": "priest",
  "demo-friend-sara": "member",
  "demo-friend-george": "servant",
  "demo-friend-nardin": "member",
  "demo-friend-peter": "priest",
  "demo-friend-kermina": "member",
};

export type CommunityMemberPreview = {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  churchName?: string;
  alphaId?: string;
  role?: string;
  shieldRole: ShieldRole | null;
  verified: boolean;
};

export function resolveCommunityShieldRole(userId: string): ShieldRole | null {
  if (userId && DEMO_ROLES[userId]) return DEMO_ROLES[userId];
  return null;
}

export function isCommunityUserVerified(userId: string): boolean {
  return resolveCommunityShieldRole(userId) != null;
}

export function resolveCommunityMemberPreview(input: {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  churchName?: string;
}): CommunityMemberPreview {
  const demo = DEMO_COMMUNITY_FRIENDS.find((f) => f.linkedUserId === input.userId);
  return {
    userId: input.userId,
    userName: input.userName,
    userAvatarUrl: input.userAvatarUrl ?? demo?.avatarUrl,
    churchName: input.churchName ?? demo?.role,
    alphaId: demo?.alphaId,
    role: demo?.role,
    shieldRole: resolveCommunityShieldRole(input.userId),
    verified: isCommunityUserVerified(input.userId),
  };
}
