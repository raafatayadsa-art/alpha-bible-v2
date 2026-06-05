import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Phone, MessageCircle, MapPin, ShieldCheck, Users,
  HandHeart, Newspaper, Radio, CalendarDays, BookOpen, Library, Heart,
  Play, ChevronLeft, Clock, Sparkles,
} from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";

import cardChurch from "@/assets/home/card-church.jpg";
import newsCandle from "@/assets/home/news-candle.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import newsMass from "@/assets/home/news-mass.jpg";
import heavenlyChurch from "@/assets/home/heavenly-church.png";

export const Route = createFileRoute("/church")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — كنيستك معاك" },
      { name: "description", content: "تجربة كنيسة قبطية أرثوذكسية متكاملة على جهازك." },
    ],
  }),
  component: ChurchScreen,
});

/* ============================================================ */
/* Premium primitives                                            */
/* ============================================================ */

function Glass({
  children,
  className = "",
  padded = true,
}: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <div
      className={
        "relative rounded-[28px] border border-white/70 bg-[#fbf3e1]/80 backdrop-blur-xl " +
        "shadow-[0_20px_44px_-26px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] " +
        (padded ? "p-4 " : "") +
        className
      }
    >
      {children}
    </div>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center gap-2 justify-center my-3" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c79356]/60 to-transparent" />
      <span className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#c79356]" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c79356]/60 to-transparent" />
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
      <h2 className="text-[15px] font-extrabold text-[#3a2a18] leading-none">{title}</h2>
      {action}
    </div>
  );
}

/* ============================================================ */
/* Header                                                        */
/* ============================================================ */

