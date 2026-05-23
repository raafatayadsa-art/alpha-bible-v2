import { useEffect, useRef, useState } from "react";
import { Play, Pause, Minus, Plus, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
type Speed = (typeof SPEEDS)[number];

const SPEED_STORAGE_KEY = "ab.autoscroll.speedIdx";
const DEFAULT_SPEED_IDX = 0; // 0.5x

function loadInitialSpeedIdx(): number {
  if (typeof window === "undefined") return DEFAULT_SPEED_IDX;
  try {
    const raw = window.localStorage.getItem(SPEED_STORAGE_KEY);
    if (raw == null) return DEFAULT_SPEED_IDX;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0 && n < SPEEDS.length) return n;
  } catch { /* ignore */ }
  return DEFAULT_SPEED_IDX;
}

/**
 * Floating glass auto-scroll controller.
 * Visibility is controlled by the shared reader chrome timer when `visible` is provided.
 */
export function AutoScrollControls({
  spiritualMode,
  onToggleSpiritual,
  scrollContainer,
  bottomClass = "bottom-24",
  visible,
}: {
  spiritualMode: boolean;
  onToggleSpiritual: () => void;
  scrollContainer?: HTMLElement | null;
  bottomClass?: string;
  /** When provided, visibility is controlled by the parent (synchronized chrome). */
  visible?: boolean;
  /** legacy, unused */
  hidden?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState<number>(loadInitialSpeedIdx);

  // Persist speed selection across refresh, chapter change, and navigation.
  useEffect(() => {
    try { window.localStorage.setItem(SPEED_STORAGE_KEY, String(speedIdx)); }
    catch { /* ignore */ }
  }, [speedIdx]);
  const [internalActive, setInternalActive] = useState(true);
  const speed: Speed = SPEEDS[speedIdx];
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  const eased = useRef<number>(0);
  const idleTimer = useRef<number | null>(null);
  const controlled = visible !== undefined;
  const active = controlled ? Boolean(visible) : internalActive;

  // Fallback (uncontrolled) visibility: dim after idle.
  const kick = () => {
    setInternalActive(true);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setInternalActive(false), 4000);
  };

  useEffect(() => {
    if (controlled) return;
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
  }, [controlled]);

  useEffect(() => {
    if (controlled) return;
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speedIdx, spiritualMode, controlled]);


  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      eased.current = 0;
      try { delete (document.documentElement.dataset as any).autoscroll; } catch { /* ignore */ }
      return;
    }
    document.documentElement.dataset.autoscroll = "1";
    last.current = performance.now();
    let acc = 0;
    // Track the last position we applied so this loop never moves the page upward.
    let lastY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    const step = (t: number) => {
      const dt = Math.min(64, t - last.current);
      last.current = t;
      const target = speed * 28; // px/sec
      const k = 1 - Math.exp(-dt / 280);
      eased.current += (target - eased.current) * k;
      acc += (eased.current * dt) / 1000;
      // If something else (user, layout) moved the page up, adopt that as the new baseline.
      const currentY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      if (currentY < lastY - 2) {
        lastY = currentY;
        acc = 0;
      } else if (currentY > lastY) {
        lastY = currentY;
      }
      if (acc >= 1) {
        const delta = Math.floor(acc);
        acc -= delta;
        const nextY = lastY + delta; // clamp: never less than current baseline
        if (scrollContainer) scrollContainer.scrollTo({ top: nextY });
        else window.scrollTo({ top: nextY });
        lastY = nextY;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      try { delete (document.documentElement.dataset as any).autoscroll; } catch { /* ignore */ }
    };
  }, [playing, speed, scrollContainer]);

  const speedLabel = `×${speed}`;

  return (
    <div
      dir="rtl"
      onMouseEnter={controlled ? undefined : kick}
      onTouchStart={controlled ? undefined : kick}
      onPointerDown={controlled ? undefined : kick}
      className={cn(
        "fixed left-1/2 z-40 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        bottomClass,
        "flex items-center gap-0.5 rounded-full border backdrop-blur-2xl px-1.5 py-1",
        spiritualMode
          ? "bg-gradient-to-b from-[#0b1a2c]/60 to-[#08131f]/55 border-[#e7c97a]/25 text-[#f3e6c4] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.85),0_0_24px_-6px_rgba(62,180,130,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-white/60 border-[#c79356]/30 text-[#1f4032] shadow-[0_14px_30px_-16px_rgba(31,94,74,0.4),inset_0_1px_0_rgba(255,255,255,0.9)]",
        active
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : controlled
            ? "opacity-0 translate-y-3 pointer-events-none"
            : "opacity-60 translate-y-0 pointer-events-auto",
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
