import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const DEFAULT_TOP_OFFSET = "calc(max(env(safe-area-inset-top), 14px) + 56px)";

function resolveAnchorTop(anchorBottom: number | undefined): string | number {
  if (anchorBottom !== undefined) return anchorBottom + 8;
  return DEFAULT_TOP_OFFSET;
}

function useAnchorBottom(anchorRef: RefObject<HTMLElement | null>, open: boolean) {
  const [anchorBottom, setAnchorBottom] = useState<number | undefined>();

  useLayoutEffect(() => {
    if (!open) {
      setAnchorBottom(undefined);
      return;
    }

    const measure = () => {
      const el = anchorRef.current;
      setAnchorBottom(el ? el.getBoundingClientRect().bottom : undefined);
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchorRef, open]);

  return anchorBottom;
}

export function ConnectTopAnchorSheet({
  open,
  onClose,
  anchorRef,
  title,
  subtitle,
  headerIcon,
  children,
  zIndex = 68,
  maxHeight = "min(75dvh, 560px)",
}: {
  open: boolean;
  onClose: () => void;
  anchorRef?: RefObject<HTMLElement | null>;
  title: string;
  subtitle?: string;
  headerIcon?: ReactNode;
  children: ReactNode;
  zIndex?: number;
  maxHeight?: string;
}) {
  const fallbackRef = useRef<HTMLElement | null>(null);
  const effectiveRef = anchorRef ?? fallbackRef;
  const measuredBottom = useAnchorBottom(effectiveRef, open && Boolean(anchorRef));

  if (!open || typeof document === "undefined") return null;

  const top = resolveAnchorTop(anchorRef ? measuredBottom : undefined);

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex }} onClick={onClose}>
      <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      <div
        dir="rtl"
        className="connect-top-anchor-sheet pointer-events-none absolute inset-x-0 mx-auto w-full max-w-[var(--alpha-content-narrow-width)] px-5 animate-in fade-in slide-in-from-top duration-200"
        style={{ top }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="connect-top-anchor-sheet-panel pointer-events-auto glass-strong flex flex-col overflow-hidden rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.42)]"
          style={{ maxHeight }}
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/80 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 text-right">
              <div className="flex items-center justify-start gap-1.5">
                {headerIcon}
                <h2 className="text-[17px] font-bold leading-tight text-neon-green">{title}</h2>
              </div>
              {subtitle ? <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p> : null}
            </div>
            <span className="h-9 w-9 shrink-0" aria-hidden />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
