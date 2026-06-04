import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Search, BookOpen, Calendar, Moon, BellRing, ChevronLeft, Star, Cross, Fish, Church } from "lucide-react";
import { useState, type ReactNode } from "react";
import { FEASTS, CATEGORIES, getTodayFeast, type FeastCategory } from "@/features/feasts";
import { getTodaySaint } from "@/features/synaxarium";
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
            <div className="relative h-[220px] overflow-hidden">
              {/* Image bleeds into card from the right (~68%) */}
              <img
                src={today.image}
                alt={today.title}
                loading="eager"
                decoding="async"
                draggable={false}
                className="absolute inset-y-0 right-0 h-full w-[68%] object-cover object-center select-none"
              />
              {/* Strong beige→white fade from text side into image */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to left, rgba(255,255,255,0) 0%, rgba(255,253,247,0.15) 30%, rgba(255,251,240,0.7) 48%, #fffaee 62%, #ffffff 78%)",
                }}
              />
              {/* Soft top/bottom polish */}
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />

              <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-[#3a2a18] border border-[#ead9b1] shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6a4ab5]" />
                اليوم
              </div>

              {/* Text overlays the faded area on the left, with extra breathing room away from the fade */}
              <div className="absolute inset-y-0 left-0 right-[42%] p-6 pl-7 flex flex-col justify-center">
                <h2 className="font-arabic-serif text-[22px] font-extrabold text-[#3a2a18] leading-tight text-right drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                  {today.title}
                </h2>
                <p className="text-[12px] text-[#6a543a] mt-1.5 text-right">{today.subtitle}</p>
                {today.scripture && (
                  <p className="text-[12px] text-[#3a2a18] mt-3 leading-relaxed line-clamp-3 text-right">{today.scripture}</p>
                )}
                {today.scriptureRef && (
                  <p className="text-[11px] font-bold text-[#b8893a] mt-1.5 text-right">{today.scriptureRef}</p>
                )}
                <span className="mt-4 self-end inline-flex items-center gap-2 rounded-full bg-white border border-[#ead9b1] px-3.5 h-9 text-[11.5px] font-bold text-[#3a2a18] shadow-[0_10px_18px_-12px_rgba(120,80,30,0.55)]">
                  <BookOpen className="h-3.5 w-3.5 text-[#6a4ab5]" />
                  تعرف على المناسبة
                </span>
              </div>
            </div>
          </GlassSurface>

        </Link>

        {/* List */}
        <div className="mt-5 space-y-3">
          {list.map((f) => {
            const isToday = f.id === today.id;
            return (
            <Link
              key={f.id}
              to="/feasts/$eventId"
              params={{ eventId: f.id }}
              className="group block origin-center touch-manipulation select-none [-webkit-tap-highlight-color:transparent] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:scale-[1.02] active:scale-[0.985] active:translate-y-0 focus:outline-none"
            >
              <div className="relative pr-3">
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 right-0 h-2 w-2 rounded-full",
                    isToday && "animate-pulse",
                  )}
                  style={{ background: ACCENT_COLORS[f.accent], boxShadow: `0 0 0 3px ${ACCENT_COLORS[f.accent]}22` }}
                  aria-hidden
                />
                <GlassSurface
                  className={cn(
                    "relative overflow-hidden p-0 bg-white border-[#ead9b1] shadow-[0_10px_24px_-20px_rgba(120,80,30,0.5)] transition-shadow duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] [@media(hover:hover)]:group-hover:shadow-[0_22px_40px_-22px_rgba(120,80,30,0.6)] group-focus-visible:shadow-[0_22px_40px_-22px_rgba(120,80,30,0.6)] group-active:shadow-[0_14px_28px_-20px_rgba(120,80,30,0.55)]",
                    isToday && "border-[#d9bf86] ring-1 ring-inset ring-[#ead9b1]",
                  )}
                >
                  {/* Image bleeds in from the left edge — subtle parallax on hover/focus */}
                  <img
                    src={f.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="absolute inset-y-0 left-0 h-full w-[44%] object-cover object-center select-none transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [@media(hover:hover)]:group-hover:scale-[1.035] [@media(hover:hover)]:group-hover:-translate-x-0.5 group-focus-visible:scale-[1.035] group-focus-visible:-translate-x-0.5 group-active:scale-[1.02] group-active:-translate-x-0.5"
                  />
                  {/* Beige→white fade from text into image */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,251,240,0.2) 22%, rgba(255,250,238,0.75) 40%, #fffaee 56%, #ffffff 70%)",
                    }}
                  />
                  <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />

                  <div className="relative grid grid-cols-[64px_minmax(0,1fr)_44%] items-center gap-3 p-3 min-h-[96px]">

                    {/* RIGHT: distinct date block */}
                    <div
                      className="relative rounded-2xl border bg-white/95 backdrop-blur px-1.5 py-2 text-center shadow-[0_6px_14px_-10px_rgba(120,80,30,0.45)]"
                      style={{ borderColor: `${ACCENT_COLORS[f.accent]}40` }}
                    >
                      <div
                        className="text-[8.5px] font-extrabold uppercase tracking-wide leading-none"
                        style={{ color: ACCENT_COLORS[f.accent] }}
                      >
                        {f.gregorianDate}
                      </div>
                      <div
                        className="font-arabic-serif text-[26px] font-extrabold leading-none mt-1"
                        style={{ color: ACCENT_COLORS[f.accent] }}
                      >
                        {f.copticDay}
                      </div>
                      <div className="mx-auto mt-1 h-px w-6" style={{ background: `${ACCENT_COLORS[f.accent]}55` }} />
                      <div className="text-[9px] text-[#6a543a] mt-1 leading-none">{f.copticYear}</div>
                    </div>
                    {/* CENTER: title + description */}
                    <div className="min-w-0 text-right">
                      {isToday && (
                        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-[#6a4ab5] text-white text-[9.5px] font-bold px-2 py-0.5 shadow-[0_6px_12px_-6px_rgba(106,74,181,0.6)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          اليوم
                        </span>
                      )}
                      <div className="font-arabic-serif text-[15.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
                        {f.title}
                      </div>
                      <div className="text-[12.5px] text-[#5a4630] line-clamp-2 mt-1 leading-relaxed">
                        {f.subtitle}
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-bold" style={{ color: ACCENT_COLORS[f.accent] }}>
                        <CopticCross size={10} />
                        <span>اقرأ المزيد</span>
                        <ChevronLeft className="h-3 w-3" />
                      </div>
                    </div>
                    {/* LEFT spacer: reserves space over the image side */}
                    <div aria-hidden />
                  </div>
                </GlassSurface>
              </div>
            </Link>
            );
          })}
        </div>


        {/* Synaxarium Today */}
        {(() => {
          const saint = getTodaySaint();
          return (
            <Link
              to="/synaxarium/$saintId"
              params={{ saintId: saint.id }}
              className="block mt-5 active:scale-[0.99] transition-transform"
            >
              <GlassSurface className="p-3.5 bg-white border-[#ead9b1] shadow-[0_14px_30px_-22px_rgba(120,80,30,0.55)]">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f4ead8] ring-1 ring-inset ring-[#ead9b1] shadow-[0_8px_18px_-12px_rgba(120,80,30,0.55)]">
                    <img
                      src={saint.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover object-center select-none"
                    />
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#b8893a]">
                      <CopticCross size={11} />
                      سنكسار اليوم
                      <span className="text-[#b8893a]/60">Ⲁ Ⲱ</span>
                    </div>
                    <div className="font-arabic-serif text-[17px] font-extrabold text-[#3a2a18] leading-tight mt-1 line-clamp-2">
                      {saint.name}
                    </div>
                    <div className="text-[12px] text-[#5a4630] leading-snug line-clamp-1 mt-1">
                      {saint.summary}
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-[#6a4ab5] to-[#8c6fd1] text-white px-3.5 h-8 text-[11.5px] font-bold shadow-[0_8px_16px_-8px_rgba(106,74,181,0.6)]">
                      <BookOpen className="h-3.5 w-3.5" />
                      افتح السنكسار
                      <ChevronLeft className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </GlassSurface>
            </Link>
          );
        })()}

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
