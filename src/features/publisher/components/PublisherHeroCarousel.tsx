import { useCallback, useRef, useState, type ComponentType } from "react";
import { Headphones, Pause, Play } from "lucide-react";
import {
  AlphaHeroPublisherContentBadge,
  AlphaHeroPublisherEngagementBar,
  AlphaHeroPublisherHeroTopBar,
} from "@/components/home/hero-card-chrome";
import { cn } from "@/lib/utils";
import {
  formatDurationSeconds,
  resolveContentPlayableMedia,
} from "@/features/publisher/publisher-content-payload";
import { derivePublisherCode } from "@/features/publisher/publisher-identity";
import type { PublisherContentItem, PublisherRecord } from "@/features/publisher/types";
import { PUBLISHER_TYPE_LABELS } from "@/features/publisher/types";
import cardChurch from "@/assets/home/card-church.jpg";

const SWIPE_THRESHOLD = 42;
const HERO_HEIGHT_CLASS = "h-[228px]";

type Props = {
  publisher: PublisherRecord;
  content: PublisherContentItem[];
  heroSlides: PublisherContentItem[];
  heroIndex: number;
  onHeroIndexChange: (index: number) => void;
  heroPlaying: boolean;
  onToggleHeroPlay: () => void;
  followCount: number;
  following: boolean;
  followBusy: boolean;
  onFollow: () => void;
  likeCount: number;
  shareCount: number;
  qrCount?: number;
  liked: boolean;
  shared?: boolean;
  likeBusy: boolean;
  onLike: () => void;
  onShare: () => void;
  onQr: () => void;
  typeIcon?: ComponentType<{ className?: string; strokeWidth?: number }>;
};

