import type { AudioV2Track } from "@/features/audiov2/build-audio-v2-tracks";

export {
  buildAudioV2Tracks as buildPublisherTracks,
  buildAudioV2Videos as buildPublisherVideos,
  filterAudioV2Tracks as filterPublisherTracks,
  type AudioV2Track as PublisherPlayableTrack,
  type AudioV2Video as PublisherVideoItem,
} from "@/features/audiov2/build-audio-v2-tracks";

export { useAudioV2Player as usePublisherPlayer } from "@/features/audiov2/use-audio-v2-player";

/** Map a content item id to a row in the flattened playback queue. */
export function findTrackForContent(
  tracks: AudioV2Track[],
  contentId: string,
): AudioV2Track | undefined {
  return (
    tracks.find((t) => t.key === contentId || t.contentId === contentId) ??
    tracks.find((t) => t.key.startsWith(`${contentId}:`))
  );
}
