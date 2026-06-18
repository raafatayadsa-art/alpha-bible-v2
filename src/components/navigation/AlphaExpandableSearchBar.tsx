import { useEffect, type RefObject } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALPHA_HEADER_BTN } from "@/components/navigation/AlphaNotificationButton";

export type AlphaExpandableSearchTone = "light" | "dark" | "classic";

type AlphaExpandableSearchBarProps = {
  expanded: boolean;
  query: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onExpand: () => void;
  onCollapse: () => void;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  tone?: AlphaExpandableSearchTone;
  placeholder?: string;
  className?: string;
};

const COLLAPSED_CLASS: Record<AlphaExpandableSearchTone, string> = {
  light: `${ALPHA_HEADER_BTN} text-[#3a2a18]`,
  dark: "grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#0e1a2e]/55 backdrop-blur-xl text-[#f3e6c4] active:scale-95 transition",
  classic: "dict-search-glass-btn shrink-0",
};

const EXPANDED_SHELL: Record<AlphaExpandableSearchTone, string> = {
  light:
    "flex h-11 w-full items-center gap-2.5 rounded-full border border-[#efe2c4] bg-white/70 px-3.5 shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] backdrop-blur-xl",
  dark: "flex h-11 w-full items-center gap-2.5 rounded-full border border-white/15 bg-[#0e1a2e]/55 px-3.5 shadow-[0_6px_14px_-10px_rgba(0,0,0,0.35)] backdrop-blur-xl",
  classic: "dict-search-glass-bar",
};

const ICON_CLASS: Record<AlphaExpandableSearchTone, string> = {
  light: "text-[#b8893a]",
  dark: "text-[#f3e6c4]",
  classic: "dict-search-icon",
};

const EXPAND_WRAPPER: Record<AlphaExpandableSearchTone, string> = {
  light: "alpha-search-expand",
  dark: "alpha-search-expand",
  classic: "dict-search-expand",
};

const INPUT_CLASS: Record<AlphaExpandableSearchTone, string> = {
  light: "text-[#3a2a18] placeholder:text-[#6a543a]/70",
  dark: "text-[#f3e6c4] placeholder:text-[#f3e6c4]/45",
  classic: "dict-search-input",
};

const CLOSE_CLASS: Record<AlphaExpandableSearchTone, string> = {
  light: "text-[#6a543a]/80 hover:text-[#3a2a18]",
  dark: "text-[#f3e6c4]/70 hover:text-[#f3e6c4]",
  classic: "dict-search-close",
};

/**
 * Unified Alpha search control — collapsed circle + expandable bar (home / header standard).
 */
export function AlphaExpandableSearchBar({
  expanded,
  query,
  inputRef,
  onExpand,
  onCollapse,
  onQueryChange,
  onSubmit,
  tone = "light",
  placeholder = "ابحث في Alpha Coptic...",
  className,
}: AlphaExpandableSearchBarProps) {
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded, inputRef]);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onExpand}
        aria-label="بحث"
        className={cn(COLLAPSED_CLASS[tone], className)}
      >
        <Search className="h-5 w-5" strokeWidth={2.2} />
      </button>
    );
  }

  return (
    <div className={cn(EXPAND_WRAPPER[tone], "flex w-full min-w-0 items-center justify-end", className)}>
      <div className={EXPANDED_SHELL[tone]}>
        <Search className={cn("h-[18px] w-[18px] shrink-0", ICON_CLASS[tone])} strokeWidth={2.2} />
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCollapse();
            }
          }}
          placeholder={placeholder}
          aria-label="بحث"
          className={cn(
            tone === "classic" ? INPUT_CLASS.classic : "min-w-0 flex-1 bg-transparent text-[13px] outline-none",
            tone !== "classic" && INPUT_CLASS[tone],
          )}
          dir="rtl"
        />
        <button
          type="button"
          onClick={onCollapse}
          aria-label="إغلاق البحث"
          className={cn(
            tone === "classic"
              ? CLOSE_CLASS.classic
              : "grid size-7 shrink-0 place-items-center rounded-full transition-colors active:scale-90",
            tone !== "classic" && CLOSE_CLASS[tone],
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Collapsed-only trigger — same shape as home search button. */
export function AlphaSearchButton({
  onClick,
  tone = "light",
  className,
  ariaLabel = "بحث",
}: {
  onClick: () => void;
  tone?: AlphaExpandableSearchTone;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(COLLAPSED_CLASS[tone], className)}
    >
      <Search className="h-5 w-5" strokeWidth={2.2} />
    </button>
  );
}
