import type { ShieldRole } from "@/components/alpha/AlphaShield";
import type { AlphaRole } from "@/features/auth";
import {
  getAlphaRoleContextSync,
  getAuthUserSync,
  getDisplayShieldRoleSync,
  getRoleLabelSync,
  roleLabelFromContext,
} from "@/features/auth";

export function alphaRoleToShieldRole(_role: AlphaRole): ShieldRole | null {
  return getDisplayShieldRoleSync();
}

export function roleLabelAr(_role: AlphaRole): string {
  return getRoleLabelSync();
}

export function resolveProfileRoleLabel(): string {
  return roleLabelFromContext(getAlphaRoleContextSync(), getAuthUserSync()?.email ?? null);
}

export const SHIELD_ASSET: Record<ShieldRole, string> = {
  official: "/shields/official-shield.png?v=14",
  priest: "/shields/priest-shield.png?v=15",
  servant: "/shields/servant-shield.png?v=13",
  member: "/shields/member-shield.png?v=13",
};
