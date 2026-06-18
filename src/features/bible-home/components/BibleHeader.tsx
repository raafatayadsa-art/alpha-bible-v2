import { useCallback, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { alphaOmegaLogo, headerCathedralBg } from "@/assets/bible-home";
import { useBibleSearch } from "@/features/bible-search";
import { ConnectExpandableSearchBar } from "@/components/alpha/ConnectExpandableSearchBar";
import { ALPHA_HEADER_BTN } from "@/components/navigation/AlphaNotificationButton";
import { cn } from "@/lib/utils";
import { bibleHomeColors } from "../tokens/colors";

export function BibleHeader({ onSearchClick }: { onSearchClick?: () => void }) {
  const router = useRouter();
  const { openSearchWithQuery } = useBibleSearch();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const collapseSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchQuery("");
  }, []);

  const submitSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (onSearchClick) {
      onSearchClick();
    } else {
      openSearchWithQuery(q);
    }
    collapseSearch();
  }, [searchQuery, onSearchClick, openSearchWithQuery, collapseSearch]);

  const goBack = () => {
    const idx =
      typeof window !== "undefined"
        ? (((window.history.state as Record<string, unknown>)?.idx as number) ?? 0)
        : 0;
    if (idx > 0) {
      router.history.back();
      return;
    }
    void router.navigate({ to: "/home" });
  };

  return (
    <header className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.42]"
        style={{
          backgroundImage: `url(${headerCathedralBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "blur(1px) saturate(1.1)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(253,251,247,0.55) 0%, rgba(253,251,247,0.92) 72%, rgba(253,251,247,1) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[var(--alpha-content-max-width)] px-4 pb-2 pt-[max(env(safe-area-inset-top),10px)]">
        <div className="flex items-center gap-2" dir="rtl">
          <button
            type="button"
            onClick={goBack}
            aria-label="رجوع"
            className={`${ALPHA_HEADER_BTN} shrink-0 text-[#3a2a18]`}
          >
            <ChevronLeft className="h-[18px] w-[18px] -scale-x-100" style={{ color: bibleHomeColors.textPrimary }} />
          </button>

          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center overflow-hidden text-center transition-[opacity,max-width] duration-200",
              searchExpanded && "pointer-events-none max-w-0 flex-none opacity-0",
            )}
          >
            <img
              src={alphaOmegaLogo}
              alt=""
              className="h-11 w-11 object-contain drop-shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
              draggable={false}
            />
            <h1
              className="mt-1.5 font-arabic-serif text-[20px] font-extrabold leading-tight"
              style={{ color: bibleHomeColors.textPrimary }}
            >
              الكتاب المقدس
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px]" style={{ color: bibleHomeColors.textMuted }}>
              <span className="text-[10px]" style={{ color: bibleHomeColors.gold }}>
                ✦
              </span>
              كلمة الله حياة
              <span className="text-[10px]" style={{ color: bibleHomeColors.gold }}>
                ✦
              </span>
            </p>
          </div>

          <div className={cn("flex min-w-0", searchExpanded ? "flex-1 justify-end" : "shrink-0")}>
            <div className={cn("flex min-w-0 justify-end", searchExpanded && "w-full flex-1")}>
              <ConnectExpandableSearchBar
                expanded={searchExpanded}
                query={searchQuery}
                inputRef={searchInputRef}
                onExpand={() => setSearchExpanded(true)}
                onCollapse={collapseSearch}
                onQueryChange={setSearchQuery}
                onSubmit={submitSearch}
                classicTheme
                placeholder="ابحث في الكتاب المقدس..."
                collapsedAriaLabel="بحث في الكتاب المقدس"
                inputAriaLabel="بحث في الكتاب المقدس"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
