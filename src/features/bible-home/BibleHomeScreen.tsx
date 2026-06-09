import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { booksQueryOptions } from "@/lib/bible";
import { groupBooks } from "@/lib/bible-books";
import { useCurrentSession } from "@/lib/reading-state";
import { useBibleSearch } from "@/features/bible-search";
import { continueReadingImage } from "@/assets/bible-home";
import { todayCardImage } from "@/assets/bible-home";
import { CopticWatermark } from "@/components/coptic";
import { BibleHeader } from "./components/BibleHeader";
import { BibleBottomNavigation } from "./components/BibleBottomNavigation";
import { ContinueReadingCard } from "./components/ContinueReadingCard";
import { FeatureCardsGrid } from "./components/FeatureCardsGrid";
import { TestamentSection } from "./components/TestamentSection";
import { TodayCard } from "./components/TodayCard";
import { defaultContinueReading, type ContinueReadingData } from "./data/continueReading";
import { todayCardData } from "./data/todayCard";
import { bibleHomeColors } from "./tokens/colors";

function resolveContinueReading(session: ReturnType<typeof useCurrentSession>): ContinueReadingData {
  if (!session) {
    return { ...defaultContinueReading, imageUrl: continueReadingImage };
  }
  return {
    ...defaultContinueReading,
    reference: `${session.bookName || session.book} ${session.chapter}${session.verse ? `:${session.verse}` : ""}`,
    preview: defaultContinueReading.preview,
    progressPercent: session.progressPercent,
    bookParam: session.book,
    chapter: session.chapter,
    imageUrl: continueReadingImage,
  };
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.5), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.14), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 80%, rgba(214,168,98,0.16), transparent 65%)",
        }}
      />
      <CopticWatermark subtle />

      <BibleHeader onSearchClick={openSearch} />

      <div className="relative z-[1] mx-auto w-full max-w-[440px] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+108px)]">
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
