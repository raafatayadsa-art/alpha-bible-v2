import { useCallback, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { AlphaNotificationButton } from "@/components/navigation/AlphaNotificationButton";
import { AlphaExpandableSearchBar } from "@/components/navigation/AlphaExpandableSearchBar";
import { ALPHA_HEADER_BTN } from "@/components/navigation/AlphaNotificationButton";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { cn } from "@/lib/utils";

export function AudioHeader() {
  const { openNavHub } = useAlphaNavigation();
  const navigate = useNavigate();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const collapseSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchQuery("");
  }, []);

  const submitSearch = useCallback(() => {
    const q = searchQuery.trim();
    void navigate({ to: "/search", search: q ? { q } : undefined });
    collapseSearch();
  }, [searchQuery, navigate, collapseSearch]);

  return (
    <header className="flex items-center gap-2 px-5 pt-4 pb-2">
      <button type="button" aria-label="القائمة" onClick={openNavHub} className={`${ALPHA_HEADER_BTN} shrink-0 text-[var(--ink)]`}>
        <Menu className="h-5 w-5" strokeWidth={2.2} />
      </button>

      <h1
        className={cn(
          "min-w-0 flex-1 overflow-hidden text-center text-[17px] font-bold tracking-tight text-foreground transition-[opacity,max-width] duration-200",
          searchExpanded && "pointer-events-none max-w-0 flex-none opacity-0",
        )}
      >
        الصوتيات والترانيم
      </h1>

      <div className={cn("flex items-center gap-2", searchExpanded ? "min-w-0 flex-1 justify-end" : "shrink-0")}>
        {!searchExpanded ? <AlphaNotificationButton /> : null}
        <div className={cn("flex min-w-0 justify-end", searchExpanded && "w-full flex-1")}>
          <AlphaExpandableSearchBar
            expanded={searchExpanded}
            query={searchQuery}
            inputRef={searchInputRef}
            onExpand={() => setSearchExpanded(true)}
            onCollapse={collapseSearch}
            onQueryChange={setSearchQuery}
            onSubmit={submitSearch}
          />
        </div>
      </div>
    </header>
  );
}
