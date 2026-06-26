import type { ShieldRole } from "@/components/alpha/AlphaShield";

export type NearbyDiscoverySource = "gps" | "bluetooth" | "church";

export type NearbyConnectionStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected";

export type NearbyMember = {
  userId: string;
  displayName: string;
  avatarUrl: string;
  role: ShieldRole;
  churchName: string;
  distanceM: number;
  alphaIdShort: string;
  connectionStatus: NearbyConnectionStatus;
  connectionRequestId?: string;
  discoverySource: NearbyDiscoverySource;
};

export type NearbyDiscoveryPrefs = {
  nearbyDiscoverable: boolean;
  whoCanDiscover: "church" | "connections" | "none";
};

export function formatNearbyDistance(distanceM: number): string {
  if (distanceM < 80) return "أقل من 80 م";
  if (distanceM < 1000) return `${Math.round(distanceM)} م`;
  return `${(distanceM / 1000).toFixed(1)} كم`;
}

export function mapNearbyRoleLabel(roleLabel?: string | null): ShieldRole {
  const label = (roleLabel ?? "member").toLowerCase();
  if (/priest|كاهن|أب/i.test(label)) return "priest";
  if (/servant|خادم|شماس/i.test(label)) return "servant";
  if (/official|رسمي/i.test(label)) return "official";
  return "member";
}
