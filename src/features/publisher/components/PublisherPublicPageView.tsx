import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Disc3,
  FileText,
  Headphones,
  Heart,
  ListMusic,
  Mic,
  Pause,
  Play,
  ShieldAlert,
  Shuffle,
  SkipBack,
  SkipForward,
  Video,
} from "lucide-react";
import { AlphaV2GoldButton, AlphaV2SecondaryButton } from "@/features/audiov2/audio-v2-chrome";
import { AudioV2VideoPanel } from "@/features/audiov2/components/AudioV2VideoPanel";
import { toast } from "sonner";
import { AlphaBrandFooter } from "@/components/brand";
import { AlphaHeroPublisherSectionTab } from "@/components/home/hero-card-chrome";
import { SectionHeader } from "@/features/audio/components/SectionHeader";
import type { PublisherContentItem, PublisherRecord } from "../types";
import { PUBLISHER_CONTENT_KIND_LABELS } from "../types";
import { formatDurationSeconds, resolveContentPlayableMedia } from "../publisher-content-payload";
import {
  groupPublisherContent,
  pickHeroSlides,
  visiblePublisherSections,
  type PublisherSectionKey,
} from "../publisher-public-content";
import {
  isPublisherFavorite,
  readPublisherContinue,
  readPublisherFavorites,
  subscribePublisherPrefs,
  togglePublisherFavorite,
  writePublisherContinue,
  type PublisherContinueEntry,
  type PublisherFavoriteEntry,
} from "../publisher-local-prefs";
import { repostPublisherToProfile } from "../publisher-profile-reposts";
import { fetchPublisherFollowState, togglePublisherFollow } from "../publisher-follow-api";
import {
  defaultHeroSlideEngagement,
  incrementPublisherQrCount,
  persistHeroSlideEngagement,
  readPublisherQrCount,
  type HeroSlideEngagement,
} from "../publisher-hero-engagement";
import {
  buildPublisherTracks,
  buildPublisherVideos,
  findTrackForContent,
  usePublisherPlayer,
  type PublisherVideoItem,
} from "../publisher-playback";
import { PublisherHeroCarousel } from "./PublisherHeroCarousel";
import {
  PUBLISHER_TEXT_MUTED,
  PUBLISHER_TEXT_REPORT,
  PUBLISHER_TEXT_SUB,
  PUBLISHER_TEXT_TITLE,
} from "./publisher-glass-chrome";
import { PublisherListenSection } from "./PublisherListenSection";
import { PublisherMiniPlayer } from "./PublisherMiniPlayer";
import { PublisherQrSheet } from "./PublisherQrSheet";
import { PublisherCopyrightReportSheet } from "./PublisherCopyrightReportSheet";
import cardChurch from "@/assets/home/card-church.jpg";

type Props = {
  publisher: PublisherRecord;
  content: PublisherContentItem[];
  preview?: boolean;
};

