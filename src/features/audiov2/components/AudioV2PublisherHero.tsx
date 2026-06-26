import { useEffect, useMemo, useState } from "react";
import { Headphones, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import {
  AlphaHeroPublisherContentBadge,
  AlphaHeroPublisherEngagementBar,
  AlphaHeroPublisherHeroTopBar,
  seedHeroCount,
} from "@/components/home/hero-card-chrome";
import {
  formatDurationSeconds,
  resolveContentPlayableMedia,
} from "@/features/publisher/publisher-content-payload";
import { pickHeroSlides } from "@/features/publisher/publisher-public-content";
import { derivePublisherCode } from "@/features/publisher/publisher-identity";
import { repostPublisherToProfile } from "@/features/publisher/publisher-profile-reposts";
import { fetchPublisherLikeState, togglePublisherLike } from "@/features/publisher/publisher-social-api";
import { fetchPublisherFollowState, togglePublisherFollow } from "@/features/publisher/publisher-follow-api";
import {
  PUBLISHER_TYPE_LABELS,
  type PublisherContentItem,
  type PublisherRecord,
} from "@/features/publisher/types";
import { PublisherQrSheet } from "@/features/publisher/components/PublisherQrSheet";
import cardChurch from "@/assets/home/card-church.jpg";
import type { AudioV2Track } from "../build-audio-v2-tracks";

type Props = {
  publisher: PublisherRecord;
  content: PublisherContentItem[];
  preview?: boolean;
  heroIndex: number;
  onHeroIndexChange: (index: number) => void;
  heroPlaying: boolean;
  onToggleHeroPlay: () => void;
};

export function AudioV2PublisherHero({
  publisher,
  content,
  preview,
  heroIndex,
  onHeroIndexChange,
  heroPlaying,
  onToggleHeroPlay,
}: Props) {
  const [qrOpen, setQrOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(publisher.likesCount ?? 0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(publisher.followerCount ?? 0);
  const [followBusy, setFollowBusy] = useState(false);
  const [shareCount, setShareCount] = useState(() => seedHeroCount(publisher.id, 13));

  const heroSlides = useMemo(() => pickHeroSlides(content, publisher), [content, publisher]);
  const heroItem = heroSlides[heroIndex] ?? heroSlides[0] ?? null;
  const heroPlayable = useMemo(
    () => (heroItem ? resolveContentPlayableMedia(heroItem, content) : { mediaUrl: null, durationSeconds: null }),
    [heroItem, content],
  );
  const heroMedia = heroPlayable.mediaUrl;
  const heroDuration = heroPlayable.durationSeconds ?? heroItem?.durationSeconds ?? null;
  const heroCover =
    heroItem?.coverUrl?.trim() || publisher.coverUrl?.trim() || publisher.logoUrl?.trim() || cardChurch;
  const publisherCode = derivePublisherCode(publisher.id);

  useEffect(() => {
    if (preview) return;
    void fetchPublisherLikeState(publisher.id).then((state) => {
      setLiked(state.liked);
      setLikeCount(state.count);
    });
    void fetchPublisherFollowState(publisher.id).then((state) => {
      setFollowing(state.following);
      setFollowCount(state.count);
    });
  }, [preview, publisher.id]);

  const onFollow = async () => {
    if (preview || followBusy) return;
    setFollowBusy(true);
    const next = await togglePublisherFollow(publisher.id);
    setFollowBusy(false);
    if (next) {
      setFollowing(next.following);
      setFollowCount(next.count);
    }
  };

  const onLike = async () => {
    if (preview || likeBusy) return;
    setLikeBusy(true);
    const next = await togglePublisherLike(publisher.id);
    setLikeBusy(false);
    if (next) {
      setLiked(next.liked);
      setLikeCount(next.count);
    }
  };

  const onShare = () => {
    if (preview) return;
    setShareCount((n) => n + 1);
    repostPublisherToProfile(publisher, {
      title: heroItem?.title ?? publisher.name,
      coverUrl: heroCover,
      contentId: heroItem?.id ?? null,
      mediaUrl: heroMedia,
      durationSeconds: heroDuration,
    });
    toast.success("تمت إعادة النشر على صفحتك");
  };

  if (!heroSlides.length && !publisher.coverUrl && !publisher.logoUrl) {
    return null;
  }

  return (
    <section className="px-5 pt-2">
      <div className="relative h-[280px] overflow-hidden rounded-[28px] gold-glow">
        <img src={heroCover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/15 via-transparent to-transparent" />

        <AlphaHeroPublisherHeroTopBar
          followCount={followCount}
          following={following}
          followBusy={followBusy}
          onFollow={() => void onFollow()}
          isTrusted={publisher.isTrusted}
          typeLabel={PUBLISHER_TYPE_LABELS[publisher.publisherType]}
          typeIcon={Headphones}
          showFollow={!preview}
        />

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[10px] font-bold text-white/70" dir="ltr">
                {publisherCode}
              </p>
              <h2 className="truncate font-arabic-serif text-[22px] font-black leading-tight">
                {heroItem?.title ?? publisher.name}
              </h2>
              <p className="mt-1 truncate text-sm text-white/85">{publisher.name}</p>

              {heroMedia ? (
                <div className="mt-4 flex items-end gap-[3px]">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const h = [10, 18, 26, 14, 22, 30, 16, 20, 12, 28][i % 10];
                    const active = heroPlaying ? i < 16 : i < 10;
                    return (
                      <span
                        key={i}
                        style={{ height: `${h}px` }}
                        className={`w-[3px] rounded-full ${active ? "bg-[var(--gold-soft)]" : "bg-white/35"}`}
                      />
                    );
                  })}
                  <span className="ms-2 text-[11px] font-medium tabular-nums text-white/85">
                    {formatDurationSeconds(heroDuration)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2">
              <AlphaHeroPublisherContentBadge contentCount={publisher.contentCount} />
              {heroMedia ? (
                <button
                  type="button"
                  aria-label={heroPlaying ? "إيقاف" : "تشغيل"}
                  onClick={onToggleHeroPlay}
                  className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-white shadow-[0_10px_30px_-6px_rgba(180,130,60,0.6)] ring-1 ring-white/40 transition active:scale-95"
                >
                  <Play
                    className={`h-6 w-6 translate-x-[1px] fill-current ${heroPlaying ? "hidden" : ""}`}
                    strokeWidth={0}
                  />
                  <Pause className={`h-6 w-6 fill-current ${heroPlaying ? "" : "hidden"}`} strokeWidth={0} />
                </button>
              ) : (
                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full ring-2 ring-white/40">
                  <img
                    src={publisher.logoUrl?.trim() || cardChurch}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {heroSlides.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`كارت هيرو ${i + 1}`}
              onClick={() => onHeroIndexChange(i)}
              className={`rounded-full transition-all ${
                i === heroIndex ? "h-1.5 w-5 bg-[var(--gold-deep)]" : "h-1.5 w-1.5 bg-[var(--gold)]/40"
              }`}
            />
          ))}
        </div>
      ) : null}

      {!preview ? (
        <AlphaHeroPublisherEngagementBar
          className="mt-3 px-1"
          likeCount={likeCount}
          shareCount={shareCount}
          liked={liked}
          likeBusy={likeBusy}
          onLike={() => void onLike()}
          onShare={onShare}
          onQr={() => setQrOpen(true)}
        />
      ) : null}

      <PublisherQrSheet publisher={qrOpen ? publisher : null} onClose={() => setQrOpen(false)} />
    </section>
  );
}

export function findAudioV2TrackForContent(
  tracks: AudioV2Track[],
  contentId: string,
): AudioV2Track | undefined {
  return (
    tracks.find((t) => t.key === contentId || t.contentId === contentId) ??
    tracks.find((t) => t.key.startsWith(`${contentId}:`))
  );
}
