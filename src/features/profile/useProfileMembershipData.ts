import { useMemo } from "react";
import { getAlphaRoleSync } from "@/features/auth";
import { getCurrentUser } from "@/features/church/current-user";
import { useMemberChurch } from "@/features/church/use-member-church";
import { useAlphaIdentity } from "@/features/identity/useAlphaIdentity";
import type { ShieldRole } from "@/components/alpha/AlphaShield";
import { formatBirthDateDisplay } from "./profile-privacy";
import { alphaRoleToShieldRole, roleLabelAr } from "./profile-role";
import { resolveProfileAvatar, useProfileUser } from "./profile-user-store";

export type ProfileMembershipData = {
  displayName: string;
  avatarUrl: string;
  churchName: string;
  diocese: string;
  churchLocation: string;
  roleLabel: string;
  shieldRole: ShieldRole;
  alphaId: string;
  qrPayload: string;
  memberSince: string | null;
  birthDate: string | null;
  verified: boolean;
};

export function useProfileMembershipData(): ProfileMembershipData {
  const user = getCurrentUser();
  const { church: memberChurch } = useMemberChurch();
  const { state: profileUser } = useProfileUser();

  const displayName = user.name?.trim() || "مستخدم Alpha";
  const avatarUrl = resolveProfileAvatar(profileUser.customAvatarUrl, user.avatarUrl);
  const churchName = memberChurch?.name?.trim() || "لم تُحدد الكنيسة بعد";
  const diocese = memberChurch?.diocese?.trim() || "—";
  const churchLocation = memberChurch?.locationLine?.trim() || "—";
  const roleLabel = roleLabelAr(getAlphaRoleSync());
  const shieldRole = alphaRoleToShieldRole(getAlphaRoleSync());
  const memberSince = memberChurch?.joinLabel ?? null;
  const birthDate = formatBirthDateDisplay(profileUser.birthDate);

  const identity = useAlphaIdentity({
    displayName,
    avatarUrl,
    churchName,
    verified: true,
  });

  return useMemo(
    () => ({
      displayName,
      avatarUrl,
      churchName,
      diocese,
      churchLocation,
      roleLabel,
      shieldRole,
      alphaId: identity.alphaIdShort,
      qrPayload: identity.qrPayload,
      memberSince,
      birthDate,
      verified: identity.verified,
    }),
    [
      displayName,
      avatarUrl,
      churchName,
      diocese,
      churchLocation,
      roleLabel,
      shieldRole,
      identity.alphaIdShort,
      identity.qrPayload,
      identity.verified,
      memberSince,
      birthDate,
    ],
  );
}
