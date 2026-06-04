import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Bookmark, BookOpen } from "lucide-react";
import {
  AGPEYA_PRAYERS,
  AgpeyaEmpty,
  CopticCross,
  useSavedAgpeya,
} from "@/features/agpeya";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";

export const Route = createFileRoute("/agpeya/saved")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الصلوات المحفوظة" },
      { name: "description", content: "صلواتك المحفوظة من الأجبية." },
    ],
  }),
  component: SavedAgpeya,
});

function SavedAgpeya() {
  const { saved, toggle } = useSavedAgpeya();
  const prayers = saved
    .map((id) => AGPEYA_PRAYERS.find((p) => p.id === id))
    .filter((p): p is (typeof AGPEYA_PRAYERS)[number] => Boolean(p));

  return (
    <div dir="rtl" className="relative min-h-dvh bg-[#faf8f3] pb-32">
      <CopticWatermark />
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#c79356]/25 bg-[#fbf3e1]/85">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 py-3">
          <Link
            to="/agpeya"
            aria-label="رجوع للأجبية"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-[#c79356]/35 text-[#8a5a1f] active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 -scale-x-100" />
          </Link>
          <div className="text-center">
            <h1 className="font-arabic-serif text-[17px] font-extrabold text-[#5b3a18]">
              المحفوظات
            </h1>
            <p className="text-[11px] text-[#8a5a1f]">صلواتك من الأجبية</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-[#c79356]/35 text-[#c79356]">
            <Bookmark className="h-4 w-4 fill-current" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-4 pt-6">
        {prayers.length === 0 ? (
          <AgpeyaEmpty
            icon={Bookmark}
            title="لا توجد صلوات محفوظة"
            subtitle="اضغط على أيقونة الحفظ داخل أي صلاة لإضافتها هنا للوصول السريع لاحقاً."
            cta={{ label: "تصفح الصلوات", to: "/agpeya" }}
          />
        ) : (
          <ul className="space-y-3">
            {prayers.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-[#c79356]/30 bg-white/75 backdrop-blur-md px-4 py-3 shadow-[0_8px_18px_-14px_rgba(120,80,30,0.4)]"
              >
                <Link
                  to="/agpeya/$prayerId"
                  params={{ prayerId: p.id }}
                  className="flex flex-1 items-center gap-3 min-w-0 active:scale-[0.98] transition-transform"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#fff3d0] to-[#f3d9a5] border border-[#c79356]/35 text-[#c79356]">
                    <CopticCross className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-right">
                    <div className="font-arabic-serif truncate text-[15px] font-bold text-[#5b3a18]">
                      {p.title}
                    </div>
                    {p.subtitle && (
                      <div className="truncate text-[11.5px] text-[#8a5a1f]">{p.subtitle}</div>
                    )}
                  </div>
                  <BookOpen className="h-4 w-4 text-[#8a5a1f]" />
                </Link>
                <button
                  type="button"
                  aria-label="إلغاء الحفظ"
                  onClick={() => toggle(p.id)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#c79356]/35 bg-white/80 text-[#c79356] active:scale-95"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomDock />
    </div>
  );
}
