import { useState } from "react";
import bgWatermark from "../../assets/bg-watermark.jpg";
import oldTestamentImg from "../../assets/old-testament.jpg";
import newTestamentImg from "../../assets/new-testament.jpg";
import { AlphaTopHeader } from "./AlphaTopHeader";
import { AlphaBottomNavigation } from "./AlphaBottomNavigation";
import { VerseHeroCard } from "./VerseHeroCard";
import { SearchOptionsRow } from "./SearchOptionsRow";
import { TestamentCard, type TestamentCardData } from "./TestamentCard";
import { QuickToolsGrid } from "./QuickToolsGrid";
import { ContinueReadingCard } from "./ContinueReadingCard";
import { AlphaWatermark } from "./AlphaWatermark";

const testamentCards: TestamentCardData[] = [
  {
    id: "new",
    title: "العهد الجديد",
    subtitle: "الكتب التي كتبت بعد\nميلاد السيد المسيح",
    cta: "اكتشف",
    image: newTestamentImg,
    badge: "✟",
    tone: "blue",
  },
  {
    id: "old",
    title: "العهد القديم",
    subtitle: "الكتب التي كتبت قبل\nميلاد السيد المسيح",
    cta: "اكتشف",
    image: oldTestamentImg,
    badge: "🕎",
    tone: "gold",
  },
];

export function BibleHomeScreen() {
  const [activeTab, setActiveTab] = useState("bible");

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(180deg,#fdf7e8 0%,#f7ecd0 60%,#f1e2b9 100%)" }}
    >
      {/* Watermark */}
      <img
        src={bgWatermark}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] w-full object-cover opacity-30 mix-blend-luminosity"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fdf7e8]/0 via-[#fdf7e8]/40 to-[#f1e2b9]" />

      <AlphaWatermark />

      <div className="relative z-10 mx-auto max-w-md pb-28">
        <AlphaTopHeader
          variant="home"
          onMenu={() => console.log("menu")}
          onNotifications={() => console.log("notifications")}
        />

        <div className="mt-1">
          <VerseHeroCard onClick={() => console.log("verse card")} />
        </div>

        <SearchOptionsRow onOptions={() => console.log("options")} />

        <div className="mx-3 mt-4 flex items-stretch gap-3">
          {testamentCards.map((card) => (
            <TestamentCard
              key={card.id}
              data={card}
              onClick={() =>
                console.log(card.id === "old" ? "old testament" : "new testament")
              }
            />
          ))}
        </div>

        <QuickToolsGrid onToolClick={(id) => console.log(id)} />

        <div className="mt-2">
          <ContinueReadingCard onClick={() => console.log("continue reading")} />
        </div>
      </div>

      <AlphaBottomNavigation
        activeId={activeTab}
        onChange={(id) => {
          console.log(id);
          setActiveTab(id);
        }}
      />
    </div>
  );
}