import { Gauge, Moon, Rows3, Sun, Type } from "lucide-react";
import {
  AlphaControlBarShell,
  AlphaControlCycleButton,
  AlphaControlDivider,
  AlphaControlFontStepper,
  AlphaControlIconButton,
  AlphaControlPlayButton,
} from "@/components/controls/AlphaControlBar";

/**
 * Official Alpha Reading Control Bar — single source of truth.
 * Same UI, props pattern, and behavior as Presentation Mode footer.
 */
export type AlphaReadingControlBarProps = {
  dark: boolean;
  playing: boolean;
  onTogglePlay: () => void;
  speedLabel: string;
  onCycleSpeed: () => void;
  spacingLabel: string;
  onCycleSpacing: () => void;
  fontDisplay: string | number;
  onFontDecrease: () => void;
  onFontIncrease: () => void;
  fontMin?: number;
  fontMax?: number;
  onToggleTheme: () => void;
  className?: string;
  compact?: boolean;
};

export function AlphaReadingControlBar({
  dark,
  playing,
  onTogglePlay,
  speedLabel,
  onCycleSpeed,
  spacingLabel,
  onCycleSpacing,
  fontDisplay,
  onFontDecrease,
  onFontIncrease,
  fontMin,
  fontMax,
  onToggleTheme,
  className,
  compact,
}: AlphaReadingControlBarProps) {
  return (
    <AlphaControlBarShell dark={dark} className={className} compact={compact}>
      <AlphaControlPlayButton
        playing={playing}
        onToggle={onTogglePlay}
        dark={dark}
        size={compact ? "sm" : "md"}
      />

      <AlphaControlDivider dark={dark} compact={compact} />

      <AlphaControlCycleButton
        icon={Gauge}
        label={speedLabel}
        ariaLabel={`السرعة: ${speedLabel}`}
        onClick={onCycleSpeed}
        dark={dark}
        compact={compact}
      />

      <AlphaControlCycleButton
        icon={Rows3}
        label={spacingLabel}
        ariaLabel={`تباعد الأسطر: ${spacingLabel}`}
        onClick={onCycleSpacing}
        dark={dark}
        compact={compact}
      />

      <AlphaControlDivider dark={dark} compact={compact} />

      <AlphaControlFontStepper
        value={fontDisplay}
        decreaseIcon={Type}
        increaseIcon={Type}
        dark={dark}
        min={fontMin}
        max={fontMax}
        onDecrease={onFontDecrease}
        onIncrease={onFontIncrease}
        compact={compact}
      />

      <AlphaControlIconButton
        icon={dark ? Sun : Moon}
        ariaLabel={dark ? "وضع نهاري" : "وضع ليلي"}
        onClick={onToggleTheme}
        dark={dark}
        compact={compact}
      />
    </AlphaControlBarShell>
  );
}
