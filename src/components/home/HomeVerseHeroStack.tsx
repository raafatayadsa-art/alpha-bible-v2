import { useCallback, useRef, useState } from "react";
import { PremiumVerseHeroCard, type VerseSharePayload } from "./PremiumVerseHeroCard";
import { HeroDailyCard } from "./HeroDailyCard";
import { HERO_STACK_LABELS, HeroProgressRail } from "./hero-card-chrome";
import { useHeroStackData } from "./useHeroStackData";
import type { HeroDailyCardData } from "./HeroDailyCard";

const STACK_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const STACK_TRANSITION = `transform 480ms ${STACK_EASE}, opacity 360ms ease-out`;

/** Card indices: 0=verse · 1=readings · 2=saint · 3=feast — index 0 matches original static layout. */
const PEEK_LAYOUT: Record<number, { left: number; right: number; back: number }> = {
  0: { left: 1, right: 2, back: 3 },
  1: { left: 0, right: 2, back: 3 },
  2: { left: 1, right: 3, back: 0 },
  3: { left: 2, right: 0, back: 1 },
};

function useStackSwipe(onAdvance: (dir: 1 | -1) => void) {
  const startX = useRef<number | null>(null);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onStart = (clientX: number) => {
    startX.current = clientX;
    lastX.current = clientX;
    lastT.current = performance.now();
    velocity.current = 0;
    setDx(0);
    setDragging(true);
  };

  const onMove = (clientX: number) => {
    if (startX.current == null) return;
    const t = performance.now();
    const dt = Math.max(1, t - lastT.current);
    velocity.current = (clientX - lastX.current) / dt;
    lastX.current = clientX;
    lastT.current = t;
    setDx(clientX - startX.current);
  };

  const onEnd = () => {
    if (startX.current == null) return;
    const d = lastX.current - startX.current;
    const v = velocity.current;
    if (Math.abs(d) > 48 || Math.abs(v) > 0.45) {
      onAdvance(d + v * 100 < 0 ? 1 : -1);
    }
    startX.current = null;
    setDx(0);
    setDragging(false);
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

  const renderPeek = (cardIndex: number, slot: "left" | "right" | "back") => {
    const variant =
      slot === "left" ? "peek-left" : slot === "right" ? "peek-right" : "peek-back";

    const className =
      slot === "left"
        ? "absolute left-0 top-5 z-[1] w-[44%]"
        : slot === "right"
          ? "absolute right-0 top-5 z-[2] w-[44%]"
          : "absolute left-1/2 top-2 z-0 w-[78%] -translate-x-1/2";

    const dragShift = slot === "back" ? parallax * 0.1 : parallax * 0.18;

    return (
      <div
        key={`${slot}-${cardIndex}`}
        className={className}
        style={{
          transform: slot === "back"
            ? `translateX(calc(-50% + ${dragShift}px))`
            : `translateX(${dragShift}px)`,
          transition: dragging ? "none" : STACK_TRANSITION,
          pointerEvents: "none",
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
        className="relative h-[286px] w-full select-none touch-pan-y overflow-visible"
        aria-roledescription="carousel"
        aria-label="بطاقات اليوم"
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => {
          if (dragging) onMove(e.clientX);
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
            transform: `translateX(${parallax}px)`,
            transition: dragging ? "none" : STACK_TRANSITION,
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
        onSelect={setIndex}
      />
    </div>
  );
}
