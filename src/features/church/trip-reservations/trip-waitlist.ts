import { getMemberProfile, registerForPost } from "../post-registrations";
import { currentUserName } from "../current-user";
import {
  ensureTripIdForPost,
  fetchTripIdByPostId,
  isDomain10RemoteAvailable,
  isMissingDomain10Error,
  markDomain10Available,
  markDomain10Unavailable,
  offerNextWaitlistSeatRemote,
} from "./trip-domain-api";
import { supabase } from "@/integrations/supabase/client";

/** ALPHA-085 — Smart waiting list (local + Domain 10 `waiting_lists`) */

export type WaitlistEntryStatus = "waiting" | "offered" | "claimed" | "expired" | "declined";

export type TripWaitlistEntry = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  seats: number;
  status: WaitlistEntryStatus;
  createdAt: string;
  offeredAt?: string;
  offerExpiresAt?: string;
};

const WAITLIST_KEY = "alpha:085:trip-waitlist";
const WAITLIST_EVENT = "ab:trip-waitlist-changed";
export const WAITLIST_HOLD_MS = 30 * 60 * 1000;

const listeners = new Set<() => void>();

function bump() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(WAITLIST_EVENT));
  }
  listeners.forEach((l) => l());
}

export function subscribeTripWaitlist(handler: () => void) {
  listeners.add(handler);
  if (typeof window !== "undefined") {
    window.addEventListener(WAITLIST_EVENT, handler);
  }
  return () => {
    listeners.delete(handler);
    if (typeof window !== "undefined") {
      window.removeEventListener(WAITLIST_EVENT, handler);
    }
  };
}

function readAll(): TripWaitlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    return raw ? (JSON.parse(raw) as TripWaitlistEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: TripWaitlistEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(rows));
  bump();
}

function rowFromDb(row: Record<string, unknown>, postId: string): TripWaitlistEntry {
  return {
    id: String(row.id),
    postId,
    userId: String(row.user_id),
    userName: String(row.user_name),
    seats: Number(row.seats) || 1,
    status: row.status as WaitlistEntryStatus,
    createdAt: String(row.created_at),
    offeredAt: row.offered_at ? String(row.offered_at) : undefined,
    offerExpiresAt: row.offer_expires_at ? String(row.offer_expires_at) : undefined,
  };
}

function mergeRemoteLocal(postId: string, remote: TripWaitlistEntry[]): TripWaitlistEntry[] {
  const local = readAll().filter((e) => e.postId === postId);
  const merged = [...remote];
  for (const entry of local) {
    if (!merged.some((x) => x.id === entry.id)) merged.push(entry);
  }
  return merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function syncTripWaitlistFromDb(postId: string): Promise<void> {
  if (!postId || isDomain10RemoteAvailable() === false) return;

  const tripId = await fetchTripIdByPostId(postId);
  if (!tripId) return;

  const { data, error } = await supabase
    .from("waiting_lists")
    .select("id, user_id, user_name, seats, status, created_at, offered_at, offer_expires_at")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return;
  }

  markDomain10Available();
  const remote = (data ?? []).map((r) => rowFromDb(r as Record<string, unknown>, postId));
  const rest = readAll().filter((e) => e.postId !== postId);
  writeAll([...mergeRemoteLocal(postId, remote), ...rest]);
}

async function persistWaitlistEntryRemote(entry: TripWaitlistEntry): Promise<void> {
  if (isDomain10RemoteAvailable() === false) return;

  const tripId = await ensureTripIdForPost({ postId: entry.postId, title: "رحلة" });
  if (!tripId) return;

  const isUuid = /^[0-9a-f-]{36}$/i.test(entry.id);
  if (isUuid) {
    const { error } = await supabase
      .from("waiting_lists")
      .update({
        status: entry.status,
        seats: entry.seats,
        user_name: entry.userName,
        offered_at: entry.offeredAt ?? null,
        offer_expires_at: entry.offerExpiresAt ?? null,
      })
      .eq("id", entry.id);
    if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
    else if (!error) markDomain10Available();
    return;
  }

  const { data, error } = await supabase
    .from("waiting_lists")
    .insert({
      trip_id: tripId,
      user_id: entry.userId,
      user_name: entry.userName,
      seats: entry.seats,
      status: entry.status,
      offered_at: entry.offeredAt ?? null,
      offer_expires_at: entry.offerExpiresAt ?? null,
    })
    .select("id, user_id, user_name, seats, status, created_at, offered_at, offer_expires_at")
    .single();

  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return;
  }

  markDomain10Available();
  const saved = rowFromDb(data as Record<string, unknown>, entry.postId);
  writeAll(readAll().map((e) => (e.id === entry.id ? saved : e)));
}

