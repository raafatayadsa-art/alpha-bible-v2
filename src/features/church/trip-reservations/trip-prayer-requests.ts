/** ALPHA-088 — Trip prayer requests */

import { getMemberProfile } from "../post-registrations";
import { currentUserName } from "../current-user";
import type { TripPrayerRequest } from "./trip-features-roadmap";

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

export function subscribeTripPrayers(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function listTripPrayerRequests(postId: string): TripPrayerRequest[] {
  return readAll().filter((p) => p.postId === postId).sort((a, b) => b.reactions - a.reactions);
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
  return req;
}

export function reactToTripPrayer(id: string) {
  writeAll(readAll().map((p) => (p.id === id ? { ...p, reactions: p.reactions + 1 } : p)));
}
