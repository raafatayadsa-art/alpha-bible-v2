import { useEffect, useRef, useState } from "react";

type Options = {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  enabled?: boolean;
};

export function usePullToRefresh({ onRefresh, threshold = 72, enabled = true }: Options) {
  const [pulling, setPulling] = useState(false);
  const [offset, setOffset] = useState(0);
  const startY = useRef(0);
  const active = useRef(false);
  const offsetRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 4) return;
      startY.current = e.touches[0]?.clientY ?? 0;
      active.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active.current) return;
      const y = e.touches[0]?.clientY ?? 0;
      const delta = Math.max(0, y - startY.current);
      if (delta > 8) setPulling(true);
      const next = Math.min(delta * 0.45, threshold * 1.2);
      offsetRef.current = next;
      setOffset(next);
    };

    const onTouchEnd = () => {
      if (!active.current) return;
      active.current = false;
      if (offsetRef.current >= threshold) void onRefreshRef.current();
      setPulling(false);
      offsetRef.current = 0;
      setOffset(0);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, threshold]);

  return { pulling, offset };
}
