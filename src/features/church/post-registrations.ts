import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { joinTripPublicChannel } from "@/features/alpha-connect/provision-trip-channels";
import { processWaitlistAfterCancellation } from "./trip-reservations/trip-waitlist";
import { currentUserName, getCurrentUser } from "./current-user";
import { resolvedMemberChurchName } from "./member-church-api";

export type RegistrationKind = "attendance" | "trip" | "event" | "reservation";
export type RegistrationStatus = "registered" | "confirmed" | "cancelled";

export type PostRegistration = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  churchName: string;
  kind: RegistrationKind;
  seats: number;
  status: RegistrationStatus;
  /** Reserved for future QR attendance / reservation flows */
  qrToken: string | null;
  registeredAt: string;
  updatedAt: string;
};

const CACHE_KEY = "alpha:church:post-registrations";
const PROFILE_KEY = "alpha:church:member-profile";
const DEFAULT_CHURCH = "—";

type MemberProfile = { id: string; name: string; churchName: string };

const EMPTY: PostRegistration[] = [];
const listeners = new Set<() => void>();
let memoryCache: PostRegistration[] | null = null;
const snapshotCache = new Map<string, PostRegistration[]>();
/** null = unknown, false = table missing / remote unavailable */
let registrationsRemoteAvailable: boolean | null = null;

function isMissingTableError(error: { code?: string; message?: string; status?: number } | null) {
  if (!error) return false;
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.status === 404 ||
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    msg.includes("could not find the table") ||
    (msg.includes("does not exist") && msg.includes("post_registrations"))
  );
}

function invalidateCache() {
  memoryCache = null;
  snapshotCache.clear();
}

function bump() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = () => {
    invalidateCache();
    l();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function readCache(): PostRegistration[] {
  if (typeof window === "undefined") return EMPTY;
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    memoryCache = raw ? (JSON.parse(raw) as PostRegistration[]) : [];
    return memoryCache;
  } catch {
    memoryCache = [];
    return memoryCache;
  }
}

function writeCache(rows: PostRegistration[]) {
  if (typeof window === "undefined") return;
  memoryCache = rows;
  snapshotCache.clear();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
    bump();
  } catch { /* ignore */ }
}

function snapshotKey(postId: string, kind?: RegistrationKind) {
  return `${postId}\0${kind ?? ""}`;
}

