import { useCallback, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import { PremiumVerseHeroCard, type VerseSharePayload } from "./PremiumVerseHeroCard";
import { HeroDailyCard } from "./HeroDailyCard";
import { HERO_STACK_LABELS, HeroProgressRail } from "./hero-card-chrome";
import { useHeroStackData } from "./useHeroStackData";
import type { HeroDailyCardData } from "./HeroDailyCard";

const STACK_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const STACK_TRANSITION = `transform 580ms ${STACK_EASE}, opacity 380ms ease-out, filter 380ms ease-out`;

/** Card indices: 0=verse · 1=readings · 2=saint · 3=feast */
const PEEK_LAYOUT: Record<number, { left: number; right: number; back: number }> = {
  0: { left: 1, right: 2, back: 3 },
  1: { left: 0, right: 2, back: 3 },
  2: { left: 1, right: 3, back: 0 },
  3: { left: 2, right: 0, back: 1 },
};

const SWIPE_DISTANCE = 36;
const SWIPE_VELOCITY = 0.38;

function dampenDrag(dx: number): number {
  const sign = dx < 0 ? -1 : 1;
  const abs = Math.abs(dx);
  return sign * (abs <= 120 ? abs : 120 + (abs - 120) * 0.22);
}

function useStackSwipe(onAdvance: (dir: 1 | -1) => void) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const locked = useRef<"x" | "y" | null>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    startX.current = null;
    startY.current = null;
    locked.current = null;
    setDx(0);
    setDragging(false);
  };

  const onStart = (clientX: number, clientY: number) => {
    startX.current = clientX;
    startY.current = clientY;
    lastX.current = clientX;
    lastT.current = performance.now();
    velocity.current = 0;
    locked.current = null;
    setDx(0);
    setDragging(true);
  };

  const onMove = (clientX: number, clientY: number, preventScroll?: () => void) => {
    if (startX.current == null || startY.current == null) return;

    const rawDx = clientX - startX.current;
    const rawDy = clientY - startY.current;

    if (!locked.current) {
      if (Math.abs(rawDx) < 8 && Math.abs(rawDy) < 8) return;
      locked.current = Math.abs(rawDx) >= Math.abs(rawDy) ? "x" : "y";
    }

    if (locked.current === "y") {
      reset();
      return;
    }

    preventScroll?.();

    const t = performance.now();
    const dt = Math.max(1, t - lastT.current);
    velocity.current = (clientX - lastX.current) / dt;
    lastX.current = clientX;
    lastT.current = t;
    setDx(dampenDrag(rawDx));
  };

  const onEnd = () => {
    if (startX.current == null || locked.current !== "x") {
      reset();
      return;
    }

    const d = lastX.current - startX.current;
    const v = velocity.current;
    if (Math.abs(d) > SWIPE_DISTANCE || Math.abs(v) > SWIPE_VELOCITY) {
      onAdvance(d + v * 110 < 0 ? 1 : -1);
    }
    reset();
  };

  return { dx, dragging, onStart, onMove, onEnd };
}

type HomeVerseHeroStackProps = {
  linkTo?: string;
  onBrandedShare?: (payload: VerseSharePayload) => void;
};

export function HomeVerseHeroStack({ linkTo = "/bible", onBrandedShare }: HomeVerseHeroStackProps) {
  const [index, setIndex] = useState(0);
  const total = 4;
  const { cards } = useHeroStackData();

  const cardFor = (cardIndex: 1 | 2 | 3): HeroDailyCardData => cards[cardIndex];

  const advance = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total),
    [total],
  );

  const { dx, dragging, onStart, onMove, onEnd } = useStackSwipe(advance);
  const layout = PEEK_LAYOUT[index];
  const parallax = dragging ? dx : 0;
  const frontRotate = dragging ? parallax * 0.012 : 0;
  const frontScale = dragging ? 1 - Math.min(Math.abs(parallax) / 2400, 0.018) : 1;

  const handleTouchStart = (e: ReactTouchEvent) => {
    onStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    onMove(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault());
  };

  const renderPeek = (cardIndex: number, slot: "left" | "right" | "back") => {
    const variant =
      slot === "left" ? "peek-left" : slot === "right" ? "peek-right" : "peek-back";

    const className =
      slot === "left"
        ? "absolute left-0 top-5 z-[1] w-[44%]"
        : slot === "right"
          ? "absolute right-0 top-5 z-[2] w-[44%]"
          : "absolute left-1/2 top-2 z-0 w-[78%] -translate-x-1/2";

    const dragFactor = slot === "back" ? 0.12 : slot === "left" ? 0.28 : 0.32;
    const dragShift = parallax * dragFactor;
    const peekScale =
      slot === "back" ? 0.94 : slot === "left" ? 0.97 : 0.97;

    return (
      <div
        key={`${slot}-${cardIndex}`}
        className={className}
        style={{
          transform:
            slot === "back"
              ? `translate3d(calc(-50% + ${dragShift}px), 0, 0) scale(${peekScale})`
              : `translate3d(${dragShift}px, 0, 0) scale(${peekScale})`,
          opacity: dragging ? (slot === "back" ? 0.72 : 0.88) : 1,
          transition: dragging ? "none" : STACK_TRANSITION,
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
      >
        {cardIndex === 0 ? (
          <PremiumVerseHeroCard variant="peek" />
        ) : (
          <HeroDailyCard
            card={cardFor(cardIndex as 1 | 2 | 3)}
            variant={variant}
            onBrandedShare={onBrandedShare}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div
        className="relative h-[286px] w-full select-none overflow-visible touch-pan-y"
        style={{ perspective: 1400 }}
        aria-roledescription="carousel"
        aria-label="بطاقات اليوم"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (dragging) onMove(e.clientX, e.clientY);
        }}
        onMouseUp={onEnd}
        onMouseLeave={() => {
          if (dragging) onEnd();
        }}
      >
        {renderPeek(layout.left, "left")}
        {renderPeek(layout.back, "back")}
        {renderPeek(layout.right, "right")}

        <div
          className="relative z-10 mx-auto w-[92%] pt-2"
          style={{
            transform: `translate3d(${parallax}px, 0, 0) scale(${frontScale}) rotate(${frontRotate}deg)`,
            transition: dragging ? "none" : STACK_TRANSITION,
            willChange: "transform",
          }}
        >
          {index === 0 ? (
            <PremiumVerseHeroCard linkTo={linkTo} onBrandedShare={onBrandedShare} variant="front" />
          ) : (
            <HeroDailyCard
              card={cards[index as 1 | 2 | 3]}
              variant="front"
              onBrandedShare={onBrandedShare}
            />
          )}
        </div>
      </div>

      <HeroProgressRail
        index={index}
        total={total}
        labels={HERO_STACK_LABELS}
        onSelect={(i) => setIndex(i)}
      />
    </div>
  );
}
