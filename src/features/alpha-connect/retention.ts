import type { EphemeralDelete } from "@/components/alpha/AlphaConnectSettings";
import type { AlphaConnectMessage, AlphaConnectRetentionPolicy } from "./types";

/** Timed chat timer options (Alpha Chat composer) */
export const CHAT_TIMER_OPTIONS = [
  { label: "٥ ثواني", policy: "5s" as const },
  { label: "١٠ ثواني", policy: "10s" as const },
  { label: "٣٠ ثانية", policy: "30s" as const },
  { label: "دقيقة", policy: "1m" as const },
  { label: "٥ دقائق", policy: "5m" as const },
  { label: "٣٠ دقيقة", policy: "30m" as const },
  { label: "يوم", policy: "1d" as const },
] as const;

export type ChatTimerLabel = (typeof CHAT_TIMER_OPTIONS)[number]["label"];

export const CHAT_TIMER_LABELS = CHAT_TIMER_OPTIONS.map((option) => option.label);

export const DEFAULT_CHAT_TIMER_LABEL: ChatTimerLabel = "دقيقة";

const LEGACY_CHAT_TIMER_LABELS: Record<string, ChatTimerLabel> = {
  "بعد القراءة": "دقيقة",
  "٣٠ دقيقة": "٣٠ دقيقة",
  "30 دقيقة": "٣٠ دقيقة",
  "ساعة": "٥ دقائق",
  "٢٤ ساعة": "يوم",
  "24 ساعة": "يوم",
  "٧ أيام": "يوم",
  "7 أيام": "يوم",
};

export function normalizeChatTimerLabel(value: unknown): ChatTimerLabel {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if ((CHAT_TIMER_LABELS as readonly string[]).includes(trimmed)) {
      return trimmed as ChatTimerLabel;
    }
    if (trimmed in LEGACY_CHAT_TIMER_LABELS) {
      return LEGACY_CHAT_TIMER_LABELS[trimmed];
    }
  }
  return DEFAULT_CHAT_TIMER_LABEL;
}

export const CHAT_TIMER_TOAST: Record<ChatTimerLabel, string> = {
  "٥ ثواني": "تم ضبط الحذف التلقائي على ٥ ثواني.",
  "١٠ ثواني": "تم ضبط الحذف التلقائي على ١٠ ثواني.",
  "٣٠ ثانية": "تم ضبط الحذف التلقائي على ٣٠ ثانية.",
  "دقيقة": "تم ضبط الحذف التلقائي على دقيقة واحدة.",
  "٥ دقائق": "تم ضبط الحذف التلقائي على ٥ دقائق.",
  "٣٠ دقيقة": "تم ضبط الحذف التلقائي على ٣٠ دقيقة.",
  "يوم": "تم ضبط الحذف التلقائي على يوم واحد.",
};

/** ALPHA-DATA-POLICY-002 + short chat timers */
export const ALPHA_CONNECT_RETENTION_POLICIES: AlphaConnectRetentionPolicy[] = [
  "on_read",
  "5s",
  "10s",
  "30s",
  "1m",
  "5m",
  "30m",
  "1d",
  "1h",
  "6h",
  "12h",
  "24h",
  "3d",
  "7d",
];

const RETENTION_MS: Record<string, number> = {
  "5s": 5_000,
  "10s": 10_000,
  "30s": 30_000,
  "1m": 60_000,
  "5m": 5 * 60_000,
  "30m": 30 * 60_000,
  "1d": 24 * 60 * 60_000,
  "1h": 60 * 60_000,
  "6h": 6 * 60 * 60_000,
  "12h": 12 * 60 * 60_000,
  "24h": 24 * 60 * 60_000,
  "3d": 3 * 24 * 60 * 60_000,
  "7d": 7 * 24 * 60 * 60_000,
  hour: 60 * 60_000,
  day: 24 * 60 * 60_000,
  week: 7 * 24 * 60 * 60_000,
};

const LEGACY_RETENTION_MAP: Record<string, AlphaConnectRetentionPolicy> = {
  read: "on_read",
  never: "on_read",
  hour: "1h",
  day: "1d",
  week: "7d",
};

const TIMER_LABEL_TO_RETENTION: Record<string, AlphaConnectRetentionPolicy> = Object.fromEntries(
  CHAT_TIMER_OPTIONS.map((option) => [option.label, option.policy]),
);

export function timerLabelToRetention(label: string): AlphaConnectRetentionPolicy {
  const mapped = TIMER_LABEL_TO_RETENTION[label.trim()];
  if (mapped) return mapped;
  return coerceMessageRetentionPolicy(label);
}

export function retentionPolicyToMs(policy: string): number | null {
  if (isOnReadRetentionPolicy(policy)) return null;
  return RETENTION_MS[policy] ?? null;
}