async function removeWaitlistEntryRemote(entry: TripWaitlistEntry): Promise<void> {
  if (isDomain10RemoteAvailable() === false) return;
  if (!/^[0-9a-f-]{36}$/i.test(entry.id)) return;
  const { error } = await supabase.from("waiting_lists").delete().eq("id", entry.id);
  if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
}

export function getWaitlistForPost(postId: string): TripWaitlistEntry[] {
  return readAll()
    .filter((e) => e.postId === postId && e.status !== "claimed" && e.status !== "declined")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getActiveWaitlistQueue(postId: string): TripWaitlistEntry[] {
  return getWaitlistForPost(postId).filter((e) => e.status === "waiting" || e.status === "offered");
}

export function myWaitlistEntry(postId: string): TripWaitlistEntry | undefined {
  const profile = getMemberProfile();
  if (!profile.id) return undefined;
  return readAll().find(
    (e) => e.postId === postId && e.userId === profile.id && e.status !== "claimed" && e.status !== "declined",
  );
}

export function waitlistPosition(entry: TripWaitlistEntry): number {
  const queue = getActiveWaitlistQueue(entry.postId).filter((e) => e.status === "waiting" || e.status === "offered");
  const idx = queue.findIndex((e) => e.id === entry.id);
  return idx >= 0 ? idx + 1 : queue.length + 1;
}

export function countWaiting(postId: string): number {
  return getActiveWaitlistQueue(postId).filter((e) => e.status === "waiting").length;
}

export function joinTripWaitlist(postId: string, seats = 1): { ok: boolean; error?: string; entry?: TripWaitlistEntry } {
  const profile = getMemberProfile();
  if (!profile.id) return { ok: false, error: "يجب تسجيل الدخول أولاً" };

  const existing = myWaitlistEntry(postId);
  if (existing) return { ok: false, error: "أنت بالفعل في قائمة الانتظار" };

  const entry: TripWaitlistEntry = {
    id: `wl-${Date.now().toString(36)}`,
    postId,
    userId: profile.id,
    userName: profile.name || currentUserName(),
    seats: Math.max(1, seats),
    status: "waiting",
    createdAt: new Date().toISOString(),
  };
  writeAll([entry, ...readAll()]);
  void persistWaitlistEntryRemote(entry);
  return { ok: true, entry };
}

function offerNextInQueue(postId: string, freedSeats: number): TripWaitlistEntry | null {
  expireStaleOffers(postId);
  const waiting = getWaitlistForPost(postId).filter((e) => e.status === "waiting");
  const next = waiting.find((e) => e.seats <= freedSeats) ?? waiting[0];
  if (!next) return null;

  const now = Date.now();
  const updated: TripWaitlistEntry = {
    ...next,
    status: "offered",
    offeredAt: new Date(now).toISOString(),
    offerExpiresAt: new Date(now + WAITLIST_HOLD_MS).toISOString(),
  };
  writeAll(readAll().map((e) => (e.id === next.id ? updated : e)));
  void persistWaitlistEntryRemote(updated);
  return updated;
}

function applyRemoteWaitlistOffer(postId: string, remote: {
  id: string;
  userId: string;
  userName: string;
  seats: number;
  status: string;
  createdAt: string;
  offeredAt?: string;
  offerExpiresAt?: string;
}): TripWaitlistEntry {
  const entry: TripWaitlistEntry = {
    id: remote.id,
    postId,
    userId: remote.userId,
    userName: remote.userName,
    seats: remote.seats,
    status: remote.status as WaitlistEntryStatus,
    createdAt: remote.createdAt,
    offeredAt: remote.offeredAt,
    offerExpiresAt: remote.offerExpiresAt,
  };
  const rows = readAll();
  const idx = rows.findIndex((e) => e.id === entry.id || (e.postId === postId && e.userId === entry.userId));
  if (idx >= 0) {
    writeAll(rows.map((e, i) => (i === idx ? entry : e)));
  } else {
    writeAll([entry, ...rows]);
  }
  return entry;
}

export function expireStaleOffers(postId: string) {
  const now = Date.now();
  const rows = readAll();
  let changed = false;
  const nextRows = rows.map((e) => {
    if (e.postId !== postId || e.status !== "offered" || !e.offerExpiresAt) return e;
    if (now < new Date(e.offerExpiresAt).getTime()) return e;
    changed = true;
    const expired = { ...e, status: "expired" as const };
    void persistWaitlistEntryRemote(expired);
    return expired;
  });
  if (changed) writeAll(nextRows);
}

export async function processWaitlistAfterCancellation(postId: string, freedSeats: number) {
  expireStaleOffers(postId);
  if (isDomain10RemoteAvailable() !== false) {
    const remote = await offerNextWaitlistSeatRemote({ postId, freedSeats, holdMs: WAITLIST_HOLD_MS });
    if (remote) return applyRemoteWaitlistOffer(postId, remote);
  }
  return offerNextInQueue(postId, freedSeats);
}

export async function confirmWaitlistOffer(entryId: string): Promise<{ ok: boolean; error?: string }> {
  const entry = readAll().find((e) => e.id === entryId);
  if (!entry || entry.status !== "offered") return { ok: false, error: "العرض غير متاح" };
  if (entry.offerExpiresAt && Date.now() > new Date(entry.offerExpiresAt).getTime()) {
    const expired = { ...entry, status: "expired" as const };
    writeAll(readAll().map((e) => (e.id === entryId ? expired : e)));
    void persistWaitlistEntryRemote(expired);
    void processWaitlistAfterCancellation(entry.postId, entry.seats);
    return { ok: false, error: "انتهت مهلة التأكيد" };
  }

  const res = await registerForPost({
    postId: entry.postId,
    kind: "trip",
    seats: entry.seats,
    userName: entry.userName,
  });
  if (!res.ok) return res;

  const claimed = { ...entry, status: "claimed" as const };
  writeAll(readAll().map((e) => (e.id === entryId ? claimed : e)));
  void persistWaitlistEntryRemote(claimed);
  return { ok: true };
}

export function declineWaitlistOffer(entryId: string) {
  const entry = readAll().find((e) => e.id === entryId);
  if (!entry) return;
  const declined = { ...entry, status: "declined" as const };
  writeAll(readAll().map((e) => (e.id === entryId ? declined : e)));
  void persistWaitlistEntryRemote(declined);
  void processWaitlistAfterCancellation(entry.postId, entry.seats);
}

export function leaveWaitlist(postId: string) {
  const profile = getMemberProfile();
  const removed = readAll().filter(
    (e) => e.postId === postId && e.userId === profile.id && (e.status === "waiting" || e.status === "offered"),
  );
  writeAll(
    readAll().filter(
      (e) => !(e.postId === postId && e.userId === profile.id && (e.status === "waiting" || e.status === "offered")),
    ),
  );
  for (const entry of removed) void removeWaitlistEntryRemote(entry);
}

export function msUntilOfferExpiry(entry: TripWaitlistEntry): number {
  if (!entry.offerExpiresAt) return 0;
  return Math.max(0, new Date(entry.offerExpiresAt).getTime() - Date.now());
}

const waitlistRealtimeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

/** Realtime sync when waitlist rows change (offers, claims, etc.) */
export function subscribeTripWaitlistRealtime(postId: string): () => void {
  if (typeof window === "undefined" || !postId) return () => {};

  const existing = waitlistRealtimeChannels.get(postId);
  if (existing) {
    void supabase.removeChannel(existing);
    waitlistRealtimeChannels.delete(postId);
  }

  let cancelled = false;

  void fetchTripIdByPostId(postId).then((tripId) => {
    if (!tripId || cancelled) return;

    const channel = supabase
      .channel(`trip-waitlist:${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waiting_lists", filter: `trip_id=eq.${tripId}` },
        () => {
          void syncTripWaitlistFromDb(postId);
        },
      )
      .subscribe();

    waitlistRealtimeChannels.set(postId, channel);
  });

  return () => {
    cancelled = true;
    const channel = waitlistRealtimeChannels.get(postId);
    if (channel) {
      void supabase.removeChannel(channel);
      waitlistRealtimeChannels.delete(postId);
    }
  };
}
