import { useMemo } from "react";
import { getAlphaRoleContextSync, getAlphaRoleSync, useAlphaAuth } from "@/features/auth";
import { useMemberChurch } from "@/features/church/use-member-church";
import { buildIdentityCard, deriveAlphaId } from "@/features/identity/alpha-identity";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { formatBirthDateDisplay } from "./profile-privacy";
import { alphaRoleToShieldRole, resolveProfileRoleLabel } from "./profile-role";
import { resolveAccountAvatar, useProfileUser } from "./profile-user-store";

export type ProfileMembershipData = {
  displayName: string;
  avatarUrl: string;
  churchName: string;
  diocese: string;
  churchLocation: string;
  roleLabel: string;
  identityLabel: string | null;
  shieldRole: ShieldRole | null;
  alphaId: string;
  alphaIdFull: string;
  userId: string;
  qrPayload: string;
  memberSince: string | null;
  birthDate: string | null;
  verified: boolean;
};

export function useProfileMembershipData(): ProfileMembershipData {
  const { user } = useAlphaAuth();
  const { church: memberChurch } = useMemberChurch();
  const { state: profileUser } = useProfileUser();

  const displayName = user?.displayName?.trim() || "مستخدم Alpha";
  const avatarUrl = resolveAccountAvatar(profileUser.customAvatarUrl, user?.avatarUrl);
  const churchName = memberChurch?.name?.trim() || "لم تُحدد الكنيسة بعد";
  const diocese = memberChurch?.diocese?.trim() || "—";
  const churchLocation = memberChurch?.locationLine?.trim() || "—";
  const roleLabel = resolveProfileRoleLabel();
  const ctx = getAlphaRoleContextSync();
  const identityLabel = ctx.platformOwnerLabel || ctx.adminTeamRole ? roleLabel : null;
  const shieldRole = alphaRoleToShieldRole(getAlphaRoleSync());
  const memberSince = memberChurch?.joinLabel ?? null;
  const birthDate = formatBirthDateDisplay(profileUser.birthDate);
  const userId = user?.id?.trim() ?? "";

  const identity = useMemo(() => {
    return buildIdentityCard({
      userId,
      displayName,
      avatarUrl,
      churchName,
      verified: shieldRole != null,
    });
  }, [userId, displayName, avatarUrl, churchName, shieldRole]);

  const alphaIdFull = userId ? deriveAlphaId(userId) : "ALPHA-GUEST";

  return useMemo(
    () => ({
      displayName,
      avatarUrl,
      churchName,
      diocese,
      churchLocation,
      roleLabel,
      identityLabel,
      shieldRole,
      alphaId: identity.alphaIdShort,
      alphaIdFull,
      userId,
      qrPayload: identity.qrPayload,
      memberSince,
      birthDate,
      verified: shieldRole != null,
    }),
    [
      displayName,
      avatarUrl,
      churchName,
      diocese,
      churchLocation,
      roleLabel,
      identityLabel,
      shieldRole,
      identity.alphaIdShort,
      identity.qrPayload,
      alphaIdFull,
      userId,
      memberSince,
      birthDate,
    ],
  );
}
