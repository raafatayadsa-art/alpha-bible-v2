import { getMemberProfile, registerForPost } from "../post-registrations";
import { currentUserName } from "../current-user";

/** ALPHA-085 — Smart waiting list */

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
  return readAll().find((e) => e.postId === postId && e.userId === profile.id && e.status !== "claimed" && e.status !== "declined");
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
  return updated;
}

export function expireStaleOffers(postId: string) {
  const now = Date.now();
  const rows = readAll();
  let changed = false;
  const nextRows = rows.map((e) => {
    if (e.postId !== postId || e.status !== "offered" || !e.offerExpiresAt) return e;
    if (Date.now() < new Date(e.offerExpiresAt).getTime()) return e;
    changed = true;
    return { ...e, status: "expired" as const };
  });
  if (changed) writeAll(nextRows);
}

export function processWaitlistAfterCancellation(postId: string, freedSeats: number) {
  expireStaleOffers(postId);
  return offerNextInQueue(postId, freedSeats);
}

export async function confirmWaitlistOffer(entryId: string): Promise<{ ok: boolean; error?: string }> {
  const entry = readAll().find((e) => e.id === entryId);
  if (!entry || entry.status !== "offered") return { ok: false, error: "العرض غير متاح" };
  if (entry.offerExpiresAt && Date.now() > new Date(entry.offerExpiresAt).getTime()) {
    writeAll(readAll().map((e) => (e.id === entryId ? { ...e, status: "expired" as const } : e)));
    processWaitlistAfterCancellation(entry.postId, entry.seats);
    return { ok: false, error: "انتهت مهلة التأكيد" };
  }

  const res = await registerForPost({
    postId: entry.postId,
    kind: "trip",
    seats: entry.seats,
    userName: entry.userName,
  });
  if (!res.ok) return res;

  writeAll(readAll().map((e) => (e.id === entryId ? { ...e, status: "claimed" as const } : e)));
  return { ok: true };
}

export function declineWaitlistOffer(entryId: string) {
  const entry = readAll().find((e) => e.id === entryId);
  if (!entry) return;
  writeAll(readAll().map((e) => (e.id === entryId ? { ...e, status: "declined" as const } : e)));
  processWaitlistAfterCancellation(entry.postId, entry.seats);
}

export function leaveWaitlist(postId: string) {
  const profile = getMemberProfile();
  writeAll(
    readAll().filter(
      (e) => !(e.postId === postId && e.userId === profile.id && (e.status === "waiting" || e.status === "offered")),
    ),
  );
}

export function msUntilOfferExpiry(entry: TripWaitlistEntry): number {
  if (!entry.offerExpiresAt) return 0;
  return Math.max(0, new Date(entry.offerExpiresAt).getTime() - Date.now());
}
