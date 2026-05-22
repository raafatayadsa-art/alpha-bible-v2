import { useEffect, useRef, useState } from "react";
import { Play, Pause, Minus, Plus, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;
type Speed = (typeof SPEEDS)[number];

/**
 * Floating mini glass auto-scroll controller.
 * Compact pill, subtle liturgical-green tint, calm cinematic scroll
 * with smoothed easing (EMA). Default speed is 0.5×.
 */
export function AutoScrollControls({
  spiritualMode,
  onToggleSpiritual,
  scrollContainer,
  bottomClass = "bottom-24",
  hidden = false,
}: {
  spiritualMode: boolean;
  onToggleSpiritual: () => void;
  scrollContainer?: HTMLElement | null;
  bottomClass?: string;
  hidden?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [idle, setIdle] = useState(false);
  const speed: Speed = SPEEDS[speedIdx];
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  const eased = useRef<number>(0);
  const idleTimer = useRef<number | null>(null);

  // partial auto-fade when inactive
  const markActive = () => {
    setIdle(false);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600);
  };
  useEffect(() => {
    markActive();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speedIdx, spiritualMode]);

  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      eased.current = 0;
      return;
    }
    last.current = performance.now();
    const step = (t: number) => {
      const dt = Math.min(64, t - last.current);
      last.current = t;
      const target = speed * 28;
      const k = 1 - Math.exp(-dt / 250);
      eased.current += (target - eased.current) * k;
      const px = (eased.current * dt) / 1000;
      if (scrollContainer) scrollContainer.scrollBy({ top: px });
      else window.scrollBy({ top: px });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, speed, scrollContainer]);

  const speedLabel = `×${speed}`;

  return (
    <div
      dir="rtl"
      onMouseEnter={markActive}
      onTouchStart={markActive}
      onPointerDown={markActive}
      className={cn(
        "fixed left-1/2 z-40 -translate-x-1/2 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
        bottomClass,
        "flex items-center gap-0.5 rounded-full border backdrop-blur-2xl px-1.5 py-1",
        spiritualMode
          ? "bg-[#0c1f1a]/70 border-[#3e8a6e]/35 text-[#e8e2cf] shadow-[0_10px_26px_-14px_rgba(0,0,0,0.7),0_0_18px_-6px_rgba(62,138,110,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "bg-white/70 border-[#3e8a6e]/30 text-[#1f4032] shadow-[0_10px_24px_-14px_rgba(31,94,74,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]",
        hidden
          ? "translate-y-[160%] opacity-0 pointer-events-none"
          : idle
            ? "opacity-55 hover:opacity-100"
            : "opacity-100",
      )}
      role="toolbar"
      aria-label="وضع القراءة"
    >
      <button
        type="button"
        aria-label={spiritualMode ? "وضع النهار" : "الوضع الروحي"}
        onClick={onToggleSpiritual}
        className="grid h-7 w-7 place-items-center rounded-full active:scale-90 transition-transform"
      >
        {spiritualMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>

      <span className={cn("mx-0.5 h-4 w-px", spiritualMode ? "bg-white/15" : "bg-[#3e8a6e]/20")} />

      <button
        type="button"
        aria-label="إبطاء"
        onClick={() => setSpeedIdx((i) => Math.max(0, i - 1))}
        className="grid h-6 w-6 place-items-center rounded-full active:scale-90 transition-transform disabled:opacity-40"
        disabled={speedIdx === 0}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="min-w-9 text-center text-[10.5px] font-bold tabular-nums">
        {speedLabel}
      </span>
      <button
        type="button"
        aria-label="تسريع"
        onClick={() => setSpeedIdx((i) => Math.min(SPEEDS.length - 1, i + 1))}
        className="grid h-6 w-6 place-items-center rounded-full active:scale-90 transition-transform disabled:opacity-40"
        disabled={speedIdx === SPEEDS.length - 1}
      >
        <Plus className="h-3 w-3" />
      </button>

      <span className={cn("mx-0.5 h-4 w-px", spiritualMode ? "bg-white/15" : "bg-[#3e8a6e]/20")} />

      <button
        type="button"
        aria-label={playing ? "إيقاف التمرير" : "تشغيل التمرير"}
        onClick={() => setPlaying((p) => !p)}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-full text-white active:scale-95 transition-transform",
          "bg-gradient-to-br from-[#3e8a6e] to-[#1f5e4a] shadow-[0_6px_14px_-6px_rgba(31,94,74,0.6)]",
        )}
      >
        {playing ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
      </button>
    </div>
  );
}
