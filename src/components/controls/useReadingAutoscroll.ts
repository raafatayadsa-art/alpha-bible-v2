import { useEffect, useRef, useState } from "react";
import {
  SPEED_TIERS,
  SPEED_STORAGE_KEY,
  DEFAULT_SPEED_TIER,
  loadInitialSpeedTier,
} from "@/components/controls/alpha-control-cycles";
import { READING_USER_SCROLL_EVENT } from "@/components/controls/reading-user-scroll";

export function useReadingAutoscroll(scrollContainer?: HTMLElement | null) {
  const [playing, setPlaying] = useState(false);
  const [speedTier, setSpeedTier] = useState<number>(loadInitialSpeedTier);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    try { window.localStorage.setItem(SPEED_STORAGE_KEY, String(speedTier)); }
    catch { /* ignore */ }
  }, [speedTier]);

  const speed = SPEED_TIERS[speedTier]?.multiplier ?? SPEED_TIERS[DEFAULT_SPEED_TIER].multiplier;
  const speedLabel = SPEED_TIERS[speedTier]?.label ?? SPEED_TIERS[DEFAULT_SPEED_TIER].label;
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);
  const eased = useRef<number>(0);
  const programmatic = useRef(false);

  useEffect(() => {
    const pause = () => {
      if (playingRef.current) setPlaying(false);
    };

    const onUserScroll = () => pause();

    const root = scrollContainer;
    const onWheel = () => pause();
    const onTouchStart = () => pause();
    const onTouchMove = () => pause();

    window.addEventListener(READING_USER_SCROLL_EVENT, onUserScroll);
    root?.addEventListener("wheel", onWheel, { passive: true });
    root?.addEventListener("touchstart", onTouchStart, { passive: true });
    root?.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener(READING_USER_SCROLL_EVENT, onUserScroll);
      root?.removeEventListener("wheel", onWheel);
      root?.removeEventListener("touchstart", onTouchStart);
      root?.removeEventListener("touchmove", onTouchMove);
    };
  }, [scrollContainer]);

  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      eased.current = 0;
      programmatic.current = false;
      try { delete (document.documentElement.dataset as Record<string, string>).autoscroll; } catch { /* ignore */ }
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
        setPlaying(false);
        return;
      } else if (currentY > lastY) {
        lastY = currentY;
      }
      if (acc >= 1) {
        const delta = Math.floor(acc);
        acc -= delta;
        const nextY = lastY + delta;
        programmatic.current = true;
        if (scrollContainer) scrollContainer.scrollTo({ top: nextY, behavior: "auto" });
        else window.scrollTo({ top: nextY, behavior: "auto" });
        lastY = nextY;
        programmatic.current = false;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      try { delete (document.documentElement.dataset as Record<string, string>).autoscroll; } catch { /* ignore */ }
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
