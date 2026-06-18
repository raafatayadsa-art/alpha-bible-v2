import { useCallback, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/bible/primitives";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { AlphaNotificationButton, ALPHA_HEADER_BTN } from "@/components/navigation/AlphaNotificationButton";
import { AlphaExpandableSearchBar } from "@/components/navigation/AlphaExpandableSearchBar";
import { useContextualSearch } from "@/hooks/useContextualSearch";
import {
  CONTEXTUAL_SEARCH_META,
  type ContextualSearchContext,
  type ContextualSearchScope,
} from "@/features/search/contextual-search";
import {
  alphaTopDebugBorderStyle,
  isAlphaTopDebugActive,
  useAlphaTopDebugTarget,
} from "@/components/alpha/alpha-top-debug";

export { ALPHA_HEADER_BTN };

export const ALPHA_HEADER_FRAME = "alpha-header-frame";

export type AlphaHeaderVariant = "home" | "main" | "internal" | "reading";

export type AlphaHeaderProps = {
  variant: AlphaHeaderVariant;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backTo?: string;
  tone?: "light" | "dark";
  className?: string;
  center?: React.ReactNode;
  showNotifications?: boolean;
  onSearchClick?: () => void;
  searchTo?: string;
  searchScope?: ContextualSearchScope;
  searchContext?: ContextualSearchContext;
  searchPlaceholder?: string;
};

export function AlphaHeaderShell({
  children,
  sticky = false,
  className,
  style,
}: {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const topDebug = useAlphaTopDebugTarget();
  const shellActive = isAlphaTopDebugActive(4, topDebug);

  return (
    <div
      data-alpha-top-debug={shellActive ? "header-shell" : undefined}
      className={cn(ALPHA_HEADER_FRAME, sticky && "sticky top-0", className)}
      style={{ ...alphaTopDebugBorderStyle(shellActive), ...style }}
    >
      {children}
    </div>
  );
}

/**
 * Alpha Header Standard — unified top bar.
 * RTL: menu/back (right) · title (center) · notifications + search (left).
 */
export function AlphaHeader({
  variant,
  title,
  subtitle,
  backTo,
  tone = "light",
  className,
  center,
  showNotifications = variant !== "reading",
  onSearchClick,
  searchTo = "/search",
  searchScope,
  searchContext,
  searchPlaceholder,
}: AlphaHeaderProps) {
  const navigate = useNavigate();
  const { openNavHub, goBack } = useAlphaNavigation();
  const contextualSearch = useContextualSearch(searchScope, searchContext);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const btnClass =
    tone === "dark"
      ? "grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#0e1a2e]/55 backdrop-blur-xl text-[#f3e6c4] active:scale-95 transition"
      : ALPHA_HEADER_BTN;

  const titleClass = tone === "dark" ? "text-[#f3e6c4]" : "text-[#3a2a18]";
  const subtitleClass = tone === "dark" ? "text-[#c79356]/80" : "text-[#6a543a]";

  const placeholder =
    searchPlaceholder ??
    (searchScope ? CONTEXTUAL_SEARCH_META[searchScope].placeholder : "ابحث في Alpha Coptic...");

  const collapseSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchQuery("");
  }, []);

  const submitSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (searchScope) {
      contextualSearch.openSearchWithQuery(q);
    } else if (onSearchClick) {
      onSearchClick();
    } else {
      void navigate({ to: searchTo as never, search: q ? { q } : undefined });
    }
    collapseSearch();
  }, [
    searchQuery,
    searchScope,
    contextualSearch,
    onSearchClick,
    navigate,
    searchTo,
    collapseSearch,
  ]);

  const notifBtn = showNotifications && !searchExpanded ? (
    <AlphaNotificationButton tone={tone} />
  ) : null;

  const searchControl = (
    <AlphaExpandableSearchBar
      expanded={searchExpanded}
      query={searchQuery}
      inputRef={searchInputRef}
      onExpand={() => setSearchExpanded(true)}
      onCollapse={collapseSearch}
      onQueryChange={setSearchQuery}
      onSubmit={submitSearch}
      tone={tone}
      placeholder={placeholder}
    />
  );

  const topDebug = useAlphaTopDebugTarget();
  const headerActive = isAlphaTopDebugActive(5, topDebug);

  return (
    <>
      <header
        dir="rtl"
        data-alpha-top-debug={headerActive ? "header" : undefined}
        className={cn("flex items-center justify-between gap-2", className)}
        style={alphaTopDebugBorderStyle(headerActive)}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {variant === "home" ? (
            <button type="button" aria-label="القائمة" onClick={openNavHub} className={btnClass}>
              <Menu className="h-5 w-5" />
            </button>
          ) : variant === "main" ? (
            <span className="h-11 w-11 shrink-0" aria-hidden />
          ) : (
            <BackButton compact tone={tone} to={backTo} onBack={backTo ? undefined : goBack} />
          )}
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center overflow-hidden px-1 transition-[opacity,max-width] duration-200",
            searchExpanded && "pointer-events-none max-w-0 flex-none opacity-0 px-0",
          )}
        >
          {center ?? (
            <>
              <div className={cn("min-w-0 truncate text-center font-extrabold text-[15px]", titleClass)}>
                {title}
              </div>
              {subtitle ? (
                <p className={cn("mt-0.5 truncate text-center text-[11px]", subtitleClass)}>{subtitle}</p>
              ) : null}
            </>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-1.5",
            searchExpanded ? "min-w-0 flex-1 justify-end" : "shrink-0",
          )}
        >
          {notifBtn}
          <div className={cn("flex min-w-0 justify-end", searchExpanded && "w-full flex-1")}>
            {searchControl}
          </div>
        </div>
      </header>
      {searchScope ? contextualSearch.overlay : null}
    </>
  );
}
