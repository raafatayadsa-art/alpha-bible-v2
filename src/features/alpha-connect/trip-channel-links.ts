import type { TripChannelLink } from "./trip-channel-types";

const LINKS_KEY = "alpha:083:trip-channel-links";

function readMap(): Record<string, TripChannelLink> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TripChannelLink>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, TripChannelLink>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

export function readTripChannelLink(postId: string): TripChannelLink | null {
  return readMap()[postId] ?? null;
}

export function writeTripChannelLink(link: TripChannelLink) {
  const map = readMap();
  map[link.postId] = link;
  writeMap(map);
}

export function listTripChannelLinks(): TripChannelLink[] {
  return Object.values(readMap());
}

export function findTripLinkByChannelId(channelId: string): TripChannelLink | null {
  return (
    listTripChannelLinks().find(
      (link) => link.tripChannelId === channelId || link.organizerChannelId === channelId,
    ) ?? null
  );
}

export function archiveTripChannelLink(postId: string) {
  const link = readTripChannelLink(postId);
  if (!link) return;
  writeTripChannelLink({ ...link, archivedAt: new Date().toISOString() });
}
