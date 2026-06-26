/** ALPHA-091 — Trip timeline replay */

import type { TripTimelineEvent } from "./trip-features-roadmap";
import type { ChurchPost } from "@/data/church-posts";
import { listTripBuses } from "./trip-bus-store";
import { readTripOperations } from "@/features/alpha-connect/trip-operations-store";

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

export function getTripTimeline(postId: string): TripTimelineEvent[] {
  return (readMap()[postId] ?? []).sort((a, b) => a.at.localeCompare(b.at));
}

export function appendTimelineEvent(event: Omit<TripTimelineEvent, "id">) {
  const map = readMap();
  const list = map[event.postId] ?? [];
  list.push({ ...event, id: `tl-${Date.now().toString(36)}` });
  map[event.postId] = list;
  writeMap(map);
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
  return events;
}
