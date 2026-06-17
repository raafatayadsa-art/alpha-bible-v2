import { useCallback, useEffect, useRef, useState } from "react";

export type PushToTalkPhase = "idle" | "holding" | "transmitting";

type PushToTalkOptions = {
  holdMs: number;
  vibrateStart?: boolean;
  vibrateEnd?: boolean;
  /** Fires immediately on press — use for getUserMedia (must stay in user gesture). */
  onPressBegin?: () => void;
  /** Fires on release whether or not transmit threshold was reached. */
  onPressEnd?: () => void;
  onStart?: () => void;
  onStop?: () => void;
};

const HOLD_PULSE_MS = 260;
const TRANSMIT_PULSE_MS = 220;

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function vibratePulse(pattern: number | number[]) {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* unsupported */
  }
}

function cancelVibration() {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(0);
  } catch {
    /* unsupported */
  }
}

export function usePushToTalk(options: PushToTalkOptions) {
  const [phase, setPhase] = useState<PushToTalkPhase>("idle");
  const phaseRef = useRef<PushToTalkPhase>("idle");
  const timerRef = useRef<number | null>(null);
  const holdPulseRef = useRef<number | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const captureTargetRef = useRef<HTMLElement | null>(null);
  const endingRef = useRef(false);
  const windowEndHandlerRef = useRef<(e: Event) => void>(() => {});
  const windowBlurHandlerRef = useRef<() => void>(() => {});
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const stableWindowEndHandler = useCallback((e: Event) => {
    windowEndHandlerRef.current(e);
  }, []);

  const stableWindowBlurHandler = useCallback(() => {
    windowBlurHandlerRef.current();
  }, []);

  const setPhaseSafe = (next: PushToTalkPhase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearHoldPulse = () => {
    if (holdPulseRef.current !== null) {
      window.clearInterval(holdPulseRef.current);
      holdPulseRef.current = null;
    }
  };

  const detachWindowListeners = useCallback(() => {
    window.removeEventListener("pointerup", stableWindowEndHandler);
    window.removeEventListener("pointercancel", stableWindowEndHandler);
    window.removeEventListener("blur", stableWindowBlurHandler);
  }, [stableWindowBlurHandler, stableWindowEndHandler]);

  const releaseCapture = useCallback(() => {
    const target = captureTargetRef.current;
    const pointerId = activePointerRef.current;
    if (target && pointerId !== null) {
      try {
        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId);
        }
      } catch {
        /* ignore */
      }
    }
    captureTargetRef.current = null;
    activePointerRef.current = null;
  }, []);

  const startPressHaptics = useCallback(() => {
    if (!optionsRef.current.vibrateStart) return;

    vibratePulse(5);

    clearHoldPulse();
    holdPulseRef.current = window.setInterval(() => {
      const current = phaseRef.current;
      if (current === "idle") return;
      vibratePulse(current === "transmitting" ? 14 : 8);
    }, HOLD_PULSE_MS);
  }, []);

  const restartTransmitPulse = useCallback(() => {
    if (!optionsRef.current.vibrateStart) return;

    clearHoldPulse();
    vibratePulse(32);
    holdPulseRef.current = window.setInterval(() => {
      if (phaseRef.current !== "transmitting") return;
      vibratePulse(14);
    }, TRANSMIT_PULSE_MS);
  }, []);

  const stopPressHaptics = useCallback((withEndPulse: boolean) => {
    clearHoldPulse();
    cancelVibration();
    if (withEndPulse && optionsRef.current.vibrateEnd) vibratePulse(18);
  }, []);

  const endPress = useCallback(() => {
    if (endingRef.current || phaseRef.current === "idle") return;
    endingRef.current = true;

    clearTimer();
    const wasTransmitting = phaseRef.current === "transmitting";
    const wasActive = phaseRef.current !== "idle";

    detachWindowListeners();
    releaseCapture();
    setPhaseSafe("idle");
    stopPressHaptics(wasActive);

    if (wasActive) optionsRef.current.onPressEnd?.();
    if (wasTransmitting) optionsRef.current.onStop?.();

    endingRef.current = false;
  }, [detachWindowListeners, releaseCapture, stopPressHaptics]);

  windowEndHandlerRef.current = (e: Event) => {
    const pointerEvent = e as PointerEvent;
    if (activePointerRef.current === null || pointerEvent.pointerId !== activePointerRef.current) return;
    endPress();
  };

  windowBlurHandlerRef.current = () => {
    endPress();
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (activePointerRef.current !== null) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget;
      activePointerRef.current = e.pointerId;
      captureTargetRef.current = target;
      endingRef.current = false;

      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        /* Safari may reject — window listeners still handle release */
      }

      window.addEventListener("pointerup", stableWindowEndHandler);
      window.addEventListener("pointercancel", stableWindowEndHandler);
      window.addEventListener("blur", stableWindowBlurHandler);

      setPhaseSafe("holding");
      optionsRef.current.onPressBegin?.();
      startPressHaptics();
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (phaseRef.current !== "holding") return;
        setPhaseSafe("transmitting");
        restartTransmitPulse();
        optionsRef.current.onStart?.();
      }, optionsRef.current.holdMs);
    },
    [restartTransmitPulse, stableWindowBlurHandler, stableWindowEndHandler, startPressHaptics],
  );

  const onLostPointerCapture = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (activePointerRef.current === null || e.pointerId !== activePointerRef.current) return;
    if (phaseRef.current === "idle") return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* keep session alive until pointerup on window */
    }
  }, []);

  const onContextMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (phase === "idle") return;
    const scrollEl = document.querySelector(".alpha-connect-theme .alpha-screen-frame-scroll");
    if (!(scrollEl instanceof HTMLElement)) return;
    const prevOverflow = scrollEl.style.overflow;
    scrollEl.style.overflow = "hidden";
    return () => {
      scrollEl.style.overflow = prevOverflow;
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      detachWindowListeners();
      releaseCapture();
      clearTimer();
      clearHoldPulse();
      cancelVibration();
    };
  }, [detachWindowListeners, releaseCapture]);

  return {
    phase,
    isTransmitting: phase === "transmitting",
    isHolding: phase === "holding",
    handlers: {
      onPointerDown,
      onLostPointerCapture,
      onContextMenu,
    },
  };
}
