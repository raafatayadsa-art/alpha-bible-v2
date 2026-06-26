/** Album / content payload stored in publisher_content_items.payload */

export type PublisherAlbumTrackRef = {
  id: string;
  title: string;
  durationSeconds?: number | null;
  mediaUrl?: string | null;
};

export type PublisherAlbumPayload = {
  releaseDate?: string | null;
  trackIds?: string[];
  tracks?: PublisherAlbumTrackRef[];
};

export function parseAlbumPayload(raw: unknown): PublisherAlbumPayload {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const tracks = Array.isArray(o.tracks)
    ? o.tracks
        .filter((t): t is Record<string, unknown> => Boolean(t && typeof t === "object"))
        .map((t) => ({
          id: String(t.id ?? ""),
          title: String(t.title ?? ""),
          durationSeconds: typeof t.durationSeconds === "number" ? t.durationSeconds : null,
          mediaUrl: typeof t.mediaUrl === "string" ? t.mediaUrl : null,
        }))
        .filter((t) => t.id && t.title)
    : undefined;
  return {
    releaseDate: typeof o.releaseDate === "string" ? o.releaseDate : null,
    trackIds: Array.isArray(o.trackIds) ? o.trackIds.map(String) : undefined,
    tracks,
  };
}

export function formatDurationSeconds(total: number | null | undefined): string {
  if (total == null || !Number.isFinite(total) || total <= 0) return "—";
  const whole = Math.floor(total);
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function sumTrackDurations(tracks: PublisherAlbumTrackRef[]): number {
  return tracks.reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0);
}

export type PublisherPlayableMedia = {
  mediaUrl: string | null;
  durationSeconds: number | null;
};

/** Resolve the first playable URL for hero / inline playback (hymn, album track, lecture, etc.). */
export function resolveContentPlayableMedia(
  item: { id: string; contentKind: string; mediaUrl?: string | null; durationSeconds?: number | null; payload?: Record<string, unknown> | null },
  allContent: Array<{ id: string; title: string; mediaUrl?: string | null; durationSeconds?: number | null }>,
): PublisherPlayableMedia {
  const direct = item.mediaUrl?.trim();
  if (direct) {
    return { mediaUrl: direct, durationSeconds: item.durationSeconds ?? null };
  }

  if (item.contentKind === "album" || item.contentKind === "playlist") {
    const payload = parseAlbumPayload(item.payload);
    const trackIds = payload.trackIds ?? [];
    const inlineTracks = payload.tracks ?? [];
    const refs = inlineTracks.length
      ? inlineTracks
      : trackIds.flatMap((id) => {
          const hymn = allContent.find((h) => h.id === id);
          if (!hymn) return [];
          return [
            {
              id: hymn.id,
              title: hymn.title,
              durationSeconds: hymn.durationSeconds,
              mediaUrl: hymn.mediaUrl,
            },
          ];
        });
    const first = refs.find((t) => t.mediaUrl?.trim());
    if (first?.mediaUrl?.trim()) {
      return { mediaUrl: first.mediaUrl.trim(), durationSeconds: first.durationSeconds ?? item.durationSeconds ?? null };
    }
  }

  return { mediaUrl: null, durationSeconds: item.durationSeconds ?? null };
}

export function contentHasPlayableMedia(
  item: { id: string; contentKind: string; mediaUrl?: string | null; payload?: Record<string, unknown> | null },
  allContent: Array<{ id: string; title: string; mediaUrl?: string | null; durationSeconds?: number | null }>,
): boolean {
  return Boolean(resolveContentPlayableMedia(item, allContent).mediaUrl);
}
