/** ALPHA-090 — Trip memory album (local + Domain 10) */

import type { TripMemoryAlbum } from "./trip-features-roadmap";
import type { ChurchPost } from "@/data/church-posts";
import {
  fetchTripMemoryAlbumRemote,
  isDomain10RemoteAvailable,
  persistTripMemoryAlbumRemote,
} from "./trip-domain-api";

const KEY = "alpha:090:trip-albums";

function readMap(): Record<string, TripMemoryAlbum> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, TripMemoryAlbum>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, TripMemoryAlbum>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getTripMemoryAlbum(postId: string): TripMemoryAlbum | null {
  return readMap()[postId] ?? null;
}

export async function syncTripMemoryAlbumFromDb(postId: string): Promise<void> {
  if (!postId || isDomain10RemoteAvailable() === false) return;

  const remote = await fetchTripMemoryAlbumRemote(postId);
  if (!remote) return;

  const map = readMap();
  map[postId] = { postId, ...remote };
  writeMap(map);
}

export function buildTripMemoryAlbum(post: ChurchPost): TripMemoryAlbum {
  const album: TripMemoryAlbum = {
    postId: post.id,
    photos: post.image ? [post.image] : [],
    videos: [],
    highlights: [
      post.title,
      post.details?.places ? `زيارة: ${post.details.places}` : "",
      post.details?.date ? `تاريخ: ${post.details.date}` : "",
      post.excerpt,
    ].filter(Boolean),
  };
  const map = readMap();
  map[post.id] = album;
  writeMap(map);

  void persistTripMemoryAlbumRemote({
    postId: post.id,
    title: post.title,
    photos: album.photos,
    videos: album.videos,
    highlights: album.highlights,
  });

  return album;
}
