import { useNavigate } from "@tanstack/react-router";
import type { KeyboardEvent } from "react";
import type { FeatureCardData } from "../data/featureCards";
import { useBibleSearch } from "@/features/bible-search";
import { bibleHomeColors } from "../tokens/colors";

export function BibleFeatureCard({
  card,
  openSearchOverlay,
}: {
  card: FeatureCardData;
  openSearchOverlay?: () => void;
}) {
  const navigate = useNavigate();
  const { openSearch } = useBibleSearch();
  const Icon = card.icon;

  const handleClick = () => {
    console.log("Bible shortcut clicked:", card.id, card.route);

    if (card.action === "search") {
      (openSearchOverlay ?? openSearch)();
      return;
    }

    if (card.route) {
      void navigate({
        to: card.route as never,
        search: card.search as never,
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={card.title}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="relative z-20 flex h-[88px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border px-2 text-center transition active:scale-[0.98] touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-[#b8893a]/40"
      style={{
        backgroundColor: bibleHomeColors.cardBackground,
        borderColor: bibleHomeColors.cardBorder,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 20px -14px ${bibleHomeColors.shadowCard}`,
      }}
    >
      <Icon className="pointer-events-none h-5 w-5" style={{ color: bibleHomeColors.goldDeep }} strokeWidth={2.2} />
      <span
        className="pointer-events-none line-clamp-2 text-[10px] font-bold leading-tight"
        style={{ color: bibleHomeColors.textPrimary }}
      >
        {card.title}
      </span>
    </div>
  );
}

/** @deprecated Use BibleFeatureCard */
export const FeatureCard = BibleFeatureCard;