export function PublisherHeroCarousel({
  publisher,
  content,
  heroSlides,
  heroIndex,
  onHeroIndexChange,
  heroPlaying,
  onToggleHeroPlay,
  followCount,
  following,
  followBusy,
  onFollow,
  likeCount,
  shareCount,
  qrCount = 0,
  liked,
  shared = false,
  likeBusy,
  onLike,
  onShare,
  onQr,
  typeIcon: TypeIcon = Headphones,
}: Props) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const heroItem = heroSlides[heroIndex] ?? heroSlides[0] ?? null;
  const heroPlayable = heroItem
    ? resolveContentPlayableMedia(heroItem, content)
    : { mediaUrl: null, durationSeconds: null };
  const heroMedia = heroPlayable.mediaUrl;
  const heroDuration = heroPlayable.durationSeconds ?? heroItem?.durationSeconds ?? null;
  const heroCover =
    heroItem?.coverUrl?.trim() || publisher.coverUrl?.trim() || publisher.logoUrl?.trim() || cardChurch;
  const choralLogo = publisher.logoUrl?.trim() || publisher.coverUrl?.trim() || cardChurch;
  const publisherCode = derivePublisherCode(publisher.id);

  const goNext = useCallback(() => {
    if (heroSlides.length <= 1) return;
    onHeroIndexChange((heroIndex + 1) % heroSlides.length);
  }, [heroIndex, heroSlides.length, onHeroIndexChange]);

  const goPrev = useCallback(() => {
    if (heroSlides.length <= 1) return;
    onHeroIndexChange((heroIndex - 1 + heroSlides.length) % heroSlides.length);
  }, [heroIndex, heroSlides.length, onHeroIndexChange]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (heroSlides.length <= 1) return;
    touchStartX.current = e.touches[0]?.clientX ?? 0;
    touchStartY.current = e.touches[0]?.clientY ?? 0;
    setDragging(true);
    setDragX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || heroSlides.length <= 1) return;
    const dx = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
    const dy = (e.touches[0]?.clientY ?? 0) - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
      setDragging(false);
      setDragX(0);
      return;
    }
    setDragX(dx);
  };

  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX < -SWIPE_THRESHOLD) goNext();
    else if (dragX > SWIPE_THRESHOLD) goPrev();
    setDragX(0);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (heroSlides.length <= 1 || e.pointerType === "touch") return;
    touchStartX.current = e.clientX;
    setDragging(true);
    setDragX(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || e.pointerType === "touch") return;
    setDragX(e.clientX - touchStartX.current);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !dragging) return;
    setDragging(false);
    if (dragX < -SWIPE_THRESHOLD) goNext();
    else if (dragX > SWIPE_THRESHOLD) goPrev();
    setDragX(0);
  };

  return (
    <section className="px-5 pt-0" aria-label="كروت الهيرو">
      <div className="relative flex flex-col items-center">
        <div className="relative z-20 -mb-6 flex flex-col items-center">
          <p className="mb-1.5 max-w-[220px] truncate text-center alpha-type-desc font-extrabold text-alpha-heading">
            {publisher.name}
          </p>
          <div className="grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--alpha-bg-elevated)_92%,transparent)] p-0.5 shadow-[var(--alpha-shadow-featured)] ring-[3px] ring-[var(--gold)]/45">
            <img src={choralLogo} alt="" className="h-full w-full rounded-full object-cover" />
          </div>
        </div>

        <div
          className={cn(
            "relative w-full touch-pan-y overflow-hidden rounded-[24px] gold-glow transition-transform",
            HERO_HEIGHT_CLASS,
            dragging ? "duration-0" : "duration-300 ease-out",
          )}
          style={{ transform: dragX ? `translateX(${dragX * 0.35}px)` : undefined }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img src={heroCover} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/28 to-black/38" />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/15 via-transparent to-transparent" />

          <AlphaHeroPublisherHeroTopBar
            followCount={followCount}
            following={following}
            followBusy={followBusy}
            onFollow={onFollow}
            isTrusted={publisher.isTrusted}
            typeLabel={PUBLISHER_TYPE_LABELS[publisher.publisherType]}
            typeIcon={TypeIcon}
            showFollow
          />

          <div className="absolute inset-x-0 bottom-0 p-4 pt-10 text-white">
            <div className="flex items-end justify-between gap-2.5">
              <div className="min-w-0 flex-1 text-right">
                <p className="text-[9px] font-bold text-white/70" dir="ltr">
                  {publisherCode}
                </p>
                <h2 className="truncate font-arabic-serif text-[19px] font-black leading-tight">
                  {heroItem?.title ?? publisher.name}
                </h2>
                {heroSlides.length > 1 ? (
                  <p className="mt-0.5 text-[10px] font-bold text-white/65">اسحب يميناً أو يساراً</p>
                ) : null}

                {heroMedia ? (
                  <div className="mt-2.5 flex items-end gap-[2px]">
                    {Array.from({ length: 22 }).map((_, i) => {
                      const h = [8, 14, 20, 12, 18, 24, 10, 16, 9, 22][i % 10];
                      const active = heroPlaying ? i < 12 : i < 8;
                      return (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className={`w-[2.5px] rounded-full ${active ? "bg-[var(--gold-soft)]" : "bg-white/35"}`}
                        />
                      );
                    })}
                    <span className="ms-1.5 text-[10px] font-medium tabular-nums text-white/85">
                      {formatDurationSeconds(heroDuration)}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <AlphaHeroPublisherContentBadge contentCount={publisher.contentCount} />
                {heroMedia ? (
                  <button
                    type="button"
                    aria-label={heroPlaying ? "إيقاف" : "تشغيل"}
                    onClick={onToggleHeroPlay}
                    className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-white shadow-[0_8px_24px_-6px_rgba(180,130,60,0.55)] ring-1 ring-white/40 transition active:scale-95"
                  >
                    <Play
                      className={`h-5 w-5 translate-x-[1px] fill-current ${heroPlaying ? "hidden" : ""}`}
                      strokeWidth={0}
                    />
                    <Pause className={`h-5 w-5 fill-current ${heroPlaying ? "" : "hidden"}`} strokeWidth={0} />
                  </button>
                ) : (
                  <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full ring-2 ring-white/40">
                    <img src={choralLogo} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
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

      <AlphaHeroPublisherEngagementBar
        className="mt-3 px-1"
        likeCount={likeCount}
        shareCount={shareCount}
        qrCount={qrCount}
        liked={liked}
        shared={shared}
        likeBusy={likeBusy}
        onLike={onLike}
        onShare={onShare}
        onQr={onQr}
      />
    </section>
  );
}
