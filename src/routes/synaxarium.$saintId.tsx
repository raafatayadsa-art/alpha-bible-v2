import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  Share2,
  Calendar,
  MapPin,
  Sparkles,
  BookOpen,
  Quote,
  ChevronLeft,
  Heart,
  Flame,
  Sun,
  Crown,
  Feather,
  Users,
} from "lucide-react";
import { getSaint } from "@/features/synaxarium";
import { BottomDock } from "@/components/bible/BottomDock";
import { GlassSurface, BackButton } from "@/components/bible/primitives";
import {
  CopticCross,
  CopticWatermark,
  CopticSeparator,
  Timeline,
  TimelineItem,
} from "@/components/coptic";

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

const VIRTUE_ICONS: Record<string, React.ReactNode> = {
  الإيمان: <CopticCross size={16} />,
  الصلاة: <Flame className="h-4 w-4" />,
  المحبة: <Heart className="h-4 w-4" />,
  الاتضاع: <Feather className="h-4 w-4" />,
  الصبر: <Sun className="h-4 w-4" />,
};

const PHASE_ICONS: Record<string, React.ReactNode> = {
  birth: <Sparkles className="h-3.5 w-3.5" />,
  service: <Crown className="h-3.5 w-3.5" />,
  events: <BookOpen className="h-3.5 w-3.5" />,
  repose: <CopticCross size={14} />,
};

const PHASE_ACCENT: Record<string, "purple" | "gold" | "green" | "blue"> = {
  birth: "gold",
  service: "purple",
  events: "blue",
  repose: "green",
};

