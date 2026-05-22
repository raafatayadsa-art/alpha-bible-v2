import { useEffect, useRef, useState } from "react";
import { Play, Pause, Minus, Plus, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Auto-scroll + spiritual reading mode controller.
 * Renders a compact floating control. Parent controls "spiritualMode" toggle.
 */
export function AutoScrollControls({
  spiritualMode,
  onToggleSpiritual,
  scrollContainer,
}: {
  spiritualMode: boolean;
  onToggleSpiritual: () => void;
  /** Optional scroll target. Defaults to window. */
  scrollContainer?: HTMLElement | null;
}) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1..5
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      return;
    }
    last.current = performance.now();
    const step = (t: number) => {
      const dt = t - last.current;
      last.current = t;
      const px = (speed * 0.04) * dt; // ~speed * 40px/sec
      if (scrollContainer) scrollContainer.scrollBy({ top: px });
      else window.scrollBy({ top: px });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, speed, scrollContainer]);

  return (
    <div
      dir="rtl"
      className={cn(
        "fixed bottom-4 left-1/2 z-40 -translate-x-1/2",
        "flex items-center gap-1 rounded-full border border-white/70 bg-[#fbf3e1]/90 backdrop-blur-2xl",
        "px-2 py-1.5 shadow-[0_14px_30px_-14px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.8)]",
      )}
      style={{ marginBottom: "max(env(safe-area-inset-bottom), 0px)" }}
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
        onClick={() => setSpeed((s) => Math.max(1, s - 1))}
        className="grid h-8 w-8 place-items-center rounded-full text-[#3a2a18] active:scale-90 transition-transform"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-6 text-center text-[11px] font-bold text-[#7a4a26] tabular-nums">
        ×{speed}
      </span>
      <button
        type="button"
        aria-label="تسريع"
        onClick={() => setSpeed((s) => Math.min(5, s + 1))}
        className="grid h-8 w-8 place-items-center rounded-full text-[#3a2a18] active:scale-90 transition-transform"
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
