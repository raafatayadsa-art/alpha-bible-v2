import { useEffect, useMemo, useState } from "react";
import {
  resolveBibleBookIcon,
  resolveBibleBookIconFromBookId,
  type BibleBookId,
} from "@/lib/bible-icons";
import { DefaultBibleIcon } from "./DefaultBibleIcon";
import { cn } from "@/lib/utils";

export type BookIconProps = {
  /** Canonical English book id, e.g. `"Matthew"` */
  bookId?: BibleBookId | string;
  /** Arabic DB name, route slug, or alias — used when `bookId` is omitted */
  book?: string;
  className?: string;
  imgClassName?: string;
  alt?: string;
  size?: number;
  /** Image extension to probe (`webp` by default) */
  ext?: string;
};

/**
 * Unified Bible book icon.
 * Cascade: book asset → category asset → testament asset → optional global default → inline SVG.
 */
export function BookIcon({
  bookId,
  book,
  className,
  imgClassName,
  alt,
  size,
  ext = "webp",
}: BookIconProps) {
  const resolved = useMemo(() => {
    if (bookId && typeof bookId === "string") {
      try {
        return resolveBibleBookIconFromBookId(bookId as BibleBookId, ext);
      } catch {
        return resolveBibleBookIcon(bookId, ext);
      }
    }
    if (book) return resolveBibleBookIcon(book, ext);
    return resolveBibleBookIcon("", ext);
  }, [bookId, book, ext]);

  const sources = resolved.fallbackSources;
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [resolved.bookId, sources.join("|")]);

  const label = alt ?? resolved.bookName;
  const currentSrc = sources[sourceIndex];
  const useSvg = !currentSrc || sourceIndex >= sources.length;

  if (useSvg) {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <DefaultBibleIcon label={label} size={size} />
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden", className)}>
      <img
        key={currentSrc}
        src={currentSrc}
        alt={label}
        draggable={false}
        className={cn("h-full w-full object-contain", imgClassName)}
        style={size ? { width: size, height: size } : undefined}
        onError={() => setSourceIndex((i) => i + 1)}
      />
    </div>
  );
}

/** @deprecated Use `BookIcon` — kept for existing imports */
export function BookSymbol({
  book,
  bookId,
  className,
}: {
  book?: string;
  bookId?: BibleBookId | string;
  className?: string;
}) {
  return <BookIcon book={book} bookId={bookId} className={className} />;
}
