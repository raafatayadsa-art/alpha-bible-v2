import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Search, BookOpen, Calendar, Moon, BellRing, ChevronLeft, Plus, Star, Cross, Fish, Church } from "lucide-react";
import { useState, type ReactNode } from "react";
import { FEASTS, CATEGORIES, getTodayFeast, type FeastCategory } from "@/features/feasts";
import { BottomDock } from "@/components/bible/BottomDock";
import { GlassSurface } from "@/components/bible/primitives";
import { CopticCross, CopticWatermark, CopticSeparator } from "@/components/coptic";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, ReactNode> = {
  all: <Calendar className="h-3.5 w-3.5" />,
  feast: <Church className="h-3.5 w-3.5" />,
  fast: <Fish className="h-3.5 w-3.5" />,
  saint: <Cross className="h-3.5 w-3.5" />,
  occasion: <Star className="h-3.5 w-3.5" />,
};

export const Route = createFileRoute("/feasts/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الأعياد والمناسبات" },
      { name: "description", content: "تعرّف على الأعياد والمواسم الكنسية." },
    ],
  }),
  component: FeastsHome,
});

const ACCENT_COLORS: Record<string, string> = {
  purple: "#6a4ab5",
  gold: "#b8893a",
  green: "#3e7a55",
  blue: "#3a6a9b",
};

