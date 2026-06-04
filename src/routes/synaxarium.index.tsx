import { createFileRoute, Link } from "@tanstack/react-router";
import { Menu, MoreVertical, Calendar, Bookmark, ChevronLeft } from "lucide-react";
import { SAINTS, getTodaySaint } from "@/features/synaxarium";
import { BottomDock } from "@/components/bible/BottomDock";
import { GlassSurface, BackButton } from "@/components/bible/primitives";
import { CopticCross, CopticWatermark, CopticSeparator, Timeline, TimelineItem, HorizontalTimeline } from "@/components/coptic";

export const Route = createFileRoute("/synaxarium/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — السنكسار" },
      { name: "description", content: "سير القديسين وقراءات السنكسار اليومية." },
    ],
  }),
  component: SynaxariumHome,
});

const TIMELINE_NODES = [
  { id: "saint", label: "القديس", accent: "green" as const },
  { id: "events", label: "الأحداث", accent: "purple" as const },
  { id: "meditation", label: "التأمل", accent: "green" as const },
  { id: "readings", label: "القراءات", accent: "orange" as const },
  { id: "sermon", label: "العظة", accent: "gold" as const },
  { id: "prayer", label: "الصلاة", accent: "red" as const },
];

function SynaxariumHome() {
  const today = getTodaySaint();
  const upcoming = SAINTS.slice(1);

  return (
    <div dir="rtl" className="relative min-h-dvh bg-[#f4ead8]">
      <CopticWatermark />

      {/* Header */}
      <header
        className="relative z-10 mx-auto w-full max-w-[430px] px-4 flex items-center justify-between"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: 8 }}
      >
        <BackButton compact to="/home" />
        <div className="flex flex-col items-center -mt-1">
          <CopticCross className="text-[#b8893a]" size={18} />
          <h1 className="font-arabic-serif text-[22px] font-extrabold text-[#3a2a18] leading-tight">
            السنكسار
          </h1>
          <p className="text-[11px] text-[#6a543a] -mt-0.5">قراءات اليوم</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform">
            <Calendar className="h-4 w-4" />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main
        className="relative z-10 mx-auto w-full max-w-[430px] px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 110px)" }}
      >
        {/* Hero card */}
        <GlassSurface className="overflow-hidden p-0">
          <div className="relative grid grid-cols-[1fr_44%] items-stretch min-h-[200px]">
            <div className="relative z-10 p-4 flex flex-col justify-between">
              <div>
                <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#3e7a55] to-[#2d5a3d] text-white shadow-[0_6px_14px_-6px_rgba(62,122,85,0.6)]">
                  <CopticCross size={18} />
                </div>
                <div className="mt-3">
                  <div className="text-[14px] font-extrabold text-[#3a2a18] leading-tight">
                    {today.gregorianDate}
                  </div>
                  <div className="text-[12px] text-[#6a543a] mt-0.5">{today.copticDate}</div>
                </div>
                <div className="mt-3 inline-block rounded-lg bg-[#e8f1ea] px-2.5 py-1.5 text-[11px] font-semibold text-[#2d5a3d] border border-[#3e7a55]/20 leading-tight max-w-[180px]">
                  {today.feast}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#3a2a18] mt-3">
                <span className="h-2 w-2 rounded-full" style={{ background: today.liturgicalColorHex }} />
                <span className="font-bold">اللون الطقسي:</span>
                <span>{today.liturgicalColor}</span>
              </div>
            </div>
            <div className="relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${today.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#fbf3e1]/30 to-[#fbf3e1]" />
            </div>
          </div>
        </GlassSurface>

        {/* Horizontal timeline */}
        <div className="mt-4">
          <HorizontalTimeline nodes={TIMELINE_NODES} activeId="saint" />
        </div>

        {/* CTA */}
        <Link
          to="/synaxarium/$saintId"
          params={{ saintId: today.id }}
          className="mt-4 flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-gradient-to-l from-[#6a4ab5] to-[#8c6fd1] text-white font-bold text-[14px] shadow-[0_10px_24px_-12px_rgba(106,74,181,0.6)] active:scale-[0.98] transition-transform"
        >
          <CopticCross size={16} />
          اقرأ السيرة كاملة
        </Link>

        <CopticSeparator />

        <h2 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2a18] mb-3 px-1">
          قديسو الأيام القادمة
        </h2>

        <Timeline>
          {upcoming.map((s, i) => (
            <TimelineItem key={s.id} accent={i % 2 === 0 ? "purple" : "gold"}>
              <Link
                to="/synaxarium/$saintId"
                params={{ saintId: s.id }}
                className="block active:scale-[0.98] transition-transform"
              >
                <GlassSurface className="p-3">
                  <div className="grid grid-cols-[64px_1fr_auto] gap-3 items-center">
                    <div
                      className="h-16 w-16 rounded-xl bg-cover bg-center ring-1 ring-[#efe2c4]"
                      style={{ backgroundImage: `url(${s.image})` }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-[#6a4ab5] mb-0.5">{s.copticDate}</div>
                      <div className="text-[13.5px] font-extrabold text-[#3a2a18] leading-snug line-clamp-1">
                        {s.name}
                      </div>
                      <div className="text-[11.5px] text-[#6a543a] line-clamp-1 mt-0.5">
                        {s.summary}
                      </div>
                    </div>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#fbf3e1] border border-[#efe2c4] text-[#6a4ab5]">
                      <ChevronLeft className="h-4 w-4" />
                    </span>
                  </div>
                </GlassSurface>
              </Link>
            </TimelineItem>
          ))}
        </Timeline>
      </main>

      <BottomDock />
    </div>
  );
}
