import { useEffect, useRef, useState, type RefObject } from "react";
import { articleScrollProgress, bindScroll } from "@/lib/chapter-scroll";
import { cn } from "@/lib/utils";

/**
 * In-header reading progress — premium glass card for chapter reader & Agpeya.
 */
export function ReaderArticleProgress({
  spiritualMode,
  scrollRoot,
  articleRef,
  positionLabel,
  enabled = true,
  resetKey,
}: {
  spiritualMode: boolean;
  scrollRoot: HTMLElement | null;
  articleRef: RefObject<HTMLElement | null>;
  positionLabel: string;
  enabled?: boolean;
  /** When this changes, progress resets (e.g. prayer id). Label updates alone do not reset. */
  resetKey?: string | number;
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
  }, [enabled, resetKey]);

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
    <div className="mt-1 w-full min-w-0 px-3 pb-2" dir="rtl">
      <div
        className={cn(
          "overflow-hidden rounded-[16px] border px-3 py-2.5 backdrop-blur-xl",
          spiritualMode
            ? "border-white/12 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "border-[#e7c97a]/35 bg-white/62 shadow-[0_10px_28px_-16px_rgba(120,80,30,0.28),inset_0_1px_0_rgba(255,255,255,0.82)]",
        )}
      >
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p
            className={cn(
              "text-[10.5px] font-extrabold tabular-nums",
              spiritualMode ? "text-[#f0d78c]" : "text-[#5a3d92]",
            )}
          >
            {labelPct}% مكتمل
          </p>
          <p
            className={cn(
              "text-[10.5px] font-bold tabular-nums",
              spiritualMode ? "text-[#e8d5a0]/90" : "text-[#7a5a32]",
            )}
          >
            {positionLabel}
          </p>
        </div>
        <div
          className={cn(
            "relative h-[6px] w-full overflow-hidden rounded-full",
            spiritualMode ? "bg-white/10" : "bg-[#c79356]/14",
          )}
          role="progressbar"
          aria-valuenow={labelPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`تقدم القراءة ${labelPct}%`}
        >
          <div
            ref={fillRef}
            className={cn(
              "absolute inset-y-0 right-0 rounded-full transition-[width,box-shadow] duration-200 ease-out",
              spiritualMode
                ? "bg-gradient-to-l from-[#f0d78c] via-[#d4af37] to-[#b8893a] shadow-[0_0_14px_rgba(212,175,55,0.7)]"
                : "bg-gradient-to-l from-[#e7c97a] via-[#d4af37] to-[#b8893a] shadow-[0_0_14px_rgba(184,137,58,0.55)]",
            )}
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}
