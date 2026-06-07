import { useEffect, useRef } from "react";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";

const EDGE_WIDTH = 28;
const TRIGGER_DELTA = 64;
const MAX_VERTICAL_DRIFT = 56;

function headerExclusionPx() {
  if (typeof window === "undefined") return 56;
  const el = document.createElement("div");
  el.style.cssText =
    "position:absolute;visibility:hidden;height:var(--alpha-header-exclusion,56px);pointer-events:none";
  document.documentElement.appendChild(el);
  const h = el.getBoundingClientRect().height;
  document.documentElement.removeChild(el);
  return h;
}

type ActiveGesture = {
  side: "left" | "right";
  startX: number;
  startY: number;
  pointerId: number;
};

function hasBlockingOverlay() {
  const modals = document.querySelectorAll('[aria-modal="true"]');
  for (const node of modals) {
    if (node.getAttribute("aria-label") === "قائمة التنقل") continue;
    return true;
  }
  return false;
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'button, a, input, textarea, select, [role="button"], [contenteditable="true"], [data-alpha-edge-ignore]',
    ),
  );
}

/**
 * App-wide edge gestures — narrow screen-edge zones only.
 * Right edge → Navigation Center · Left edge → Back
 */
export function AlphaEdgeGestures() {
  const { navEdgeEnabled, backEdgeEnabled, openNavHub, goBack } = useAlphaNavigation();
  const active = useRef<ActiveGesture | null>(null);
  const feedback = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!navEdgeEnabled && !backEdgeEnabled) return;

    const setFeedback = (side: "left" | "right" | null, amount = 0) => {
      const el = feedback.current;
      if (!el) return;
      if (!side || amount <= 0) {
        el.style.opacity = "0";
        el.style.transform = side === "left" ? "translateX(-100%)" : "translateX(100%)";
        return;
      }
      el.style.opacity = String(Math.min(0.35, amount / 120));
      const shift = Math.min(10, amount * 0.12);
      el.style.transform =
        side === "left" ? `translateX(calc(-100% + ${shift}px))` : `translateX(calc(100% - ${shift}px))`;
      el.dataset.side = side;
    };

    const clear = () => {
      active.current = null;
      setFeedback(null, 0);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (hasBlockingOverlay()) return;
      if (isInteractiveTarget(e.target)) return;

      const x = e.clientX;
      const y = e.clientY;
      const w = window.innerWidth;
      const headerBottom = headerExclusionPx();
      if (y < headerBottom) return;

      const fromRight = navEdgeEnabled && x >= w - EDGE_WIDTH;
      const fromLeft = backEdgeEnabled && x <= EDGE_WIDTH;
      if (!fromRight && !fromLeft) return;

      active.current = {
        side: fromRight ? "right" : "left",
        startX: x,
        startY: y,
        pointerId: e.pointerId,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const g = active.current;
      if (!g || g.pointerId !== e.pointerId) return;

      const dx = e.clientX - g.startX;
      const dy = Math.abs(e.clientY - g.startY);
      if (dy > MAX_VERTICAL_DRIFT) {
        clear();
        return;
      }

      const progress =
        g.side === "right" ? Math.max(0, -dx) : Math.max(0, dx);
      setFeedback(g.side, progress);

      const triggered =
        g.side === "right"
          ? dx <= -TRIGGER_DELTA
          : dx >= TRIGGER_DELTA;

      if (triggered) {
        if (g.side === "right") openNavHub();
        else goBack();
        clear();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (active.current?.pointerId === e.pointerId) clear();
    };

    const onPointerCancel = () => clear();

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerCancel, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      clear();
    };
  }, [navEdgeEnabled, backEdgeEnabled, openNavHub, goBack]);

  return (
    <div
      ref={feedback}
      aria-hidden
      className="pointer-events-none fixed inset-y-0 z-[54] w-[3px] opacity-0 transition-opacity duration-150 ease-out data-[side=left]:left-0 data-[side=left]:bg-gradient-to-r data-[side=right]:right-0 data-[side=right]:bg-gradient-to-l from-[#b8893a]/55 to-transparent"
      style={{
        top: "max(env(safe-area-inset-top), 0px)",
        bottom: "max(env(safe-area-inset-bottom), 0px)",
      }}
    />
  );
}
