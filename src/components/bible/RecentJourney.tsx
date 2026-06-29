import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { displayName } from "@/lib/bible-books";
import { useRecentSessions } from "@/lib/reading-state";
import { BookIcon } from "./BookIcon";
import { chapterWithNumber } from "@/lib/bible-labels";
import { cn } from "@/lib/utils";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "الآن";
  const m = Math.floor(s / 60);
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} ي`;
}

export function RecentJourney() {
  const recent = useRecentSessions();
  if (!recent || recent.length <= 1) return null;
  const items = recent.slice(1); // first is "Continue Reading"

  if (items.length === 0) return null;

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="alpha-type-h2 text-alpha-heading">رحلتك الأخيرة</h2>
        <Clock className="h-3.5 w-3.5 text-alpha-gold-deep" />
      </div>
      <div className="-mx-4 px-4 flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {items.map((r) => {
          const pct = Math.max(0, Math.min(100, Math.round(r.progressPercent)));
          return (
            <Link
              key={`${r.book}-${r.chapter}-${r.lastOpenedAt}`}
              to="/$book/$chapter"
              params={{ book: r.book, chapter: String(r.chapter) }}
              className={cn(
                "alpha-card-mini shrink-0 w-[170px] rounded-[var(--alpha-radius-dock-tab)] border border-alpha",
                "px-3 py-2.5 text-right",
                "active:scale-[0.97] alpha-motion-spring",
              )}
            >
              <div className="mb-2 h-10 w-10">
                <BookIcon book={r.book} className="h-full w-full" />
              </div>
              <p className="alpha-type-desc font-bold text-alpha-gold-deep">
                {timeAgo(r.lastOpenedAt)}
              </p>
              <h3 className="alpha-type-h2 mt-0.5 truncate font-arabic-serif text-alpha-heading">
                {displayName(r.bookName || r.book)}
              </h3>
              <p className="alpha-type-desc text-alpha-description">{chapterWithNumber(r.book, r.chapter)}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-alpha-progress-track overflow-hidden">
                  <div
                    className="alpha-progress-gold h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="alpha-type-caption font-bold text-alpha-gold-deep tabular-nums">{pct}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
