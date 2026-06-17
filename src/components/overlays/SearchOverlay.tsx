import { Search, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  placeholder?: string;
  query: string;
  onQueryChange: (v: string) => void;
  children: ReactNode;
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
        className="absolute inset-0 bg-[#3a2a18]/25 backdrop-blur-[6px]"
      />

      {/* Panel — top-anchored */}
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-x-0 top-0 mx-auto w-full max-w-[460px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-y-0" : "-translate-y-full",
        )}
        style={{ paddingTop: "max(env(safe-area-inset-top), 10px)" }}
      >
        <div
          className="mx-2 rounded-b-3xl bg-white/95 backdrop-blur-xl border border-[#ead9b1] shadow-[0_24px_60px_-20px_rgba(120,80,30,0.45)] overflow-hidden"
          style={{ maxHeight: "80dvh" }}
        >
          {/* Sticky search bar */}
          <div
            className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl px-3 pt-3 pb-2 border-b border-[#ead9b1]/70"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#ead9b1]" />
            <div className="flex items-center gap-2">
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
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق البحث"
                className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform"
              >
                <X className="h-4 w-4" />
              </button>
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
