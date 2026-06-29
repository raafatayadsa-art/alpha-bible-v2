import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { deriveAlphaIdShort } from "@/features/identity/alpha-identity";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function mapRoleLabelToShield(roleType?: string | null): ShieldRole | null {
  const key = (roleType ?? "").toLowerCase();
  if (key === "priest" || key === "admin") return "priest";
  if (key === "servant") return "servant";
  if (key === "member") return "member";
  return null;
}

export function resolveCommunityShieldRole(userId: string, roleType?: string): ShieldRole | null {
  if (!userId || !UUID_RE.test(userId)) return null;
  if (!roleType) return null;
  return mapRoleLabelToShield(roleType) ?? "member";
}

export function isCommunityUserVerified(userId: string, roleType?: string): boolean {
  return UUID_RE.test(userId) && Boolean(roleType);
}

export function resolveCommunityMemberPreview(input: {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  churchName?: string;
  role?: string;
  roleType?: string;
}): CommunityMemberPreview {
  const verified = isCommunityUserVerified(input.userId, input.roleType);
  return {
    userId: input.userId,
    userName: input.userName,
    userAvatarUrl: input.userAvatarUrl,
    churchName: input.churchName,
    alphaId: verified ? deriveAlphaIdShort(input.userId) : undefined,
    role: input.role,
    shieldRole: verified ? resolveCommunityShieldRole(input.userId, input.roleType) : null,
    verified,
  };
}