function FeastsHome() {
  const [active, setActive] = useState<FeastCategory | "all">("all");
  const today = getTodayFeast();
  const list = active === "all" ? FEASTS : FEASTS.filter((f) => f.category === active);

  return (
    <div dir="rtl" className="relative min-h-dvh bg-[#faf3e3]">
      <CopticWatermark />

      {/* Header */}
      <header
        className="relative z-10 mx-auto w-full max-w-[430px] px-4 flex items-center justify-between"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: 8 }}
      >
        <button className="relative grid h-10 w-10 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#6a4ab5]" />
        </button>
        <div className="flex flex-col items-center -mt-1">
          <CopticCross className="text-[#b8893a]" size={18} />
          <h1 className="font-arabic-serif text-[20px] font-extrabold text-[#3a2a18] leading-tight">
            الأعياد والمناسبات
          </h1>
          <p className="text-[10.5px] text-[#6a543a] -mt-0.5">تعرف على الأعياد والمواسم الكنسية</p>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]">
          <Search className="h-4 w-4" />
        </button>
      </header>

      <main
        className="relative z-10 mx-auto w-full max-w-[430px] px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 110px)" }}
      >
        {/* Filter chips */}
        <div className="mt-2 -mx-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-1 py-1">
            {CATEGORIES.map((c) => {
              const isActive = c.id === active;
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 h-9 text-[12px] font-bold whitespace-nowrap border transition-all active:scale-95",
                    isActive
                      ? "bg-gradient-to-l from-[#6a4ab5] to-[#8c6fd1] text-white border-transparent shadow-[0_6px_14px_-6px_rgba(106,74,181,0.55)]"
                      : "bg-white text-[#3a2a18] border-[#ead9b1] shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]",
                  )}
                >
                  {c.label}
                  {CATEGORY_ICONS[c.id]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today hero */}
        <Link to="/feasts/$eventId" params={{ eventId: today.id }} className="block mt-3 active:scale-[0.99] transition-transform">
          <GlassSurface className="overflow-hidden p-0 bg-white border-[#ead9b1] shadow-[0_18px_40px_-22px_rgba(120,80,30,0.55)]">
            <div className="relative h-[200px]">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${today.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/55 to-transparent" />
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#3a2a18] border border-[#ead9b1] shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6a4ab5]" />
                اليوم
              </div>
              <div className="absolute inset-y-0 left-0 w-[58%] p-4 flex flex-col justify-center">
                <h2 className="font-arabic-serif text-[22px] font-extrabold text-[#3a2a18] leading-tight text-right">
                  {today.title}
                </h2>
                <p className="text-[12px] text-[#6a543a] mt-1 text-right">{today.subtitle}</p>
                {today.scripture && (
                  <p className="text-[12px] text-[#3a2a18] mt-2 leading-relaxed line-clamp-3 text-right">{today.scripture}</p>
                )}
                {today.scriptureRef && (
                  <p className="text-[11px] font-bold text-[#b8893a] mt-1 text-right">{today.scriptureRef}</p>
                )}
              </div>
            </div>
            <div className="px-4 pb-4 -mt-6 flex justify-end relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#ead9b1] px-4 h-10 text-[12px] font-bold text-[#3a2a18] shadow-[0_10px_18px_-12px_rgba(120,80,30,0.55)]">
                <BookOpen className="h-3.5 w-3.5 text-[#6a4ab5]" />
                تعرف على المناسبة
              </span>
            </div>
          </GlassSurface>
        </Link>

        {/* List */}
        <div className="mt-5 space-y-2.5">
          {list.map((f) => (
            <Link
              key={f.id}
              to="/feasts/$eventId"
              params={{ eventId: f.id }}
              className="block active:scale-[0.99] transition-transform"
            >
              <div className="relative pr-3">
                <span
                  className="absolute top-1/2 -translate-y-1/2 right-0 h-2 w-2 rounded-full"
                  style={{ background: ACCENT_COLORS[f.accent], boxShadow: `0 0 0 3px ${ACCENT_COLORS[f.accent]}22` }}
                  aria-hidden
                />
                <GlassSurface className="p-2.5 bg-white border-[#ead9b1] shadow-[0_14px_30px_-22px_rgba(120,80,30,0.55)]">
                  <div className="grid grid-cols-[48px_104px_1fr_auto] gap-2.5 items-center">
                    <div className="text-center">
                      <div className="text-[9.5px] font-bold text-[#b8893a] leading-none">{f.gregorianDate}</div>
                      <div
                        className="font-arabic-serif text-[26px] font-extrabold leading-none mt-1"
                        style={{ color: ACCENT_COLORS[f.accent] }}
                      >
                        {f.copticDay}
                      </div>
                      <div className="text-[9.5px] text-[#6a543a] mt-1 leading-none">{f.copticYear}</div>
                    </div>
                    <div
                      className="h-[78px] w-[104px] rounded-2xl bg-cover bg-center ring-1 ring-[#ead9b1]"
                      style={{ backgroundImage: `url(${f.image})` }}
                      aria-hidden
                    />
                    <div className="min-w-0 text-right">
                      <div className="font-arabic-serif text-[15.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
                        {f.title}
                      </div>
                      <div className="text-[11.5px] text-[#6a543a] line-clamp-2 mt-1 leading-snug">
                        {f.subtitle}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="grid h-9 w-9 place-items-center rounded-xl"
                        style={{ background: `${ACCENT_COLORS[f.accent]}14`, color: ACCENT_COLORS[f.accent] }}
                      >
                        <CopticCross size={16} />
                      </span>
                      <ChevronLeft className="h-4 w-4 text-[#6a543a]" />
                    </div>
                  </div>
                </GlassSurface>
              </div>
            </Link>
          ))}
        </div>

        {/* Add CTA */}
        <button className="mt-5 w-full active:scale-[0.99] transition-transform">
          <GlassSurface className="p-3 bg-gradient-to-l from-[#f3eafd] to-white border-[#e7d4f5]">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#6a4ab5] to-[#8c6fd1] text-white shadow-[0_6px_14px_-6px_rgba(106,74,181,0.55)]">
                <Plus className="h-5 w-5" />
              </span>
              <div className="flex-1 text-right">
                <div className="text-[13px] font-extrabold text-[#3a2a18]">هل تريد إضافة مناسبة؟</div>
                <div className="text-[11px] text-[#6a543a]">اضغط لإضافتها إلى تقويمك الروحي</div>
              </div>
              <ChevronLeft className="h-4 w-4 text-[#6a4ab5]" />
            </div>
          </GlassSurface>
        </button>

        <CopticSeparator />

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          <QuickAction icon={<BookOpen className="h-4 w-4" />} label="قراءات اليوم" sub="اضغط للعرض" tone="#6a4ab5" />
          <QuickAction icon={<Moon className="h-4 w-4" />} label="الصوم الحالي" sub="لا يوجد صوم" tone="#3a6a9b" />
          <QuickAction icon={<Calendar className="h-4 w-4" />} label="التقويم الكامل" sub="جميع المناسبات" tone="#b8893a" />
          <QuickAction icon={<BellRing className="h-4 w-4" />} label="التنبيهات" sub="إدارة التنبيهات" tone="#3e7a55" />
        </div>
      </main>

      <BottomDock />
    </div>
  );
}

function QuickAction({ icon, label, sub, tone }: { icon: React.ReactNode; label: string; sub: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white border border-[#ead9b1] p-2 text-center flex flex-col items-center gap-1 shadow-[0_8px_18px_-12px_rgba(120,80,30,0.5)]">
      <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${tone}14`, color: tone }}>
        {icon}
      </span>
      <div className="text-[10.5px] font-extrabold text-[#3a2a18] leading-tight">{label}</div>
      <div className="text-[9.5px] text-[#6a543a] leading-tight">{sub}</div>
    </div>
  );
}
