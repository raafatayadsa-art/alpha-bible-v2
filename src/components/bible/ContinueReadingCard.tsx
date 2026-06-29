import { BookOpen, ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Pressable, ProgressBar, GlassSurface } from "./primitives";
import { BookIcon } from "./BookIcon";
import { chapterWithNumber } from "@/lib/bible-labels";

export function ContinueReadingCard({
  book,
  bookParam,
  chapter,
  verse,
  progress,
  to,
}: {
  book: string;
  bookParam?: string;
  chapter: number;
  verse?: number;
  progress: number;
  to?: string;
}) {
  const hasReader = !!bookParam;
  const readerParams = hasReader ? { book: bookParam, chapter: String(chapter) } : undefined;

  return (
    <GlassSurface tone="warm" className="overflow-hidden p-0">
      <Pressable
        to={hasReader ? "/$book/$chapter" : to}
        params={readerParams}
        ariaLabel={`متابعة قراءة ${book}`}
        className="rounded-3xl"
      >
        <div className="flex items-center gap-3 p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--alpha-radius-button)] border border-alpha-subtle bg-alpha-surface alpha-media-polish">
            {bookParam ? (
              <BookIcon book={bookParam} className="h-full w-full p-1.5 alpha-media-polish" />
            ) : (
              <BookIcon className="h-full w-full p-1.5 alpha-media-polish" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="alpha-type-caption text-alpha-gold tracking-wide">أكمل حيث توقفت</p>
            <h3 className="alpha-type-h2 mt-0.5 truncate">{book}</h3>
            <p className="alpha-type-desc">
              {bookParam ? chapterWithNumber(bookParam, chapter) : `الإصحاح ${chapter}`}
              {verse ? ` • الآية ${verse}` : ""}
            </p>
            <div className="mt-2">
              <ProgressBar value={progress} showLabel tone="purple" />
            </div>
          </div>
          <ChevronLeft className="alpha-icon text-alpha-gold shrink-0" />
        </div>
      </Pressable>
      {hasReader && (
        <div className="border-t border-white/60 px-3 py-2.5">
          <Link
            to="/$book/$chapter"
            params={readerParams!}
            className="alpha-btn-secondary flex h-10 w-full alpha-motion-spring active:scale-[0.98] !min-h-0 !px-3 bg-gradient-to-br from-[#cdb8ef] to-[#6a4ab5] !text-white !border-transparent"
          >
            <BookOpen className="h-4 w-4" />
            استكمال القراءة
          </Link>
        </div>
      )}
    </GlassSurface>
  );
}
