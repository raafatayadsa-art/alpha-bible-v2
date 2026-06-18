import { useEffect, useRef, type RefObject } from "react";

export type AutoMarqueeOptions = {
  speed?: number;
  direction?: 1 | -1;
  resumeMs?: number;
  loop?: boolean;
  /** Called each animation frame (e.g. center-card detection while auto-scrolling). */
  onFrame?: () => void;
};

/** RTL-aware horizontal auto-marquee — same DNA as Church quick-access rails. */
export function useAutoMarquee(
  ref: RefObject<HTMLDivElement | null>,
  opts: AutoMarqueeOptions = {},
) {
  const { speed = 22, direction = 1, resumeMs = 2200, loop = false, onFrame } = opts;
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    let raf = 0;
    let last = performance.now();
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused && track.scrollWidth > track.clientWidth + 4) {
        track.scrollLeft -= direction * speed * dt;
        const max = track.scrollWidth - track.clientWidth;
        if (loop && max > 0) {
          const half = max / 2;
          if (track.scrollLeft <= -half - 1) track.scrollLeft += half;
          else if (track.scrollLeft >= 1) track.scrollLeft -= half;
        } else {
          if (track.scrollLeft <= -max + 1) track.scrollLeft = 0;
          else if (track.scrollLeft >= 1) track.scrollLeft = -max;
        }
      }
      onFrameRef.current?.();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    };
    const scheduleResume = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
        last = performance.now();
      }, resumeMs);
    };

    track.addEventListener("pointerdown", pause);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("pointerup", scheduleResume);
    track.addEventListener("pointercancel", scheduleResume);
    track.addEventListener("touchend", scheduleResume);
    track.addEventListener("mouseleave", scheduleResume);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) clearTimeout(resumeTimer);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("pointerup", scheduleResume);
      track.removeEventListener("pointercancel", scheduleResume);
      track.removeEventListener("touchend", scheduleResume);
      track.removeEventListener("mouseleave", scheduleResume);
    };
  }, [ref, speed, direction, resumeMs, loop]);
}
