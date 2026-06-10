import bgWatermark from "@/features/bible-lavoble/assets/bg-watermark.jpg";
import { useBibleSearch } from "@/features/bible-search";
import { newTestamentRef, oldTestamentRef } from "../assets";
import { bibleV2Tokens } from "../tokens";
import { BibleV2BottomNav } from "./BibleV2BottomNav";
import { BibleV2ContinueReading } from "./BibleV2ContinueReading";
import { BibleV2Header } from "./BibleV2Header";
import { BibleV2QuickTools } from "./BibleV2QuickTools";
import { BibleV2SearchRow } from "./BibleV2SearchRow";
import { BibleV2TestamentCard, type BibleV2TestamentData } from "./BibleV2TestamentCard";
import { BibleV2VerseCard } from "./BibleV2VerseCard";

const testamentCards: BibleV2TestamentData[] = [
  {
    id: "old",
    title: "العهد القديم",
    subtitle: "الكتب التي كتبت قبل\nميلاد السيد المسيح",
    image: oldTestamentRef,
    tone: "gold",
    badgeInImage: true,
    to: "/books-v2",
    search: { testament: "old" },
  },
  {
    id: "new",
    title: "العهد الجديد",
    subtitle: "الكتب التي كتبت بعد\nميلاد السيد المسيح",
    image: newTestamentRef,
    tone: "blue",
    badgeInImage: true,
    to: "/books-v2",
    search: { testament: "new" },
  },
];

export function BibleV2Screen() {
  const { openSearch } = useBibleSearch();

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: bibleV2Tokens.ivory }}
    >
      <img
        src={bgWatermark}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] w-full object-cover opacity-[0.22] mix-blend-luminosity"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${bibleV2Tokens.ivory}88 45%, ${bibleV2Tokens.ivory} 100%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[440px] pb-32">
        <BibleV2Header />
        <div className="mt-1">
          <BibleV2VerseCard />
        </div>
        <BibleV2SearchRow onSearch={openSearch} />
        <div className="mx-3.5 mt-5 flex items-stretch gap-3.5 [perspective:900px]">
          {testamentCards.map((card) => (
            <BibleV2TestamentCard key={card.id} data={card} />
          ))}
        </div>
        <BibleV2QuickTools />
        <BibleV2ContinueReading />
      </div>

      <BibleV2BottomNav />
    </div>
  );
}
