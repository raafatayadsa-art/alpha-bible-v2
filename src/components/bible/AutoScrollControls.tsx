import { useEffect, useRef, useState } from "react";
import { Play, Pause, Minus, Plus, Moon, Sun, Rows3, Type } from "lucide-react";
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
  fontSize,
  setFontSize,
  fontMin = 14,
  fontMax = 34,
  fontStep = 1,
  lineHeight,
  setLineHeight,
  lineHeightSteps = [1.6, 1.8, 2.0, 2.2, 2.4],
}: {
  spiritualMode: boolean;
  onToggleSpiritual: () => void;
  scrollContainer?: HTMLElement | null;
  bottomClass?: string;
  /** When provided, visibility is controlled by the parent (synchronized chrome). */
  visible?: boolean;
  /** legacy, unused */
  hidden?: boolean;
  fontSize?: number;
  setFontSize?: (n: number) => void;
  fontMin?: number;
  fontMax?: number;
  fontStep?: number;
  lineHeight?: number;
  setLineHeight?: (n: number) => void;
  lineHeightSteps?: number[];
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
        "flex flex-col items-center gap-1",
        active
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : controlled
            ? "opacity-0 translate-y-3 pointer-events-none"
            : "opacity-60 translate-y-0 pointer-events-auto",
      )}
      role="toolbar"
      aria-label="وضع القراءة"
    >
      {/* Alpha mark above the bar */}
      <span
        aria-hidden
        className={cn(
          "text-[10px] font-extrabold tracking-[0.3em] leading-none select-none",
          spiritualMode ? "text-[#f0d78c]/55" : "text-[#b8893a]/70",
        )}
        style={{ textShadow: spiritualMode ? "0 0 6px rgba(240,215,140,0.25)" : undefined }}
      >
        Ⲁ
      </span>

      <div
        className={cn(
          "flex items-center gap-0.5 rounded-full border backdrop-blur-2xl px-1.5 py-1",
          spiritualMode
            ? "bg-[#1a140a]/55 border-[#c9a96b]/25 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.85),0_0_22px_-8px_rgba(184,137,58,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "bg-[#fff7e3]/65 border-[#e6d2a6]/55 text-[#5b3a18] shadow-[0_14px_30px_-16px_rgba(120,80,30,0.40),inset_0_1px_0_rgba(255,255,255,0.9)]",
        )}
      >
      <button
        type="button"
        aria-label={spiritualMode ? "وضع النهار" : "الوضع الروحي"}
        onClick={onToggleSpiritual}
        className="grid h-7 w-7 place-items-center rounded-full active:scale-90 transition-transform"
        style={spiritualMode ? { color: "#f0d78c" } : undefined}
      >
        {spiritualMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>

      <span className={cn("mx-0.5 h-4 w-px", spiritualMode ? "bg-[#c9a96b]/25" : "bg-[#b8893a]/20")} />

      <button
        type="button"
        aria-label="إبطاء"
        onClick={() => setSpeedIdx((i) => Math.max(0, i - 1))}
        className="grid h-6 w-6 place-items-center rounded-full active:scale-90 transition-transform disabled:opacity-40"
        style={spiritualMode ? { color: "#f0d78c" } : undefined}
        disabled={speedIdx === 0}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span
        className="min-w-9 text-center text-[10.5px] font-bold tabular-nums"
        style={
          spiritualMode
            ? { color: "#f0d78c", textShadow: "0 0 8px rgba(184,137,58,0.40)" }
            : { color: "#8a6322" }
        }
      >
        {speedLabel}
      </span>
      <button
        type="button"
        aria-label="تسريع"
        onClick={() => setSpeedIdx((i) => Math.min(SPEEDS.length - 1, i + 1))}
        className="grid h-6 w-6 place-items-center rounded-full active:scale-90 transition-transform disabled:opacity-40"
        style={spiritualMode ? { color: "#f0d78c" } : undefined}
        disabled={speedIdx === SPEEDS.length - 1}
      >
        <Plus className="h-3 w-3" />
      </button>

      {(setFontSize && typeof fontSize === "number") && (
        <>
          <span className={cn("mx-0.5 h-4 w-px", spiritualMode ? "bg-[#c9a96b]/25" : "bg-[#b8893a]/20")} />
          <button
            type="button"
            aria-label="تصغير الخط"
            onClick={() => setFontSize(Math.max(fontMin, +(fontSize - fontStep).toFixed(2)))}
            className="grid h-6 w-6 place-items-center rounded-full active:scale-90 transition-transform disabled:opacity-40"
            style={spiritualMode ? { color: "#f0d78c" } : undefined}
            disabled={fontSize <= fontMin}
          >
            <Type className="h-2.5 w-2.5" />
          </button>
          <span
            className="min-w-7 text-center text-[10.5px] font-bold tabular-nums"
            style={spiritualMode ? { color: "#f0d78c" } : { color: "#8a6322" }}
          >
            {Number.isInteger(fontSize) ? fontSize : fontSize.toFixed(0)}
          </span>
          <button
            type="button"
            aria-label="تكبير الخط"
            onClick={() => setFontSize(Math.min(fontMax, +(fontSize + fontStep).toFixed(2)))}
            className="grid h-6 w-6 place-items-center rounded-full active:scale-90 transition-transform disabled:opacity-40"
            style={spiritualMode ? { color: "#f0d78c" } : undefined}
            disabled={fontSize >= fontMax}
          >
            <Type className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      {(setLineHeight && typeof lineHeight === "number" && lineHeightSteps.length > 0) && (
        <>
          <span className={cn("mx-0.5 h-4 w-px", spiritualMode ? "bg-[#c9a96b]/25" : "bg-[#b8893a]/20")} />
          <button
            type="button"
            aria-label="تباعد الأسطر"
            onClick={() => {
              const idx = lineHeightSteps.findIndex((s) => Math.abs(s - lineHeight) < 0.05);
              const next = lineHeightSteps[(idx + 1) % lineHeightSteps.length] ?? lineHeightSteps[0];
              setLineHeight(next);
            }}
            className="grid h-6 w-6 place-items-center rounded-full active:scale-90 transition-transform"
            style={spiritualMode ? { color: "#f0d78c" } : undefined}
          >
            <Rows3 className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      <span className={cn("mx-0.5 h-4 w-px", spiritualMode ? "bg-[#c9a96b]/25" : "bg-[#b8893a]/20")} />

      <button
        type="button"
        aria-label={playing ? "إيقاف التمرير" : "تشغيل التمرير"}
        onClick={() => setPlaying((p) => !p)}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-full text-white active:scale-95 transition-all duration-300",
          "bg-gradient-to-br from-[#d9b878] to-[#8a6322] border border-white/25",
          playing
            ? "shadow-[0_0_14px_rgba(184,137,58,0.85),0_0_28px_rgba(184,137,58,0.45)] ring-1 ring-[#f0d78c]/45"
            : "shadow-[0_6px_14px_-6px_rgba(120,80,30,0.6)] ring-1 ring-[#f0d78c]/25",
        )}
      >
        {playing ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
      </button>
      </div>
    </div>
  );
}

