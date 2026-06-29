/** ALPHA-088 — Trip prayer requests (local + Domain 10 `trip_prayer_requests`) */

import { getMemberProfile } from "../post-registrations";
import { currentUserName } from "../current-user";
import type { TripPrayerRequest } from "./trip-features-roadmap";
import {
  fetchTripPrayerRequests,
  incrementTripPrayerReactionRemote,
  insertTripPrayerRequestRemote,
  isDomain10RemoteAvailable,
} from "./trip-domain-api";

const KEY = "alpha:088:trip-prayers";
const EVENT = "ab:trip-prayers-changed";

function readAll(): TripPrayerRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TripPrayerRequest[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: TripPrayerRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(EVENT));
}

function mergeRemoteLocal(postId: string, remote: TripPrayerRequest[]): TripPrayerRequest[] {
  const local = readAll().filter((p) => p.postId === postId);
  const merged = [...remote];
  for (const row of local) {
    if (!merged.some((x) => x.id === row.id)) merged.push(row);
  }
  return merged.sort((a, b) => b.reactions - a.reactions);
}

export function subscribeTripPrayers(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function listTripPrayerRequests(postId: string): TripPrayerRequest[] {
  return readAll().filter((p) => p.postId === postId).sort((a, b) => b.reactions - a.reactions);
}

export async function syncTripPrayersFromDb(postId: string): Promise<void> {
  if (!postId || isDomain10RemoteAvailable() === false) return;

  const remoteRows = await fetchTripPrayerRequests(postId);
  const remote: TripPrayerRequest[] = remoteRows.map((r) => ({
    id: r.id,
    postId,
    authorName: r.authorName,
    body: r.body,
    reactions: r.reactions,
    sharedWithOrganizer: r.sharedWithOrganizer,
  }));

  const rest = readAll().filter((p) => p.postId !== postId);
  writeAll([...mergeRemoteLocal(postId, remote), ...rest]);
}

export function submitTripPrayerRequest(postId: string, body: string, shareWithOrganizer = true) {
  const profile = getMemberProfile();
  const req: TripPrayerRequest = {
    id: `tpr-${Date.now().toString(36)}`,
    postId,
    authorName: profile.name || currentUserName(),
    body: body.trim(),
    reactions: 0,
    sharedWithOrganizer: shareWithOrganizer,
  };
  writeAll([req, ...readAll()]);

  const userId = profile.id;
  if (userId) {
    void insertTripPrayerRequestRemote({
      postId,
      userId,
      authorName: req.authorName,
      body: req.body,
      sharedWithOrganizer: shareWithOrganizer,
    }).then((remoteId) => {
      if (!remoteId) return;
      writeAll(readAll().map((p) => (p.id === req.id ? { ...p, id: remoteId } : p)));
    });
  }

  return req;
}

export function reactToTripPrayer(id: string) {
  const row = readAll().find((p) => p.id === id);
  if (!row) return;
  const nextCount = row.reactions + 1;
  writeAll(readAll().map((p) => (p.id === id ? { ...p, reactions: nextCount } : p)));
  void incrementTripPrayerReactionRemote(id, nextCount);
}
