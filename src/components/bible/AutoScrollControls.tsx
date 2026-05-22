import { useEffect, useRef, useState } from "react";
import { Play, Pause, Minus, Plus, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;
type Speed = (typeof SPEEDS)[number];

/**
 * Auto-scroll + spiritual reading mode controller.
 * Calmer cinematic scroll with smoothed easing (EMA).
 * Default speed is 0.5× for a meditative pace.
 */
export function AutoScrollControls({
  spiritualMode,
  onToggleSpiritual,
  scrollContainer,
  bottomClass = "bottom-24",
}: {
  spiritualMode: boolean;
  onToggleSpiritual: () => void;
  scrollContainer?: HTMLElement | null;
  bottomClass?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0); // 0 -> 0.5x default
  const speed: Speed = SPEEDS[speedIdx];
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  const eased = useRef<number>(0); // smoothed pixels/sec

  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      eased.current = 0;
      return;
    }
    last.current = performance.now();
    const step = (t: number) => {
      const dt = Math.min(64, t - last.current); // clamp big frames
      last.current = t;
      // target: ~28px/sec at 1x → calm cinematic reading pace
      const target = speed * 28;
      // exponential smoothing toward target (≈250ms time constant)
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
      className={cn(
        "fixed left-1/2 z-40 -translate-x-1/2",
        bottomClass,
        "flex items-center gap-1 rounded-full border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-2xl",
        "px-2 py-1.5 shadow-[0_14px_30px_-14px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.8)]",
      )}
      role="toolbar"
      aria-label="وضع القراءة"
    >
      <button
        type="button"
        aria-label={spiritualMode ? "وضع النهار" : "الوضع الروحي"}
        onClick={onToggleSpiritual}
        className="grid h-9 w-9 place-items-center rounded-full text-[#3a2a18] active:scale-90 transition-transform"
      >
        {spiritualMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <span className="mx-1 h-5 w-px bg-[#efe2c4]" />

      <button
        type="button"
        aria-label="إبطاء"
        onClick={() => setSpeedIdx((i) => Math.max(0, i - 1))}
        className="grid h-8 w-8 place-items-center rounded-full text-[#3a2a18] active:scale-90 transition-transform disabled:opacity-40"
        disabled={speedIdx === 0}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-10 text-center text-[11px] font-bold text-[#7a4a26] tabular-nums">
        {speedLabel}
      </span>
      <button
        type="button"
        aria-label="تسريع"
        onClick={() => setSpeedIdx((i) => Math.min(SPEEDS.length - 1, i + 1))}
        className="grid h-8 w-8 place-items-center rounded-full text-[#3a2a18] active:scale-90 transition-transform disabled:opacity-40"
        disabled={speedIdx === SPEEDS.length - 1}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      <span className="mx-1 h-5 w-px bg-[#efe2c4]" />

      <button
        type="button"
        aria-label={playing ? "إيقاف التمرير" : "تشغيل التمرير"}
        onClick={() => setPlaying((p) => !p)}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full text-white shadow-[0_8px_18px_-8px_rgba(120,80,20,0.55)] active:scale-95 transition-transform",
          "bg-gradient-to-br from-[#e7c97a] to-[#a87a35]",
        )}
      >
        {playing ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
      </button>
    </div>
  );
}
