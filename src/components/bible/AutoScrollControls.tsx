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
 */
export function AutoScrollControls({
  spiritualMode,
  onToggleSpiritual,
  scrollContainer,
  bottomClass = "bottom-[88px]",
  hidden = false,
  barSize = "compact",
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
  hidden?: boolean;
  barSize?: "compact" | "comfort";
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

  const hasFont = setFontSize && typeof fontSize === "number";
  const hasSpacing = setLineHeight && typeof lineHeight === "number" && lineHeightSteps.length > 0;
  const isComfort = barSize === "comfort";

  return (
    <div
      dir="rtl"
      className={cn(
        "fixed left-1/2 z-40 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        bottomClass,
        hidden ? "pointer-events-none translate-y-3 opacity-0" : "pointer-events-auto translate-y-0 opacity-100",
      )}
      role="toolbar"
      aria-label="وضع القراءة"
      aria-hidden={hidden}
    >
      <AlphaReadingControlBar
        compact={!isComfort}
        className={isComfort ? "gap-1.5 px-2.5 py-1.5" : undefined}
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
