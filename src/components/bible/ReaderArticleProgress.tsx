import { useEffect, useRef, useState, type RefObject } from "react";
import { articleScrollProgress, bindScroll } from "@/lib/chapter-scroll";
import { cn } from "@/lib/utils";

/**
 * In-header reading progress bar — shared by chapter reader & Agpeya.
 * Smooth fill driven by scroll position through the article body.
 */
export function ReaderArticleProgress({
  spiritualMode,
  scrollRoot,
  articleRef,
  positionLabel,
  enabled = true,
}: {
  spiritualMode: boolean;
  scrollRoot: HTMLElement | null;
  articleRef: RefObject<HTMLElement | null>;
  positionLabel: string;
  enabled?: boolean;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const displayed = useRef(0);
  const target = useRef(0);
  const [labelPct, setLabelPct] = useState(0);

  useEffect(() => {
    displayed.current = 0;
    target.current = 0;
    setLabelPct(0);
    if (fillRef.current) fillRef.current.style.width = "0%";
  }, [enabled, positionLabel]);

  useEffect(() => {
    const root = scrollRoot ?? document.documentElement;
    const article = articleRef.current;

    const paint = (pct: number) => {
      if (fillRef.current) fillRef.current.style.width = `${pct}%`;
      setLabelPct(Math.round(pct));
    };

    const onScroll = () => {
      if (!article) return;
      target.current = articleScrollProgress(root, article);
      if (rafRef.current == null) {
        const tick = () => {
          const diff = target.current - displayed.current;
          displayed.current += diff * 0.2;
          const done = Math.abs(diff) < 0.05;
          if (done) {
            displayed.current = target.current;
            paint(displayed.current);
            rafRef.current = null;
            return;
          }
          paint(displayed.current);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    onScroll();
    const unbind = bindScroll(root, onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      unbind();
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [scrollRoot, articleRef, enabled]);

  if (!enabled) return null;

  return (
    <div className="mt-1 w-full min-w-0 px-3 pb-1" dir="rtl">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p
          className={cn(
            "text-[11px] font-bold tabular-nums",
            spiritualMode ? "text-[#e8d5a0]/90" : "text-[#7a5a32]",
          )}
        >
          {positionLabel}
        </p>
        <p
          className={cn(
            "text-[11px] font-extrabold tabular-nums",
            spiritualMode ? "text-[#f0d78c]" : "text-[#5a3d92]",
          )}
        >
          {labelPct}% مكتمل
        </p>
      </div>
      <div
        className={cn(
          "flex h-[5px] w-full gap-px overflow-hidden rounded-full",
          spiritualMode ? "bg-white/8" : "bg-[#c79356]/15",
        )}
        role="progressbar"
        aria-valuenow={labelPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`تقدم القراءة ${labelPct}%`}
      >
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className={cn("absolute inset-0", spiritualMode ? "bg-white/10" : "bg-[#c79356]/14")} />
          <div
            ref={fillRef}
            className={cn(
              "absolute inset-y-0 right-0 transition-[width,box-shadow] duration-200 ease-out",
              spiritualMode
                ? "bg-gradient-to-l from-[#f0d78c] via-[#d4af37] to-[#b8893a] shadow-[0_0_12px_rgba(212,175,55,0.75)]"
                : "bg-gradient-to-l from-[#7a5cb0] via-[#9b7fd4] to-[#5a3d92] shadow-[0_0_12px_rgba(122,92,176,0.85)]",
            )}
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}
