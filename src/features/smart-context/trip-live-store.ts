import type { TripLivePhase } from "./types";
import { archiveTripChannels } from "@/features/alpha-connect/provision-trip-channels";
import { expireSingleTripGrant } from "@/features/church/trip-organizer/trip-organizer-grants";
import { finalizePostTrip } from "@/features/church/trip-reservations/post-trip-lifecycle";
import { fetchChurchPostById } from "@/features/church/church-posts-api";

/** Live trip snapshot — local until organizer GPS / realtime ships. */
export type TripLiveSnapshot = {
  postId: string;
  phase: TripLivePhase;
  etaMinutes?: number;
  nextStop?: string;
  announcement?: string;
  progressPercent: number;
  updatedAt: number;
  /** Show completion summary until this epoch ms */
  completedUntil?: number;
};

const STORAGE_KEY = "alpha:082:trip-live";

function readAll(): Record<string, TripLiveSnapshot> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TripLiveSnapshot>) : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, TripLiveSnapshot>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

export function readTripLiveSnapshot(postId: string): TripLiveSnapshot | null {
  return readAll()[postId] ?? null;
}

export function writeTripLiveSnapshot(snapshot: TripLiveSnapshot) {
  const map = readAll();
  map[snapshot.postId] = snapshot;
  writeAll(map);
}

export function clearTripLiveSnapshot(postId: string) {
  const map = readAll();
  delete map[postId];
  writeAll(map);
}

const PHASE_COPY: Record<TripLivePhase, string> = {
  pre_departure: "استعد للانطلاق",
  en_route: "في الطريق",
  arrived: "تم الوصول",
  activity_next: "النشاط القادم",
  departing: "العودة",
  completed: "اكتملت الرحلة",
};

export function tripPhaseStatusLine(phase: TripLivePhase): string {
  return PHASE_COPY[phase];
}

export function formatEtaMinutes(minutes?: number): string | undefined {
  if (minutes == null || Number.isNaN(minutes)) return undefined;
  if (minutes <= 0) return "وصلت الآن";
  if (minutes < 60) return `الوصول خلال ${minutes} دقيقة`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `الوصول خلال ${h} س و ${m} د` : `الوصول خلال ${h} س`;
}

/** Default live snapshot for a registered trip when no organizer feed exists yet. */
export function seedRegisteredTripSnapshot(input: {
  postId: string;
  destination: string;
  announcement?: string;
}): TripLiveSnapshot {
  const existing = readTripLiveSnapshot(input.postId);
  if (existing) return existing;

  const snapshot: TripLiveSnapshot = {
    postId: input.postId,
    phase: "en_route",
    etaMinutes: 23,
    nextStop: input.destination,
    announcement: input.announcement,
    progressPercent: 42,
    updatedAt: Date.now(),
  };
  writeTripLiveSnapshot(snapshot);
  return snapshot;
}

export function markTripCompleted(input: {
  postId: string;
  summaryDays?: number;
}): TripLiveSnapshot {
  const days = input.summaryDays ?? 3;
  const snapshot: TripLiveSnapshot = {
    postId: input.postId,
    phase: "completed",
    progressPercent: 100,
    updatedAt: Date.now(),
    completedUntil: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  writeTripLiveSnapshot(snapshot);
  archiveTripChannels(input.postId);
  expireSingleTripGrant(input.postId);
  void fetchChurchPostById(input.postId).then((post) => {
    if (post) finalizePostTrip(post);
  });
  return snapshot;
}

export function isTripCompletionVisible(snapshot: TripLiveSnapshot | null): boolean {
  if (!snapshot || snapshot.phase !== "completed") return false;
  if (!snapshot.completedUntil) return true;
  return Date.now() < snapshot.completedUntil;
}
