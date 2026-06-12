import { useCallback, useState, type PointerEvent, type ReactNode } from "react";

type Ripple = { id: number; x: number; y: number };

export function katamerosHaptic() {
  try {
    navigator.vibrate?.(6);
  } catch {
    /* unsupported */
  }
}

/** Press feedback: optional golden shimmer, haptic tick, and `pressing` state for glow styles. */
export function useKatamerosPress({
  haptic = true,
  shimmer = false,
}: {
  haptic?: boolean;
  shimmer?: boolean;
} = {}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [pressing, setPressing] = useState(false);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (haptic) katamerosHaptic();
      setPressing(true);
      if (shimmer) {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        window.setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== id)), 520);
      }
    },
    [haptic, shimmer],
  );

  const endPress = useCallback(() => setPressing(false), []);

  const rippleLayer: ReactNode = shimmer ? (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          className="katameros-press-ripple pointer-events-none absolute rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: 18,
            height: 18,
            marginLeft: -9,
            marginTop: -9,
            background: "radial-gradient(circle, rgba(240,223,170,0.28) 0%, rgba(196,151,74,0.1) 45%, transparent 72%)",
          }}
        />
      ))}
    </>
  ) : null;

  return {
    pressing,
    onPointerDown,
    onPointerUp: endPress,
    onPointerLeave: endPress,
    onPointerCancel: endPress,
    rippleLayer,
  };
}
