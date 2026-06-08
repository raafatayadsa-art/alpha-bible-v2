import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, CalendarDays, Pin, RotateCcw } from "lucide-react";
import { POST_TYPE_META } from "@/data/church-posts";
import {
  useCanManagePosts, isPinned,
} from "@/features/church/post-store";
import { patchChurchPost } from "@/features/church/church-posts-api";
import { useChurchDashboard } from "@/features/church/use-church-dashboard";
import { useChurchPosts } from "@/features/church/use-church-posts";
import { PostImage } from "@/features/church/PostImage";

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
  const { data } = useChurchDashboard();
  const { posts: items, loading } = useChurchPosts(data?.church.id, { archived: true });
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
        {loading ? (
          <p className="mt-10 text-center text-[12.5px] text-[#7a5a30]">جاري التحميل…</p>
        ) : items.length === 0 ? (
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
                    <PostImage post={p} alt="" className="absolute inset-0 h-full w-full object-cover" />
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
                    </div>
                    <h3 className="mt-1 text-[13.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[10.5px] text-[#6a543a]">
                      <CalendarDays className="h-3 w-3 text-[#b8893a]" />
                      {p.date}
                    </p>
                  </div>
                </Link>
                {canManage ? (
                  <div className="border-t border-[#efe2c4]/70 px-3 py-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void patchChurchPost(p.id, { archived: false, expiresAt: null })}
                      className="inline-flex items-center gap-1 rounded-full bg-white/85 border border-[#efe2c4] px-3 py-1.5 text-[11px] font-extrabold text-[#3a2a18] active:scale-95"
                    >
                      <RotateCcw className="h-3 w-3" />
                      استعادة
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
