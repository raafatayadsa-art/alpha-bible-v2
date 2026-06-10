import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { resolveBookId, type BibleBookId } from "@/lib/bible-icons";
import { getBookSymbolDef } from "@/lib/bible-icons/book-symbol-registry";
import { displayName } from "@/lib/bible-books";
import { BooksV2BookSymbol } from "./BooksV2BookSymbol";

export function BooksV2BookCard({
  bookParam,
  orderLabel,
}: {
  bookParam: string;
  orderLabel: string;
}) {
  const bookId = (resolveBookId(bookParam) ?? bookParam) as BibleBookId;
  const def = getBookSymbolDef(bookId);

  return (
    <Link
      to="/$book"
      params={{ book: bookParam }}
      className="group flex items-center gap-2.5 overflow-hidden rounded-[18px] border border-white/80 bg-white/88 py-2.5 pl-2 pr-3 shadow-[0_8px_22px_-12px_rgba(120,90,40,0.22)] backdrop-blur-md transition active:scale-[0.98] hover:-translate-y-0.5"
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 24px -12px rgba(70,55,30,0.14)",
      }}
    >
      <div
        aria-hidden
        className="w-1 shrink-0 self-stretch rounded-full"
        style={{ background: `linear-gradient(180deg, ${def.colorLight}, ${def.color})` }}
      />
      <BooksV2BookSymbol bookId={bookId} size={48} showBadge badgeText={orderLabel} />
      <div className="min-w-0 flex-1 text-right">
        <h3 className="truncate text-[13px] font-extrabold leading-tight" style={{ color: def.color }}>
          {displayName(bookParam)}
        </h3>
        <p className="mt-0.5 text-[10px] font-semibold text-[#8a7355]">{def.categoryAr}</p>
      </div>
      <ChevronLeft className="h-4 w-4 shrink-0 text-[#b8a888] transition group-hover:text-[#7a5a18]" />
    </Link>
  );
}
