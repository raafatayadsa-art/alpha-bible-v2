/** Canonical asset roots — drop book art into `public/bible-icons/`. */
export const BIBLE_ICONS_ROOT = "/bible-icons";

export const BIBLE_ICON_PATHS = {
  books: `${BIBLE_ICONS_ROOT}/books`,
  categories: `${BIBLE_ICONS_ROOT}/categories`,
} as const;

/** Per-book icon: `/bible-icons/books/Matthew.webp` */
export function bibleBookIconPath(bookId: string, ext = "webp"): string {
  return `${BIBLE_ICON_PATHS.books}/${bookId}.${ext}`;
}

/** Per-category icon: `/bible-icons/categories/gospels/icon.webp` */
export function bibleCategoryIconPath(categorySlug: string, ext = "webp"): string {
  return `${BIBLE_ICON_PATHS.categories}/${categorySlug}/icon.${ext}`;
}

/** Global default when book + category assets are missing (optional file). */
export function bibleDefaultIconPath(ext = "webp"): string {
  return `${BIBLE_ICON_PATHS.categories}/default/icon.${ext}`;
}
