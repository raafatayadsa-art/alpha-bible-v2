import { useCallback, useEffect, useRef, useState } from "react";
import { articleScrollProgress, bindScroll, scrollMetrics, scrollToY } from "@/lib/chapter-scroll";
import { dispatchReadingUserScroll } from "@/components/controls/reading-user-scroll";
import { cn } from "@/lib/utils";

type RailLayout = {
  left: number;
  top: number;
  height: number;
  thumbTop: number;
  thumbHeight: number;
  pct: number;
};

/**
 * Custom vertical reading scroll rail — anchored to the content column, not the viewport edge.
 */
export function ChapterReadingScrollRail({
  scrollRoot,
  contentRef,
  articleRef,
  spiritualMode,
  tone = "default",
  hidden = false,
}: {
  scrollRoot: HTMLElement | null;
  contentRef: React.RefObject<HTMLElement | null>;
  articleRef?: React.RefObject<HTMLElement | null>;
  spiritualMode: boolean;
  tone?: "default" | "kholagy";
  hidden?: boolean;
}) {
  const dragRef = useRef(false);
  const [layout, setLayout] = useState<RailLayout | null>(null);
  const [active, setActive] = useState(false);

  const measure = useCallback(() => {
    const root = scrollRoot;
    const content = contentRef.current;
    if (!root || !content) return;

    const rect = content.getBoundingClientRect();
    const article = articleRef?.current;
    const { max } = scrollMetrics(root);
    const pct = article
      ? articleScrollProgress(root, article)
      : scrollMetrics(root).pct;

    const viewportH = root === document.documentElement ? window.innerHeight : root.clientHeight;
    const scrollH = root === document.documentElement ? document.documentElement.scrollHeight : root.scrollHeight;
    const railHeight = Math.min(Math.max(viewportH * 0.36, 128), 220);
    const ratio = scrollH > 0 ? Math.min(1, viewportH / scrollH) : 0.25;
    const thumbHeight = Math.max(36, Math.min(railHeight * 0.45, railHeight * ratio));
    const travel = Math.max(0, railHeight - thumbHeight);
    const thumbTop = travel * (pct / 100);
    const railTop = Math.max(72, (viewportH - railHeight) / 2);
    const railWidth = 5;
    const railLeft = rect.left + 6;

    setLayout({
      left: railLeft,
      top: railTop,
      height: railHeight,
      thumbTop,
      thumbHeight,
      pct,
    });
  }, [scrollRoot, contentRef, articleRef]);

  useEffect(() => {
    measure();
    const root = scrollRoot ?? document.documentElement;
    const unbind = bindScroll(root, measure);
    window.addEventListener("resize", measure);
    return () => {
      unbind();
      window.removeEventListener("resize", measure);
    };
  }, [scrollRoot, measure]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || !scrollRoot) return;
    const ro = new ResizeObserver(measure);
    ro.observe(content);
    const article = articleRef?.current;
    if (article) ro.observe(article);
    return () => ro.disconnect();
  }, [scrollRoot, contentRef, articleRef, measure]);

  const scrollFromPointer = useCallback(
    (clientY: number) => {
      if (!layout || !scrollRoot) return;
      const root = scrollRoot;
      const ratio = Math.min(1, Math.max(0, (clientY - layout.top) / layout.height));
      const { max } = scrollMetrics(root);
      scrollToY(root, ratio * max);
    },
    [layout, scrollRoot],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = true;
    setActive(true);
    dispatchReadingUserScroll();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    scrollFromPointer(e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dispatchReadingUserScroll();
    scrollFromPointer(e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = false;
    setActive(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  if (!layout) return null;

  const isKholagyDark = tone === "kholagy" && spiritualMode;

  const trackClass =
    tone === "kholagy"
      ? spiritualMode
        ? "bg-[#c4b0e8]/26 ring-1 ring-[#c4b0e8]/42 shadow-[0_0_14px_rgba(138,110,193,0.28)]"
        : "bg-[#c4b0e8]/28"
      : spiritualMode
        ? "bg-white/16"
        : "bg-[#7a5cb0]/14";

  const thumbClass =
    tone === "kholagy"
      ? spiritualMode
        ? "bg-gradient-to-b from-[#fff6dc] via-[#f0d78c] to-[#e7c075] shadow-[0_0_20px_rgba(240,215,140,0.9),0_0_8px_rgba(231,192,117,0.75)] ring-1 ring-[#f0d78c]/55"
        : "bg-gradient-to-b from-[#b8a0e8] via-[#8a6ec1] to-[#5a3d92] shadow-[0_0_14px_rgba(122,92,176,0.45)]"
      : spiritualMode
        ? "bg-gradient-to-b from-[#f0d78c] via-[#d4af37] to-[#b8893a] shadow-[0_0_16px_rgba(212,175,55,0.55)]"
        : "bg-gradient-to-b from-[#9b7fd4] via-[#7a5cb0] to-[#5a3d92] shadow-[0_0_14px_rgba(122,92,176,0.55)]";

  const railWidth = isKholagyDark ? 6 : 5;

  return (
    <div
      role="scrollbar"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(layout.pct)}
      aria-label="مؤشر التمرير"
      className={cn(
        "pointer-events-auto fixed z-[45] touch-none transition-opacity duration-500 ease-out",
        hidden && !active ? "pointer-events-none opacity-0" : "opacity-100",
        isKholagyDark || active ? "opacity-100" : !hidden && "opacity-90",
      )}
      style={{
        left: layout.left,
        top: layout.top,
        height: layout.height,
        width: Math.max(railWidth, 28),
        marginLeft: -10,
        paddingLeft: 10,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={cn(
          "relative mx-auto h-full rounded-full",
          isKholagyDark ? "w-[6px]" : "w-[5px]",
          trackClass,
        )}
      >
        <div
          className={cn(
            "absolute rounded-full transition-[top,height] duration-150",
            isKholagyDark ? "inset-x-[-2px]" : "inset-x-[-1px]",
            thumbClass,
          )}
          style={{ top: layout.thumbTop, height: layout.thumbHeight }}
        />
      </div>
    </div>
  );
}