function sameRows(a: PostRegistration[], b: PostRegistration[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function rowFromDb(r: Record<string, unknown>): PostRegistration {
  return {
    id: String(r.id),
    postId: String(r.post_id),
    userId: String(r.user_id),
    userName: String(r.user_name),
    churchName: String(r.church_name),
    kind: r.kind as RegistrationKind,
    seats: Number(r.seats) || 1,
    status: r.status as RegistrationStatus,
    qrToken: r.qr_token ? String(r.qr_token) : null,
    registeredAt: String(r.registered_at),
    updatedAt: String(r.updated_at),
  };
}

export function getMemberProfile(): MemberProfile {
  const user = getCurrentUser();
  if (!user.id) {
    return { id: "", name: "", churchName: DEFAULT_CHURCH };
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MemberProfile;
      if (parsed.id === user.id) return parsed;
    }
  } catch { /* ignore */ }
  return { id: user.id, name: user.name || currentUserName(), churchName: resolvedMemberChurchName(DEFAULT_CHURCH) };
}

export function saveMemberProfile(patch: Partial<MemberProfile>) {
  const cur = getMemberProfile();
  const next = { ...cur, ...patch };
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

export async function syncRegistrationsFromDb(postId?: string) {
  if (registrationsRemoteAvailable === false) return readCache();

  let q = supabase.from("post_registrations").select("*").order("registered_at", { ascending: false });
  if (postId) q = q.eq("post_id", postId);
  const { data, error } = await q;
  if (error) {
    if (isMissingTableError(error)) registrationsRemoteAvailable = false;
    return readCache();
  }
  registrationsRemoteAvailable = true;
  if (!data) return readCache();
  const remote = data.map((r) => rowFromDb(r as Record<string, unknown>));
  if (postId) {
    const rest = readCache().filter((r) => r.postId !== postId);
    writeCache([...remote, ...rest]);
  } else {
    writeCache(remote);
  }
  return readCache();
}

function upsertLocal(row: PostRegistration) {
  const list = readCache().filter((r) => r.id !== row.id);
  writeCache([row, ...list]);
}

function afterTripRegistration(postId: string, kind: RegistrationKind) {
  if (kind !== "trip") return;
  joinTripPublicChannel(postId);
}

export async function registerForPost(opts: {
  postId: string;
  kind: RegistrationKind;
  seats?: number;
  userName?: string;
  churchName?: string;
}): Promise<{ ok: boolean; error?: string; row?: PostRegistration }> {
  const profile = getMemberProfile();
  if (!profile.id) return { ok: false, error: "يجب تسجيل الدخول أولاً" };
  const name = (opts.userName ?? currentUserName()).trim();

  const seats = Math.max(1, opts.seats ?? 1);
  const churchName = opts.churchName ?? profile.churchName ?? DEFAULT_CHURCH;
  saveMemberProfile({ name, churchName });

  const existing = readCache().find(
    (r) =>
      r.postId === opts.postId &&
      r.userId === profile.id &&
      r.kind === opts.kind &&
      r.status !== "cancelled",
  );

  const payload = {
    post_id: opts.postId,
    user_id: profile.id,
    user_name: name,
    church_name: churchName,
    kind: opts.kind,
    seats,
    status: "registered" as const,
    qr_token: null as string | null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("post_registrations")
      .update({ ...payload, seats: existing.seats + seats })
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();

    if (!error && data) {
      const row = rowFromDb(data as Record<string, unknown>);
      upsertLocal(row);
      afterTripRegistration(opts.postId, opts.kind);
      return { ok: true, row };
    }

    const row: PostRegistration = {
      ...existing,
      seats: existing.seats + seats,
      userName: name,
      churchName,
      updatedAt: new Date().toISOString(),
    };
    upsertLocal(row);
    afterTripRegistration(opts.postId, opts.kind);
    return { ok: true, row };
  }

  const { data, error } = await supabase
    .from("post_registrations")
    .insert({ ...payload, registered_at: new Date().toISOString() })
    .select("*")
    .maybeSingle();

  if (!error && data) {
    const row = rowFromDb(data as Record<string, unknown>);
    upsertLocal(row);
    afterTripRegistration(opts.postId, opts.kind);
    return { ok: true, row };
  }

  const localRow: PostRegistration = {
    id: `local-${Date.now()}`,
    postId: opts.postId,
    userId: profile.id,
    userName: name,
    churchName,
    kind: opts.kind,
    seats,
    status: "registered",
    qrToken: null,
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  upsertLocal(localRow);
  afterTripRegistration(opts.postId, opts.kind);
  return { ok: true, row: localRow };
}

export async function cancelRegistration(id: string) {
  const row = readCache().find((r) => r.id === id);
  const freedSeats = row?.seats ?? 1;
  const postId = row?.postId;
  const kind = row?.kind;

  const { error } = await supabase
    .from("post_registrations")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id);

  const list = readCache().map((r) =>
    r.id === id ? { ...r, status: "cancelled" as const, updatedAt: new Date().toISOString() } : r,
  );
  writeCache(list);

  if (postId && kind === "trip") {
    processWaitlistAfterCancellation(postId, freedSeats);
  }
  return !error;
}

export async function confirmRegistration(id: string) {
  const { error } = await supabase
    .from("post_registrations")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", id);

  const list = readCache().map((r) =>
    r.id === id ? { ...r, status: "confirmed" as const, updatedAt: new Date().toISOString() } : r,
  );
  writeCache(list);
  return !error;
}

export function subscribePostRegistrations(listener: () => void) {
  return subscribe(listener);
}

export function listMyRegistrations(userId?: string): PostRegistration[] {
  const uid = userId ?? getMemberProfile().id;
  return readCache()
    .filter((r) => r.userId === uid && r.status !== "cancelled")
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
}

export function getRegistrationsForPost(postId: string, kind?: RegistrationKind) {
  const key = snapshotKey(postId, kind);
  const prev = snapshotCache.get(key);
  const filtered = readCache().filter(
    (r) => r.postId === postId && r.status !== "cancelled" && (!kind || r.kind === kind),
  );
  if (prev && sameRows(prev, filtered)) return prev;
  snapshotCache.set(key, filtered);
  return filtered;
}

export function countParticipants(postId: string, kind?: RegistrationKind) {
  return getRegistrationsForPost(postId, kind).reduce((sum, r) => sum + r.seats, 0);
}

export function myRegistration(postId: string, kind: RegistrationKind) {
  const profile = getMemberProfile();
  return readCache().find(
    (r) =>
      r.postId === postId &&
      r.userId === profile.id &&
      r.kind === kind &&
      r.status !== "cancelled",
  );
}

let registrationsSyncStarted = false;

export function usePostRegistrations(postId: string, kind?: RegistrationKind) {
  const rows = useSyncExternalStore(
    subscribe,
    () => getRegistrationsForPost(postId, kind),
    () => EMPTY,
  );
  useEffect(() => {
    if (registrationsRemoteAvailable === false) return;
    if (!registrationsSyncStarted) {
      registrationsSyncStarted = true;
      syncRegistrationsFromDb().catch(() => {});
      return;
    }
    if (registrationsRemoteAvailable === true) {
      syncRegistrationsFromDb(postId).catch(() => {});
    }
  }, [postId]);
  const count = rows.reduce((s, r) => s + r.seats, 0);
  const profile = getMemberProfile();
  const mine = rows.find((r) => r.userId === profile.id && (!kind || r.kind === kind));
  return { rows, count, mine };
}

export function exportRegistrationsCsv(postId: string, title: string) {
  const rows = getRegistrationsForPost(postId);
  const header = "الاسم,الكنيسة,النوع,العدد,الحالة,تاريخ التسجيل";
  const body = rows
    .map((r) =>
      [r.userName, r.churchName, r.kind, r.seats, r.status, r.registeredAt]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + header + "\n" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}-participants.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function kindForPostType(type: string): RegistrationKind | null {
  if (type === "trip") return "trip";
  if (type === "event") return "event";
  if (type === "liturgy" || type === "meeting") return "attendance";
  return null;
}
