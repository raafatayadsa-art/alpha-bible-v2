import verseHero from "../../assets/verse-hero.jpg";

interface VerseHeroCardProps {
  onClick?: () => void;
}

export function VerseHeroCard({ onClick }: VerseHeroCardProps) {
  return (
    <button
      dir="rtl"
      onClick={onClick}
      className="relative mx-3 block w-[calc(100%-1.5rem)] overflow-hidden rounded-[20px] ring-[0.5px] ring-[#d9c084]/80 shadow-[0_8px_24px_-12px_rgba(120,90,40,0.3)] text-right transition active:scale-[0.99]"
    >
      <img
        src={verseHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#fdf6e3]/55 via-[#fdf6e3]/35 to-[#fdf6e3]/60" />
      <div className="relative flex flex-col items-center px-6 py-6 text-center">
        <p
          className="text-[17px] leading-[1.9] font-bold text-[#3a2c10] drop-shadow-sm"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          مِصْباحٌ لِرِجْلَيَّ كَلامُكَ
          <br />
          وَنُورٌ لِسَبِيلِي."
        </p>
        <p
          className="mt-2 text-[12px] text-[#7a5a18]"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          (مزمور 105:119)
        </p>
      </div>
    </button>
  );
}