import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { displayName } from "@/lib/bible-books";
import { useRecentSessions } from "@/lib/reading-state";
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
        <h2 className="text-[14px] font-extrabold text-[#3a2a18]">رحلتك الأخيرة</h2>
        <Clock className="h-3.5 w-3.5 text-[#b8893a]" />
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
                "shrink-0 w-[170px] rounded-2xl border border-[#efe2c4]",
                "bg-[#fbf3e1]/90 px-3 py-2.5 text-right",
                "shadow-[0_8px_18px_-14px_rgba(120,80,30,0.4)]",
                "active:scale-[0.97] transition-transform",
              )}
            >
              <p className="text-[10.5px] font-bold text-[#b8893a]">
                {timeAgo(r.lastOpenedAt)}
              </p>
              <h3 className="mt-0.5 truncate font-arabic-serif text-[13px] font-extrabold text-[#3a2a18]">
                {displayName(r.bookName || r.book)}
              </h3>
              <p className="text-[11px] text-[#6a543a]">الإصحاح {r.chapter}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-[#ecdcb6] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e7c97a] via-[#c79356] to-[#7a4a26]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[9.5px] font-bold text-[#7a4a26] tabular-nums">{pct}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
