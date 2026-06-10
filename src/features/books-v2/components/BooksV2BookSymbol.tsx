import type { BibleBookId } from "@/lib/bible-icons";
import { getBookSymbolDef } from "@/lib/bible-icons/book-symbol-registry";
import { SYMBOL_PATHS } from "@/lib/bible-icons/symbol-paths";
import { bibleBookIconPath } from "@/lib/bible-icons/paths";
import { useState } from "react";

export function BooksV2BookSymbol({
  bookId,
  size = 52,
  showBadge,
  badgeText,
}: {
  bookId: BibleBookId;
  size?: number;
  showBadge?: boolean;
  badgeText?: string;
}) {
  const def = getBookSymbolDef(bookId);
  const paths = SYMBOL_PATHS[def.symbol] ?? SYMBOL_PATHS.scroll;
  const [useSvg, setUseSvg] = useState(false);
  const src = bibleBookIconPath(bookId);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {!useSvg ? (
        <img
          src={src}
          alt=""
          draggable={false}
          className="h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.22)]"
          onError={() => setUseSvg(true)}
        />
      ) : (
        <svg viewBox="0 0 52 52" className="h-full w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.22)]">
          <defs>
            <radialGradient id={`g-${bookId}`} cx="32%" cy="28%" r="72%">
              <stop offset="0%" stopColor={def.colorLight} />
              <stop offset="55%" stopColor={def.color} />
              <stop offset="100%" stopColor={def.color} />
            </radialGradient>
          </defs>
          <circle cx="26" cy="26" r="24" fill={`url(#g-${bookId})`} />
          <g
            transform="translate(26 26) scale(1.75) translate(-12 -12)"
            fill="#fff"
            opacity={0.95}
            dangerouslySetInnerHTML={{ __html: paths }}
          />
        </svg>
      )}
      {showBadge && badgeText ? (
        <span
          className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[9px] font-bold text-white"
          style={{
            background: def.color,
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          {badgeText}
        </span>
      ) : null}
    </div>
  );
}
