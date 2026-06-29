import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { GlassSurface } from "./primitives";
import { BookIcon } from "./BookIcon";
import { chapterCountLabel } from "@/lib/bible-labels";
import { cn } from "@/lib/utils";

export function BookCard({
  name,
  chaptersCount,
  bookParam,
  defaultSaved,
  onToggleSave,
}: {
  name: string;
  chaptersCount?: number;
  bookParam: string;
  defaultSaved?: boolean;
  onToggleSave?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(!!defaultSaved);
  return (
    <div className="relative">
      <Link
        to="/$book"
        params={{ book: bookParam }}
        aria-label={name}
        className="block rounded-[var(--alpha-radius-card)] alpha-motion-standard active:scale-[0.96] focus:outline-none"
      >
        <GlassSurface tone="ivory" className="overflow-hidden p-0 text-center">
          <div className="relative px-2 pt-3 pb-2.5">
            <div className="mx-auto h-[72px] w-[72px] alpha-media-polish">
              <BookIcon book={bookParam} className="h-full w-full alpha-media-polish" />
            </div>
            <h3 className="alpha-type-caption mt-2 font-extrabold text-alpha-primary leading-tight line-clamp-2 min-h-[2rem]">
              {name}
            </h3>
            {chaptersCount != null && (
              <p className="alpha-type-caption mt-1 text-alpha-description tabular-nums">
                {chapterCountLabel(bookParam, chaptersCount)}
              </p>
            )}
          </div>
        </GlassSurface>
      </Link>

      <button
        type="button"
        aria-label={saved ? "إزالة من المحفوظات" : "حفظ السفر"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const next = !saved;
          setSaved(next);
          onToggleSave?.(next);
        }}
        className={cn(
          "absolute top-2.5 left-2.5 grid h-7 w-7 place-items-center rounded-full border backdrop-blur-sm active:scale-90 transition-transform",
          saved
            ? "bg-[#fff1c7]/90 border-[#e7c97a] text-[#7a4a26]"
            : "bg-white/75 border-[#efe2c4] text-[#7a4a26]",
        )}
      >
        {saved ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export function BookDetailHero({
  book,
  name,
  description,
  chaptersCount,
}: {
  book: string;
  name: string;
  description: string;
  chaptersCount: number;
}) {
  return (
    <div className="relative overflow-hidden alpha-card-hero !p-0">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,241,199,0.4) 0%, rgba(60,40,20,0.85) 55%, rgba(30,20,12,0.95) 100%)",
        }}
      />
      <div className="relative flex flex-col items-center px-5 pt-6 pb-5 text-center">
        <div className="h-[140px] w-[140px] drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] alpha-media-polish">
          <BookIcon book={book} className="h-full w-full alpha-media-polish" />
        </div>
        <h1 className="alpha-type-h1 mt-4 font-arabic-serif !text-white leading-tight">
          {name}
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-px w-10 bg-alpha-gold/60" />
          <span className="text-alpha-gold alpha-type-caption">✦</span>
          <span className="h-px w-10 bg-alpha-gold/60" />
        </div>
        <p className="alpha-type-body mt-2 !text-white/85 leading-relaxed max-w-[280px]">
          {description}
        </p>
        <p className="alpha-tag mt-3 !bg-white/15 !border !border-white/25 !text-[#f7e1ad] backdrop-blur-sm">
          {chaptersCount} إصحاح
        </p>
      </div>
    </div>
  );
}
