import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, CalendarDays, Pin, RotateCcw } from "lucide-react";
import { POST_TYPE_META } from "@/data/church-posts";
import {
  useArchivedPosts, useCanManagePosts, restorePost, isPinned,
} from "@/features/church/post-store";

export const Route = createFileRoute("/church/archive")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — أرشيف المنشورات" },
      { name: "description", content: "المنشورات المنتهية والمؤرشفة." },
    ],
  }),
  component: ChurchArchive,
});

function ChurchArchive() {
  const items = useArchivedPosts();
  const canManage = useCanManagePosts();

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4ead8]">
      <header
        className="sticky top-0 z-20 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,234,216,0.95) 0%, rgba(244,234,216,0.6) 70%, rgba(244,234,216,0) 100%)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" />
          </Link>
          <h1 className="text-[15px] font-extrabold text-[#3a2a18]">أرشيف المنشورات</h1>
          <span className="w-10" />
        </div>
      </header>

      <main className="px-4 py-3 space-y-3">
        {items.length === 0 ? (
          <p className="mt-10 text-center text-[12.5px] text-[#7a5a30]">
            لا توجد منشورات منتهية أو مؤرشفة بعد.
          </p>
        ) : (
          items.map((p) => {
            const meta = POST_TYPE_META[p.type];
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-3xl border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl shadow-[0_14px_30px_-20px_rgba(120,80,30,0.4)]"
              >
                <Link
                  to="/church/post/$id"
                  params={{ id: p.id }}
                  className="flex gap-3 p-2.5 active:scale-[0.99] transition-transform"
                >
                  <div className="relative h-[78px] w-[88px] shrink-0 overflow-hidden rounded-2xl">
                    <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    {isPinned(p) ? (
                      <span className="absolute top-1 right-1 grid place-items-center h-5 w-5 rounded-full bg-[#b8893a] text-white border border-white/50">
                        <Pin className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white border border-white/30"
                        style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}cc)` }}
                      >
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#6a543a]/15 text-[#6a543a] px-2 py-0.5 text-[9.5px] font-extrabold">
                        منتهي
                      </span>
                    </div>
                    <h4 className="mt-1 text-[13.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-2">
                      {p.title}
                    </h4>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[10.5px] text-[#6a543a]">
                      <CalendarDays className="h-3 w-3 text-[#b8893a]" />
                      {p.date}
                    </p>
                  </div>
                </Link>
                {canManage ? (
                  <div className="px-3 pb-3">
                    <button
                      type="button"
                      onClick={() => restorePost(p.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-white/95 border border-[#efe2c4] text-[#3a2a18] text-[11.5px] font-extrabold py-2 active:scale-[0.97]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      استعادة المنشور
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
        <div className="h-[env(safe-area-inset-bottom,20px)]" />
      </main>
    </div>
  );
}
