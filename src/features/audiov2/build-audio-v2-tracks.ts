import {
  parseAlbumPayload,
  resolveContentPlayableMedia,
} from "@/features/publisher/publisher-content-payload";
import type { PublisherContentItem } from "@/features/publisher/types";

export type AudioV2Tab = "all" | "hymns" | "albums" | "videos";

export type AudioV2Track = {
  key: string;
  contentId: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  mediaUrl: string;
  durationSeconds: number | null;
  tab: "hymns" | "albums";
};

export type AudioV2Video = {
  key: string;
  contentId: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  mediaUrl: string;
  durationSeconds: number | null;
};

function coverFor(item: PublisherContentItem, fallback: string) {
  return item.coverUrl?.trim() || fallback;
}

/** Flatten publisher content into a Spotify-style playable queue. */
export function buildAudioV2Tracks(
  content: PublisherContentItem[],
  fallbackCover: string,
): AudioV2Track[] {
  const out: AudioV2Track[] = [];

  for (const item of content) {
    if (item.contentKind === "hymn" || item.contentKind === "lecture") {
      const media = resolveContentPlayableMedia(item, content);
      if (!media.mediaUrl) continue;
      out.push({
        key: item.id,
        contentId: item.id,
        title: item.title,
        subtitle: item.contentKind === "lecture" ? "محاضرة" : "ترنيمة",
        coverUrl: coverFor(item, fallbackCover),
        mediaUrl: media.mediaUrl,
        durationSeconds: media.durationSeconds ?? item.durationSeconds ?? null,
        tab: "hymns",
      });
    }
  }

  for (const item of content) {
    if (item.contentKind !== "album" && item.contentKind !== "playlist") continue;

    const payload = parseAlbumPayload(item.payload);
    const trackIds = payload.trackIds ?? [];
    const inlineTracks = payload.tracks ?? [];
    const refs = inlineTracks.length
      ? inlineTracks
      : trackIds.flatMap((id) => {
          const hymn = content.find((h) => h.id === id);
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

    if (refs.length) {
      for (const ref of refs) {
        const url = ref.mediaUrl?.trim();
        if (!url) continue;
        out.push({
          key: `${item.id}:${ref.id}`,
          contentId: item.id,
          title: ref.title,
          subtitle: item.title,
          coverUrl: coverFor(item, fallbackCover),
          mediaUrl: url,
          durationSeconds: ref.durationSeconds ?? null,
          tab: "albums",
        });
      }
      continue;
    }

    const media = resolveContentPlayableMedia(item, content);
    if (!media.mediaUrl) continue;
    out.push({
      key: item.id,
      contentId: item.id,
      title: item.title,
      subtitle: item.contentKind === "playlist" ? "قائمة تشغيل" : "ألبوم",
      coverUrl: coverFor(item, fallbackCover),
      mediaUrl: media.mediaUrl,
      durationSeconds: media.durationSeconds ?? item.durationSeconds ?? null,
      tab: "albums",
    });
  }

  return out;
}

export function buildAudioV2Videos(
  content: PublisherContentItem[],
  fallbackCover: string,
): AudioV2Video[] {
  return content
    .filter((item) => item.contentKind === "video" && item.mediaUrl?.trim())
    .map((item) => ({
      key: item.id,
      contentId: item.id,
      title: item.title,
      subtitle: "فيديو",
      coverUrl: coverFor(item, fallbackCover),
      mediaUrl: item.mediaUrl!.trim(),
      durationSeconds: item.durationSeconds ?? null,
    }));
}

export function filterAudioV2Tracks(tracks: AudioV2Track[], tab: AudioV2Tab): AudioV2Track[] {
  if (tab === "all" || tab === "videos") return tracks;
  if (tab === "hymns") return tracks.filter((t) => t.tab === "hymns");
  return tracks.filter((t) => t.tab === "albums");
}
