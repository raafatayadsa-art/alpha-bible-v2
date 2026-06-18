import { Search, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ConnectSearchBarField } from "@/components/alpha/ConnectExpandableSearchBar";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  placeholder?: string;
  query: string;
  onQueryChange: (v: string) => void;
  children: ReactNode;
  variant?: "default" | "classic";
}

/**
 * Top-anchored search overlay (Apple/Facebook style).
 * - Slides down from the top of the screen.
 * - Light backdrop blur.
 * - Sticky search bar at top, results scroll beneath.
 * - Max 80% height. Drag-down handle + click-outside + X to close.
 */
export function SearchOverlay({
  open,
  onClose,
  title,
  placeholder = "ابحث...",
  query,
  onQueryChange,
  children,
  variant = "default",
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const startY = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 90);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null || !panelRef.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) panelRef.current.style.transform = `translateY(${Math.min(dy, 200)}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current == null || !panelRef.current) return;
    const dy = e.changedTouches[0].clientY - startY.current;
    panelRef.current.style.transform = "";
    startY.current = null;
    if (dy > 90) onClose();
  };

  if (!open) return null;

  const isClassic = variant === "classic";

  return (
    <div
      dir="rtl"
      aria-hidden={false}
      className="fixed inset-0 z-[120] opacity-100 pointer-events-auto transition-opacity duration-200"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className={cn(
          "absolute inset-0 backdrop-blur-[2px]",
          isClassic ? "dict-sheet-backdrop" : "bg-[#3a2a18]/25 backdrop-blur-[6px]",
        )}
      />

      {/* Panel — top-anchored */}
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-x-0 top-0 mx-auto w-full max-w-[var(--alpha-content-max-width)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-y-0" : "-translate-y-full",
        )}
        style={{ paddingTop: "max(env(safe-area-inset-top), 10px)" }}
      >
        <div
          className={cn(
            "mx-2 overflow-hidden rounded-b-3xl",
            isClassic
              ? "dict-sheet-panel"
              : "bg-white/95 backdrop-blur-xl border border-[#ead9b1] shadow-[0_24px_60px_-20px_rgba(120,80,30,0.45)]",
          )}
          style={{ maxHeight: "80dvh" }}
        >
          {/* Sticky search bar */}
          <div
            className={cn(
              "sticky top-0 z-10 px-3 pt-3 pb-2",
              isClassic
                ? "border-b border-[#e0eae4] bg-[#edf3ef]"
                : "bg-white/95 backdrop-blur-xl border-b border-[#ead9b1]/70",
            )}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={cn(
                "mx-auto mb-2 h-1 w-10 rounded-full",
                isClassic ? "dict-sheet-handle" : "bg-[#ead9b1]",
              )}
            />
            <div className="flex items-center gap-2">
              {isClassic ? (
                <div className="alpha-connect-theme alpha-connect-theme--classic flex min-w-0 flex-1 items-center gap-2">
                  <ConnectSearchBarField
                    query={query}
                    inputRef={inputRef}
                    onQueryChange={onQueryChange}
                    placeholder={placeholder}
                    inputAriaLabel={title}
                    className="min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="إغلاق البحث"
                    className="glass grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-muted-foreground transition-all active:scale-90 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 h-4 w-4 text-[#b8893a]" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder={placeholder}
                    aria-label={title}
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    className="w-full h-11 rounded-2xl bg-[#faf3e3] border border-[#ead9b1] pr-9 pl-3 text-[13px] text-[#3a2a18] placeholder:text-[#b08a55] focus:outline-none focus:border-[#6a4ab5]"
                  />
                </div>
              )}
              {!isClassic && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق البحث"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div
            className="overflow-y-auto px-3 py-3 space-y-2"
            style={{ maxHeight: "calc(80dvh - 80px)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
