import { Link } from "@tanstack/react-router";
import { Clock, MoreHorizontal } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { BackButton } from "@/components/bible";
import { CopticWatermark } from "@/components/coptic";
import { displayName } from "@/lib/bible-books";
import { useCurrentSession, useRecentSessions, type ReadingSession } from "@/lib/reading-state";

function groupLabel(ms: number): string {
  const d = new Date(ms);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startYesterday = startToday - 86_400_000;
  if (ms >= startToday) return "اليوم";
  if (ms >= startYesterday) return "أمس";
  return d.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "short" });
}

function groupSessions(sessions: ReadingSession[]) {
  const map = new Map<string, ReadingSession[]>();
  for (const s of sessions) {
    const key = groupLabel(s.lastOpenedAt);
    const list = map.get(key) ?? [];
    list.push(s);
    map.set(key, list);
  }
  return [...map.entries()];
}

export function ReadingHistoryScreen() {
  const current = useCurrentSession();
  const recent = useRecentSessions();
  const merged = [
    ...(current ? [current] : []),
    ...recent.filter((r) => !(current && r.book === current.book && r.chapter === current.chapter)),
  ];
  const groups = groupSessions(merged);

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="flex items-center justify-between gap-2 py-3">
          <button
            type="button"
            aria-label="خيارات"
            className="alpha-chrome-btn grid h-9 w-9 place-items-center rounded-full"
          >
            <MoreHorizontal className="h-4 w-4 text-alpha-muted" />
          </button>
          <h1 className="font-arabic-serif text-[18px] font-extrabold text-alpha-heading">سجل التاريخ</h1>
          <BackButton to="/bible" compact tone="light" />
        </header>

        {groups.length === 0 ? (
          <p className="mt-16 text-center text-[14px] text-alpha-muted">لا يوجد سجل قراءة بعد</p>
        ) : (
          <div className="mt-4 space-y-5">
            {groups.map(([label, items]) => (
              <section key={label}>
                <h2 className="mb-2 text-[13px] font-extrabold text-alpha-heading">{label}</h2>
                <ul className="overflow-hidden rounded-[20px] border border-alpha/40 bg-white/80">
                  {items.map((item, i) => (
                    <li key={`${item.book}-${item.chapter}-${item.lastOpenedAt}`}>
                      <Link
                        to="/$book/$chapter"
                        params={{ book: item.book, chapter: String(item.chapter) }}
                        className={
                          "flex items-center gap-3 px-4 py-3.5 transition active:bg-white " +
                          (i < items.length - 1 ? "border-b border-alpha/20" : "")
                        }
                      >
                        <Clock className="h-4 w-4 shrink-0 text-alpha-muted" />
                        <div className="min-w-0 flex-1 text-right">
                          <p className="font-arabic-serif text-[15px] font-extrabold text-alpha-heading">
                            {displayName(item.bookName || item.book)} {item.chapter}
                            {item.verse ? `:${item.verse}` : ""}
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold text-alpha-muted">الكتاب المقدس</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <BottomDock />
    </div>
  );
}
