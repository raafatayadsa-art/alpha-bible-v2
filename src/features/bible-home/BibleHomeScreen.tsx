import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { booksQueryOptions } from "@/lib/bible";
import { groupBooks } from "@/lib/bible-books";
import { useCurrentSession } from "@/lib/reading-state";
import { useBibleSearch } from "@/features/bible-search";
import { continueReadingImage, todayCardImage } from "@/assets/bible-home";
import { CopticWatermark } from "@/components/coptic";
import { BibleHeader } from "./components/BibleHeader";
import { BibleBottomNavigation } from "./components/BibleBottomNavigation";
import { ContinueReadingCard } from "./components/ContinueReadingCard";
import { FeatureCardsGrid } from "./components/FeatureCardsGrid";
import { TestamentSection } from "./components/TestamentSection";
import { TodayCard } from "./components/TodayCard";
import { resolveContinueReadingView } from "@/lib/continue-reading-nav";
import type { ContinueReadingData } from "./data/continueReading";
import { todayCardData } from "./data/todayCard";
import { bibleHomeColors } from "./tokens/colors";

function resolveContinueReading(session: ReturnType<typeof useCurrentSession>): ContinueReadingData {
  const view = resolveContinueReadingView(session);
  return { ...view, id: "continue-default", label: "آخر متابعة", imageUrl: continueReadingImage };
}

export function BibleHomeScreen({ initialSearchOpen = false }: { initialSearchOpen?: boolean }) {
  const { data: books } = useQuery(booksQueryOptions());
  const grouped = books ? groupBooks(books) : { old: [], neu: [], other: [] };
  const session = useCurrentSession();
  const continueData = resolveContinueReading(session);
  const { openSearch } = useBibleSearch();

  useEffect(() => {
    if (initialSearchOpen) {
      openSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchOpen]);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: bibleHomeColors.background }}
    >
      <CopticWatermark subtle />

      <BibleHeader onSearchClick={openSearch} />

      <div className="relative z-[1] mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+108px)]">
        <section className="mt-3">
          <ContinueReadingCard data={continueData} />
        </section>

        <TestamentSection oldCount={grouped.old.length || 39} newCount={grouped.neu.length || 27} />

        <FeatureCardsGrid openSearchOverlay={openSearch} />

        <TodayCard data={{ ...todayCardData, imageUrl: todayCardImage }} />
      </div>

      <BibleBottomNavigation />
    </main>
  );
}
