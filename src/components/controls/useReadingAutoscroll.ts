import { useEffect, useRef, useState } from "react";
import {
  SPEED_TIERS,
  SPEED_STORAGE_KEY,
  DEFAULT_SPEED_TIER,
  loadInitialSpeedTier,
} from "@/components/controls/alpha-control-cycles";

export function useReadingAutoscroll(scrollContainer?: HTMLElement | null) {
  const [playing, setPlaying] = useState(false);
  const [speedTier, setSpeedTier] = useState<number>(loadInitialSpeedTier);

  useEffect(() => {
    try { window.localStorage.setItem(SPEED_STORAGE_KEY, String(speedTier)); }
    catch { /* ignore */ }
  }, [speedTier]);

  const speed = SPEED_TIERS[speedTier]?.multiplier ?? SPEED_TIERS[DEFAULT_SPEED_TIER].multiplier;
  const speedLabel = SPEED_TIERS[speedTier]?.label ?? SPEED_TIERS[DEFAULT_SPEED_TIER].label;
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  const eased = useRef<number>(0);

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
    let lastY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    const step = (t: number) => {
      const dt = Math.min(64, t - last.current);
      last.current = t;
      const target = speed * 28;
      const k = 1 - Math.exp(-dt / 280);
      eased.current += (target - eased.current) * k;
      acc += (eased.current * dt) / 1000;
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
        const nextY = lastY + delta;
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

  const cycleSpeed = () => setSpeedTier((t) => (t + 1) % SPEED_TIERS.length);

  return {
    playing,
    setPlaying,
    togglePlay: () => setPlaying((p) => !p),
    speedLabel,
    cycleSpeed,
  };
}
