import type { EphemeralDelete } from "@/components/alpha/AlphaConnectSettings";
import type { AlphaConnectRetentionPolicy } from "./types";

/** ALPHA-DATA-POLICY-002 — Alpha Connect / Alpha Messages only (max timed: 7 days) */
export const ALPHA_CONNECT_RETENTION_POLICIES: AlphaConnectRetentionPolicy[] = [
  "on_read",
  "1h",
  "6h",
  "12h",
  "24h",
  "3d",
  "7d",
];

const LEGACY_RETENTION_MAP: Record<string, AlphaConnectRetentionPolicy> = {
  read: "on_read",
  hour: "1h",
  day: "24h",
  week: "7d",
  never: "on_read",
};

export function retentionPolicyFromSettings(policy: EphemeralDelete): AlphaConnectRetentionPolicy {
  return policy;
}

export function isImmediateOnReadPolicy(policy: AlphaConnectRetentionPolicy): boolean {
  return policy === "on_read";
}

/** Migrate legacy localStorage / invalid values to ALPHA-DATA-POLICY-002 */
export function normalizeRetentionPolicy(value: unknown): EphemeralDelete {
  if (typeof value === "string" && ALPHA_CONNECT_RETENTION_POLICIES.includes(value as AlphaConnectRetentionPolicy)) {
    return value as EphemeralDelete;
  }
  if (typeof value === "string" && value in LEGACY_RETENTION_MAP) {
    return LEGACY_RETENTION_MAP[value];
  }
  return "24h";
}

export function formatVoiceDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export function formatMessageRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export function formatRetentionHint(policy: AlphaConnectRetentionPolicy, expiresAt: string | null): string {
  if (policy === "on_read") return " · بعد القراءة/الاستماع";
  if (expiresAt) return " · مؤقت";
  return "";
}
