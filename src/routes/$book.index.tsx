import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid3x3, List as ListIcon, ChevronLeft } from "lucide-react";
import { chaptersQueryOptions } from "@/lib/bible";
import { displayName } from "@/lib/bible-books";
import { BackButton, BottomDock, ChapterGridSkeleton, SectionHeader } from "@/components/bible";
import { useCurrentSession, useRecentSessions } from "@/lib/reading-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$book/")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${params.book} — الكتاب المقدس` },
      { name: "description", content: `اختر إصحاحًا من سفر ${params.book}.` },
    ],
  }),
  component: ChaptersPage,
});

type Mode = "grid" | "list";

const MODE_KEY = "ab:chapter:view-mode";

function ChaptersPage() {
  const { book } = Route.useParams();
  const { data: chapters, isLoading, error } = useQuery(chaptersQueryOptions(book));
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "grid";
    try {
      const v = window.localStorage.getItem(MODE_KEY);
      return v === "list" || v === "grid" ? v : "grid";
    } catch {
      return "grid";
    }
  });
  const setModePersist = (m: Mode) => {
    setMode(m);
    try { window.localStorage.setItem(MODE_KEY, m); } catch { /* ignore */ }
  };
  const current = useCurrentSession();
  const recent = useRecentSessions();

  const lastRead = current && current.book === book ? current.chapter : undefined;
  const progressMap = useMemo(() => {
    const m: Record<number, number> = {};
    for (const r of recent) {
      if (r.book === book) m[r.chapter] = Math.round(r.progressPercent);
    }
    return m;
  }, [recent, book]);


  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.55), transparent 60%)," +
            "radial-gradient(70% 60% at 0% 80%, rgba(214,168,98,0.18), transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-36">
        <header className="flex items-center justify-between gap-2 pt-2">
          <BackButton to="/books" />
          <h1 className="font-arabic-serif text-[17px] font-bold text-[#3a2a18] truncate">
            {displayName(book)}
          </h1>
          <span className="w-[68px]" aria-hidden />
        </header>

        <div className="mt-4 flex items-center justify-between gap-3">
          <SectionHeader
            title="الإصحاحات"
            caption={chapters ? `${chapters.length} إصحاح` : undefined}
          />
          <SegmentedToggle mode={mode} onChange={setModePersist} />
        </div>


        {isLoading && <div className="mt-1"><ChapterGridSkeleton count={20} /></div>}
        {error && (
          <p className="text-center text-[12px] text-red-700/80">
            تعذّر التحميل: {(error as Error).message}
          </p>
        )}
        {!isLoading && !error && chapters && chapters.length === 0 && (
          <p className="text-center text-[12px] text-[#6a543a]">لا توجد إصحاحات.</p>
        )}

        {chapters && chapters.length > 0 && (
          <div className="mt-1 animate-in fade-in duration-200">
            {mode === "grid" ? (
              <ul className="grid grid-cols-5 gap-2.5">
                {chapters.map((c) => {
                  const isLast = c === lastRead;
                  return (
                    <li key={c}>
                      <Link
                        to="/$book/$chapter"
                        params={{ book, chapter: String(c) }}
                        className={cn(
                          "relative grid aspect-square place-items-center rounded-2xl border font-arabic-serif text-[16px] font-bold transition-all active:scale-95",
                          isLast
                            ? "bg-gradient-to-br from-[#fff1c7] to-[#e7c07a] border-transparent text-[#7a4a26] shadow-[0_8px_18px_-10px_rgba(120,80,20,0.5),inset_0_1px_0_rgba(255,255,255,0.7)]"
                            : "bg-[#fbf3e1]/85 border-[#efe2c4] text-[#3a2a18] shadow-[0_6px_14px_-12px_rgba(120,80,30,0.30)]",
                        )}
                      >
                        {c}
                        {isLast && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#d96b2a] ring-2 ring-[#f4ead8]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="space-y-2">
                {chapters.map((c) => {
                  const isLast = c === lastRead;
                  const pct = progressMap[c] ?? 0;
                  return (
                    <li key={c}>
                      <Link
                        to="/$book/$chapter"
                        params={{ book, chapter: String(c) }}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-transform active:scale-[0.98]",
                          isLast
                            ? "bg-gradient-to-br from-[#fff8e9] to-[#f5e7c2] border-[#efe2c4]"
                            : "bg-[#fbf3e1]/85 border-[#efe2c4]",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-10 w-10 place-items-center rounded-xl font-arabic-serif text-[15px] font-extrabold",
                            isLast
                              ? "bg-gradient-to-br from-[#e7c97a] to-[#a87a35] text-white"
                              : "bg-white text-[#3a2a18] border border-[#efe2c4]",
                          )}
                        >
                          {c}
                        </span>
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-extrabold text-[#3a2a18]">
                              الإصحاح {c}
                            </p>
                            {isLast && (
                              <span className="text-[9px] font-bold text-[#d96b2a]">
                                • آخر قراءة
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1 flex-1 rounded-full bg-[#ecdcb6] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#e7c97a] via-[#c79356] to-[#7a4a26] transition-[width] duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-[#7a4a26] tabular-nums min-w-[28px]">
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <ChevronLeft className="h-4 w-4 text-[#b8893a] shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <BottomDock />
    </main>
  );
}

function SegmentedToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      role="tablist"
      aria-label="عرض الإصحاحات"
      className="relative flex items-center gap-0.5 rounded-full border border-[#efe2c4] bg-white/70 p-0.5 shadow-[0_6px_14px_-12px_rgba(120,80,30,0.3)]"
    >
      {(["grid", "list"] as const).map((m) => {
        const active = mode === m;
        const Icon = m === "grid" ? Grid3x3 : ListIcon;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={m === "grid" ? "شبكة" : "قائمة"}
            onClick={() => onChange(m)}
            className={cn(
              "relative grid h-7 w-9 place-items-center rounded-full transition-all duration-200",
              active
                ? "bg-gradient-to-br from-[#e7c97a] to-[#a87a35] text-white shadow-[0_4px_10px_-4px_rgba(120,80,20,0.5)]"
                : "text-[#7a4a26]",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        );
      })}
    </div>
  );
}
