import { oldTestamentImage, newTestamentImage } from "@/assets/bible-home";
import { CopticCrossConnector } from "./CopticCrossConnector";
import { NewTestamentCard } from "./NewTestamentCard";
import { OldTestamentCard } from "./OldTestamentCard";
import { bibleHomeColors } from "../tokens/colors";

export function TestamentSection({
  oldCount = 39,
  newCount = 27,
}: {
  oldCount?: number;
  newCount?: number;
}) {
  return (
    <section className="relative z-0 mt-3">
      <div className="relative grid grid-cols-2 gap-2" dir="ltr">
        <OldTestamentCard imageUrl={oldTestamentImage} bookCount={oldCount} />
        <NewTestamentCard imageUrl={newTestamentImage} bookCount={newCount} />
        <CopticCrossConnector />
      </div>

      {/* Light path system — CSS only; must not intercept taps on shortcut cards below */}
      <div
        className="pointer-events-none relative mx-auto mt-0 h-[58px] w-full max-w-[320px] overflow-hidden"
        aria-hidden
      >
        <div
          className="pointer-events-none absolute bottom-[42px] left-[18%] h-[2px] w-[32%] origin-right rotate-[28deg] rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${bibleHomeColors.goldSoft}, ${bibleHomeColors.glowGold})`,
            boxShadow: `0 0 12px ${bibleHomeColors.glowGold}`,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-[42px] right-[18%] h-[2px] w-[32%] origin-left -rotate-[28deg] rounded-full"
          style={{
            background: `linear-gradient(270deg, transparent, ${bibleHomeColors.purpleSoft}, ${bibleHomeColors.glowPurple})`,
            boxShadow: `0 0 12px ${bibleHomeColors.glowPurple}`,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-[46px] w-[3px] -translate-x-1/2 rounded-full"
          style={{
            background: `linear-gradient(180deg, ${bibleHomeColors.glowGold}, ${bibleHomeColors.glowWarm}, transparent)`,
            boxShadow: `0 0 16px ${bibleHomeColors.glowGold}`,
          }}
        />
      </div>
    </section>
  );
}