function Header() {
  return (
    <header
      className="sticky top-0 z-30 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]"
      style={{
        background:
          "linear-gradient(180deg, rgba(244,234,216,0.95) 0%, rgba(244,234,216,0.6) 70%, rgba(244,234,216,0) 100%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/home"
          aria-label="رجوع"
          className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </Link>

        <h1 className="text-[15px] font-extrabold text-[#3a2a18]">كنيستك معاك</h1>

        <Link
          to="/profile"
          aria-label="الملف الشخصي"
          className="inline-grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#e7c97a] to-[#7a4a26] text-white font-extrabold text-[13px] border border-white/70 shadow-[0_10px_22px_-12px_rgba(120,80,30,0.55)] active:scale-90 transition-transform"
        >
          ب
        </Link>
      </div>
    </header>
  );
}

/* ============================================================ */
/* Hero Church Card                                              */
/* ============================================================ */

function HeroChurchCard() {
  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 shadow-[0_30px_60px_-30px_rgba(60,40,16,0.55),inset_0_1px_0_rgba(255,255,255,0.7)]">
        {/* Church image background */}
        <div className="relative h-[210px] w-full">
          <img src={cardChurch} alt="كنيسة الشهيد مار جرجس" className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,10,4,0.15) 0%, rgba(15,10,4,0.4) 55%, rgba(15,10,4,0.9) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-50 mix-blend-screen"
            style={{
              background:
                "radial-gradient(70% 60% at 70% 25%, rgba(255,210,120,0.3), transparent 60%)",
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c79356]/70 to-transparent" />

          {/* Floating glass actions over image */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <FloatAction icon={Phone} label="اتصال" />
            <FloatAction icon={MessageCircle} label="رسالة" />
            <FloatAction icon={MapPin} label="خريطة" />
          </div>

          {/* Verified premium green badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white border border-white/30 shadow-[0_8px_18px_-8px_rgba(31,138,90,0.7)]">
              <ShieldCheck className="h-3 w-3" strokeWidth={2.6} />
              عضوية موثقة
            </span>
          </div>

          {/* Bottom: Church Name & Location */}
          <div className="absolute bottom-3 right-4 left-4 text-right text-white">
            <h2 className="font-arabic-serif text-[22px] font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              كنيسة الشهيد مار جرجس
            </h2>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-white/90">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
              إيبارشية شرق القاهرة · مدينة نصر
            </p>
          </div>
        </div>

        {/* Glass body — compact */}
        <div
          className="relative px-4 py-3"
          style={{
            background:
              "linear-gradient(180deg, rgba(251,243,225,0.94) 0%, rgba(246,232,200,0.97) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#c79356]/40 to-transparent" />

          <div className="flex items-center gap-3">
            <div className="h-[46px] w-[46px] shrink-0 rounded-full bg-gradient-to-br from-[#7a4a26] to-[#3a2a18] grid place-items-center text-[#f3e6c4] font-arabic-serif text-[16px] font-extrabold border-[2.5px] border-[#e7c97a] shadow-[0_8px_20px_-8px_rgba(60,40,16,0.6)]">
              ✚
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[9.5px] font-bold text-[#b8893a] tracking-wide leading-none">الكاهن المسؤول</p>
              <p className="mt-1 text-[13.5px] font-extrabold text-[#3a2a18] leading-tight truncate">
                القمص داود عبد الملاك
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <MiniStat icon={Users} value="2,480" label="عضو" />
              <MiniStat icon={HandHeart} value="186" label="خادم" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/75 border border-white/80 px-2 py-1.5 text-center min-w-[46px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_-8px_rgba(120,80,30,0.4)]">
      <Icon className="mx-auto h-3.5 w-3.5 text-[#b8893a]" strokeWidth={2} />
      <p className="mt-0.5 text-[11.5px] font-extrabold text-[#3a2a18] leading-none">{value}</p>
      <p className="mt-0.5 text-[8.5px] text-[#6a543a] leading-none">{label}</p>
    </div>
  );
}

function FloatAction({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-grid h-9 w-9 place-items-center rounded-full bg-white/25 backdrop-blur-xl border border-white/40 text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)] active:scale-90 transition-transform"
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}

/* ============================================================ */
/* Quick Access Grid                                             */
/* ============================================================ */

const QUICK = [
  { key: "news", label: "الأخبار", icon: Newspaper, tone: "#c98a3c" },
  { key: "live", label: "البث المباشر", icon: Radio, tone: "#c44569" },
  { key: "meetings", label: "الاجتماعات", icon: Users, tone: "#5b8fd1" },
  { key: "service", label: "الخدمة", icon: HandHeart, tone: "#1f8a5a" },
  { key: "mass", label: "جدول القداسات", icon: CalendarDays, tone: "#8a6ec1" },
  { key: "prayer", label: "طلبات الصلاة", icon: Heart, tone: "#a85450" },
  { key: "library", label: "المكتبة", icon: Library, tone: "#6a4ab5" },
  { key: "bible", label: "الكتاب المقدس", icon: BookOpen, tone: "#b8893a" },
] as const;

function QuickGrid() {
  return (
    <section>
      <SectionTitle title="وصول سريع" />
      <div className="grid grid-cols-4 gap-2.5">
        {QUICK.map((q) => (
          <button
            key={q.key}
            type="button"
            className="group relative rounded-2xl bg-[#fbf3e1]/85 border border-white/70 backdrop-blur-xl p-2.5 text-center shadow-[0_10px_22px_-16px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-[0.95] transition-transform"
          >
            <div
              className="mx-auto grid h-11 w-11 place-items-center rounded-[14px] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_16px_-10px_rgba(0,0,0,0.25)]"
              style={{
                background: `linear-gradient(160deg, ${q.tone}22, ${q.tone}55)`,
                color: q.tone,
              }}
            >
              <q.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <p className="mt-1.5 text-[10.5px] font-extrabold text-[#3a2a18] leading-tight [word-break:keep-all]">
              {q.label}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Announcement                                                  */
/* ============================================================ */

function Announcement() {
  return (
    <section>
      <Glass className="overflow-hidden" padded={false}>
        <div className="relative">
          <img src={newsCandle} alt="" className="h-32 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f04]/70 via-transparent to-transparent" />
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-[#c44569]/95 px-2.5 py-1 text-[10px] font-bold text-white">
            <Sparkles className="h-3 w-3" /> إعلان هام
          </span>
        </div>
        <div className="p-4 text-right">
          <h3 className="font-arabic-serif text-[16px] font-extrabold text-[#3a2a18] leading-snug">
            قداس عيد الصليب المجيد
          </h3>
          <p className="mt-1 text-[12px] text-[#6a543a] leading-relaxed">
            يُقام القداس الإلهي يوم الجمعة 17 سبتمبر الساعة 7 صباحًا. الكل مدعوّ للمشاركة.
          </p>
          <button className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[12px] font-bold px-4 py-2 shadow-[0_10px_20px_-10px_rgba(122,74,38,0.7)] active:scale-95 transition-transform">
            عرض التفاصيل
            <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
          </button>
        </div>
      </Glass>
    </section>
  );
}

/* ============================================================ */
/* Latest News (horizontal)                                      */
/* ============================================================ */

const NEWS = [
  { img: newsYouth, title: "خدمة الشباب", sub: "اجتماع الجمعة", tag: "شباب" },
  { img: newsMass, title: "قداس الأحد", sub: "بحضور نيافة الأنبا", tag: "قداس" },
  { img: newsCandle, title: "صلاة العشية", sub: "يوميًا 6 مساءً", tag: "صلاة" },
];

function LatestNews() {
  return (
    <section>
      <SectionTitle
        title="آخر الأخبار"
        action={<span className="text-[11px] font-bold text-[#b8893a]">عرض الكل</span>}
      />
      <div className="-mx-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-4 pb-1">
          {NEWS.map((n, i) => (
            <article
              key={i}
              className="shrink-0 w-[180px] rounded-3xl overflow-hidden border border-white/70 bg-[#fbf3e1] shadow-[0_14px_30px_-20px_rgba(120,80,30,0.5),inset_0_1px_0_rgba(255,255,255,0.85)]"
            >
              <div className="relative h-[110px]">
                <img src={n.img} alt={n.title} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-bold text-[#7a4a26]">
                  {n.tag}
                </span>
              </div>
              <div className="p-3 text-right">
                <h4 className="text-[13px] font-extrabold text-[#3a2a18] leading-tight">{n.title}</h4>
                <p className="mt-0.5 text-[10.5px] text-[#6a543a]">{n.sub}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Upcoming Meetings                                             */
/* ============================================================ */

const MEETINGS = [
  { icon: HandHeart, title: "اجتماع الخدام", date: "السبت 12 سبتمبر", time: "5:00 م", tone: "#1f8a5a" },
  { icon: Users, title: "اجتماع الشباب", date: "الجمعة 11 سبتمبر", time: "7:30 م", tone: "#5b8fd1" },
  { icon: BookOpen, title: "درس الكتاب المقدس", date: "الأربعاء 9 سبتمبر", time: "6:00 م", tone: "#8a6ec1" },
];

function UpcomingMeetings() {
  return (
    <section>
      <SectionTitle title="الاجتماعات القادمة" />
      <Glass padded={false}>
        <ul className="divide-y divide-[#efe2c4]/80">
          {MEETINGS.map((m, i) => (
            <li key={i} className="flex items-center gap-3 p-3">
              <div
                className="grid h-11 w-11 place-items-center rounded-2xl border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-10px_rgba(0,0,0,0.25)]"
                style={{ background: `linear-gradient(160deg, ${m.tone}22, ${m.tone}55)`, color: m.tone }}
              >
                <m.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[13.5px] font-extrabold text-[#3a2a18] truncate">{m.title}</p>
                <p className="mt-0.5 inline-flex items-center gap-2 text-[11px] text-[#6a543a]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#b8893a]" />
                  {m.date}
                  <span className="text-[#c79356]">•</span>
                  <Clock className="h-3.5 w-3.5 text-[#b8893a]" />
                  {m.time}
                </p>
              </div>
              <ChevronLeft className="h-4 w-4 text-[#b8893a]" />
            </li>
          ))}
        </ul>
      </Glass>
    </section>
  );
}

/* ============================================================ */
/* Live Broadcast                                                */
/* ============================================================ */

function LiveBroadcast() {
  return (
    <section>
      <SectionTitle title="البث المباشر" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 shadow-[0_24px_50px_-26px_rgba(60,40,16,0.6),inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="relative h-[180px]">
          <img src={heavenlyChurch} alt="البث المباشر" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0603]/85 via-[#0a0603]/30 to-transparent" />

          {/* LIVE pill */}
          <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#c44569] px-2.5 py-1 text-[10.5px] font-extrabold text-white shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-bold text-white border border-white/20">
            <Users className="h-3 w-3" />
            1,284 يشاهدون
          </div>

          {/* Play button */}
          <button
            type="button"
            aria-label="مشاهدة البث المباشر"
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-[#3a2a18] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] active:scale-95 transition-transform">
              <Play className="h-7 w-7 fill-current" strokeWidth={0} />
            </span>
          </button>

          {/* Bottom title */}
          <div className="absolute bottom-3 right-3 left-3 text-right text-white">
            <h3 className="font-arabic-serif text-[16px] font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              قداس الأحد الإلهي
            </h3>
            <p className="mt-0.5 text-[11px] text-white/85">بث مباشر من الكاتدرائية</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Screen                                                        */
/* ============================================================ */

function ChurchScreen() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.6), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.18), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 85%, rgba(214,168,98,0.22), transparent 65%)",
        }}
      />
      <CopticWatermark />

      <Header />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+120px)] space-y-5">
        <HeroChurchCard />
        <QuickGrid />
        <Announcement />
        <LatestNews />
        <UpcomingMeetings />
        <LiveBroadcast />
      </div>

      <BottomDock />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </main>
  );
}
