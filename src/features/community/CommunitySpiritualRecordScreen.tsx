import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Church, HandHeart, Sparkles, Trophy } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { useSpiritualRecord } from "./spiritual-record-store";
import { CommunityActionFab } from "./CommunityActionFab";
import { COMMUNITY_GLASS_BTN, COMMUNITY_GLASS_CARD } from "./community-glass-chrome";

const PILLARS = [
  { key: "reading" as const, label: "خطة القراءة", icon: BookOpen, accent: "#8a6ec1", streakKey: "readingStreak" as const },
  { key: "prayer" as const, label: "الصلاة", icon: HandHeart, accent: "#1f8a5a", streakKey: "prayerStreak" as const },
  { key: "agpeya" as const, label: "الأجبية", icon: Church, accent: "#c98a3c", streakKey: "agpeyaStreak" as const },
];

export function CommunitySpiritualRecordScreen() {
  const record = useSpiritualRecord();
  const ringPercent = Math.min(100, Math.max(10, record.overallStreak * 10));

  return (
    <div dir="rtl" className="alpha-home-screen relative min-h-screen w-full overflow-x-clip">
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pb-36">
        <header className="flex items-center gap-3 pt-[max(env(safe-area-inset-top),12px)] pb-4">
          <Link
            to="/community"
            aria-label="رجوع"
            className="alpha-chrome-btn grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-95"
          >
            <ArrowRight className="h-5 w-5 text-alpha" strokeWidth={2.1} />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-[17px] font-extrabold text-alpha-heading">السجل الروحي</h1>
            <p className="mt-0.5 text-[11px] font-semibold text-alpha-heading-muted">قراءة · صلاة · أجبية</p>
          </div>
          <span className="h-11 w-11 shrink-0" aria-hidden />
        </header>

        <div
          className={`relative overflow-hidden p-5 ${COMMUNITY_GLASS_CARD}`}
          style={{
            background:
              "linear-gradient(165deg, rgba(36,26,58,0.94) 0%, rgba(14,10,22,0.98) 55%, rgba(8,6,12,1) 100%)",
            boxShadow:
              "0 24px 56px -24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(240,215,140,0.14), 0 0 48px rgba(138,110,193,0.12)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 top-0 h-32 w-32 rounded-full bg-[#8a6ec1]/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 bottom-0 h-28 w-28 rounded-full bg-[#e7c97a]/12 blur-3xl"
          />

          <div className="relative text-center">
            <Sparkles className="mx-auto h-5 w-5 text-[#f0d78c]/80" strokeWidth={2.1} />
            <p className="mt-2 text-[15px] font-extrabold leading-relaxed text-[#f0d78c]">
              {record.overallStreak > 0
                ? "أنت على الطريق الصحيح! استمر في نموك الروحي"
                : "ابدأ رحلتك — كل يوم خطوة نحو النور"}
            </p>
          </div>

          <div className="relative mx-auto mt-6 flex justify-center">
            <div
              className="relative grid h-[148px] w-[148px] place-items-center rounded-full border-[5px] border-[#e7c97a]/35 p-1"
              style={{
                background: `conic-gradient(from 210deg, #e7c97a 0% ${ringPercent}%, rgba(255,255,255,0.06) ${ringPercent}% 100%)`,
                boxShadow: "0 0 32px rgba(231,201,122,0.22), inset 0 0 24px rgba(0,0,0,0.35)",
              }}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-[#120c18]/95 text-center shadow-[inset_0_2px_12px_rgba(0,0,0,0.45)]">
                <span className="text-[34px] font-black tabular-nums leading-none text-[#f0d78c]">
                  {record.overallStreak}
                </span>
                <span className="mt-1 text-[11px] font-extrabold text-white/55">يوم متتالي</span>
              </div>
            </div>
          </div>

          {record.longestReading > 0 ? (
            <p className="relative mt-4 text-center text-[11px] font-bold text-[#8a6ec1]/90">
              أطول سلسلة قراءة: {record.longestReading} يوم
            </p>
          ) : null}

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const value = record[pillar.streakKey];
              return (
                <div
                  key={pillar.key}
                  className="rounded-[18px] border border-white/10 bg-white/[0.04] px-2 py-3.5 text-center backdrop-blur-sm"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
                >
                  <span
                    className="mx-auto grid h-9 w-9 place-items-center rounded-xl border border-white/10"
                    style={{ background: `${pillar.accent}18`, color: pillar.accent }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.1} />
                  </span>
                  <p className="mt-2 text-[20px] font-black tabular-nums text-white">{value}</p>
                  <p className="text-[9px] font-bold text-white/40">يوم</p>
                  <p className="mt-0.5 text-[9px] font-extrabold leading-tight" style={{ color: pillar.accent }}>
                    {pillar.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="relative mt-5">
            <p className="mb-2.5 text-center text-[11px] font-extrabold text-white/55">آخر 7 أيام</p>
            <div className="grid grid-cols-7 gap-1.5">
              {record.last7.map((day) => {
                const active = day.reading || day.prayer || day.agpeya;
                return (
                  <div key={day.day} className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-bold text-white/38">{day.label}</span>
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-[14px] border transition ${
                        active
                          ? "border-[#e7c97a]/50 bg-[#e7c97a]/12 shadow-[0_0_16px_rgba(231,201,122,0.15)]"
                          : "border-white/8 bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className={`mx-auto h-1 w-1 rounded-full ${day.reading ? "bg-[#8a6ec1]" : "bg-white/12"}`} />
                        <span className={`mx-auto h-1 w-1 rounded-full ${day.prayer ? "bg-[#1f8a5a]" : "bg-white/12"}`} />
                        <span className={`mx-auto h-1 w-1 rounded-full ${day.agpeya ? "bg-[#c98a3c]" : "bg-white/12"}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link
            to="/bible/journey"
            className={`py-3 text-center text-[10px] font-extrabold text-[#5a3d92] ${COMMUNITY_GLASS_CARD} bg-white/58`}
          >
            رحلة القراءة
          </Link>
          <Link
            to="/prayer-requests"
            className={`py-3 text-center text-[10px] font-extrabold text-[#1f8a5a] ${COMMUNITY_GLASS_CARD} bg-white/58`}
          >
            طلبات الصلاة
          </Link>
          <Link
            to="/agpeya"
            className={`py-3 text-center text-[10px] font-extrabold text-[#7a4a26] ${COMMUNITY_GLASS_CARD} bg-white/58`}
          >
            الأجبية
          </Link>
        </div>

        <Link
          to="/profile"
          search={{ tab: "spiritual" }}
          className={`mt-4 flex w-full items-center justify-center gap-2 py-3.5 text-[13px] font-extrabold text-[#3a2a18] ${COMMUNITY_GLASS_BTN} bg-gradient-to-br from-[#f0d78c]/92 to-[#c79356]/85 border-[#e7c97a]/50`}
        >
          <Trophy className="h-4 w-4 text-[#7a4a26]" />
          عرض كل الإنجازات
        </Link>
      </div>

      <CommunityActionFab />
      <BottomDock />
    </div>
  );
}
