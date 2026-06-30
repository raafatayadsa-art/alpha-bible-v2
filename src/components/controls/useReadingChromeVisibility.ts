import { useEffect, useRef, useState } from "react";
import { bindScroll } from "@/lib/chapter-scroll";

const CHROME_IDLE_MS = 5000;

/**
 * Auto-hide reading chrome (toolbar, scroll rail, bottom dock) after idle.
 * Shows on any interaction; hides after 5s whether or not autoscroll is playing.
 */
export function useReadingChromeVisibility(scrollRoot?: HTMLElement | null) {
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeTimer = useRef<number | null>(null);

  useEffect(() => {
    const show = () => {
      setChromeVisible(true);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
      chromeTimer.current = window.setTimeout(() => setChromeVisible(false), CHROME_IDLE_MS);
    };

    show();

    window.addEventListener("pointerdown", show, { passive: true });
    window.addEventListener("touchstart", show, { passive: true });
    window.addEventListener("keydown", show);
    window.addEventListener("wheel", show, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", show);
      window.removeEventListener("touchstart", show);
      window.removeEventListener("keydown", show);
      window.removeEventListener("wheel", show);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!scrollRoot) return;

    const show = () => {
      setChromeVisible(true);
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
      chromeTimer.current = window.setTimeout(() => setChromeVisible(false), CHROME_IDLE_MS);
    };

    const unbind = bindScroll(scrollRoot, show);
    return () => {
      unbind();
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current);
    };
  }, [scrollRoot]);

  return { chromeVisible, chromeHidden: !chromeVisible };
}
