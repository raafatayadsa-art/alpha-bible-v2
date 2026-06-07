import type { BibleBookId, BibleIconCategory, BibleTestamentCategory } from "./BibleBookIcons";

export type BibleBookIconEntry = {
  bookId: BibleBookId;
  /** Primary Arabic display name */
  bookName: string;
  /** English canonical id (same as bookId) */
  bookNameEn: string;
  iconPath: string;
  /** Specific category fallback; null → testament category only */
  category: BibleIconCategory | null;
  /** Old / New testament grouping */
  testament: BibleTestamentCategory;
};

export type ResolvedBibleBookIcon = BibleBookIconEntry & {
  /** Ordered fallback image URLs (book → category → testament → optional global default) */
  fallbackSources: string[];
};

export type ResolveBibleBookIconOptions = {
  /** Preferred image extension when probing assets */
  ext?: string;
};
