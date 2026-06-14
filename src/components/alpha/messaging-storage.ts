// ─── Shared localStorage keys for Alpha Messages ─────────────

export const HIDDEN_CONVS_KEY   = "alpha_hidden_conversations";
export const HIDDEN_CODE_KEY    = "alpha_hidden_chats_secret_code";
export const HIDDEN_SESSION_KEY = "alpha_hidden_chats_unlocked_session";
export const MUTED_CONVS_KEY    = "alpha-muted-convs";
export const TIMER_KEY          = "alpha-chat-timer";

export const MESSAGES_SECRET_LOCK_ENABLED = "alpha_messages_secret_lock_enabled";
export const MESSAGES_LOCK_METHOD         = "alpha_messages_lock_method";
export const MESSAGES_LOCK_PIN            = "alpha_messages_lock_pin";
export const MESSAGES_AUTO_LOCK           = "alpha_messages_auto_lock";

export type LockMethod = "face-id" | "pin";
export type AutoLockDuration = "0" | "1" | "5" | "15";

export const AUTO_LOCK_OPTIONS: { value: AutoLockDuration; label: string }[] = [
  { value: "0",  label: "فوراً" },
  { value: "1",  label: "بعد دقيقة" },
  { value: "5",  label: "بعد 5 دقائق" },
  { value: "15", label: "بعد 15 دقيقة" },
];

export function convLockedKey(id: string)     { return `alpha-locked-${id}`; }
export function convPinKey(id: string)        { return `alpha-pin-${id}`; }
export function convLockMethodKey(id: string) { return `alpha-lock-method-${id}`; }

export function loadLS<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
}

export function saveLS(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function hasSecretCode(): boolean {
  return loadLS<string>(HIDDEN_CODE_KEY, "").length >= 4;
}

export function isConvLocked(id: string): boolean {
  return loadLS(convLockedKey(id), false);
}

export function lockConversation(id: string) {
  const method = loadLS<LockMethod>(MESSAGES_LOCK_METHOD, "face-id");
  const pin    = loadLS<string>(MESSAGES_LOCK_PIN, "123456");
  saveLS(convLockedKey(id), true);
  saveLS(convLockMethodKey(id), method);
  if (method === "pin") saveLS(convPinKey(id), pin);
}

export function unlockConversation(id: string) {
  saveLS(convLockedKey(id), false);
}
