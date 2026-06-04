import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, Bell, Search, Sparkles, Share2, Bookmark, ChevronLeft, SkipBack, SkipForward, Play, Pause, Home as HomeIcon, HandHeart, Users, User as UserIcon } from "lucide-react";
import logoBible from "@/assets/home/logo-bible.png";
import { supabase } from "@/integrations/supabase/client";
import { CopticWatermark } from "@/components/coptic";


import churchHeavenly from "@/assets/home/heavenly-church.png";
import iconBible from "@/assets/home/icon-bible.png";
import iconPrayer from "@/assets/home/icon-prayer.png";
import iconMeeting from "@/assets/home/icon-meeting.png";
import iconCalendar from "@/assets/home/icon-calendar.png";
import iconMeditation from "@/assets/home/icon-meditation.png";
import continueImg from "@/assets/home/continue.png";
import playerImg from "@/assets/home/player.png";


export const Route = createFileRoute("/home")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الرئيسية" },
      { name: "description", content: "الشاشة الرئيسية لتطبيق ألفا — الكتاب المقدس، الترانيم، الصلوات، المجتمع." },
    ],
  }),
  component: HomeScreen,
});

function useGreeting() {
  const [h, setH] = useState(() => new Date().getHours());
  useEffect(() => {
    const t = setInterval(() => setH(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (h >= 5 && h < 12) return "صباح الخير";
  if (h >= 12 && h < 18) return "نهارك سعيد";
  if (h >= 18 && h < 23) return "مساء الخير";
  return "تصبح على خير";
}

// ===== atoms =====
function Pressable({
  children, onClick, to, className = "", ariaLabel,
}: {
  children: React.ReactNode; onClick?: () => void; to?: string; className?: string; ariaLabel?: string;
}) {
  const base = "block transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] focus:outline-none " + className;
  if (to) return <Link to={to as any} aria-label={ariaLabel} className={base}>{children}</Link>;
  return <button type="button" onClick={onClick} aria-label={ariaLabel} className={base}>{children}</button>;
}

function GlassChip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={
      "rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 " +
      "shadow-[0_8px_22px_-10px_rgba(120,80,30,0.30),inset_0_1px_0_rgba(255,255,255,0.7)] " + className
    }>{children}</div>
  );
}

function useHideOnScroll() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      if (y < 40) setVisible(true);
      else if (dy > 6) setVisible(false);
      else if (dy < -6) setVisible(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return visible;
}

// ===== screen =====
function HomeScreen() {
  const greeting = useGreeting();
  const userName = "رافت";
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [notifCount] = useState(1);
  const dockVisible = useHideOnScroll();
  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: dc } = await supabase.from("daily_content").select("*").limit(1).maybeSingle();
        if (!cancelled && dc) {
          const text = (dc as any).verse_text ?? (dc as any).text ?? (dc as any).content ?? (dc as any).body;
          const reference =
            (dc as any).verse_reference ?? (dc as any).reference ?? (dc as any).title ?? "";
          if (text) { setVerse({ text: String(text), reference: String(reference || "") }); return; }
        }
      } catch { /* fallback below */ }
      try {
        const { data: bv } = await supabase
          .from("bible_verses")
          .select("book_name,chapter_number,verse_number,verse_text")
          .limit(1)
          .maybeSingle();
        if (!cancelled && bv) {
          setVerse({
            text: (bv as any).verse_text,
            reference: `${(bv as any).book_name} ${(bv as any).chapter_number}:${(bv as any).verse_number}`,
          });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);


  // Primary modules — large horizontal swipe cards
  const primary: Array<{
    key: string;
    title: string;
    sub: string;
    icon: string;
    to: string;
    accent: string;
    gradient: string;
    glyph: "Ⲁ" | "Ⲱ";
  }> = [
    {
      key: "bible",
      title: "الكتاب المقدس",
      sub: "إقرأ كلمة الله",
      icon: iconBible,
      to: "/books",
      accent: "#caa15f",
      gradient: "linear-gradient(135deg,#fff4d6 0%,#f3d99a 55%,#caa15f 100%)",
      glyph: "Ⲁ",
    },
    {
      key: "agpeya",
      title: "الأجبية",
      sub: "صلوات السبع ساعات",
      icon: iconPrayer,
      to: "/agpeya",
      accent: "#8a6ec1",
      gradient: "linear-gradient(135deg,#f3ecff 0%,#cdb9ef 55%,#8a6ec1 100%)",
      glyph: "Ⲱ",
    },
    {
      key: "katameros",
      title: "القطمارس",
      sub: "قراءات اليوم",
      icon: iconMeditation,
      to: "/katameros",
      accent: "#4a9e6e",
      gradient: "linear-gradient(135deg,#e8f7ee 0%,#a7d9bb 55%,#4a9e6e 100%)",
      glyph: "Ⲁ",
    },
    {
      key: "synaxarium",
      title: "السنكسار",
      sub: "سير القديسين",
      icon: iconMeeting,
      to: "/synaxarium",
      accent: "#a85450",
      gradient: "linear-gradient(135deg,#fbecea 0%,#e3a8a4 55%,#a85450 100%)",
      glyph: "Ⲱ",
    },
  ];

  // Secondary modules — smaller cards
  const secondary: Array<{
    key: string; title: string; icon: string; to?: string; color: string; bg: string;
  }> = [
    { key: "meditation", title: "التأملات", icon: iconMeditation, color: "#5b8fd1", bg: "linear-gradient(160deg,#eaf2fb,#cfdef2)" },
    { key: "feasts", title: "المناسبات", icon: iconCalendar, to: "/feasts", color: "#c98a3c", bg: "linear-gradient(160deg,#fdf0d9,#f3d49a)" },
    { key: "saint", title: "قديس اليوم", icon: iconMeeting, to: "/synaxarium", color: "#a85450", bg: "linear-gradient(160deg,#fbe9e7,#eec0bd)" },
    { key: "prayerDay", title: "صلاة اليوم", icon: iconPrayer, to: "/agpeya", color: "#8a6ec1", bg: "linear-gradient(160deg,#efe8fa,#d4c2ee)" },
  ];


  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#faf8f3]">
      {/* ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.55), transparent 60%)," +
            "radial-gradient(80% 60% at 100% 30%, rgba(231,201,138,0.30), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 80%, rgba(214,168,98,0.18), transparent 65%)",
        }}
      />
      <CopticWatermark />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-2 pt-2">
          <Pressable ariaLabel="القائمة">
            <GlassChip className="h-11 w-11 grid place-items-center">
              <Menu className="h-5 w-5 text-[#3a2a18]" />
            </GlassChip>
          </Pressable>

          <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center">
            <Sparkles className="h-3.5 w-3.5 text-[#c79356] shrink-0" />
            <h1 className="font-extrabold text-[15px] text-[#3a2a18] whitespace-nowrap [word-break:keep-all]">{greeting} يا {userName}</h1>
            <span className="text-[14px] shrink-0">☀️</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Pressable ariaLabel="الإشعارات">
              <GlassChip className="relative h-11 w-11 grid place-items-center">
                <Bell className="h-5 w-5 text-[#3a2a18]" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#d88a2a] text-[10px] font-bold text-white shadow">
                    {notifCount}
                  </span>
                )}
              </GlassChip>
            </Pressable>
            <Pressable to="/search" ariaLabel="بحث">
              <GlassChip className="h-11 w-11 grid place-items-center">
                <Search className="h-5 w-5 text-[#3a2a18]" />
              </GlassChip>
            </Pressable>
          </div>
        </header>


        {/* Hero verse card — text left, church right, compact & cinematic */}
        <section className="mt-4">
          <div
            className="relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#fff9ec] via-[#fbecc8] to-[#efd29a] shadow-[0_24px_50px_-22px_rgba(120,80,30,0.55),inset_0_1px_0_rgba(255,255,255,0.85)]"
          >
            {/* warm ambient light */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 70% at 100% 100%, rgba(255,210,130,0.55), transparent 60%)," +
                  "radial-gradient(70% 60% at 0% 0%, rgba(255,248,225,0.70), transparent 70%)",
              }}
            />

            {/* Content row: verse (left) + church (right) */}
            <div className="relative flex items-stretch gap-2 px-4 pt-5 pb-4 min-h-[210px]">
              {/* Verse text — left side (RTL: text-right inside) */}
              <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-center text-right">
                <div className="mb-2.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#c79356]/35 bg-white/65 px-2.5 py-1 backdrop-blur-md">
                  <Sparkles className="h-3 w-3 text-[#b8893a]" />
                  <span className="text-[10px] font-bold tracking-wide text-[#7a4a26]">آية اليوم</span>
                </div>
                <p
                  className="font-extrabold text-[#2a1c0e] leading-[1.85] text-[15px]"
                  style={{ wordBreak: "keep-all" }}
                >
                  {verse ? `"${verse.text}"` : "لا توجد آية اليوم"}
                </p>
                {verse?.reference && (
                  <p className="mt-2 text-[11px] font-bold tracking-wide text-[#7a4a26]">
                    {verse.reference}
                  </p>
                )}
              </div>

              {/* Church — right side, slightly overflowing bottom-right */}
              <div className="relative w-[42%] shrink-0 self-stretch">
                {/* golden glow halo */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(closest-side at 55% 55%, rgba(255,210,120,0.65), transparent 70%)",
                    filter: "blur(6px)",
                  }}
                />
                {/* light mist at base */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
                  style={{
                    background:
                      "radial-gradient(80% 100% at 50% 100%, rgba(255,244,215,0.95), transparent 75%)",
                    filter: "blur(4px)",
                  }}
                />
                <img
                  src={churchHeavenly}
                  alt=""
                  draggable={false}
                  className="absolute -right-4 -bottom-3 w-[125%] max-w-none select-none pointer-events-none object-contain"
                  style={{
                    filter:
                      "drop-shadow(0 14px 18px rgba(120,70,20,0.45)) drop-shadow(0 0 22px rgba(255,200,110,0.45))",
                  }}
                />
              </div>
            </div>

            {/* Footer controls — luxury glass */}
            <div className="relative flex items-center justify-between px-4 pb-3.5 pt-1">

              <button
                aria-label="حفظ الآية"
                onClick={() => setSaved((s) => !s)}
                className={
                  "grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all active:scale-[0.94] " +
                  (saved
                    ? "border-[#c79356]/60 bg-gradient-to-br from-[#fde3a8] to-[#d9a55a] text-white shadow-[0_8px_18px_-8px_rgba(168,120,42,0.65)]"
                    : "border-white/70 bg-white/60 text-[#7a4a26] shadow-[0_6px_14px_-8px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.9)]")
                }
              >
                <Bookmark className={"h-4 w-4 " + (saved ? "fill-white" : "")} />
              </button>

              {/* carousel indicators */}
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#c79356] to-[#7a4a26] shadow-[0_0_6px_rgba(199,147,86,0.55)]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#c79356]/35" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#c79356]/35" />
              </div>

              <button
                aria-label="مشاركة"
                onClick={() => navigator.share?.({ title: "آية اليوم", text: verse?.text ?? "" }).catch(() => {})}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/60 text-[#7a4a26] backdrop-blur-md shadow-[0_6px_14px_-8px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all active:scale-[0.94]"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Primary modules — large horizontal swipe */}
        <section className="mt-5 -mx-4">
          <div className="mb-2.5 flex items-center justify-between px-5">
            <h2 className="text-[14px] font-extrabold text-[#3a2a18] tracking-tight">المحتوى الأساسي</h2>
            <span className="text-[11px] font-bold text-[#b8893a]">اسحب →</span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-3 snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {primary.map((c) => (
              <Pressable key={c.key} to={c.to} ariaLabel={c.title} className="snap-start shrink-0">
                <div
                  className="relative h-[210px] w-[170px] overflow-hidden rounded-[28px] border border-white/60 text-right shadow-[0_22px_44px_-22px_rgba(60,40,15,0.55),inset_0_1px_0_rgba(255,255,255,0.6)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
                  style={{ background: c.gradient }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 60% at 10% 0%, rgba(255,255,255,0.55), transparent 55%)," +
                        "radial-gradient(80% 60% at 100% 100%, rgba(0,0,0,0.18), transparent 60%)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute -left-2 -bottom-4 select-none font-black leading-none"
                    style={{ fontSize: 130, color: "rgba(255,255,255,0.28)", textShadow: "0 4px 18px rgba(0,0,0,0.15)" }}
                  >
                    {c.glyph}
                  </span>
                  <div
                    className="absolute top-3 right-3 grid h-[78px] w-[78px] place-items-center rounded-2xl"
                    style={{
                      background: "linear-gradient(160deg,rgba(255,255,255,0.65),rgba(255,255,255,0.15))",
                      boxShadow: "0 14px 24px -10px rgba(80,40,10,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <img
                      src={c.icon}
                      alt=""
                      draggable={false}
                      className="h-[64px] w-[64px] object-contain"
                      style={{ filter: "drop-shadow(0 8px 10px rgba(60,30,5,0.35))" }}
                    />
                  </div>
                  <div className="absolute inset-x-3 bottom-3">
                    <h3 className="text-[17px] font-extrabold leading-tight text-white" style={{ textShadow: "0 2px 6px rgba(60,30,5,0.45)" }}>
                      {c.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-medium text-white/90 leading-snug" style={{ textShadow: "0 1px 3px rgba(60,30,5,0.35)" }}>
                      {c.sub}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-white" style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)" }}>
                      افتح
                      <ChevronLeft className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Pressable>
            ))}
          </div>
        </section>

        {/* Secondary modules */}
        <section className="mt-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-[13px] font-extrabold text-[#3a2a18]">اكتشف اليوم</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {secondary.map((s) => (
              <Pressable key={s.key} to={s.to} ariaLabel={s.title}>
                <div
                  className="relative overflow-hidden rounded-2xl border border-white/60 p-3 text-right shadow-[0_10px_22px_-14px_rgba(60,40,15,0.40),inset_0_1px_0_rgba(255,255,255,0.7)]"
                  style={{ background: s.bg }}
                >
                  <span
                    aria-hidden
                    className="absolute -left-2 -bottom-3 select-none font-black leading-none"
                    style={{ fontSize: 64, color: `${s.color}1f` }}
                  >
                    Ⲁ
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="grid h-11 w-11 place-items-center rounded-xl"
                      style={{
                        background: "linear-gradient(160deg,rgba(255,255,255,0.85),rgba(255,255,255,0.35))",
                        boxShadow: `0 8px 14px -8px ${s.color}66, inset 0 1px 0 rgba(255,255,255,0.9)`,
                      }}
                    >
                      <img
                        src={s.icon}
                        alt=""
                        draggable={false}
                        className="h-8 w-8 object-contain"
                        style={{ filter: "drop-shadow(0 4px 6px rgba(60,30,5,0.25))" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-extrabold leading-tight" style={{ color: s.color }}>
                        {s.title}
                      </h3>
                      <p className="text-[10px] text-[#6a543a]/85 mt-0.5">اضغط للعرض</p>
                    </div>
                  </div>
                </div>
              </Pressable>
            ))}
          </div>
        </section>

        {/* Continue reading */}
        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-[13px] font-extrabold text-[#3a2a18]">متابعة القراءة</h2>
            <span className="text-[11px] font-bold text-[#b8893a]">آخر ما فتحت</span>
          </div>
          <Pressable to="/books" ariaLabel="استكمل الكتاب المقدس">
            <div
              className="relative flex items-center gap-3 overflow-hidden rounded-3xl border border-white/60 p-2.5 shadow-[0_14px_28px_-16px_rgba(60,40,15,0.45),inset_0_1px_0_rgba(255,255,255,0.7)]"
              style={{ background: "linear-gradient(135deg,#fff7e3 0%,#f0dcab 100%)" }}
            >
              <span
                aria-hidden
                className="absolute -left-3 -bottom-4 select-none font-black leading-none"
                style={{ fontSize: 90, color: "rgba(202,161,95,0.18)" }}
              >
                Ⲱ
              </span>
              <img
                src={continueImg}
                alt=""
                className="h-[78px] w-[110px] rounded-2xl object-cover shadow-[0_10px_18px_-10px_rgba(60,30,5,0.45)]"
                draggable={false}
              />
              <div className="flex-1 text-right">
                <h3 className="text-[14px] font-extrabold text-[#3a2a18]">إنجيل يوحنا</h3>
                <p className="mt-0.5 text-[11px] text-[#6a543a] leading-snug">الإصحاح 3 · اليوم 5 من 30</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/60 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: "35%", background: "linear-gradient(90deg,#caa15f,#7a4a26)" }} />
                  </div>
                  <span className="text-[11px] font-bold text-[#7a4a26]">35%</span>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-[#b8893a] shrink-0" />
            </div>
          </Pressable>
        </section>

        {/* Mini player */}
        <section className="mt-4">
          <div
            className="relative flex items-center gap-3 overflow-hidden rounded-3xl border border-white/60 p-2.5 shadow-[0_14px_28px_-16px_rgba(60,40,15,0.40),inset_0_1px_0_rgba(255,255,255,0.7)]"
            style={{ background: "linear-gradient(135deg,#fff4d6 0%,#ead09a 100%)" }}
          >
            <img src={playerImg} alt="" className="h-14 w-14 rounded-2xl object-cover" draggable={false} />
            <div className="flex-1 text-right">
              <h3 className="text-[14px] font-extrabold text-[#3a2a18]">مجدك في الأعالي</h3>
              <p className="text-[11px] text-[#6a543a]">ترنيمة</p>
            </div>
            <div className="flex items-center gap-1">
              <button aria-label="السابق" className="grid h-9 w-9 place-items-center text-[#3a2a18] active:scale-90 transition-transform">
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                aria-label={playing ? "إيقاف" : "تشغيل"}
                onClick={() => setPlaying((p) => !p)}
                className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#e7c97a] to-[#a8782a] text-white shadow-[0_10px_22px_-6px_rgba(120,80,20,0.55)] active:scale-95 transition-transform"
              >
                {playing ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
              </button>
              <button aria-label="التالي" className="grid h-9 w-9 place-items-center text-[#3a2a18] active:scale-90 transition-transform">
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Bottom dock — premium iOS-style glass dock with smart hide/show */}
      <nav
        aria-label="التنقل السفلي"
        className="fixed inset-x-0 bottom-0 z-50 transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
          transform: dockVisible ? "translateY(0)" : "translateY(120%)",
          opacity: dockVisible ? 1 : 0,
          pointerEvents: dockVisible ? "auto" : "none",
        }}
      >
        <div className="mx-auto w-full max-w-[440px] px-3">
          <div className="relative rounded-[28px] bg-[#fbf3e1]/85 border border-white/70 shadow-[0_-10px_30px_-12px_rgba(120,80,30,0.30),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl">
            <div className="grid grid-cols-5 items-end px-2 pt-2.5 pb-2">
              {/* RTL order: الرئيسية (right) ... الملف الشخصي (left) */}
              <DockItem icon={HomeIcon} label="الرئيسية" active to="/home" color="#d96b2a" />
              <DockItem icon={HandHeart} label="الصلاة" to="/agpeya" color="#3a6fb5" />
              <DockItem label="الكتاب المقدس" raised to="/books" />
              <DockItem icon={Users} label="المجتمع" color="#6a4ab5" />
              <DockItem icon={UserIcon} label="الملف الشخصي" color="#6a4ab5" />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

function DockItem({
  icon: Icon, label, active, raised, to,
}: { icon?: any; label: string; active?: boolean; raised?: boolean; to?: string; color?: string }) {
  const goldColor = "#b8893a";
  const inner = (
    <div className="flex w-full flex-col items-center justify-end gap-1.5">
      {raised ? (
        <div
          className="-mt-8 grid h-16 w-16 place-items-center"
          style={{
            filter: "drop-shadow(0 0 12px rgba(231,201,122,0.45)) drop-shadow(0 6px 10px rgba(168,120,42,0.20))",
          }}
        >
          <img src={logoBible} alt="الكتاب المقدس" className="h-full w-full object-contain" draggable={false} />
        </div>
      ) : Icon ? (
        <Icon
          className="h-6 w-6"
          strokeWidth={1.8}
          style={{ color: goldColor, opacity: active ? 1 : 0.95 }}
        />
      ) : null}

      <span
        className="text-[11px] font-bold leading-none whitespace-nowrap [word-break:keep-all]"
        style={{ color: goldColor }}
      >
        {label}
      </span>
    </div>
  );
  const cls = "flex items-end justify-center py-1 transition-transform duration-150 ease-out active:scale-[0.96] active:opacity-80";
  if (to) return <Link to={to as any} className={cls}>{inner}</Link>;
  return <button type="button" className={cls}>{inner}</button>;
}
