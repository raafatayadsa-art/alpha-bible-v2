import verseHero from "@/features/bible-lavoble/assets/verse-hero.jpg";
import { bibleV2Tokens } from "../tokens";

interface BibleV2VerseCardProps {
  onClick?: () => void;
}

export function BibleV2VerseCard({ onClick }: BibleV2VerseCardProps) {
  return (
    <button
      type="button"
      dir="rtl"
      onClick={onClick}
      className="group relative mx-4 block w-[calc(100%-2rem)] overflow-hidden rounded-[24px] text-right transition active:scale-[0.99]"
      style={{
        boxShadow: [
          `0 0 0 1px ${bibleV2Tokens.cardBorder}`,
          `0 14px 32px -14px ${bibleV2Tokens.shadowCard}`,
          `0 4px 12px -6px ${bibleV2Tokens.shadowWarm}`,
        ].join(", "),
      }}
    >
      <img
        src={verseHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/70 via-[#faf7f2]/45 to-[#faf7f2]/75" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/50"
      />
      <div className="relative flex flex-col items-center px-6 py-7 text-center">
        <p className="font-arabic-serif text-[18px] font-bold leading-[1.95] text-[#2a1f12] drop-shadow-sm">
          مِصْبَاحٌ لِرِجْلِي كَلَامُكَ،
          <br />
          وَنُورٌ لِسَبِيلِي.
        </p>
        <p className="mt-2.5 text-[12px] font-semibold text-[#7a5a18]">(مزمور 119:105)</p>
      </div>
    </button>
  );
}
