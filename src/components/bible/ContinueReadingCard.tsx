import { ChevronLeft, BookOpen } from "lucide-react";
import { Pressable, ProgressBar, IconBadge } from "./primitives";

export function ContinueReadingCard({
  book,
  chapter,
  verse,
  progress,
  to,
}: {
  book: string;
  chapter: number;
  verse?: number;
  progress: number;
  to?: string;
}) {
  return (
    <Pressable to={to} ariaLabel={`متابعة قراءة ${book}`} className="rounded-3xl">
      <div className="flex items-center gap-3 rounded-3xl bg-[#fbf3e1] border border-[#efe2c4] p-3 shadow-[0_10px_24px_-16px_rgba(120,80,30,0.35)]">
        <IconBadge tone="gold" size={52}>
          <BookOpen className="h-6 w-6" strokeWidth={1.8} />
        </IconBadge>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-[10.5px] font-bold text-[#b8893a] tracking-wide">متابعة القراءة</p>
          <h3 className="mt-0.5 truncate text-[14px] font-extrabold text-[#3a2a18]">{book}</h3>
          <p className="text-[11px] text-[#6a543a]">
            الإصحاح {chapter}
            {verse ? ` · الآية ${verse}` : ""}
          </p>
          <div className="mt-2">
            <ProgressBar value={progress} showLabel />
          </div>
        </div>
        <ChevronLeft className="h-5 w-5 text-[#b8893a] shrink-0" />
      </div>
    </Pressable>
  );
}
