import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, User, MoreVertical, Calendar, Cross, MapPin, BookOpen } from "lucide-react";
import { getSaint } from "@/features/synaxarium";
import { BottomDock } from "@/components/bible/BottomDock";
import { GlassSurface, BackButton, IconBadge } from "@/components/bible/primitives";
import { CopticCross, CopticWatermark, CopticSeparator, Timeline, TimelineItem, HorizontalTimeline } from "@/components/coptic";

export const Route = createFileRoute("/synaxarium/$saintId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — سيرة قديس" },
      { name: "description", content: "سيرة القديس وقراءات السنكسار." },
    ],
  }),
  component: SaintDetails,
});

const TIMELINE_NODES = [
  { id: "saint", label: "القديس", accent: "green" as const },
  { id: "events", label: "الأحداث", accent: "purple" as const },
  { id: "meditation", label: "التأمل", accent: "green" as const },
  { id: "readings", label: "القراءات", accent: "orange" as const },
  { id: "sermon", label: "العظة", accent: "gold" as const },
  { id: "prayer", label: "الصلاة", accent: "red" as const },
];

function SaintDetails() {
  const { saintId } = Route.useParams();
  const saint = getSaint(saintId);

  return (
    <div dir="rtl" className="relative min-h-dvh bg-[#f4ead8]">
      <CopticWatermark />

      <header
        className="relative z-10 mx-auto w-full max-w-[430px] px-4 flex items-center justify-between"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: 8 }}
      >
        <BackButton compact to="/synaxarium" />
        <div className="flex flex-col items-center -mt-1">
          <CopticCross className="text-[#b8893a]" size={18} />
          <h1 className="font-arabic-serif text-[20px] font-extrabold text-[#3a2a18] leading-tight">
            السنكسار
          </h1>
          <p className="text-[11px] text-[#6a543a] -mt-0.5">قراءات اليوم</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-[#efe2c4] text-[#3a2a18]">
            <Calendar className="h-4 w-4" />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-[#efe2c4] text-[#3a2a18]">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main
        className="relative z-10 mx-auto w-full max-w-[430px] px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 110px)" }}
      >
        {/* Hero */}
        <GlassSurface className="overflow-hidden p-0">
          <div className="relative grid grid-cols-[1fr_44%] items-stretch min-h-[210px]">
            <div className="relative z-10 p-4 flex flex-col justify-between">
              <div>
                <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#3e7a55] to-[#2d5a3d] text-white shadow-[0_6px_14px_-6px_rgba(62,122,85,0.6)]">
                  <CopticCross size={18} />
                </div>
                <div className="mt-3">
                  <div className="text-[14px] font-extrabold text-[#3a2a18] leading-tight">
                    {saint.gregorianDate}
                  </div>
                  <div className="text-[12px] text-[#6a543a] mt-0.5">{saint.copticDate}</div>
                </div>
                <div className="mt-3 inline-block rounded-lg bg-[#e8f1ea] px-2.5 py-1.5 text-[11px] font-semibold text-[#2d5a3d] border border-[#3e7a55]/20 leading-tight max-w-[180px]">
                  {saint.feast}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#3a2a18] mt-3">
                <span className="h-2 w-2 rounded-full" style={{ background: saint.liturgicalColorHex }} />
                <span className="font-bold">اللون الطقسي:</span>
                <span>{saint.liturgicalColor}</span>
              </div>
            </div>
            <div className="relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${saint.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#fbf3e1]/30 to-[#fbf3e1]" />
            </div>
          </div>
        </GlassSurface>

        <div className="mt-4">
          <HorizontalTimeline nodes={TIMELINE_NODES} activeId="saint" />
        </div>

        {/* Name card */}
        <GlassSurface className="mt-4 p-4">
          <div className="flex items-start justify-between gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 border border-[#efe2c4] text-[#6a4ab5] active:scale-90 transition-transform" aria-label="حفظ">
              <Bookmark className="h-4 w-4" />
            </button>
            <div className="flex-1 text-center">
              <h2 className="font-arabic-serif text-[17px] font-extrabold text-[#6a4ab5] leading-tight">
                {saint.name}
              </h2>
              <p className="text-[12px] text-[#6a543a] mt-1">{saint.title}</p>
            </div>
            <button className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform" aria-label="ملف">
              <User className="h-4 w-4" />
            </button>
          </div>

          {/* Quote */}
          <div className="mt-4 relative rounded-2xl bg-[#f4f8f5] border border-[#3e7a55]/15 p-4 pr-10">
            <span className="absolute top-3 right-3 text-[#3e7a55]/40 text-3xl leading-none font-serif">”</span>
            <p className="text-[13px] text-[#3a2a18] leading-relaxed text-center">
              {saint.quote}
            </p>
            <p className="text-center text-[12px] font-bold text-[#3e7a55] mt-2">{saint.quoteRef}</p>
          </div>
        </GlassSurface>

        {/* Info grid */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <InfoTile icon={<Cross className="h-4 w-4" />} label="تاريخ نياحته" value={saint.reposeDate} />
          <InfoTile icon={<MapPin className="h-4 w-4" />} label="مكان نياحته" value={saint.reposePlace} />
          <InfoTile icon={<CopticCross size={16} />} label="خدمته" value={saint.service} />
          <InfoTile icon={<Calendar className="h-4 w-4" />} label="تذكار استشهاده" value={saint.commemoration} />
        </div>

        <CopticSeparator />

        {/* Bio */}
        <section>
          <h3 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2a18] mb-2 px-1 inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#b8893a] rounded-full" />
            نبذة عن حياته
          </h3>
          <GlassSurface className="p-4">
            <p className="text-[13px] text-[#3a2a18] leading-[1.85]">{saint.bio}</p>
          </GlassSurface>
        </section>

        {/* Events */}
        <section className="mt-5">
          <h3 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2a18] mb-3 px-1 inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#b8893a] rounded-full" />
            أهم الأحداث في حياته
          </h3>
          <Timeline>
            {saint.events.map((e, i) => (
              <TimelineItem key={i} accent={i % 2 === 0 ? "purple" : "gold"}>
                <GlassSurface className="p-3">
                  <div className="text-[12px] font-extrabold text-[#6a4ab5]">{e.year}</div>
                  <p className="text-[13px] text-[#3a2a18] leading-relaxed mt-1">{e.text}</p>
                </GlassSurface>
              </TimelineItem>
            ))}
          </Timeline>
        </section>
      </main>

      <BottomDock />
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-[#efe2c4] p-2.5 text-center flex flex-col items-center gap-1.5 shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)]">
      <span className="text-[#b8893a]">{icon}</span>
      <div className="text-[10px] text-[#6a543a] leading-tight">{label}</div>
      <div className="text-[11px] font-bold text-[#3a2a18] leading-tight">{value}</div>
    </div>
  );
}
