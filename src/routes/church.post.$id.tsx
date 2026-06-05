import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, CalendarDays, Share2, Pin, Pencil, Trash2, User } from "lucide-react";
import { CopticWatermark } from "@/components/coptic";
import { getChurchPost, POST_TYPE_META } from "@/data/church-posts";

export const Route = createFileRoute("/church/post/$id")({
  ssr: false,
  head: () => ({
    meta: [{ title: "ألفا — منشور الكنيسة" }],
  }),
  component: ChurchPostScreen,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-[#f4ead8] text-[#3a2a18] font-bold">
      المنشور غير موجود
    </div>
  ),
});

function ChurchPostScreen() {
  const { id } = useParams({ from: "/church/post/$id" });
  const post = getChurchPost(id);

  if (!post) {
    return (
      <main dir="rtl" className="min-h-screen w-full bg-[#f4ead8] grid place-items-center text-[#3a2a18]">
        <div className="text-center">
          <p className="font-extrabold mb-3">لم يتم العثور على المنشور</p>
          <Link to="/church" className="text-[#b8893a] font-bold">العودة لمنشورات الكنيسة</Link>
        </div>
      </main>
    );
  }

  const meta = POST_TYPE_META[post.type];

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.6), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.18), transparent 65%)",
        }}
      />
      <CopticWatermark />

      {/* Hero image with sticky header overlay */}
      <div className="relative">
        <div className="relative h-[300px] w-full">
          <img src={post.image} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0603]/55 via-transparent to-[#f4ead8]" />
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 px-4 pt-[max(env(safe-area-inset-top),14px)]">
          <div className="flex items-center justify-between">
            <Link
              to="/church"
              aria-label="رجوع"
              className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-md border border-white/70 text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)]"
            >
              <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
            </Link>
            <button
              type="button"
              aria-label="مشاركة"
              className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-md border border-white/70 text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)]"
            >
              <Share2 className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Floating category + pin */}
        <div className="absolute bottom-6 right-4 left-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center rounded-full font-extrabold text-white px-3 py-1 text-[11px] border border-white/30 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.5)]"
              style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}cc)` }}
            >
              {meta.label}
            </span>
            {post.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#b8893a] px-2.5 py-1 text-[10px] font-extrabold text-white border border-white/40 shadow">
                <Pin className="h-3 w-3" strokeWidth={2.8} /> مثبت
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body card */}
      <div className="relative mx-auto w-full max-w-[440px] px-4 -mt-6 pb-[calc(env(safe-area-inset-bottom,0px)+40px)]">
        <article className="relative rounded-[28px] border border-white/70 bg-[#fbf3e1]/95 backdrop-blur-xl p-5 shadow-[0_24px_50px_-26px_rgba(60,40,16,0.55),inset_0_1px_0_rgba(255,255,255,0.8)]">
          <h1 className="font-arabic-serif text-[22px] font-extrabold text-[#3a2a18] leading-snug text-right">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 justify-end text-[11.5px] text-[#6a543a]">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#b8893a]" />
              {post.author}
            </span>
            <span className="text-[#c79356]">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[#b8893a]" />
              {post.date}
            </span>
          </div>

          {/* Coptic gold divider */}
          <div className="flex items-center gap-2 justify-center my-4" aria-hidden>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c79356]/60 to-transparent" />
            <span className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#c79356]" />
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c79356]/60 to-transparent" />
          </div>

          <p className="text-right text-[14px] leading-[1.9] text-[#3a2a18] whitespace-pre-line">
            {post.body}
          </p>

          {/* Servants/Priests admin actions (UI only — requires backend) */}
          <div className="mt-6 pt-4 border-t border-[#efe2c4]">
            <p className="text-[10.5px] font-bold text-[#b8893a] tracking-wide mb-2 text-right">
              إجراءات الكهنة والخدام
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <AdminBtn icon={Pin} label={post.pinned ? "إلغاء التثبيت" : "تثبيت"} tone="#b8893a" />
              <AdminBtn icon={Pencil} label="تعديل" tone="#5b8fd1" />
              <AdminBtn icon={Trash2} label="حذف" tone="#a85450" />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

function AdminBtn({ icon: Icon, label, tone }: { icon: any; label: string; tone: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-10px_rgba(0,0,0,0.25)] active:scale-95 transition-transform"
      style={{ color: tone }}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      {label}
    </button>
  );
}