export function PublisherPublicPageView({ publisher, content, preview }: Props) {
  const groups = useMemo(() => groupPublisherContent(content), [content]);
  const heroSlides = useMemo(() => pickHeroSlides(content, publisher), [content, publisher]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrCount, setQrCount] = useState(() => readPublisherQrCount(publisher.id));
  const [slideEngagement, setSlideEngagement] = useState<HeroSlideEngagement>({
    liked: false,
    likeCount: 0,
    shareCount: 0,
  });
  const [likeBusy, setLikeBusy] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(publisher.followerCount ?? 0);
  const [followBusy, setFollowBusy] = useState(false);
  const [continueEntry, setContinueEntry] = useState<PublisherContinueEntry | null>(null);
  const [favorites, setFavorites] = useState<PublisherFavoriteEntry[]>([]);
  const [reportItem, setReportItem] = useState<PublisherContentItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<PublisherVideoItem | null>(null);

  const fallbackCover =
    publisher.coverUrl?.trim() || publisher.logoUrl?.trim() || cardChurch;

  const allTracks = useMemo(
    () => buildPublisherTracks(content, fallbackCover),
    [content, fallbackCover],
  );

  const allVideos = useMemo(
    () => buildPublisherVideos(content, fallbackCover),
    [content, fallbackCover],
  );

  const player = usePublisherPlayer(allTracks);

  const heroItem = heroSlides[heroIndex] ?? heroSlides[0] ?? null;
  const showReport = !publisher.isTrusted && !preview;
  const heroCover = heroItem?.coverUrl?.trim() || publisher.coverUrl?.trim() || publisher.logoUrl?.trim() || cardChurch;
  const hasPlayableContent = allTracks.length > 0;

  const heroPlaying = Boolean(
    heroItem &&
      player.playing &&
      player.current &&
      (player.current.contentId === heroItem.id ||
        player.current.key === heroItem.id ||
        player.current.key.startsWith(`${heroItem.id}:`)),
  );

  const resumeTrack = useMemo(() => {
    if (!continueEntry) return null;
    return findTrackForContent(allTracks, continueEntry.contentId) ?? null;
  }, [allTracks, continueEntry]);

  const refreshPrefs = useCallback(() => {
    if (preview) return;
    setContinueEntry(readPublisherContinue(publisher.id));
    setFavorites(readPublisherFavorites(publisher.id));
  }, [preview, publisher.id]);

  useEffect(() => {
    refreshPrefs();
    return subscribePublisherPrefs(refreshPrefs);
  }, [refreshPrefs]);

  useEffect(() => {
    if (preview) return;
    void fetchPublisherFollowState(publisher.id).then((state) => {
      setFollowing(state.following);
      setFollowCount(state.count);
    });
  }, [publisher.id, preview]);

  useEffect(() => {
    if (!heroItem) {
      setSlideEngagement({ liked: false, shared: false, likeCount: 0, shareCount: 0 });
      return;
    }
    setSlideEngagement(defaultHeroSlideEngagement(heroItem));
  }, [heroItem?.id]);

  useEffect(() => {
    setHeroIndex(0);
  }, [publisher.id, heroSlides.length]);

  const closeVideo = useCallback(() => setActiveVideo(null), []);

  const openVideo = useCallback(
    (video: PublisherVideoItem) => {
      const audio = player.audioRef.current;
      if (audio) audio.pause();
      setActiveVideo(video);
    },
    [player.audioRef],
  );

  const playTrackItem = useCallback(
    (track: (typeof allTracks)[number], queue = allTracks, startSec = 0) => {
      closeVideo();
      const slideIdx = heroSlides.findIndex(
        (s) => s.id === track.contentId || s.id === track.key.split(":")[0],
      );
      if (slideIdx >= 0) setHeroIndex(slideIdx);
      player.playTrack(track, queue, startSec);
    },
    [allTracks, closeVideo, heroSlides, player],
  );

  const sectionKeys = useMemo(
    () =>
      visiblePublisherSections(groups, {
        hasListen: allTracks.length > 0,
        hasContinue: Boolean(continueEntry),
        hasFavorites: favorites.length > 0,
        hasBio: Boolean(publisher.bio?.trim() || publisher.phone || publisher.email || publisher.websiteUrl),
      }),
    [groups, allTracks.length, continueEntry, favorites.length, publisher],
  );
  const [activeSection, setActiveSection] = useState<PublisherSectionKey | null>(null);

  const scrollToPublisherSection = useCallback((key: PublisherSectionKey) => {
    setActiveSection(key);
    const target = document.getElementById(`publisher-${key}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const sectionGridCols = useMemo(() => {
    const n = sectionKeys.length;
    if (n <= 1) return 1;
    if (n === 2) return 2;
    if (n === 3) return 3;
    if (n === 4) return 4;
    if (n <= 6) return 3;
    return 4;
  }, [sectionKeys.length]);

  const onFollow = async () => {
    if (preview) {
      toast.message("معاينة — المتابعة تعمل بعد نشر الصفحة");
      return;
    }
    if (followBusy) return;
    setFollowBusy(true);
    const next = await togglePublisherFollow(publisher.id);
    setFollowBusy(false);
    if (next) {
      setFollowing(next.following);
      setFollowCount(next.count);
    }
  };

  const onHeroLike = () => {
    if (!heroItem) return;
    if (preview) {
      toast.message("معاينة — الإعجاب يعمل بعد نشر الصفحة");
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    const nextLiked = !slideEngagement.liked;
    const next: HeroSlideEngagement = {
      ...slideEngagement,
      liked: nextLiked,
      likeCount: Math.max(0, slideEngagement.likeCount + (nextLiked ? 1 : -1)),
    };
    setSlideEngagement(next);
    persistHeroSlideEngagement(heroItem.id, next);
    setLikeBusy(false);
  };

  const toggleFavorite = (item: PublisherContentItem) => {
    if (preview) return;
    togglePublisherFavorite(publisher.id, item);
    refreshPrefs();
  };

  const playItem = useCallback(
    (item: PublisherContentItem, startSec = 0) => {
      if (preview) return;
      const track = findTrackForContent(allTracks, item.id);
      if (!track) return;
      playTrackItem(track, allTracks, startSec);
    },
    [allTracks, playTrackItem, preview],
  );

  const toggleHeroPlay = () => {
    if (!heroItem || preview) return;
    if (heroPlaying) {
      player.togglePlay();
      return;
    }
    const track = findTrackForContent(allTracks, heroItem.id);
    if (track) playTrackItem(track, allTracks);
  };

  const continueTrack = continueEntry
    ? findTrackForContent(allTracks, continueEntry.contentId)
    : null;

  const continueIsActive = Boolean(
    continueTrack && player.current && player.current.key === continueTrack.key,
  );

  const toggleContinuePlay = useCallback(() => {
    if (!continueEntry || preview || !continueTrack) return;
    if (continueIsActive && player.playing) {
      player.togglePlay();
      return;
    }
    playTrackItem(continueTrack, allTracks, continueEntry.positionSec);
  }, [allTracks, continueEntry, continueIsActive, continueTrack, playTrackItem, player, preview]);

  const persistContinue = useCallback(
    (item: PublisherContentItem, positionSec: number, durationSec: number) => {
      if (preview || durationSec <= 0) return;
      const pos = Math.floor(positionSec);
      const dur = Math.floor(durationSec);
      writePublisherContinue(publisher.id, {
        contentId: item.id,
        title: item.title,
        coverUrl: item.coverUrl,
        contentKind: item.contentKind,
        progressPct: Math.min(99, Math.round((pos / dur) * 100)),
        positionSec: pos,
        durationSec: dur,
        updatedAt: Date.now(),
      });
      refreshPrefs();
    },
    [preview, publisher.id, refreshPrefs],
  );

  return (
    <div className="relative pb-40">

      {preview ? (
        <div className="mx-5 mb-4 rounded-[16px] border border-amber-300/40 bg-amber-50 px-3 py-2 text-center text-[11px] font-extrabold text-amber-800">
          وضع المعاينة — هكذا ستظهر الصفحة للمستخدمين بعد الاعتماد
        </div>
      ) : null}

      <PublisherHeroCarousel
        publisher={publisher}
        content={content}
        heroSlides={heroSlides}
        heroIndex={heroIndex}
        onHeroIndexChange={setHeroIndex}
        heroPlaying={heroPlaying}
        onToggleHeroPlay={toggleHeroPlay}
        followCount={followCount}
        following={following}
        followBusy={followBusy}
        onFollow={() => void onFollow()}
        likeCount={slideEngagement.likeCount}
        shareCount={slideEngagement.shareCount}
        qrCount={qrCount}
        liked={slideEngagement.liked}
        shared={slideEngagement.shared}
        likeBusy={likeBusy}
        onLike={onHeroLike}
        onShare={() => {
          if (!heroItem) return;
          if (preview) {
            toast.message("معاينة — إعادة النشر تعمل بعد نشر الصفحة");
            return;
          }
          const next: HeroSlideEngagement = {
            ...slideEngagement,
            shared: true,
            shareCount: slideEngagement.shareCount + 1,
          };
          setSlideEngagement(next);
          persistHeroSlideEngagement(heroItem.id, next);
          const playable = resolveContentPlayableMedia(heroItem, content);
          repostPublisherToProfile(publisher, {
            title: heroItem.title ?? publisher.name,
            coverUrl: heroCover,
            contentId: heroItem.id,
            mediaUrl: playable.mediaUrl,
            durationSeconds: playable.durationSeconds,
          });
          toast.success("تمت إعادة النشر على صفحتك");
        }}
        onQr={() => {
          setQrCount(incrementPublisherQrCount(publisher.id));
          setQrOpen(true);
        }}
      />

      {allTracks.length ? (
        <section className="mt-3 flex flex-wrap items-center gap-2 px-5">
          <AlphaV2GoldButton disabled={preview} onClick={() => player.playAll(allTracks)}>
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            تشغيل الكل
          </AlphaV2GoldButton>
          <AlphaV2SecondaryButton disabled={preview} onClick={() => player.shufflePlay(allTracks)}>
            <Shuffle className="h-4 w-4" />
            عشوائي
          </AlphaV2SecondaryButton>
          {resumeTrack && continueEntry ? (
            <AlphaV2SecondaryButton
              disabled={preview}
              onClick={() => playTrackItem(resumeTrack, allTracks, continueEntry.positionSec)}
            >
              <Headphones className="h-4 w-4" />
              أكمل · {formatDurationSeconds(continueEntry.positionSec)}
            </AlphaV2SecondaryButton>
          ) : null}
        </section>
      ) : null}

      {/* Quick jump — full-width section nav */}
      {sectionKeys.length ? (
        <section className="mt-4 px-5" aria-label="أقسام المحتوى">
          <div
            className="grid w-full gap-2"
            style={{ gridTemplateColumns: `repeat(${sectionGridCols}, minmax(0, 1fr))` }}
          >
            {sectionKeys.map((key) => (
              <AlphaHeroPublisherSectionTab
                key={key}
                label={sectionLabel(key)}
                sublabel={sectionSublabel(key)}
                accent={sectionAccent(key)}
                active={activeSection === key}
                onClick={() => scrollToPublisherSection(key)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {allTracks.length ? (
        <section id="publisher-listen" className="mt-8 scroll-mt-28 space-y-3">
          <SectionHeader title="استمع الآن" />
          <div className="px-5">
            <PublisherListenSection
              tracks={allTracks}
              currentKey={player.current?.key ?? null}
              playing={player.playing}
              onPlay={(track) => {
                if (preview) return;
                playTrackItem(track, allTracks);
              }}
            />
          </div>
        </section>
      ) : null}

      {continueEntry ? (
        <ContinueSection
          entry={continueEntry}
          content={content}
          preview={preview}
          isActive={continueIsActive}
          playing={continueIsActive && player.playing}
          currentSec={
            continueIsActive && player.durationSec > 0 ? player.playheadSec : continueEntry.positionSec
          }
          durationSec={
            continueIsActive && player.durationSec > 0 ? player.durationSec : continueEntry.durationSec
          }
          onTogglePlay={toggleContinuePlay}
          onSeek={(sec) => {
            if (preview || !continueTrack) return;
            if (continueIsActive) player.seek(sec);
            else playTrackItem(continueTrack, allTracks, sec);
          }}
          onSkipBack={() => {
            if (preview || !continueTrack) return;
            if (continueIsActive) player.skip(-15);
            else playTrackItem(continueTrack, allTracks, Math.max(0, continueEntry.positionSec - 15));
          }}
          onSkipForward={() => {
            if (preview || !continueTrack) return;
            if (continueIsActive) player.skip(15);
            else
              playTrackItem(
                continueTrack,
                allTracks,
                Math.min(continueEntry.durationSec, continueEntry.positionSec + 15),
              );
          }}
        />
      ) : null}

      {favorites.length ? (
        <FavoritesSection
          favorites={favorites}
          content={content}
          publisherId={publisher.id}
          preview={preview}
          onPlay={(item) => playItem(item)}
          onToggleFavorite={toggleFavorite}
        />
      ) : null}

      {groups.hymns.length ? (
        <HymnsSection
          items={groups.hymns}
          publisherId={publisher.id}
          preview={preview}
          onPlay={playItem}
          onToggleFavorite={toggleFavorite}
          onReport={setReportItem}
          showReport={showReport}
        />
      ) : null}

      {groups.albums.length ? (
        <AlbumsSection
          albums={groups.albums}
          publisherId={publisher.id}
          preview={preview}
          onReport={setReportItem}
          showReport={showReport}
        />
      ) : null}

      {groups.playlists.length ? (
        <PlaylistsSection
          items={groups.playlists}
          publisherId={publisher.id}
          preview={preview}
          onReport={setReportItem}
          showReport={showReport}
        />
      ) : null}

      {groups.videos.length ? (
        <VideosSection
          items={groups.videos}
          videos={allVideos}
          preview={preview}
          onOpenVideo={openVideo}
          onReport={setReportItem}
          showReport={showReport}
        />
      ) : null}

      {groups.lectures.length ? (
        <LecturesSection
          items={groups.lectures}
          preview={preview}
          onPlay={playItem}
          onReport={setReportItem}
          showReport={showReport}
        />
      ) : null}

      {groups.books.length ? (
        <BooksSection items={groups.books} preview={preview} onReport={setReportItem} showReport={showReport} />
      ) : null}

      {groups.articles.length ? (
        <ArticlesSection items={groups.articles} preview={preview} onReport={setReportItem} showReport={showReport} />
      ) : null}

      {(publisher.bio?.trim() || publisher.phone || publisher.email || publisher.websiteUrl) ? (
        <AboutSection publisher={publisher} />
      ) : null}

      {!content.length ? (
        <div className="mx-5 mt-8 rounded-[22px] border border-dashed border-[rgba(93,50,145,0.18)] bg-white/70 px-4 py-10 text-center">
          <p className="alpha-type-body font-extrabold text-[var(--alpha-publisher-ink)]">لا يوجد محتوى منشور بعد</p>
          <p className="mt-1 alpha-type-desc font-bold text-[var(--alpha-publisher-muted)]">ستظهر الترانيم والألبومات هنا فور اعتمادها.</p>
        </div>
      ) : null}

      <div className="px-5 pt-10 pb-4">
        <AlphaBrandFooter size="prominent" />
      </div>

      <PublisherQrSheet publisher={qrOpen ? publisher : null} onClose={() => setQrOpen(false)} />
      <PublisherCopyrightReportSheet
        contentId={reportItem?.id ?? null}
        contentTitle={reportItem?.title ?? null}
        onClose={() => setReportItem(null)}
      />

      {!activeVideo ? (
        <PublisherMiniPlayer
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

      {hasPlayableContent ? (
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
            const item = content.find((c) => c.id === player.current!.contentId);
            if (!item) return;
            if (Math.floor(el.currentTime) % 8 === 0) {
              persistContinue(item, el.currentTime, el.duration);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function sectionLabel(key: PublisherSectionKey) {
  const map: Record<PublisherSectionKey, string> = {
    listen: "استمع",
    continue: "أكمل",
    favorites: "المفضلة",
    hymns: "ترانيم",
    albums: "ألبومات",
    playlists: "قوائم",
    videos: "فيديو",
    lectures: "محاضرات",
    books: "كتب",
    articles: "مقالات",
    about: "حول",
  };
  return map[key];
}

function sectionSublabel(key: PublisherSectionKey) {
  const map: Record<PublisherSectionKey, string> = {
    listen: "الكل",
    continue: "استماع",
    favorites: "محفوظ",
    hymns: "مختارة",
    albums: "مجموعات",
    playlists: "تشغيل",
    videos: "مرئي",
    lectures: "صوتي",
    books: "قراءة",
    articles: "نص",
    about: "ناشر",
  };
  return map[key];
}

function sectionAccent(key: PublisherSectionKey) {
  const map: Record<PublisherSectionKey, string> = {
    listen: "#c79356",
    continue: "#5b9fd8",
    favorites: "#e85d7a",
    hymns: "#9d7bd8",
    albums: "#e7c97a",
    playlists: "#6ec9a0",
    videos: "#f97316",
    lectures: "#6366f1",
    books: "#c79356",
    articles: "#64748b",
    about: "#8a84a8",
  };
  return map[key];
}

function contentCover(item: PublisherContentItem) {
  return item.coverUrl?.trim() || cardChurch;
}

function ReportChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 ${PUBLISHER_TEXT_REPORT}`}
    >
      <ShieldAlert className="h-3.5 w-3.5" />
      بلاغ
    </button>
  );
}

function ContinueSection({
  entry,
  content,
  preview,
  isActive,
  playing,
  currentSec,
  durationSec,
  onTogglePlay,
  onSeek,
  onSkipBack,
  onSkipForward,
}: {
  entry: PublisherContinueEntry;
  content: PublisherContentItem[];
  preview?: boolean;
  isActive: boolean;
  playing: boolean;
  currentSec: number;
  durationSec: number;
  onTogglePlay: () => void;
  onSeek: (sec: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}) {
  const item = content.find((c) => c.id === entry.contentId);
  const cover = entry.coverUrl?.trim() || (item ? contentCover(item) : cardChurch);
  const safeDuration = durationSec > 0 ? durationSec : entry.durationSec;
  const safeCurrent = Math.min(Math.max(0, currentSec), safeDuration || currentSec);
  const progressPct =
    safeDuration > 0 ? Math.min(100, Math.max(0, (safeCurrent / safeDuration) * 100)) : entry.progressPct;

  return (
    <section id="publisher-continue" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="أكمل الاستماع" />
      <div className="px-5">
        <article className="glass-card overflow-hidden rounded-[24px] border border-[rgba(93,50,145,0.08)] p-3.5 shadow-[0_10px_28px_-18px_rgba(93,50,145,0.22)]">
          <div className="flex items-center gap-3">
            <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl ring-2 ring-[var(--gold)]/30">
              <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
              {isActive && playing ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-1 pb-1 pt-4 text-center text-[8px] font-extrabold text-white">
                  يُشغَّل
                </span>
              ) : null}
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate alpha-type-h2 font-extrabold text-[var(--alpha-publisher-ink)]">{entry.title}</p>
              <p className={`mt-0.5 truncate ${PUBLISHER_TEXT_MUTED}`}>
                {PUBLISHER_CONTENT_KIND_LABELS[entry.contentKind]}
              </p>
            </div>
          </div>

          <div className="mt-3.5">
            <style>{`
              .publisher-continue-range::-webkit-slider-thumb {
                appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 9999px;
                background: linear-gradient(180deg, var(--gold-soft), var(--gold-deep));
                border: 2px solid #fff;
                box-shadow: 0 2px 8px rgba(120, 80, 30, 0.35);
              }
              .publisher-continue-range::-moz-range-thumb {
                width: 14px;
                height: 14px;
                border-radius: 9999px;
                background: linear-gradient(180deg, var(--gold-soft), var(--gold-deep));
                border: 2px solid #fff;
              }
            `}</style>
            <input
              type="range"
              min={0}
              max={Math.max(safeDuration, 1)}
              step={1}
              value={Math.floor(safeCurrent)}
              disabled={preview || !item}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label="موضع التشغيل"
              className="publisher-continue-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--gold)]/15 disabled:opacity-50"
              dir="ltr"
              style={{
                background: `linear-gradient(to left, var(--gold-deep) 0%, var(--gold-soft) ${progressPct}%, rgba(231,201,122,0.15) ${progressPct}%, rgba(231,201,122,0.15) 100%)`,
              }}
            />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="alpha-type-caption font-bold tabular-nums text-[var(--alpha-publisher-subtle)]" dir="ltr">
                {formatDurationSeconds(safeDuration)}
              </span>
              <span className="alpha-type-caption font-extrabold tabular-nums text-[var(--alpha-publisher-purple)]" dir="ltr">
                {formatDurationSeconds(safeCurrent)}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={preview || !item}
              onClick={onSkipBack}
              aria-label="رجوع 15 ثانية"
              className="grid h-10 w-10 place-items-center rounded-full border border-[rgba(93,50,145,0.12)] bg-white/90 text-[var(--alpha-publisher-purple)] transition active:scale-95 disabled:opacity-45"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={preview || !item}
              onClick={onTogglePlay}
              aria-label={isActive && playing ? "إيقاف مؤقت" : "تشغيل"}
              className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-white shadow-[0_8px_22px_-8px_rgba(180,130,60,0.55)] ring-1 ring-white/50 transition active:scale-95 disabled:opacity-45"
            >
              {isActive && playing ? (
                <Pause className="h-5 w-5 fill-current" strokeWidth={0} />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px] fill-current" strokeWidth={0} />
              )}
            </button>
            <button
              type="button"
              disabled={preview || !item}
              onClick={onSkipForward}
              aria-label="تقديم 15 ثانية"
              className="grid h-10 w-10 place-items-center rounded-full border border-[rgba(93,50,145,0.12)] bg-white/90 text-[var(--alpha-publisher-purple)] transition active:scale-95 disabled:opacity-45"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

function FavoritesSection({
  favorites,
  content,
  publisherId,
  preview,
  onPlay,
  onToggleFavorite,
}: {
  favorites: PublisherFavoriteEntry[];
  content: PublisherContentItem[];
  publisherId: string;
  preview?: boolean;
  onPlay: (item: PublisherContentItem) => void;
  onToggleFavorite: (item: PublisherContentItem) => void;
}) {
  return (
    <section id="publisher-favorites" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="المفضلة" />
      <HorizontalRow>
        {favorites.map((fav) => {
          const item = content.find((c) => c.id === fav.contentId);
          if (!item) return null;
          return (
            <MediaCard
              key={fav.contentId}
              title={fav.title}
              subtitle={PUBLISHER_CONTENT_KIND_LABELS[fav.contentKind]}
              cover={fav.coverUrl?.trim() || contentCover(item)}
              liked={!preview && isPublisherFavorite(publisherId, item.id)}
              onPlay={() => onPlay(item)}
              onLike={() => onToggleFavorite(item)}
            />
          );
        })}
      </HorizontalRow>
    </section>
  );
}

function HymnsSection({
  items,
  publisherId,
  preview,
  onPlay,
  onToggleFavorite,
  onReport,
  showReport,
}: {
  items: PublisherContentItem[];
  publisherId: string;
  preview?: boolean;
  onPlay: (item: PublisherContentItem) => void;
  onToggleFavorite: (item: PublisherContentItem) => void;
  onReport: (item: PublisherContentItem) => void;
  showReport: boolean;
}) {
  return (
    <section id="publisher-hymns" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="ترانيم مختارة" />
      <HorizontalRow>
        {items.map((item, index) => (
          <MediaCard
            key={item.id}
            title={item.title}
            durationLabel={formatDurationSeconds(item.durationSeconds)}
            cover={contentCover(item)}
            rank={index + 1}
            liked={!preview && isPublisherFavorite(publisherId, item.id)}
            onPlay={() => onPlay(item)}
            onLike={() => onToggleFavorite(item)}
            footer={showReport ? <ReportChip onClick={() => onReport(item)} /> : null}
          />
        ))}
      </HorizontalRow>
    </section>
  );
}

function AlbumsSection({
  albums,
  publisherId,
  preview,
  onReport,
  showReport,
}: {
  albums: PublisherContentItem[];
  publisherId: string;
  preview?: boolean;
  onReport: (item: PublisherContentItem) => void;
  showReport: boolean;
}) {
  return (
    <section id="publisher-albums" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="الألبومات" />
      <div dir="rtl" className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1">
        {albums.map((album) => {
          const cover = contentCover(album);
          return (
            <article key={album.id} className="w-[132px] shrink-0 snap-start text-center">
              <Link
                to="/publisher/$publisherId/album/$contentId"
                params={{ publisherId, contentId: album.id }}
                className="group relative block"
              >
                <div className="relative mx-auto h-[132px] w-[132px] overflow-hidden rounded-full ring-2 ring-[var(--gold)]/30 shadow-[0_12px_30px_-12px_rgba(140,100,40,0.35)]">
                  <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition group-active:scale-[0.98]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30">
                    <Disc3 className="h-4 w-4" />
                  </span>
                </div>
                <p className={`mt-2 line-clamp-2 alpha-type-desc font-extrabold leading-tight ${PUBLISHER_TEXT_TITLE}`}>{album.title}</p>
              </Link>
              {showReport ? (
                <button
                  type="button"
                  onClick={() => onReport(album)}
                  className={`mt-1 ${PUBLISHER_TEXT_REPORT}`}
                >
                  بلاغ
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PlaylistsSection({
  items,
  publisherId,
  preview,
  onReport,
  showReport,
}: {
  items: PublisherContentItem[];
  publisherId: string;
  preview?: boolean;
  onReport: (item: PublisherContentItem) => void;
  showReport: boolean;
}) {
  return (
    <section id="publisher-playlists" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="قوائم التشغيل" />
      <div dir="rtl" className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
        {items.map((item) => (
          <article key={item.id} className="w-[160px] shrink-0 snap-start text-right">
            <Link
              to="/publisher/$publisherId/album/$contentId"
              params={{ publisherId, contentId: item.id }}
              className="group relative block"
            >
              <div className="relative h-[200px] w-full overflow-hidden rounded-3xl ring-1 ring-[var(--gold)]/20 shadow-[0_12px_30px_-12px_rgba(140,100,40,0.35)]">
                <img src={contentCover(item)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30">
                  <ListMusic className="h-4 w-4" />
                </span>
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <p className="line-clamp-2 text-[13px] font-bold leading-tight">{item.title}</p>
                  <p className="mt-1 text-[10px] text-white/80">قائمة تشغيل</p>
                </div>
              </div>
            </Link>
            {showReport ? (
              <button
                type="button"
                onClick={() => onReport(item)}
                className={`mt-1 ${PUBLISHER_TEXT_REPORT}`}
              >
                بلاغ
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function VideosSection({
  items,
  videos,
  preview,
  onOpenVideo,
  onReport,
  showReport,
}: {
  items: PublisherContentItem[];
  videos: PublisherVideoItem[];
  preview?: boolean;
  onOpenVideo: (video: PublisherVideoItem) => void;
  onReport: (item: PublisherContentItem) => void;
  showReport: boolean;
}) {
  return (
    <section id="publisher-videos" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="فيديوهات" />
      <ul className="space-y-2 px-5">
        {items.map((item) => {
          const video = videos.find((v) => v.contentId === item.id);
          const isActive = false;
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={!video || preview}
                onClick={() => video && onOpenVideo(video)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-right transition active:scale-[0.995] ${
                  isActive
                    ? "border-[#f97316]/40 bg-[#f97316]/8"
                    : "border-[rgba(93,50,145,0.1)] bg-white/95 hover:bg-[var(--gold)]/5"
                } disabled:opacity-50`}
              >
                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-[var(--gold)]/20">
                  <img src={contentCover(item)} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 grid place-items-center bg-black/25">
                    <Video className="h-5 w-5 text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate alpha-type-body font-extrabold text-[var(--alpha-publisher-ink)]">{item.title}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#f97316]">فيديو · اضغط للتشغيل</p>
                </div>
                {item.durationSeconds ? (
                  <span className="shrink-0 alpha-type-caption font-bold tabular-nums text-[var(--alpha-publisher-subtle)]" dir="ltr">
                    {formatDurationSeconds(item.durationSeconds)}
                  </span>
                ) : null}
              </button>
              {showReport ? (
                <div className="mt-1 px-1">
                  <ReportChip onClick={() => onReport(item)} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LecturesSection({
  items,
  preview,
  onPlay,
  onReport,
  showReport,
}: {
  items: PublisherContentItem[];
  preview?: boolean;
  onPlay: (item: PublisherContentItem) => void;
  onReport: (item: PublisherContentItem) => void;
  showReport: boolean;
}) {
  return (
    <section id="publisher-lectures" className="mt-8 scroll-mt-28 space-y-3 pb-1">
      <SectionHeader title="محاضرات" />
      <HorizontalRow>
        {items.map((item, index) => (
          <MediaCard
            key={item.id}
            title={item.title}
            durationLabel={formatDurationSeconds(item.durationSeconds)}
            cover={contentCover(item)}
            rank={index + 1}
            icon={Mic}
            onPlay={() => onPlay(item)}
            footer={showReport ? <ReportChip onClick={() => onReport(item)} /> : null}
          />
        ))}
      </HorizontalRow>
    </section>
  );
}

function BooksSection({
  items,
  preview,
  onReport,
  showReport,
}: {
  items: PublisherContentItem[];
  preview?: boolean;
  onReport: (item: PublisherContentItem) => void;
  showReport: boolean;
}) {
  return (
    <section id="publisher-books" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="كتب" />
      <div dir="rtl" className="grid grid-cols-2 gap-3 px-5">
        {items.map((item) => (
          <article key={item.id} className="glass-card overflow-hidden rounded-3xl text-right">
            <img src={contentCover(item)} alt="" className="aspect-[3/4] w-full object-cover" />
            <div className="space-y-2 p-3">
              <p className="line-clamp-2 alpha-type-body font-extrabold text-[var(--alpha-publisher-ink)]">{item.title}</p>
              {item.mediaUrl ? (
                <a
                  href={item.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 alpha-type-desc font-extrabold text-[var(--alpha-publisher-purple)]"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  فتح الكتاب
                </a>
              ) : null}
              {showReport ? <ReportChip onClick={() => onReport(item)} /> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ArticlesSection({
  items,
  preview,
  onReport,
  showReport,
}: {
  items: PublisherContentItem[];
  preview?: boolean;
  onReport: (item: PublisherContentItem) => void;
  showReport: boolean;
}) {
  return (
    <section id="publisher-articles" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="مقالات" />
      <div className="space-y-2.5 px-5">
        {items.map((item) => (
          <article key={item.id} className="glass-card rounded-3xl p-4 text-right">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="alpha-type-body font-extrabold text-[var(--alpha-publisher-ink)]">{item.title}</p>
                {item.description ? (
                  <p className={`mt-1 line-clamp-3 alpha-type-desc font-bold leading-relaxed ${PUBLISHER_TEXT_SUB}`}>{item.description}</p>
                ) : null}
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--gold)]/15 text-[var(--gold-deep)]">
                <FileText className="h-5 w-5" />
              </span>
            </div>
            {showReport ? <div className="mt-2"><ReportChip onClick={() => onReport(item)} /></div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutSection({ publisher }: { publisher: PublisherRecord }) {
  return (
    <section id="publisher-about" className="mt-8 scroll-mt-28 space-y-3">
      <SectionHeader title="حول الناشر" />
      <div className="mx-5 glass-card rounded-3xl p-4 text-right">
        {publisher.bio ? (
          <p className="alpha-type-body font-bold leading-relaxed text-[var(--alpha-publisher-ink)] whitespace-pre-line">{publisher.bio}</p>
        ) : (
          <p className="text-center alpha-type-desc font-bold text-[var(--alpha-publisher-muted)]">لا توجد نبذة بعد.</p>
        )}
        {(publisher.phone || publisher.email || publisher.websiteUrl) ? (
          <div className="mt-4 space-y-2 border-t border-[rgba(93,50,145,0.1)] pt-4">
            {publisher.phone ? <p className="alpha-type-desc font-bold text-[var(--alpha-publisher-ink)]">هاتف: {publisher.phone}</p> : null}
            {publisher.email ? <p className="alpha-type-desc font-bold text-[var(--alpha-publisher-ink)]">بريد: {publisher.email}</p> : null}
            {publisher.websiteUrl ? (
              <a href={publisher.websiteUrl} target="_blank" rel="noopener noreferrer" className={`block alpha-type-desc font-bold text-[var(--alpha-publisher-purple)] underline`}>
                الموقع الرسمي
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HorizontalRow({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
      {children}
    </div>
  );
}

function MediaCard({
  title,
  subtitle,
  durationLabel,
  cover,
  rank,
  liked,
  icon: Icon = Headphones,
  onPlay,
  onLike,
  footer,
}: {
  title: string;
  subtitle?: string;
  durationLabel?: string;
  cover: string;
  rank?: number;
  liked?: boolean;
  icon?: typeof Headphones;
  onPlay: () => void;
  onLike?: () => void;
  footer?: ReactNode;
}) {
  return (
    <article className="glass-card flex w-[260px] shrink-0 snap-start flex-col rounded-3xl p-3">
      <div className="flex items-center gap-3">
        <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-[var(--gold)]/20">
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
          {rank ? (
            <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-[10px] font-black text-white ring-2 ring-[var(--ivory)]">
              {rank}
            </span>
          ) : (
            <span className="absolute inset-0 grid place-items-center bg-black/25">
              <Icon className="h-4 w-4 text-white" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-[13px] font-bold text-foreground">{title}</p>
          {subtitle ? <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</p> : null}
        </div>
        {durationLabel ? (
          <span className="shrink-0 alpha-type-caption font-bold tabular-nums text-[var(--alpha-publisher-subtle)]" dir="ltr">
            {durationLabel}
          </span>
        ) : null}
        <button
          type="button"
          aria-label="تشغيل"
          onClick={onPlay}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-white shadow-[0_6px_16px_-6px_rgba(180,130,60,0.55)] active:scale-95"
        >
          <Play className="h-4 w-4 translate-x-[0.5px] fill-current" strokeWidth={0} />
        </button>
      </div>
      {(onLike || footer) ? (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--gold)]/10 pt-2">
          {footer ?? <span />}
          {onLike ? (
            <button type="button" onClick={onLike} aria-label="مفضلة" className="inline-flex items-center gap-1 alpha-type-desc font-extrabold text-[var(--alpha-publisher-purple)]">
              <Heart className={`h-4 w-4 ${liked ? "fill-[#e85d7a] text-[#e85d7a]" : ""}`} />
              {liked ? "في المفضلة" : "أضف للمفضلة"}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
