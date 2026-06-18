import { useEffect, type RefObject } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConnectExpandableSearchBarProps = {
  expanded: boolean;
  query: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onExpand: () => void;
  onCollapse: () => void;
  onQueryChange: (value: string) => void;
  secretMode?: boolean;
  placeholder?: string;
  collapsedAriaLabel?: string;
  inputAriaLabel?: string;
  onSubmit?: () => void;
  className?: string;
  /** Apply Alpha Connect Classic tokens when rendered outside the Connect route. */
  classicTheme?: boolean;
  /** Which edge the collapsed button sits on when expanding (default: end / trailing). */
  expandFrom?: "start" | "end";
};

/**
 * Expandable search control from Alpha Connect (collapsed glass circle → full glass bar).
 * Used in Connect messages and shared Bible surfaces.
 */
export function ConnectExpandableSearchBar({
  expanded,
  query,
  inputRef,
  onExpand,
  onCollapse,
  onQueryChange,
  secretMode = false,
  placeholder = "ابحث أو أدخل الكود السري...",
  collapsedAriaLabel = "بحث",
  inputAriaLabel = "بحث",
  onSubmit,
  className,
  classicTheme = false,
  expandFrom = "end",
}: ConnectExpandableSearchBarProps) {
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded, inputRef]);

  const content = !expanded ? (
    <button
      type="button"
      onClick={onExpand}
      aria-label={collapsedAriaLabel}
      className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-[var(--neon-blue)] shadow-[0_0_12px_oklch(0.72_0.18_235/0.18)] transition-all active:scale-90"
    >
      <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </button>
  ) : (
    <div
      className={cn(
        "connect-search-expand alpha-search-expand flex w-full min-w-0 items-center",
        expandFrom === "start" ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "glass flex h-11 w-full items-center gap-2.5 rounded-full border px-3.5",
          secretMode
            ? "border-neon-green/35 shadow-[0_0_14px_oklch(0.82_0.22_145/0.22)]"
            : "border-white/15",
        )}
      >
        <Search
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            secretMode ? "text-neon-green" : "text-[var(--neon-blue)]",
          )}
          strokeWidth={2.2}
        />
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSubmit) {
              e.preventDefault();
              onSubmit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCollapse();
            }
          }}
          placeholder={placeholder}
          aria-label={inputAriaLabel}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/55"
          dir="rtl"
        />
        <button
          type="button"
          onClick={onCollapse}
          aria-label="إغلاق البحث"
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  if (classicTheme) {
    return (
      <div
        className={cn(
          "alpha-connect-theme alpha-connect-theme--classic min-w-0",
          expanded && "w-full flex-1",
          className,
        )}
      >
        {content}
      </div>
    );
  }

  return <div className={cn("min-w-0", expanded && "w-full flex-1", className)}>{content}</div>;
}

/** Inline Connect glass search field (always expanded — overlays / dialogs). */
export function ConnectSearchBarField({
  query,
  inputRef,
  onQueryChange,
  placeholder = "ابحث...",
  inputAriaLabel = "بحث",
  secretMode = false,
  trailing,
  className,
  classicTheme = false,
  onSubmit,
  onFocus,
}: {
  query: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  inputAriaLabel?: string;
  secretMode?: boolean;
  trailing?: React.ReactNode;
  className?: string;
  classicTheme?: boolean;
  onSubmit?: () => void;
  onFocus?: () => void;
}) {
  const field = (
    <div
      className={cn(
        "glass flex h-11 w-full items-center gap-2.5 rounded-full border px-3.5",
        secretMode
          ? "border-neon-green/35 shadow-[0_0_14px_oklch(0.82_0.22_145/0.22)]"
          : "border-white/15",
        !classicTheme && className,
      )}
    >
      <Search
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          secretMode ? "text-neon-green" : "text-[var(--neon-blue)]",
        )}
        strokeWidth={2.2}
      />
      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        aria-label={inputAriaLabel}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/55"
        dir="rtl"
      />
      {trailing}
    </div>
  );

  if (classicTheme) {
    return (
      <div className={cn("alpha-connect-theme alpha-connect-theme--classic min-w-0", className)}>
        {field}
      </div>
    );
  }

  return field;
}
