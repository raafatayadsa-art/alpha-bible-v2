import { useEffect, useMemo, useState } from "react";
import { Headphones, Pause, Play, Shuffle, Video } from "lucide-react";
import { CopticWatermark } from "@/components/coptic";
import { formatDurationSeconds } from "@/features/publisher/publisher-content-payload";
import {
  readPublisherContinue,
  writePublisherContinue,
} from "@/features/publisher/publisher-local-prefs";
import { pickHeroSlides } from "@/features/publisher/publisher-public-content";
import {
  type PublisherContentItem,
  type PublisherRecord,
} from "@/features/publisher/types";
import cardChurch from "@/assets/home/card-church.jpg";
import {
  AlphaV2GoldButton,
  AlphaV2PrimaryButton,
  AlphaV2SecondaryButton,
} from "../audio-v2-chrome";
import {
  buildAudioV2Tracks,
  buildAudioV2Videos,
  filterAudioV2Tracks,
  type AudioV2Tab,
  type AudioV2Video,
} from "../build-audio-v2-tracks";
import { useAudioV2Player } from "../use-audio-v2-player";
import { AudioV2MiniPlayer } from "./AudioV2MiniPlayer";
import { AudioV2PublisherHero, findAudioV2TrackForContent } from "./AudioV2PublisherHero";
import { AudioV2VideoPanel } from "./AudioV2VideoPanel";

type Props = {
  publisher: PublisherRecord;
  content: PublisherContentItem[];
  preview?: boolean;
};

const TABS: { id: AudioV2Tab; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "hymns", label: "ترانيم" },
  { id: "albums", label: "ألبومات" },
  { id: "videos", label: "فيديو" },
];

