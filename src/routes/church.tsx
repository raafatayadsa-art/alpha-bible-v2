import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Phone, MessageCircle, MapPin, ShieldCheck, Users,
  HandHeart, Newspaper, Radio, CalendarDays, BookOpen, Library, Heart,
  Play, ChevronLeft, Clock, Sparkles, Bell, Flame, Pin, Plus,
  Navigation, Share2, Crown, UserCog, Send, Lock,
} from "lucide-react";
import { CHURCH_CONTACTS, type ChurchContact } from "@/data/church-contacts";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import { CHURCH_POSTS, POST_TYPE_META, type ChurchPost } from "@/data/church-posts";

import cardChurch from "@/assets/home/card-church.jpg";
import newsCandle from "@/assets/home/news-candle.jpg";
import newsYouth from "@/assets/home/news-youth.jpg";
import newsMass from "@/assets/home/news-mass.jpg";
import heavenlyChurch from "@/assets/home/heavenly-church.png";
import cardAgpeya from "@/assets/home/card-agpeya.jpg";
import cardKatameros from "@/assets/home/card-katameros.jpg";
import cardChildren from "@/assets/home/card-children.jpg";

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

        <button
          type="button"
          aria-label="الإشعارات"
          className="relative inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#c44569] border border-white" />
        </button>
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

        {/* Glass body — compact, two dedicated rows */}
        <div
          className="relative px-4 pt-3 pb-3"
          style={{
            background:
              "linear-gradient(180deg, rgba(251,243,225,0.94) 0%, rgba(246,232,200,0.97) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#c79356]/40 to-transparent" />

          {/* Row 1: Priest information (dedicated row, full name) */}
          <div className="flex items-center gap-3">
            <div className="h-[48px] w-[48px] shrink-0 rounded-full bg-gradient-to-br from-[#7a4a26] to-[#3a2a18] grid place-items-center text-[#f3e6c4] font-arabic-serif text-[18px] font-extrabold border-[2.5px] border-[#e7c97a] shadow-[0_8px_20px_-8px_rgba(60,40,16,0.6)]">
              ✚
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[9.5px] font-bold text-[#b8893a] tracking-wide leading-none">الكاهن المسؤول</p>
              <p className="mt-1 font-arabic-serif text-[15px] font-extrabold text-[#3a2a18] leading-tight whitespace-normal break-words">
                القمص داود عبد الملاك المقاري
              </p>
            </div>
          </div>

          {/* Coptic gold separator */}
          <div className="my-2.5 flex items-center gap-2" aria-hidden>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c79356]/50 to-transparent" />
            <span className="inline-block h-1 w-1 rotate-45 rounded-[1px] bg-[#c79356]" />
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c79356]/50 to-transparent" />
          </div>

          {/* Row 2: Statistics (dedicated row) */}
          <div className="grid grid-cols-3 gap-2">
            <StatTile icon={Users} value="2,480" label="عضو" tone="#5b8fd1" />
            <StatTile icon={HandHeart} value="186" label="خادم" tone="#1f8a5a" />
            <StatTile icon={Flame} value="نشط" label="نشاط الصلاة" tone="#c98a3c" />
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

function StatTile({ icon: Icon, value, label, tone }: { icon: any; value: string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-white/80 px-2 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_-12px_rgba(120,80,30,0.45)]">
      <div
        className="mx-auto grid h-7 w-7 place-items-center rounded-lg border border-white/70"
        style={{ background: `linear-gradient(160deg, ${tone}22, ${tone}55)`, color: tone }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <p className="mt-1 text-[12.5px] font-extrabold text-[#3a2a18] leading-none">{value}</p>
      <p className="mt-0.5 text-[9px] font-bold text-[#6a543a] leading-none">{label}</p>
    </div>
  );
}

/* ============================================================ */
/* Quick Access Grid                                             */
/* ============================================================ */

const QUICK = [
  { key: "news", label: "الأخبار", icon: Newspaper, tone: "#c98a3c", img: newsCandle },
  { key: "live", label: "البث المباشر", icon: Radio, tone: "#c44569", img: heavenlyChurch },
  { key: "meetings", label: "الاجتماعات", icon: Users, tone: "#5b8fd1", img: newsYouth },
  { key: "service", label: "الخدمة", icon: HandHeart, tone: "#1f8a5a", img: cardChildren },
  { key: "mass", label: "جدول القداسات", icon: CalendarDays, tone: "#8a6ec1", img: newsMass },
  { key: "prayer", label: "طلبات الصلاة", icon: Heart, tone: "#a85450", img: cardAgpeya },
  { key: "library", label: "المكتبة", icon: Library, tone: "#6a4ab5", img: cardKatameros },
] as const;

function QuickGrid() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    let last = performance.now();
    const SPEED = 22; // px per second — slow & smooth

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current && track.scrollWidth > track.clientWidth + 4) {
        // RTL: scrollLeft becomes negative as you scroll towards the end.
        track.scrollLeft -= SPEED * dt;
        const max = track.scrollWidth - track.clientWidth;
        if (Math.abs(track.scrollLeft) >= max - 1) {
          track.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => {
      pausedRef.current = true;
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
    const scheduleResume = () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        pausedRef.current = false;
        last = performance.now();
      }, 2200);
    };

    track.addEventListener("pointerdown", pause);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("pointerup", scheduleResume);
    track.addEventListener("pointercancel", scheduleResume);
    track.addEventListener("touchend", scheduleResume);
    track.addEventListener("mouseleave", scheduleResume);
    track.addEventListener("scroll", () => {
      pause();
      scheduleResume();
    });

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("pointerup", scheduleResume);
      track.removeEventListener("pointercancel", scheduleResume);
      track.removeEventListener("touchend", scheduleResume);
      track.removeEventListener("mouseleave", scheduleResume);
    };
  }, []);

  return (
    <section>
      <SectionTitle
        title="وصول سريع"
        action={<span className="text-[11px] font-bold text-[#b8893a]">عرض الكل</span>}
      />
      <div
        ref={trackRef}
        className="-mx-4 overflow-x-auto no-scrollbar scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 px-4 pb-2">
          {QUICK.map((q) => (
            <button
              key={q.key}
              type="button"
              className="group shrink-0 w-[124px] h-[150px] relative rounded-3xl overflow-hidden border border-white/70 text-right active:scale-[0.96] transition-transform shadow-[0_18px_36px_-22px_rgba(120,80,30,0.55),inset_0_1px_0_rgba(255,255,255,0.85)]"
            >
              {/* Image */}
              <img
                src={q.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {/* Tone wash + bottom fade */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${q.tone}10 0%, rgba(15,10,4,0.15) 40%, rgba(15,10,4,0.85) 100%)`,
                }}
              />
              {/* Top gold hairline */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e7c97a]/80 to-transparent" />

              {/* 3D glass icon chip */}
              <div
                className="absolute top-2.5 right-2.5 grid h-10 w-10 place-items-center rounded-2xl border border-white/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_18px_-10px_rgba(0,0,0,0.45)]"
                style={{
                  background: `linear-gradient(160deg, ${q.tone}cc, ${q.tone}88)`,
                  color: "#fff",
                }}
              >
                <q.icon className="h-5 w-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]" strokeWidth={2.3} />
              </div>

              {/* Label */}
              <div className="absolute bottom-2.5 right-2.5 left-2.5">
                <p className="font-arabic-serif text-[12.5px] font-extrabold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] [word-break:keep-all]">
                  {q.label}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Church Posts Feed (featured + list)                           */
/* ============================================================ */

function CategoryPill({ type, size = "sm" }: { type: ChurchPost["type"]; size?: "sm" | "md" }) {
  const meta = POST_TYPE_META[type];
  const px = size === "md" ? "px-3 py-1 text-[11px]" : "px-2.5 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-extrabold text-white border border-white/30 shadow-[0_6px_14px_-8px_rgba(0,0,0,0.45)] ${px}`}
      style={{ background: `linear-gradient(180deg, ${meta.tone}, ${meta.tone}cc)` }}
    >
      {meta.label}
    </span>
  );
}

function FeaturedPostCard({ post }: { post: ChurchPost }) {
  return (
    <Link
      to="/church/post/$id"
      params={{ id: post.id }}
      className="block active:scale-[0.99] transition-transform"
    >
      <Glass className="overflow-hidden" padded={false}>
        <div className="relative">
          <img src={post.image} alt={post.title} className="h-44 w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f04]/85 via-[#1a0f04]/15 to-transparent" />

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {post.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#b8893a] px-2 py-0.5 text-[9.5px] font-extrabold text-white border border-white/40">
                <Pin className="h-3 w-3" strokeWidth={2.6} /> مثبت
              </span>
            )}
            <CategoryPill type={post.type} size="md" />
          </div>

          <div className="absolute bottom-3 right-3 left-3 text-right text-white">
            <h3 className="font-arabic-serif text-[17px] font-extrabold leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
              {post.title}
            </h3>
            <p className="mt-1 inline-flex items-center gap-2 text-[11px] text-white/90">
              <CalendarDays className="h-3.5 w-3.5" />
              {post.date}
              <span className="text-[#e7c97a]">•</span>
              {post.author}
            </p>
          </div>
        </div>
        <div className="p-4 text-right">
          <p className="text-[12.5px] text-[#6a543a] leading-relaxed line-clamp-2">{post.excerpt}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[12px] font-bold px-4 py-2 shadow-[0_10px_20px_-10px_rgba(122,74,38,0.7)]">
            عرض التفاصيل
            <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
          </span>
        </div>
      </Glass>
    </Link>
  );
}

function SmallPostCard({ post }: { post: ChurchPost }) {
  return (
    <Link
      to="/church/post/$id"
      params={{ id: post.id }}
      className="block active:scale-[0.98] transition-transform"
    >
      <Glass padded={false} className="overflow-hidden">
        <div className="flex gap-3 p-2.5">
          <div className="relative h-[78px] w-[88px] shrink-0 overflow-hidden rounded-2xl border border-white/70">
            <img src={post.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            {post.pinned && (
              <span className="absolute top-1 right-1 grid place-items-center h-5 w-5 rounded-full bg-[#b8893a] text-white border border-white/50 shadow">
                <Pin className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <CategoryPill type={post.type} />
            </div>
            <h4 className="mt-1 text-[13.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-2">
              {post.title}
            </h4>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[10.5px] text-[#6a543a]">
              <CalendarDays className="h-3 w-3 text-[#b8893a]" />
              {post.date}
            </p>
          </div>
          <ChevronLeft className="self-center h-4 w-4 text-[#b8893a] shrink-0" />
        </div>
      </Glass>
    </Link>
  );
}

function ChurchPostsFeed() {
  // Featured = first pinned, else first post. Rest go below.
  const sorted = [...CHURCH_POSTS].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <section>
      <SectionTitle
        title="منشورات الكنيسة"
        action={
          <button
            type="button"
            aria-label="منشور جديد"
            title="إنشاء منشور (للكهنة والخدام)"
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[11px] font-extrabold px-3 py-1.5 shadow-[0_10px_20px_-10px_rgba(122,74,38,0.6)] active:scale-95 transition-transform"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
            منشور
          </button>
        }
      />
      <div className="space-y-3">
        {featured && <FeaturedPostCard post={featured} />}
        {rest.map((p) => (
          <SmallPostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Upcoming Meetings                                             */
/* ============================================================ */

const MEETINGS = [
  { day: "12", month: "سبتمبر", title: "اجتماع الخدام", time: "5:00 مساءً", location: "قاعة القديس أغسطينوس", tone: "#1f8a5a" },
  { day: "11", month: "سبتمبر", title: "اجتماع الشباب", time: "7:30 مساءً", location: "قاعة المجمع", tone: "#5b8fd1" },
  { day: "9", month: "سبتمبر", title: "درس الكتاب المقدس", time: "6:00 مساءً", location: "الكنيسة الرئيسية", tone: "#8a6ec1" },
];

function MeetingCard({ m }: { m: typeof MEETINGS[number] }) {
  return (
    <div className="relative flex items-stretch gap-0 overflow-hidden rounded-[24px] border border-white/70 bg-[#fbf3e1]/80 backdrop-blur-xl shadow-[0_16px_40px_-22px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-[0.98] transition-transform">
      {/* Date block */}
      <div
        className="flex w-[74px] shrink-0 flex-col items-center justify-center gap-0.5 border-l border-white/60"
        style={{ background: `linear-gradient(180deg, ${m.tone}18, ${m.tone}08)` }}
      >
        <span className="text-[22px] font-extrabold text-[#3a2a18] leading-none">{m.day}</span>
        <span className="text-[10px] font-bold text-[#b8893a] leading-none">{m.month}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3.5 text-right">
        <h4 className="text-[14px] font-extrabold text-[#3a2a18] leading-tight">{m.title}</h4>
        <div className="mt-2 flex flex-col gap-1">
          <p className="inline-flex items-center justify-end gap-1.5 text-[11px] text-[#6a543a]">
            <Clock className="h-3.5 w-3.5 text-[#b8893a]" strokeWidth={2} />
            {m.time}
          </p>
          <p className="inline-flex items-center justify-end gap-1.5 text-[11px] text-[#6a543a]">
            <MapPin className="h-3.5 w-3.5 text-[#b8893a]" strokeWidth={2} />
            {m.location}
          </p>
        </div>
      </div>

      {/* Chevron */}
      <div className="flex items-center px-3">
        <ChevronLeft className="h-4 w-4 text-[#c79356]" />
      </div>
    </div>
  );
}

function UpcomingMeetings() {
  return (
    <section>
      <SectionTitle
        title="الاجتماعات القادمة"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b8893a] active:opacity-60 transition-opacity"
          >
            عرض الكل
            <ArrowRight className="h-3.5 w-3.5 -scale-x-100" />
          </button>
        }
      />
      <div className="space-y-2.5">
        {MEETINGS.slice(0, 3).map((m, i) => (
          <MeetingCard key={i} m={m} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Prayer Requests Card                                          */
/* ============================================================ */

function PrayerRequestsCard() {
  return (
    <Link
      to="/church/prayer"
      className="block active:scale-[0.98] transition-transform"
    >
      <Glass className="overflow-hidden">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="shrink-0 grid h-12 w-12 place-items-center rounded-2xl border border-white/70 bg-gradient-to-br from-[#8a6ec1]/25 to-[#8a6ec1]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_18px_-10px_rgba(138,110,193,0.45)]">
            <Sparkles className="h-6 w-6 text-[#8a6ec1]" strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1 text-right">
            <p className="text-[13px] font-extrabold text-[#3a2a18]">طلبات الصلاة</p>
            <p className="mt-0.5 text-[10.5px] text-[#6a543a]">شارك في الصلاة من أجل إخوتك</p>
            <div className="mt-2 flex items-center justify-end gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/12 px-2.5 py-1 text-[11px] font-extrabold text-[#1f8a5a] border border-[#1f8a5a]/20">
                <Heart className="h-3 w-3" strokeWidth={2.5} />
                24 طلب نشط
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#5b8fd1]/12 px-2.5 py-1 text-[11px] font-extrabold text-[#5b8fd1] border border-[#5b8fd1]/20">
                <Users className="h-3 w-3" strokeWidth={2.5} />
                128 صليّ
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronLeft className="h-5 w-5 text-[#c79356] shrink-0" />
        </div>
      </Glass>
    </Link>
  );
}

/* ============================================================ */
/* Live Broadcast                                                */
/* ============================================================ */

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, done: diff === 0 };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <span className="font-arabic-serif text-[18px] font-extrabold text-[#3a2a18] tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[9.5px] font-bold text-[#8a6a3a] tracking-wide">{label}</span>
    </div>
  );
}

function UpcomingStreamCard() {
  const [reminded, setReminded] = useState(false);
  // Next Sunday 9:00 AM local
  const target = useRef<number>(
    (() => {
      const d = new Date();
      const day = d.getDay();
      const add = ((7 - day) % 7) || 7;
      d.setDate(d.getDate() + add);
      d.setHours(9, 0, 0, 0);
      return d.getTime();
    })()
  ).current;
  const { days, hours, mins, secs } = useCountdown(target);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl shadow-[0_20px_44px_-26px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]">
      <div className="flex gap-3 p-3">
        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[18px] border border-white/70">
          <img src={cardChurch} alt="بث قادم" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-extrabold text-[#3a2a18]">
            <CalendarDays className="h-2.5 w-2.5" /> قريباً
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] leading-tight">
            قداس الأحد القادم
          </h4>
          <p className="mt-0.5 text-[11px] text-[#7a5a30]">من الكاتدرائية المرقسية</p>
          <div className="mt-2 flex items-center gap-1.5" dir="ltr">
            <CountdownUnit value={days} label="يوم" />
            <span className="text-[#c79356] font-bold">:</span>
            <CountdownUnit value={hours} label="ساعة" />
            <span className="text-[#c79356] font-bold">:</span>
            <CountdownUnit value={mins} label="دقيقة" />
            <span className="text-[#c79356] font-bold">:</span>
            <CountdownUnit value={secs} label="ثانية" />
          </div>
        </div>
      </div>
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setReminded((v) => !v)}
          className={
            "w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-extrabold transition-all active:scale-[0.98] " +
            (reminded
              ? "bg-[#e9d9b8] text-[#3a2a18] border border-[#c79356]/40"
              : "bg-gradient-to-l from-[#c79356] to-[#d6a862] text-white shadow-[0_10px_24px_-12px_rgba(199,147,86,0.7)]")
          }
        >
          <Bell className={"h-4 w-4 " + (reminded ? "fill-current" : "")} />
          {reminded ? "تم تفعيل التذكير" : "ذكّرني قبل البث"}
        </button>
      </div>
    </div>
  );
}

function LiveBroadcast() {
  return (
    <section>
      <SectionTitle title="البث المباشر" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 shadow-[0_24px_50px_-26px_rgba(60,40,16,0.6),inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="relative h-[200px]">
          <img src={heavenlyChurch} alt="البث المباشر" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0603]/90 via-[#0a0603]/35 to-transparent" />

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
        {/* Watch button bar */}
        <div className="bg-[#1a0f06] px-3 py-2.5 flex items-center gap-2">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#c44569] to-[#e0577f] px-4 py-2.5 text-[12.5px] font-extrabold text-white shadow-[0_10px_24px_-12px_rgba(196,69,105,0.8)] active:scale-[0.98] transition-transform"
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            شاهد الآن
          </button>
          <button
            type="button"
            aria-label="مشاركة"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white border border-white/15 active:scale-95 transition-transform"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <UpcomingStreamCard />
      </div>
    </section>
  );
}

/* ============================================================ */
/* Church Utilities — Map, Contacts, Messages                   */
/* ============================================================ */

const CHURCH_ADDRESS = "كنيسة الشهيد مار جرجس، مدينة نصر، القاهرة";
const CHURCH_COORDS = { lat: 30.0626, lng: 31.3470 };
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${CHURCH_COORDS.lat},${CHURCH_COORDS.lng}`;

function ChurchMapCard() {
  const handleOpenMaps = () => window.open(MAPS_URL, "_blank", "noopener,noreferrer");
  const handleShare = async () => {
    const text = `${CHURCH_ADDRESS}\n${MAPS_URL}`;
    if (navigator.share) {
      try { await navigator.share({ title: "موقع الكنيسة", text, url: MAPS_URL }); } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  };

  const staticMap = `https://staticmap.openstreetmap.de/staticmap.php?center=${CHURCH_COORDS.lat},${CHURCH_COORDS.lng}&zoom=15&size=600x260&markers=${CHURCH_COORDS.lat},${CHURCH_COORDS.lng},red-pushpin`;

  return (
    <section>
      <SectionTitle title="موقع الكنيسة" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl shadow-[0_20px_44px_-26px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]">
        <div className="relative h-[150px] w-full overflow-hidden">
          <img
            src={staticMap}
            alt="خريطة الكنيسة"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(244,234,216,0.0) 30%, rgba(244,234,216,0.85) 100%), " +
                "radial-gradient(60% 70% at 50% 40%, rgba(167,139,217,0.18), transparent 70%)",
            }}
          />
          {/* Pin */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-[#c44569]/30 animate-ping" />
              <div className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#e0577f] to-[#c44569] text-white border-2 border-white shadow-[0_10px_24px_-8px_rgba(196,69,105,0.7)]">
                <MapPin className="h-5 w-5" strokeWidth={2.6} />
              </div>
            </div>
          </div>
        </div>
        <div className="p-3.5">
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[#c79356] mt-0.5 shrink-0" />
            <div className="flex-1 text-right">
              <p className="font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] leading-tight">
                كنيسة الشهيد مار جرجس
              </p>
              <p className="mt-0.5 text-[11px] text-[#7a5a30]">إيبارشية شرق القاهرة · مدينة نصر</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOpenMaps}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#c79356] to-[#d6a862] px-3 py-2.5 text-[12px] font-extrabold text-white shadow-[0_10px_24px_-12px_rgba(199,147,86,0.7)] active:scale-[0.98] transition-transform"
            >
              <Navigation className="h-3.5 w-3.5" />
              فتح في الخرائط
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/80 border border-[#efe2c4] px-4 py-2.5 text-[12px] font-extrabold text-[#3a2a18] active:scale-[0.98] transition-transform"
            >
              <Share2 className="h-3.5 w-3.5" />
              مشاركة
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

type Contact = ChurchContact;

const CONTACTS: Contact[] = CHURCH_CONTACTS;

const ROLE_TONE: Record<Contact["roleType"], { bg: string; icon: any; tag: string }> = {
  priest: { bg: "linear-gradient(160deg, #7a4a26, #3a2a18)", icon: Crown, tag: "#c79356" },
  servant: { bg: "linear-gradient(160deg, #6a4ab5, #4a2e8e)", icon: HandHeart, tag: "#8a6ec1" },
  admin: { bg: "linear-gradient(160deg, #1f8a5a, #136a44)", icon: UserCog, tag: "#1f8a5a" },
};

function ContactRow({ contact }: { contact: Contact }) {
  const tone = ROLE_TONE[contact.roleType];
  const RoleIcon = tone.icon;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-12px_rgba(120,80,30,0.4)]">
      <div
        className="relative h-11 w-11 shrink-0 rounded-full grid place-items-center text-[#f3e6c4] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[0_6px_14px_-6px_rgba(60,40,16,0.5)]"
        style={{ background: tone.bg }}
      >
        {contact.initials}
        <span
          className="absolute -bottom-0.5 -left-0.5 grid h-4 w-4 place-items-center rounded-full bg-white border border-white"
          style={{ color: tone.tag }}
        >
          <RoleIcon className="h-2.5 w-2.5" strokeWidth={2.8} />
        </span>
      </div>
      <div className="flex-1 min-w-0 text-right">
        <p className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a2a18] leading-tight truncate">
          {contact.name}
        </p>
        <p className="mt-0.5 text-[10.5px] text-[#7a5a30] leading-none">{contact.role}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <a
          href={`tel:${contact.phone}`}
          aria-label={`اتصال بـ ${contact.name}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#5b8fd1] to-[#3a6db0] text-white shadow-[0_8px_18px_-10px_rgba(91,143,209,0.7)] active:scale-90 transition-transform"
        >
          <Phone className="h-4 w-4" strokeWidth={2.4} />
        </a>
        <a
          href={`https://wa.me/${contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`واتساب ${contact.name}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#25d366] to-[#128c44] text-white shadow-[0_8px_18px_-10px_rgba(37,211,102,0.7)] active:scale-90 transition-transform"
        >
          <MessageCircle className="h-4 w-4 fill-current" strokeWidth={0} />
        </a>
      </div>
    </div>
  );
}

function ContactsCard() {
  return (
    <section>
      <SectionTitle title="جهات الاتصال" />
      <div className="rounded-[28px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl p-3 shadow-[0_20px_44px_-26px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] space-y-2">
        {CONTACTS.map((c) => <ContactRow key={c.id} contact={c} />)}
      </div>
    </section>
  );
}

function MessageRow({ contact, unread }: { contact: Contact; unread?: number }) {
  const tone = ROLE_TONE[contact.roleType];
  const allowed = contact.messagingAllowed;
  const className =
    "w-full flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 p-2.5 text-right transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-12px_rgba(120,80,30,0.4)] " +
    (allowed ? "active:scale-[0.98]" : "opacity-70 cursor-not-allowed");

  const inner = (
    <>
      <div
        className="h-11 w-11 shrink-0 rounded-full grid place-items-center text-[#f3e6c4] font-arabic-serif text-[16px] font-extrabold border-2 border-white shadow-[0_6px_14px_-6px_rgba(60,40,16,0.5)]"
        style={{ background: tone.bg }}
      >
        {contact.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-arabic-serif text-[13.5px] font-extrabold text-[#3a2a18] leading-tight truncate">
            {contact.name}
          </p>
          {allowed && unread ? (
            <span className="inline-grid h-5 min-w-5 px-1.5 place-items-center rounded-full bg-[#c44569] text-white text-[10px] font-extrabold">
              {unread}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-[#7a5a30] truncate">
          {allowed ? (
            "اضغط لبدء محادثة خاصة"
          ) : (
            <>
              <Lock className="h-2.5 w-2.5" /> المحادثة معطّلة بإذن الكاهن
            </>
          )}
        </p>
      </div>
      {allowed ? (
        <Send className="h-4 w-4 text-[#c79356] -scale-x-100 shrink-0" strokeWidth={2.4} />
      ) : (
        <Lock className="h-4 w-4 text-[#a08862] shrink-0" strokeWidth={2.2} />
      )}
    </>
  );

  if (!allowed) {
    return (
      <div className={className} aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link
      to="/church/chat/$contactId"
      params={{ contactId: contact.id }}
      className={className}
    >
      {inner}
    </Link>
  );
}

function MessagesCard() {
  const leaders = CONTACTS.filter((c) => c.roleType !== "admin");
  return (
    <section>
      <SectionTitle
        title="مراسلة قادة الكنيسة"
        action={
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7a5a30]">
            <ShieldCheck className="h-3 w-3" />
            بإذن الكاهن
          </span>
        }
      />
      <div className="rounded-[28px] border border-white/70 bg-[#fbf3e1]/85 backdrop-blur-xl p-3 shadow-[0_20px_44px_-26px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] space-y-2">
        {leaders.map((c, i) => (
          <MessageRow key={c.id} contact={c} unread={i === 0 ? 2 : undefined} />
        ))}
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
        <ChurchPostsFeed />
        <PrayerRequestsCard />
        <UpcomingMeetings />
        <LiveBroadcast />
        <ChurchMapCard />
        <ContactsCard />
        <MessagesCard />
      </div>

      <BottomDock />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </main>
  );
}
