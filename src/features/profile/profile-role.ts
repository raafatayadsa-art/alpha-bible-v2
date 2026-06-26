import type { ShieldRole } from "@/components/alpha/AlphaShield";
import type { AlphaRole } from "@/features/auth";

export function alphaRoleToShieldRole(role: AlphaRole): ShieldRole {
  if (role === "owner") return "official";
  if (role === "priest") return "priest";
  if (role === "servant") return "servant";
  return "member";
}

export function roleLabelAr(role: AlphaRole): string {
  switch (role) {
    case "owner":
      return "عضو Alpha الرسمي";
    case "priest":
      return "كاهن";
    case "servant":
      return "خادم";
    case "member":
      return "عضو عادي";
    default:
      return "زائر";
  }
}

export const SHIELD_ASSET: Record<ShieldRole, string> = {
  official: "/shields/official-shield.png?v=14",
  priest: "/shields/priest-shield.png?v=15",
  servant: "/shields/servant-shield.png?v=13",
  member: "/shields/member-shield.png?v=13",
};
