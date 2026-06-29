/** ALPHA-091 — Trip timeline replay (local + Domain 10) */

import type { TripTimelineEvent } from "./trip-features-roadmap";
import type { ChurchPost } from "@/data/church-posts";
import { listTripBuses } from "./trip-bus-store";
import { readTripOperations } from "@/features/alpha-connect/trip-operations-store";
import {
  fetchTripTimelineEvents,
  insertTripTimelineEventRemote,
  isDomain10RemoteAvailable,
  replaceTripTimelineRemote,
} from "./trip-domain-api";

const KEY = "alpha:091:trip-timelines";

function readMap(): Record<string, TripTimelineEvent[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, TripTimelineEvent[]>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, TripTimelineEvent[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

function mergeRemoteLocal(postId: string, remote: TripTimelineEvent[]): TripTimelineEvent[] {
  const local = readMap()[postId] ?? [];
  const merged = [...remote];
  for (const row of local) {
    if (!merged.some((x) => x.id === row.id)) merged.push(row);
  }
  return merged.sort((a, b) => a.at.localeCompare(b.at));
}

export function getTripTimeline(postId: string): TripTimelineEvent[] {
  return (readMap()[postId] ?? []).sort((a, b) => a.at.localeCompare(b.at));
}

export async function syncTripTimelineFromDb(postId: string): Promise<void> {
  if (!postId || isDomain10RemoteAvailable() === false) return;

  const remoteRows = await fetchTripTimelineEvents(postId);
  const remote: TripTimelineEvent[] = remoteRows.map((r) => ({
    id: r.id,
    postId,
    kind: r.kind as TripTimelineEvent["kind"],
    title: r.title,
    at: r.at,
    mediaUrl: r.mediaUrl,
  }));

  const map = readMap();
  map[postId] = mergeRemoteLocal(postId, remote);
  writeMap(map);
}

export function appendTimelineEvent(event: Omit<TripTimelineEvent, "id">) {
  const map = readMap();
  const list = map[event.postId] ?? [];
  const row: TripTimelineEvent = { ...event, id: `tl-${Date.now().toString(36)}` };
  list.push(row);
  map[event.postId] = list;
  writeMap(map);

  void insertTripTimelineEventRemote({
    postId: event.postId,
    kind: event.kind,
    title: event.title,
    at: event.at,
    mediaUrl: event.mediaUrl,
  }).then((remoteId) => {
    if (!remoteId) return;
    const next = readMap();
    next[event.postId] = (next[event.postId] ?? []).map((e) => (e.id === row.id ? { ...e, id: remoteId } : e));
    writeMap(next);
  });
}

export function buildTripTimelineFromArchive(post: ChurchPost): TripTimelineEvent[] {
  const ops = readTripOperations(post.id);
  const buses = listTripBuses(post.id);
  const now = new Date().toISOString();
  const events: TripTimelineEvent[] = [
    {
      id: `tl-dep-${post.id}`,
      postId: post.id,
      at: post.details?.date ?? now,
      kind: "departure",
      title: "انطلاق الرحلة",
      mediaUrl: post.image,
    },
  ];
  for (const bus of buses) {
    events.push({
      id: `tl-bus-${bus.id}`,
      postId: post.id,
      at: now,
      kind: "stop",
      title: `${bus.label} — ${bus.status}`,
    });
  }
  if (post.details?.places) {
    events.push({
      id: `tl-places-${post.id}`,
      postId: post.id,
      at: now,
      kind: "activity",
      title: post.details.places,
    });
  }
  events.push({
    id: `tl-ret-${post.id}`,
    postId: post.id,
    at: post.details?.returnDate ?? now,
    kind: "arrival",
    title: "العودة",
  });
  if (ops.checkedIn > 0) {
    events.push({
      id: `tl-checkin-${post.id}`,
      postId: post.id,
      at: ops.lastCheckInAt ?? now,
      kind: "activity",
      title: `${ops.checkedIn} حضور مؤكد`,
    });
  }
  const map = readMap();
  map[post.id] = events;
  writeMap(map);

  void replaceTripTimelineRemote({
    postId: post.id,
    title: post.title,
    events: events.map((e) => ({
      kind: e.kind,
      title: e.title,
      at: e.at,
      mediaUrl: e.mediaUrl,
    })),
  }).then((ok) => {
    if (ok) void syncTripTimelineFromDb(post.id);
  });

  return events;
}
