import bgWatermark from "@/features/bible-lavoble/assets/bg-watermark.jpg";
import { newTestamentCardBg, oldTestamentCardBg } from "../assets";
import { BottomDock } from "@/components/bible/BottomDock";
import { BibleV2ContinueReading } from "./BibleV2ContinueReading";
import { BibleV2Header } from "./BibleV2Header";
import { BibleV2QuickTools } from "./BibleV2QuickTools";
import { BibleV2SearchRow } from "./BibleV2SearchRow";
import { BibleV2TestamentCard, type BibleV2TestamentData } from "./BibleV2TestamentCard";

const testamentCards: BibleV2TestamentData[] = [
  {
    id: "old",
    title: "العهد القديم",
    subtitle: "الكتب التي كتبت قبل\nميلاد السيد المسيح",
    image: oldTestamentCardBg,
    tone: "gold",
    badgeInImage: true,
  },
  {
    id: "new",
    title: "العهد الجديد",
    subtitle: "الكتب التي كتبت بعد\nميلاد السيد المسيح",
    image: newTestamentCardBg,
    tone: "blue",
    badgeInImage: true,
  },
];

export function BibleV2Screen() {
  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-alpha-base text-alpha font-sans"
    >
      <img
        src={bgWatermark}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] w-full object-cover opacity-[0.22] mix-blend-luminosity dark:opacity-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--alpha-bg-base)]"
      />

      <div className="relative z-10 mx-auto max-w-[var(--alpha-content-max-width)] pb-32">
        <BibleV2Header />
        <BibleV2ContinueReading placement="hero" />
        <BibleV2SearchRow />
        <div className="mx-3.5 mt-5 flex items-stretch gap-3.5 [perspective:900px]">
          {testamentCards.map((card) => (
            <BibleV2TestamentCard key={card.id} data={card} />
          ))}
        </div>
        <BibleV2QuickTools />
      </div>

      <BottomDock />
    </div>
  );
}
