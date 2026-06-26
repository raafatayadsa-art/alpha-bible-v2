import { Link } from "@tanstack/react-router";
import { resolveBookId, type BibleBookId } from "@/lib/bible-icons";
import { bibleBookIconPath } from "@/lib/bible-icons/paths";
import { getBookSymbolDef } from "@/lib/bible-icons/book-symbol-registry";
import { displayName } from "@/lib/bible-books";
import { BOOKS_PREMIUM } from "../books-premium-tokens";
import { BooksV2BookSymbol } from "./BooksV2BookSymbol";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function BooksPremiumBookCard({
  bookParam,
  index,
  testament,
}: {
  bookParam: string;
  index: number;
  testament: "old" | "new";
}) {
  const bookId = (resolveBookId(bookParam) ?? bookParam) as BibleBookId;
  const def = getBookSymbolDef(bookId);
  const spotlight = index % 7 === 0;
  const isOt = testament === "old";
  const [artFailed, setArtFailed] = useState(false);
  const outerRing = isOt ? "rgba(212,175,55,0.38)" : "rgba(61,90,154,0.32)";
  const liftShadow = isOt
    ? "0 16px 36px -14px rgba(90,60,20,0.38), 0 8px 18px -8px rgba(184,137,58,0.22)"
    : "0 16px 36px -14px rgba(20,30,60,0.34), 0 8px 18px -8px rgba(61,90,154,0.2)";
  const bookLabel = displayName(bookParam);

  return (
    <Link
      to="/$book"
      params={{ book: bookParam }}
      aria-label={bookLabel}
      className={cn(
        "group relative flex aspect-[3/4] flex-col overflow-hidden rounded-[22px] transition duration-300 hover:-translate-y-1 active:scale-[0.98]",
        spotlight && "books-card-spotlight",
      )}
      style={{
        boxShadow: [`0 0 0 1px ${outerRing}`, liftShadow].join(", "),
      }}
    >
      {!artFailed ? (
        <img
          src={bibleBookIconPath(bookId)}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          onError={() => setArtFailed(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-3"
          style={{
            background: `linear-gradient(145deg, ${def.colorLight}33 0%, ${def.color}88 100%)`,
          }}
        >
          <span
            className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
            style={{ background: def.color }}
          >
            {def.categoryAr}
          </span>
          <BooksV2BookSymbol bookId={bookId} size={88} />
          <p className="mt-3 font-arabic-serif text-[13px] font-extrabold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
            {bookLabel}
          </p>
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${isOt ? BOOKS_PREMIUM.gold : BOOKS_PREMIUM.ntAccent}88, transparent)`,
        }}
      />
    </Link>
  );
}