function SaintDetails() {
  const { saintId } = Route.useParams();
  const saint = getSaint(saintId);
  const [saved, setSaved] = useState(false);

  return (
    <div dir="rtl" className="relative min-h-dvh bg-[#f4ead8]">
      <CopticWatermark />

      {/* Header */}
      <header
        className="relative z-10 mx-auto w-full max-w-[430px] px-4 flex items-center justify-between"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: 8 }}
      >
        <BackButton compact to="/synaxarium" />
        <div className="flex flex-col items-center -mt-1">
          <CopticCross className="text-[#b8893a]" size={16} />
          <h1 className="font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] leading-tight mt-0.5">
            سيرة قديس
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="مشاركة"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="حفظ"
            onClick={() => setSaved((v) => !v)}
            className={`grid h-9 w-9 place-items-center rounded-full border active:scale-90 transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              saved
                ? "bg-[#6a4ab5] border-[#6a4ab5] text-white shadow-[0_8px_18px_-10px_rgba(106,74,181,0.7)]"
                : "bg-white/70 border-[#efe2c4] text-[#6a4ab5]"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </header>

      <main
        className="relative z-10 mx-auto w-full max-w-[430px] px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 120px)" }}
      >
        {/* HERO */}
        <GlassSurface className="overflow-hidden p-0 mt-1">
          <div className="relative">
            <div className="relative h-[260px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{ backgroundImage: `url(${saint.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#fbf3e1] via-[#fbf3e1]/30 to-transparent" />
              {/* Coptic letter ornaments */}
              <span className="absolute top-3 right-3 text-[28px] font-bold text-white/70 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] leading-none">
                Ⲁ
              </span>
              <span className="absolute top-3 left-3 text-[28px] font-bold text-white/70 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] leading-none">
                Ⲱ
              </span>
              {/* Feast chip */}
              <div className="absolute top-4 inset-x-0 flex justify-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/35 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/20">
                  <Calendar className="h-3 w-3" />
                  {saint.copticDate}
                </div>
              </div>
            </div>
            <div className="px-5 pt-2 pb-5 text-center">
              <h2 className="font-arabic-serif text-[22px] font-extrabold text-[#6a4ab5] leading-tight">
                {saint.name}
              </h2>
              <p className="text-[13px] font-bold text-[#b8893a] mt-1.5">{saint.title}</p>
              <p className="text-[11.5px] text-[#6a543a] mt-1">{saint.gregorianDate}</p>
            </div>
          </div>
        </GlassSurface>

        {/* QUICK INFO CARDS */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <QuickInfoCard icon={<Crown className="h-4 w-4" />} label="النوع" value={saint.type ?? saint.service} tone="purple" />
          <QuickInfoCard icon={<Calendar className="h-4 w-4" />} label="العصر" value={saint.era ?? "—"} tone="gold" />
          <QuickInfoCard icon={<MapPin className="h-4 w-4" />} label="مكان الخدمة" value={saint.servicePlace ?? saint.reposePlace} tone="gold" />
          <QuickInfoCard icon={<Sparkles className="h-4 w-4" />} label="المناسبة" value={saint.occasion ?? saint.commemoration} tone="purple" />
        </div>

        {/* QUOTE */}
        <GlassSurface tone="purple" className="mt-4 p-5 relative overflow-hidden">
          <Quote className="absolute top-3 right-3 h-5 w-5 text-[#b8893a]/50" />
          <Quote className="absolute bottom-3 left-3 h-5 w-5 text-[#b8893a]/50 rotate-180" />
          <div className="text-center px-3">
            <span className="inline-block text-[10px] font-bold tracking-wider text-[#b8893a] uppercase mb-2">
              Ⲁ · من أقواله · Ⲱ
            </span>
            <p className="font-arabic-serif text-[15px] text-[#3a2a18] leading-[1.9]">
              {saint.quote}
            </p>
            <p className="mt-2.5 text-[11.5px] font-bold text-[#6a4ab5]">{saint.quoteRef}</p>
          </div>
        </GlassSurface>

        {/* BIOGRAPHY */}
        <section className="mt-5">
          <SectionTitle title="السيرة" caption="نبذة عن حياته" />
          <GlassSurface className="p-5">
            {saint.bio.split("\n\n").map((para, i) => (
              <p
                key={i}
                className={`text-[13.5px] text-[#3a2a18] leading-[2] ${i > 0 ? "mt-3" : ""}`}
              >
                {i === 0 ? (
                  <>
                    <span className="float-right ml-2 mt-0.5 font-arabic-serif text-[34px] leading-[0.85] font-extrabold text-[#6a4ab5]">
                      {para.charAt(0)}
                    </span>
                    {para.slice(1)}
                  </>
                ) : (
                  para
                )}
              </p>
            ))}
          </GlassSurface>
        </section>

        <CopticSeparator />

        {/* TIMELINE */}
        <section>
          <SectionTitle title="محطات من حياته" caption="الميلاد · الخدمة · الأحداث · النياحة" />
          <Timeline>
            {(saint.timelinePhases ?? []).map((phase) => (
              <TimelineItem key={phase.id} accent={PHASE_ACCENT[phase.id]}>
                <GlassSurface className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-lg text-white"
                      style={{
                        background:
                          PHASE_ACCENT[phase.id] === "purple"
                            ? "#6a4ab5"
                            : PHASE_ACCENT[phase.id] === "green"
                            ? "#3e7a55"
                            : PHASE_ACCENT[phase.id] === "blue"
                            ? "#3a6a9b"
                            : "#b8893a",
                      }}
                    >
                      {PHASE_ICONS[phase.id]}
                    </span>
                    <span className="text-[12px] font-extrabold text-[#3a2a18]">{phase.label}</span>
                    {phase.year && (
                      <span className="mr-auto text-[11px] font-bold text-[#6a543a]">{phase.year}</span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-[#3a2a18] leading-relaxed">{phase.body}</p>
                </GlassSurface>
              </TimelineItem>
            ))}
          </Timeline>
        </section>

        {/* VIRTUES */}
        <section className="mt-5">
          <SectionTitle title="فضائله" caption="مثال يُحتذى به" />
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
            {(saint.virtues ?? []).map((v) => (
              <div
                key={v}
                className="shrink-0 inline-flex flex-col items-center gap-1.5 rounded-2xl bg-white/85 border border-[#efe2c4] px-4 py-3 min-w-[78px] shadow-[0_6px_14px_-10px_rgba(120,80,30,0.4)] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#fff1c7] to-[#e7c07a] text-[#7a4a26]">
                  {VIRTUE_ICONS[v] ?? <Sparkles className="h-4 w-4" />}
                </span>
                <span className="text-[11.5px] font-bold text-[#3a2a18]">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-5">
          <SectionTitle title="محتوى مرتبط" caption="استكشف أكثر" />
          <div className="grid grid-cols-2 gap-2.5">
            <RelatedTile icon={<Flame className="h-4 w-4" />} title="صلوات مرتبطة" subtitle={`${saint.relatedPrayers?.length ?? 0} صلوات`} tone="gold" />
            <RelatedTile icon={<BookOpen className="h-4 w-4" />} title="تأملات مرتبطة" subtitle={`${saint.relatedMeditations?.length ?? 0} تأملات`} tone="purple" />
            <RelatedTile icon={<Calendar className="h-4 w-4" />} title="مناسبات مرتبطة" subtitle={`${saint.relatedEvents?.length ?? 0} مناسبات`} tone="purple" />
            <RelatedTile icon={<Users className="h-4 w-4" />} title="قديسون مشابهون" subtitle={`${saint.similarSaints?.length ?? 0} قديسين`} tone="gold" />
          </div>
        </section>

        {/* BOTTOM ACTIONS */}
        <section className="mt-6 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/85 border border-[#efe2c4] text-[#3a2a18] text-[13px] font-bold shadow-[0_8px_18px_-12px_rgba(120,80,30,0.45)] active:scale-[0.97] transition-transform"
            >
              <Share2 className="h-4 w-4" /> مشاركة السيرة
            </button>
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              className={`h-12 inline-flex items-center justify-center gap-2 rounded-2xl border text-[13px] font-bold active:scale-[0.97] transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                saved
                  ? "bg-[#6a4ab5] border-[#6a4ab5] text-white shadow-[0_10px_22px_-12px_rgba(106,74,181,0.7)]"
                  : "bg-white/85 border-[#efe2c4] text-[#3a2a18] shadow-[0_8px_18px_-12px_rgba(120,80,30,0.45)]"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
              {saved ? "محفوظ" : "حفظ"}
            </button>
          </div>
          <Link
            to="/synaxarium"
            className="h-14 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#6a4ab5] to-[#8c6fd1] text-white text-[14px] font-extrabold shadow-[0_14px_30px_-14px_rgba(106,74,181,0.7)] active:scale-[0.98] transition-transform"
          >
            <BookOpen className="h-4 w-4" />
            قراءة سنكسار اليوم
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <BottomDock />
    </div>
  );
}

function SectionTitle({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="mb-2.5 px-1 flex items-end justify-between">
      <div className="inline-flex items-center gap-2">
        <span className="h-0.5 w-6 bg-[#b8893a] rounded-full" />
        <h3 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2a18] leading-none">
          {title}
        </h3>
      </div>
      {caption && <p className="text-[10.5px] text-[#6a543a]">{caption}</p>}
    </div>
  );
}

function QuickInfoCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "gold" | "purple";
}) {
  const accent = tone === "purple" ? "#6a4ab5" : "#b8893a";
  const bg =
    tone === "purple"
      ? "bg-gradient-to-br from-[#efe7fb] to-[#cdb8ef] text-[#4a2f8a]"
      : "bg-gradient-to-br from-[#fff1c7] to-[#e7c07a] text-[#7a4a26]";
  return (
    <div className="rounded-2xl bg-white/85 border border-[#efe2c4] p-3 flex items-center gap-3 shadow-[0_8px_18px_-14px_rgba(120,80,30,0.45)] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]">
      <span className={`grid h-10 w-10 place-items-center rounded-xl border border-white/70 ${bg}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: accent }}>
          {label}
        </div>
        <div className="text-[12px] font-extrabold text-[#3a2a18] leading-tight mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function RelatedTile({
  icon,
  title,
  subtitle,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "gold" | "purple";
}) {
  const accentBg =
    tone === "purple"
      ? "bg-gradient-to-br from-[#efe7fb] to-[#cdb8ef] text-[#4a2f8a]"
      : "bg-gradient-to-br from-[#fff1c7] to-[#e7c07a] text-[#7a4a26]";
  return (
    <button
      type="button"
      className="text-right rounded-2xl bg-white/85 border border-[#efe2c4] p-3.5 shadow-[0_8px_18px_-14px_rgba(120,80,30,0.45)] hover:shadow-[0_14px_28px_-14px_rgba(120,80,30,0.5)] transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
    >
      <span className={`grid h-10 w-10 place-items-center rounded-xl border border-white/70 mb-2 ${accentBg}`}>
        {icon}
      </span>
      <div className="text-[13px] font-extrabold text-[#3a2a18] leading-tight">{title}</div>
      <div className="text-[11px] text-[#6a543a] mt-0.5">{subtitle}</div>
    </button>
  );
}
