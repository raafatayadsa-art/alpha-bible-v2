import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AlphaReadingControlBar } from "@/components/controls/AlphaReadingControlBar";
import {
  cycleLineHeight,
  lineSpacingLabel,
} from "@/components/controls/alpha-control-cycles";
import { useReadingAutoscroll } from "@/components/controls/useReadingAutoscroll";

const DEFAULT_LINE_HEIGHT_STEPS = [1.7, 1.9, 2.05, 2.25, 2.5] as const;

/**
 * Floating host for {@link AlphaReadingControlBar} on inline reading screens.
 * Scroll logic + chrome visibility only — bar UI comes from the official component.
 */
export function AutoScrollControls({
  spiritualMode,
  onToggleSpiritual,
  scrollContainer,
  bottomClass = "bottom-[88px]",
  fontSize,
  setFontSize,
  fontMin = 14,
  fontMax = 34,
  fontStep = 1,
  lineHeight,
  setLineHeight,
  lineHeightSteps = [...DEFAULT_LINE_HEIGHT_STEPS],
}: {
  spiritualMode: boolean;
  onToggleSpiritual: () => void;
  scrollContainer?: HTMLElement | null;
  bottomClass?: string;
  fontSize?: number;
  setFontSize?: (n: number) => void;
  fontMin?: number;
  fontMax?: number;
  fontStep?: number;
  lineHeight?: number;
  setLineHeight?: (n: number) => void;
  lineHeightSteps?: number[];
}) {
  const { playing, togglePlay, speedLabel, cycleSpeed } = useReadingAutoscroll(scrollContainer);

  const [active, setActive] = useState(true);
  const idleTimer = useRef<number | null>(null);

  const kick = () => {
    setActive(true);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setActive(false), 4000);
  };

  useEffect(() => {
    kick();
    const onAny = () => kick();
    window.addEventListener("pointerdown", onAny, { passive: true });
    window.addEventListener("touchstart", onAny, { passive: true });
    window.addEventListener("scroll", onAny, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onAny);
      window.removeEventListener("touchstart", onAny);
      window.removeEventListener("scroll", onAny);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speedLabel, spiritualMode]);

  const hasFont = setFontSize && typeof fontSize === "number";
  const hasSpacing = setLineHeight && typeof lineHeight === "number" && lineHeightSteps.length > 0;

  return (
    <div
      dir="rtl"
      onMouseEnter={kick}
      onTouchStart={kick}
      onPointerDown={kick}
      className={cn(
        "fixed left-1/2 z-40 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        bottomClass,
        active
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-60 translate-y-0 pointer-events-auto",
      )}
      role="toolbar"
      aria-label="وضع القراءة"
    >
      <AlphaReadingControlBar
        dark={spiritualMode}
        playing={playing}
        onTogglePlay={togglePlay}
        speedLabel={speedLabel}
        onCycleSpeed={cycleSpeed}
        spacingLabel={hasSpacing ? lineSpacingLabel(lineHeight!, lineHeightSteps) : "متوسط"}
        onCycleSpacing={
          hasSpacing
            ? () => setLineHeight!(cycleLineHeight(lineHeight!, lineHeightSteps))
            : () => {}
        }
        fontDisplay={
          hasFont
            ? Number.isInteger(fontSize!) ? fontSize! : fontSize!.toFixed(0)
            : "100%"
        }
        onFontDecrease={
          hasFont
            ? () => setFontSize!(Math.max(fontMin, +(fontSize! - fontStep).toFixed(2)))
            : () => {}
        }
        onFontIncrease={
          hasFont
            ? () => setFontSize!(Math.min(fontMax, +(fontSize! + fontStep).toFixed(2)))
            : () => {}
        }
        fontMin={fontMin}
        fontMax={fontMax}
        onToggleTheme={onToggleSpiritual}
      />
    </div>
  );
}
