import type { ShieldRole } from "@/components/alpha/AlphaShield";
import heroChurchPremium from "@/assets/home/hero-church-premium.jpg";
import cardChurch from "@/assets/home/card-church.jpg";
import type { ProfileMember } from "./types";

const MEMBERSHIP_LABELS: Record<ShieldRole, string> = {
  member: "عضو كنيسة",
  servant: "خادم",
  priest: "كاهن",
  official: "عضو Alpha",
};

export function membershipLabelFor(role: ShieldRole): string {
  return MEMBERSHIP_LABELS[role];
}

/** Demo profile context — wired to identity hook at render time. */
export const PROFILE_MEMBER_DEMO: ProfileMember = {
  displayName: "مينا عاطف",
  username: "@mina.atef",
  role: "servant",
  membershipLabel: membershipLabelFor("servant"),
  churchName: "كنيسة الشهيد مار جرجس",
  diocese: "إيبارشية القاهرة والشرق",
  churchRole: "خادم مدارس الأحد",
  churchImage: cardChurch,
  coverImage: heroChurchPremium,
  verified: true,
  joinDate: "12 يناير 2019",
};