export function normalizeInsertedMessage(
  message: AlphaConnectMessage,
  intendedPolicy: AlphaConnectRetentionPolicy,
): AlphaConnectMessage {
  if (isOnReadRetentionPolicy(intendedPolicy)) {
    return { ...message, retention_policy: intendedPolicy, expires_at: null };
  }

  const durationMs = retentionPolicyToMs(intendedPolicy);
  if (!durationMs) {
    return { ...message, retention_policy: intendedPolicy };
  }

  const createdMs = new Date(message.created_at).getTime();
  return {
    ...message,
    retention_policy: intendedPolicy,
    expires_at: new Date(createdMs + durationMs).toISOString(),
  };
}

export function retentionPolicyToSeconds(policy: string): number | null {
  const ms = retentionPolicyToMs(policy);
  return ms === null ? null : Math.round(ms / 1000);
}

export function retentionPolicyFromSettings(policy: EphemeralDelete): AlphaConnectRetentionPolicy {
  return normalizeRetentionPolicy(policy);
}

/** Coerce any timer/settings/legacy value to a DB-safe retention policy */
export function coerceMessageRetentionPolicy(value: unknown): AlphaConnectRetentionPolicy {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (ALPHA_CONNECT_RETENTION_POLICIES.includes(trimmed as AlphaConnectRetentionPolicy)) {
      return trimmed as AlphaConnectRetentionPolicy;
    }
    if (trimmed in LEGACY_RETENTION_MAP) {
      return LEGACY_RETENTION_MAP[trimmed];
    }
  }
  return normalizeRetentionPolicy(value);
}

export function isOnReadRetentionPolicy(policy: string): boolean {
  return policy === "on_read" || policy === "read";
}

export function messageExpiresAtMs(
  message: Pick<AlphaConnectMessage, "expires_at" | "retention_policy" | "created_at">,
): number | null {
  if (isOnReadRetentionPolicy(message.retention_policy)) return null;

  const durationMs = retentionPolicyToMs(message.retention_policy);
  if (durationMs) {
    const createdMs = new Date(message.created_at).getTime();
    if (!Number.isFinite(createdMs)) return null;
    return createdMs + durationMs;
  }

  if (message.expires_at) {
    const expiresMs = new Date(message.expires_at).getTime();
    if (Number.isFinite(expiresMs)) return expiresMs;
  }

  return null;
}

export function isMessageExpired(
  message: Pick<AlphaConnectMessage, "expires_at" | "retention_policy" | "created_at">,
  nowMs = Date.now(),
  options?: { timerAnchorMs?: number },
): boolean {
  if (!isOnReadRetentionPolicy(message.retention_policy)) {
    if (!options?.timerAnchorMs || options.timerAnchorMs <= 0) return false;
    const createdMs = new Date(message.created_at).getTime();
    if (Number.isFinite(createdMs) && createdMs < options.timerAnchorMs) {
      return false;
    }
  }

  const expiresMs = messageExpiresAtMs(message);
  if (expiresMs === null) return false;
  return expiresMs <= nowMs;
}

export function filterActiveAlphaConnectMessages(
  messages: AlphaConnectMessage[],
  options?: { timerAnchorMs?: number; nowMs?: number },
): AlphaConnectMessage[] {
  const now = options?.nowMs ?? Date.now();
  return messages.filter((message) => !isMessageExpired(message, now, options));
}

export function isImmediateOnReadPolicy(policy: AlphaConnectRetentionPolicy | string): boolean {
  return isOnReadRetentionPolicy(policy);
}

/** Migrate legacy localStorage / invalid values */
export function normalizeRetentionPolicy(value: unknown): EphemeralDelete {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (ALPHA_CONNECT_RETENTION_POLICIES.includes(trimmed as AlphaConnectRetentionPolicy)) {
      return trimmed as EphemeralDelete;
    }
    if (trimmed in LEGACY_RETENTION_MAP) {
      return LEGACY_RETENTION_MAP[trimmed];
    }
    const fromTimer = timerLabelToRetention(trimmed);
    if (ALPHA_CONNECT_RETENTION_POLICIES.includes(fromTimer)) {
      return fromTimer as EphemeralDelete;
    }
  }
  return "1m";
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

function toArabicDigits(value: number): string {
  return value.toString().replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

/** Live descending countdown — seconds only (Arabic digits). */
export function formatDeletionCountdown(
  message: Pick<AlphaConnectMessage, "expires_at" | "retention_policy" | "created_at">,
  nowMs = Date.now(),
  incoming = true,
  timerAnchorMs = 0,
): string | null {
  if (isOnReadRetentionPolicy(message.retention_policy)) {
    return incoming ? "عند الخروج" : "بعد القراءة";
  }

  if (!timerAnchorMs || timerAnchorMs <= 0) return null;

  if (timerAnchorMs > 0) {
    const createdMs = new Date(message.created_at).getTime();
    if (Number.isFinite(createdMs) && createdMs < timerAnchorMs) return null;
  }

  const expiresMs = messageExpiresAtMs(message);
  if (expiresMs === null) return null;

  const remainingMs = expiresMs - nowMs;
  if (remainingMs <= 0) return null;

  const totalSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
  return toArabicDigits(totalSeconds);
}
