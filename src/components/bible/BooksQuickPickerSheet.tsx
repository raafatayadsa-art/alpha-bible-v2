import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History, X } from "lucide-react";
import { createPortal } from "react-dom";
import { booksQueryOptions } from "@/lib/bible";
import { displayName, groupBooks } from "@/lib/bible-books";
import { cn } from "@/lib/utils";

type SortMode = "traditional" | "alpha";

type Props = {
  open: boolean;
  onClose: () => void;
  testament: "old" | "new";
  currentBook?: string;
  currentChapter?: number;
  onOpenHistory?: () => void;
};

export function BooksQuickPickerSheet({
  open,
  onClose,
  testament,
  currentBook,
  currentChapter = 1,
  onOpenHistory,
}: Props) {
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortMode>("traditional");
  const { data: books } = useQuery(booksQueryOptions());

  const list = useMemo(() => {
    if (!books) return [];
    const grouped = groupBooks(books);
    const raw = testament === "old" ? grouped.old : grouped.neu;
    const sorted =
      sort === "alpha"
        ? [...raw].sort((a, b) => displayName(a).localeCompare(displayName(b), "ar"))
        : raw;
    return sorted;
  }, [books, testament, sort]);

  if (!open || typeof document === "undefined") return null;

  const pickBook = (book: string) => {
    onClose();
    void navigate({
      to: "/$book/$chapter",
      params: { book, chapter: String(book === currentBook ? currentChapter : 1) },
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[95] flex flex-col justify-end" dir="rtl">
      <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative z-10 flex max-h-[78vh] flex-col overflow-hidden rounded-t-[26px] border-t border-alpha/40 bg-[var(--alpha-bg-elevated)] shadow-[0_-16px_48px_-12px_rgba(0,0,0,0.35)]">
        <div className="flex justify-center pt-2.5 pb-1" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-alpha-gold-deep/35" />
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-alpha/25 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full border border-alpha/35 bg-white/80 text-alpha-muted active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-arabic-serif text-[17px] font-extrabold text-alpha-heading">الأسفار</h2>
          <button
            type="button"
            aria-label="سجل التاريخ"
            onClick={() => {
              onClose();
              onOpenHistory?.();
            }}
            className="grid h-9 w-9 place-items-center rounded-full border border-alpha/35 bg-white/80 text-alpha-muted active:scale-95"
          >
            <History className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {list.map((book) => (
            <button
              key={book}
              type="button"
              onClick={() => pickBook(book)}
              className={cn(
                "flex w-full items-center justify-end rounded-xl px-4 py-3.5 text-right font-arabic-serif text-[16px] font-bold transition active:bg-white/80",
                book === currentBook ? "bg-white/90 text-alpha-gold-deep" : "text-alpha-heading",
              )}
            >
              {displayName(book)}
            </button>
          ))}
        </div>

        <div className="border-t border-alpha/25 px-4 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">
          <div className="flex rounded-full border border-alpha/35 bg-white/60 p-1">
            <button
              type="button"
              onClick={() => setSort("traditional")}
              className={cn(
                "flex-1 rounded-full py-2 text-[12px] font-extrabold transition",
                sort === "traditional" ? "bg-white text-alpha-heading shadow-sm" : "text-alpha-muted",
              )}
            >
              تقليدي
            </button>
            <button
              type="button"
              onClick={() => setSort("alpha")}
              className={cn(
                "flex-1 rounded-full py-2 text-[12px] font-extrabold transition",
                sort === "alpha" ? "bg-white text-alpha-heading shadow-sm" : "text-alpha-muted",
              )}
            >
              أبجدي
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
