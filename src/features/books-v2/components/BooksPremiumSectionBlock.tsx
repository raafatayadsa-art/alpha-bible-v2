import type { BooksSectionDef } from "../books-premium-sections";
import { BOOKS_PREMIUM } from "../books-premium-tokens";
import { BooksPremiumBookCard } from "./BooksPremiumBookCard";
import { CopticMiniCross } from "@/components/coptic";

export function BooksPremiumSectionBlock({
  section,
  books,
  testament,
  startIndex,
}: {
  section: BooksSectionDef;
  books: string[];
  testament: "old" | "new";
  startIndex: number;
}) {
  const isOt = testament === "old";

  return (
    <section className="mt-6">
      <div
        className="relative overflow-hidden rounded-[20px] border px-4 py-3"
        style={{
          borderColor: isOt ? `${BOOKS_PREMIUM.gold}44` : `${BOOKS_PREMIUM.ntAccent}44`,
          background: isOt
            ? "linear-gradient(90deg, rgba(212,175,55,0.12) 0%, rgba(255,255,255,0.75) 55%, transparent 100%)"
            : "linear-gradient(90deg, rgba(61,90,154,0.12) 0%, rgba(255,255,255,0.75) 55%, transparent 100%)",
        }}
      >
        <span
          aria-hidden
          className="books-star-twinkle pointer-events-none absolute left-3 top-3 h-1.5 w-1.5 rounded-full"
          style={{ background: isOt ? BOOKS_PREMIUM.gold : BOOKS_PREMIUM.ntAccent }}
        />
        <div className="pointer-events-none absolute right-3 top-2.5 text-[#b8893a]/30" aria-hidden>
          <CopticMiniCross size={11} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span
            className="hero-ledger-glyph-gold text-[18px] font-black leading-none"
            aria-hidden
          >
            {section.glyph}
          </span>
          <div className="min-w-0 flex-1 text-right">
            <h2
              className="font-arabic-serif text-[15px] font-extrabold"
              style={{ color: isOt ? BOOKS_PREMIUM.textPrimary : BOOKS_PREMIUM.navy }}
            >
              {section.label}
            </h2>
            <p className="mt-0.5 text-[10px] font-semibold text-[#8a7355]">{section.subtitle}</p>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
            style={{
              background: isOt ? "rgba(212,175,55,0.16)" : "rgba(61,90,154,0.12)",
              color: isOt ? BOOKS_PREMIUM.goldDeep : BOOKS_PREMIUM.ntAccent,
            }}
          >
            {books.length}
          </span>
        </div>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2.5">
        {books.map((book, i) => (
          <li key={book}>
            <BooksPremiumBookCard bookParam={book} index={startIndex + i} testament={testament} />
          </li>
        ))}
      </ul>
    </section>
  );
}
