import { getAuthUserSync } from "@/features/auth/auth-context";
import { getCurrentUser } from "@/features/church/current-user";
import { supabase } from "@/integrations/supabase/client";

export type AlphaPresenceStatus = "available" | "busy" | "hidden";

export const ALPHA_PRESENCE_STATUSES: AlphaPresenceStatus[] = ["available", "busy", "hidden"];

export const PRESENCE_LABELS: Record<AlphaPresenceStatus, string> = {
  available: "متاح",
  busy: "مشغول",
  hidden: "مخفي",
};

const STORAGE_KEY = "ab.alpha-presence.v1";
const DEFAULT_STATUS: AlphaPresenceStatus = "available";

const DEMO_SEED: Record<string, AlphaPresenceStatus> = {
  priest: "available",
  alpha: "available",
  servant: "busy",
  member: "hidden",
  creator: "available",
  p2: "available",
  p3: "busy",
  p4: "available",
};

const presenceMap = new Map<string, AlphaPresenceStatus>();
const listeners = new Set<() => void>();
let presenceVersion = 0;
let initialized = false;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

function emitPresence() {
  presenceVersion += 1;
  listeners.forEach((listener) => listener());
}

export function getPresenceStoreVersion(): number {
  return presenceVersion;
}

function readLocalStore(): Record<string, AlphaPresenceStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next: Record<string, AlphaPresenceStatus> = {};
    for (const [userId, status] of Object.entries(parsed)) {
      const normalized = normalizePresenceStatus(status);
      if (normalized) next[userId] = normalized;
    }
    return next;
  } catch {
    return {};
  }
}

function writeLocalStore() {
  if (typeof window === "undefined") return;
  const payload: Record<string, AlphaPresenceStatus> = {};
  presenceMap.forEach((status, userId) => {
    payload[userId] = status;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function normalizePresenceStatus(value: unknown): AlphaPresenceStatus | null {
  if (value === "available" || value === "busy" || value === "hidden") return value;
  if (value === "listen_only" || value === "listen-only" || value === "Listen Only") return DEFAULT_STATUS;
  return null;
}

export function getViewerUserId(): string {
  return getAuthUserSync()?.id ?? getCurrentUser().id ?? "creator";
}

export function getPresenceStatus(userId: string): AlphaPresenceStatus {
  return presenceMap.get(userId) ?? DEMO_SEED[userId] ?? DEFAULT_STATUS;
}

export function resolvePresenceDot(
  status: AlphaPresenceStatus,
  viewerUserId: string,
  subjectUserId: string,
): AlphaPresenceStatus | null {
  if (status === "hidden" && viewerUserId !== subjectUserId) return null;
  return status;
}

export function presenceCountsAsOnline(status: AlphaPresenceStatus): boolean {
  return status === "available" || status === "busy";
}

export function isPresenceVisibleInOnlineSurfaces(
  userId: string,
  viewerUserId = getViewerUserId(),
): boolean {
  const status = getPresenceStatus(userId);
  if (status === "hidden" && viewerUserId !== userId) return false;
  return presenceCountsAsOnline(status);
}

export function presenceDotClassName(
  status: AlphaPresenceStatus,
  size: "xs" | "sm" | "md" = "sm",
): string {
  const sizeClass =
    size === "xs"
      ? "h-1.5 w-1.5 border"
      : size === "md"
        ? "h-3 w-3 border-2"
        : "h-2 w-2 border-2";

  const toneClass =
    status === "busy"
      ? "connect-presence-dot connect-presence-dot--busy bg-[#F59E0B]"
      : status === "hidden"
        ? "connect-presence-dot connect-presence-dot--hidden bg-[#6B7280]"
        : "connect-presence-dot connect-presence-dot--available bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.45)]";

  return `absolute bottom-0 left-0 rounded-full border-[#0a1430] ${sizeClass} ${toneClass}`;
}

export function resolvePresenceDotForUser(
  userId: string,
  viewerUserId = getViewerUserId(),
): AlphaPresenceStatus | null {
  if (!userId) return null;
  return resolvePresenceDot(getPresenceStatus(userId), viewerUserId, userId);
}

export function subscribePresence(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyPresenceRows(rows: Array<{ user_id: string; status: string }>) {
  rows.forEach((row) => {
    const normalized = normalizePresenceStatus(row.status);
    if (normalized) presenceMap.set(row.user_id, normalized);
  });
  emitPresence();
}

async function syncAuthPresenceFromRemote(authUserId: string) {
  const { data, error } = await supabase
    .from("alpha_user_presence")
    .select("user_id, status")
    .eq("user_id", authUserId)
    .maybeSingle();

  if (error) return;

  if (!data) {
    await supabase.from("alpha_user_presence").upsert({
      user_id: authUserId,
      status: getPresenceStatus(authUserId),
      updated_at: new Date().toISOString(),
    });
    return;
  }

  const normalized = normalizePresenceStatus(data.status);
  if (normalized) {
    presenceMap.set(authUserId, normalized);
    writeLocalStore();
    emitPresence();
  }
}

function ensureRealtimeSubscription() {
  if (realtimeChannel) return;

  realtimeChannel = supabase
    .channel("alpha-user-presence")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "alpha_user_presence" },
      (payload) => {
        const row = (payload.new ?? payload.old) as { user_id?: string; status?: string } | null;
        if (!row?.user_id) return;
        const normalized = normalizePresenceStatus(row.status);
        if (!normalized) return;
        presenceMap.set(row.user_id, normalized);
        writeLocalStore();
        emitPresence();
      },
    )
    .subscribe();
}

export function initPresenceStore() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const local = readLocalStore();
  Object.entries(DEMO_SEED).forEach(([userId, status]) => {
    if (!presenceMap.has(userId)) presenceMap.set(userId, local[userId] ?? status);
  });
  Object.entries(local).forEach(([userId, status]) => presenceMap.set(userId, status));

  const authUserId = getAuthUserSync()?.id;
  if (authUserId && !presenceMap.has(authUserId)) {
    presenceMap.set(authUserId, local[authUserId] ?? DEFAULT_STATUS);
  }

  ensureRealtimeSubscription();

  if (authUserId) {
    void syncAuthPresenceFromRemote(authUserId);
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    const next = readLocalStore();
    Object.entries(next).forEach(([userId, status]) => presenceMap.set(userId, status));
    emitPresence();
  });
}

export async function setMyPresenceStatus(status: AlphaPresenceStatus): Promise<void> {
  const viewerId = getViewerUserId();
  presenceMap.set(viewerId, status);
  writeLocalStore();
  emitPresence();

  const authUserId = getAuthUserSync()?.id;
  if (!authUserId) return;

  await supabase.from("alpha_user_presence").upsert({
    user_id: authUserId,
    status,
    updated_at: new Date().toISOString(),
  });
}

export function cycleMyPresenceStatus(): AlphaPresenceStatus {
  const viewerId = getViewerUserId();
  const current = getPresenceStatus(viewerId);
  const index = ALPHA_PRESENCE_STATUSES.indexOf(current);
  const next = ALPHA_PRESENCE_STATUSES[(index + 1) % ALPHA_PRESENCE_STATUSES.length] ?? DEFAULT_STATUS;
  void setMyPresenceStatus(next);
  return next;
}

export function countPresenceVisibleMembers(memberIds: string[], viewerUserId = getViewerUserId()): number {
  return memberIds.filter((memberId) => isPresenceVisibleInOnlineSurfaces(memberId, viewerUserId)).length;
}