export function AudioV2PublisherScreen({ publisher, content, preview }: Props) {
  const [tab, setTab] = useState<AudioV2Tab>("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<AudioV2Video | null>(null);

  const fallbackCover =
    publisher.coverUrl?.trim() || publisher.logoUrl?.trim() || cardChurch;

  const heroSlides = useMemo(() => pickHeroSlides(content, publisher), [content, publisher]);
  const heroItem = heroSlides[heroIndex] ?? heroSlides[0] ?? null;

  const allTracks = useMemo(
    () => buildAudioV2Tracks(content, fallbackCover),
    [content, fallbackCover],
  );

  const allVideos = useMemo(
    () => buildAudioV2Videos(content, fallbackCover),
    [content, fallbackCover],
  );

  const visibleTracks = useMemo(
    () => filterAudioV2Tracks(allTracks, tab),
    [allTracks, tab],
  );

  const player = useAudioV2Player(allTracks);

  const showAudioList = tab !== "videos";
  const showVideoList = tab === "videos" || tab === "all";

  const continueEntry = useMemo(() => {
    if (preview) return null;
    return readPublisherContinue(publisher.id);
  }, [preview, publisher.id, player.playheadSec]);

  useEffect(() => {
    setHeroIndex(0);
  }, [publisher.id, heroSlides.length]);

  const resumeTrack = useMemo(() => {
    if (!continueEntry) return null;
    return allTracks.find((t) => t.contentId === continueEntry.contentId) ?? null;
  }, [allTracks, continueEntry]);

  const heroPlaying = Boolean(
    heroItem &&
      player.playing &&
      player.current &&
      (player.current.contentId === heroItem.id ||
        player.current.key === heroItem.id ||
        player.current.key.startsWith(`${heroItem.id}:`)),
  );

  const playHeroAt = (index: number) => {
    const item = heroSlides[index];
    if (!item) return;
    closeVideo();
    const track = findAudioV2TrackForContent(allTracks, item.id);
    if (track) player.playTrack(track, allTracks);
  };

  const toggleHeroPlay = () => {
    if (!heroItem) return;
    if (heroPlaying) {
      player.audioRef.current?.pause();
      return;
    }
    playHeroAt(heroIndex);
  };

  const openVideo = (video: AudioV2Video) => {
    const audio = player.audioRef.current;
    if (audio) audio.pause();
    setActiveVideo(video);
  };

  const closeVideo = () => setActiveVideo(null);

  const persistProgress = (
    track: (typeof allTracks)[number],
    positionSec: number,
    durationSec: number,
  ) => {
    if (preview || durationSec <= 0) return;
    const pos = Math.floor(positionSec);
    const dur = Math.floor(durationSec);
    const source = content.find((c) => c.id === track.contentId);
    writePublisherContinue(publisher.id, {
      contentId: track.contentId,
      title: track.title,
      coverUrl: track.coverUrl,
      contentKind: source?.contentKind ?? "hymn",
      progressPct: Math.min(99, Math.round((pos / dur) * 100)),
      positionSec: pos,
      durationSec: dur,
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="relative pb-36">
      <CopticWatermark />

      {preview ? (
        <div className="mx-5 mb-3 rounded-[14px] border border-amber-300/40 bg-amber-50 px-3 py-2 text-center text-[10px] font-extrabold text-amber-800">
          AudioV2 — معاينة مساحة الناشر (يشمل المحتوى غير المعتمد)
        </div>
      ) : null}

      <AudioV2PublisherHero
        publisher={publisher}
        content={content}
        preview={preview}
        heroIndex={heroIndex}
        onHeroIndexChange={setHeroIndex}
        heroPlaying={heroPlaying}
        onToggleHeroPlay={toggleHeroPlay}
      />

      <section className="mt-3 flex flex-wrap items-center gap-2 px-5">
        <AlphaV2GoldButton disabled={!allTracks.length} onClick={() => player.playAll(allTracks)}>
          <Play className="h-4 w-4 fill-current" strokeWidth={0} />
          تشغيل الكل
        </AlphaV2GoldButton>

        <AlphaV2SecondaryButton disabled={!allTracks.length} onClick={() => player.shufflePlay(allTracks)}>
          <Shuffle className="h-4 w-4" />
          عشوائي
        </AlphaV2SecondaryButton>

        {resumeTrack && continueEntry ? (
          <AlphaV2PrimaryButton
            onClick={() => player.playTrack(resumeTrack, allTracks, continueEntry.positionSec)}
            className="px-3"
          >
            <Headphones className="h-4 w-4" />
            أكمل · {formatDurationSeconds(continueEntry.positionSec)}
          </AlphaV2PrimaryButton>
        ) : null}
      </section>

      <nav
        className="mx-5 mt-4 grid grid-cols-4 gap-1 rounded-2xl border border-[rgba(93,50,145,0.1)] bg-white/90 p-1"
        aria-label="تصفية المحتوى"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl py-2 text-[10px] font-extrabold transition sm:text-[11px] ${
              tab === t.id
                ? "bg-[#5D3291] text-white shadow-sm"
                : "text-[#6b658a] active:scale-[0.98]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {showAudioList ? (
        <section className="mt-4 px-5" aria-label="قائمة الصوت">
          {!visibleTracks.length ? (
            <div className="rounded-2xl border border-dashed border-[rgba(93,50,145,0.18)] bg-white/70 px-4 py-8 text-center">
              <p className="text-[13px] font-extrabold text-[#3a3258]">لا يوجد محتوى صوتي في هذا القسم</p>
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(93,50,145,0.08)] overflow-hidden rounded-2xl border border-[rgba(93,50,145,0.1)] bg-white/95">
              {visibleTracks.map((track, index) => {
                const isCurrent = player.current?.key === track.key;
                return (
                  <li key={track.key}>
                    <button
                      type="button"
                      onClick={() => {
                        closeVideo();
                        player.playTrack(track, visibleTracks);
                      }}
                      className={`flex w-full items-center gap-3 px-3 py-3 text-right transition active:scale-[0.995] ${
                        isCurrent ? "bg-[#5D3291]/6" : "hover:bg-[#5D3291]/4"
                      }`}
                    >
                      <span className="w-5 shrink-0 text-center text-[11px] font-black tabular-nums text-[#8a84a8]">
                        {isCurrent && player.playing ? (
                          <Pause className="mx-auto h-3.5 w-3.5 text-[#5D3291]" strokeWidth={2.5} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-[var(--gold)]/20">
                        <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-[13px] font-extrabold ${
                            isCurrent ? "text-[#5D3291]" : "text-[#3a3258]"
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] font-bold text-[#8a84a8]">{track.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#8a84a8]" dir="ltr">
                        {formatDurationSeconds(track.durationSeconds)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {showVideoList ? (
        <section className="mt-4 px-5" aria-label="قائمة الفيديو">
          {tab === "all" && visibleTracks.length ? (
            <h3 className="mb-2 text-[12px] font-extrabold text-[#5D3291]">فيديوهات</h3>
          ) : null}
          {!allVideos.length ? (
            tab === "videos" ? (
              <div className="rounded-2xl border border-dashed border-[rgba(93,50,145,0.18)] bg-white/70 px-4 py-8 text-center">
                <p className="text-[13px] font-extrabold text-[#3a3258]">لا توجد فيديوهات بعد</p>
                <p className="mt-1 text-[11px] font-bold text-[#6b658a]">
                  أضف فيديو من مساحة الناشر → المحتوى.
                </p>
              </div>
            ) : null
          ) : (
            <ul className="space-y-2">
              {allVideos.map((video) => {
                const isActive = activeVideo?.key === video.key;
                return (
                  <li key={video.key}>
                    <button
                      type="button"
                      onClick={() => openVideo(video)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-right transition active:scale-[0.995] ${
                        isActive
                          ? "border-[#f97316]/40 bg-[#f97316]/8"
                          : "border-[rgba(93,50,145,0.1)] bg-white/95 hover:bg-[#5D3291]/4"
                      }`}
                    >
                      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-[var(--gold)]/20">
                        <img src={video.coverUrl} alt="" className="h-full w-full object-cover" />
                        <span className="absolute inset-0 grid place-items-center bg-black/25">
                          <Video className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-extrabold text-[#3a3258]">{video.title}</p>
                        <p className="mt-0.5 text-[10px] font-bold text-[#f97316]">فيديو · اضغط للتشغيل</p>
                      </div>
                      {video.durationSeconds ? (
                        <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#8a84a8]" dir="ltr">
                          {formatDurationSeconds(video.durationSeconds)}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {!activeVideo ? (
        <AudioV2MiniPlayer
          track={player.current}
          playing={player.playing}
          playheadSec={player.playheadSec}
          durationSec={player.durationSec}
          onTogglePlay={player.togglePlay}
          onNext={player.playNext}
          onPrevious={player.playPrevious}
          onSeek={player.seek}
        />
      ) : (
        <AudioV2VideoPanel video={activeVideo} onClose={closeVideo} />
      )}

      {allTracks.length ? (
        <audio
          ref={player.audioRef}
          preload="metadata"
          playsInline
          className="sr-only"
          onPlay={() => player.setPlaying(true)}
          onPause={() => player.setPlaying(false)}
          onEnded={() => player.playNext()}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            if (el.duration > 0) player.setDurationSec(el.duration);
          }}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (el.duration <= 0 || !player.current) return;
            player.setPlayheadSec(el.currentTime);
            player.setDurationSec(el.duration);
            if (Math.floor(el.currentTime) % 8 === 0) {
              persistProgress(player.current, el.currentTime, el.duration);
            }
          }}
        />
      ) : null}
    </div>
  );
}
