import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioV2Track } from "./build-audio-v2-tracks";

function shuffleTracks(list: AudioV2Track[]): AudioV2Track[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export function useAudioV2Player(initialTracks: AudioV2Track[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const [queue, setQueue] = useState<AudioV2Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  const current = queue[queueIndex] ?? null;

  const loadAndPlay = useCallback((track: AudioV2Track, seekSec = 0) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (loadedUrlRef.current !== track.mediaUrl) {
      audio.src = track.mediaUrl;
      loadedUrlRef.current = track.mediaUrl;
      audio.load();
    }

    const applySeek = () => {
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      const seek = dur > 0 ? Math.min(Math.max(0, seekSec), Math.max(0, dur - 0.5)) : Math.max(0, seekSec);
      audio.currentTime = seek;
      setPlayheadSec(seek);
      if (dur > 0) setDurationSec(dur);
    };

    if (audio.readyState >= 1) applySeek();
    else audio.addEventListener("loadedmetadata", applySeek, { once: true });

    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const playQueue = useCallback(
    (tracks: AudioV2Track[], startIndex = 0) => {
      if (!tracks.length) return;
      const idx = Math.min(Math.max(0, startIndex), tracks.length - 1);
      setQueue(tracks);
      setQueueIndex(idx);
      loadAndPlay(tracks[idx]!, 0);
    },
    [loadAndPlay],
  );

  const playTrack = useCallback(
    (track: AudioV2Track, tracksForQueue: AudioV2Track[], startSec = 0) => {
      const idx = tracksForQueue.findIndex((t) => t.key === track.key);
      const queueList = tracksForQueue;
      const startIdx = idx >= 0 ? idx : 0;
      setQueue(queueList);
      setQueueIndex(startIdx);
      loadAndPlay(queueList[startIdx]!, startSec);
    },
    [loadAndPlay],
  );

  const playAll = useCallback(
    (tracks: AudioV2Track[]) => {
      playQueue(tracks, 0);
    },
    [playQueue],
  );

  const shufflePlay = useCallback(
    (tracks: AudioV2Track[]) => {
      if (!tracks.length) return;
      playQueue(shuffleTracks(tracks), 0);
    },
    [playQueue],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (playing) {
      audio.pause();
      return;
    }
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [current, playing]);

  const playNext = useCallback(() => {
    if (!queue.length) return;
    const nextIdx = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    loadAndPlay(queue[nextIdx]!, 0);
  }, [loadAndPlay, queue, queueIndex]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (!queue.length) return;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setPlayheadSec(0);
      return;
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    loadAndPlay(queue[prevIdx]!, 0);
  }, [loadAndPlay, queue, queueIndex]);

  const seek = useCallback((sec: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const next = Math.min(Math.max(0, sec), audio.duration);
    audio.currentTime = next;
    setPlayheadSec(next);
  }, []);

  const skip = useCallback(
    (deltaSec: number) => {
      seek(playheadSec + deltaSec);
    },
    [playheadSec, seek],
  );

  useEffect(() => {
    setQueue([]);
    setQueueIndex(0);
    setPlaying(false);
    setPlayheadSec(0);
    setDurationSec(0);
    loadedUrlRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [initialTracks]);

  return {
    audioRef,
    current,
    queue,
    playing,
    playheadSec,
    durationSec,
    playAll,
    shufflePlay,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    skip,
    setPlaying,
    setPlayheadSec,
    setDurationSec,
  };
}
