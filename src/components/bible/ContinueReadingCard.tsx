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
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            {bookParam ? (
              <BookIcon book={bookParam} className="h-full w-full p-1.5" />
            ) : (
              <BookIcon className="h-full w-full p-1.5" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] font-bold text-[#b8893a] tracking-wide">أكمل حيث توقفت</p>
            <h3 className="mt-0.5 truncate text-[14px] font-extrabold text-[#3a2a18]">{book}</h3>
            <p className="text-[11px] text-[#6a543a]">
              {bookParam ? chapterWithNumber(bookParam, chapter) : `الإصحاح ${chapter}`}
              {verse ? ` • الآية ${verse}` : ""}
            </p>
            <div className="mt-2">
              <ProgressBar value={progress} showLabel tone="purple" />
            </div>
          </div>
          <ChevronLeft className="h-5 w-5 text-[#b8893a] shrink-0" />
        </div>
      </Pressable>
      {hasReader && (
        <div className="border-t border-white/60 px-3 py-2.5">
          <Link
            to="/$book/$chapter"
            params={readerParams!}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#cdb8ef] to-[#6a4ab5] text-[12.5px] font-extrabold text-white shadow-[0_10px_22px_-12px_rgba(106,74,181,0.55)] active:scale-[0.98] transition-transform"
          >
            <BookOpen className="h-4 w-4" />
            استكمال القراءة
          </Link>
        </div>
      )}
    </GlassSurface>
  );
}
