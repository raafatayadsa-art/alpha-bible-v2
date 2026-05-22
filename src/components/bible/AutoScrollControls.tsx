import { useEffect, useRef, useState } from "react";
import { Play, Pause, Minus, Plus, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;
type Speed = (typeof SPEEDS)[number];

/**
 * Floating glass auto-scroll controller.
 * - Cinematic dark navy / emerald glass pill with soft gold border + neon green active glow.
 * - Apple/Kindle-style overlay visibility:
 *     appears on ANY tap / touch / interaction with the reader,
 *     stays visible 5 seconds, then fades smoothly to a low-opacity ghost.
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
  /** kept for backwards-compat; no longer used (controller manages its own visibility) */
  hidden?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const speed: Speed = SPEEDS[speedIdx];
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  const eased = useRef<number>(0);
  const idleTimer = useRef<number | null>(null);

  // Apple-video-style overlay: show immediately on any interaction, hide after 5s.
  const kick = () => {
    setVisible(true);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setVisible(false), 5000);
  };

  useEffect(() => {
    kick();
    const onAny = () => kick();
    window.addEventListener("pointerdown", onAny, { passive: true });
    window.addEventListener("touchstart", onAny, { passive: true });
    window.addEventListener("click", onAny, { passive: true });
    window.addEventListener("keydown", onAny);
    return () => {
      window.removeEventListener("pointerdown", onAny);
      window.removeEventListener("touchstart", onAny);
      window.removeEventListener("click", onAny);
      window.removeEventListener("keydown", onAny);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While playing, keep the controller visible so the user can see speed/pause.
  useEffect(() => {
    if (playing) {
      setVisible(true);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    } else {
      kick();
    }
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
      const k = 1 - Math.exp(-dt / 280);
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
      onMouseEnter={kick}
      onTouchStart={kick}
      onPointerDown={kick}
      className={cn(
        "fixed left-1/2 z-40 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        bottomClass,
        "flex items-center gap-0.5 rounded-full border backdrop-blur-2xl px-1.5 py-1",
        spiritualMode
          ? // cinematic navy + emerald glass, warm gold hairline border, soft neon green glow
            "bg-gradient-to-b from-[#0b1a2c]/60 to-[#08131f]/55 border-[#e7c97a]/25 text-[#f3e6c4] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.85),0_0_24px_-6px_rgba(62,180,130,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-white/60 border-[#c79356]/30 text-[#1f4032] shadow-[0_14px_30px_-16px_rgba(31,94,74,0.4),inset_0_1px_0_rgba(255,255,255,0.9)]",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none",
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
          "grid h-8 w-8 place-items-center rounded-full text-white active:scale-95 transition-all duration-300",
          "bg-gradient-to-br from-[#3eb482] to-[#1f6e54]",
          playing
            ? "shadow-[0_0_14px_rgba(62,180,130,0.85),0_0_28px_rgba(62,180,130,0.45)] ring-1 ring-[#7af0b8]/40"
            : "shadow-[0_6px_14px_-6px_rgba(31,94,74,0.6)]",
        )}
      >
        {playing ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
      </button>
    </div>
  );
}
