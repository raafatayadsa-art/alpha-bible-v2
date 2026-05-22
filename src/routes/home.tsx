import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, Bell, Search, Sparkles, Share2, Bookmark, ChevronLeft, SkipBack, SkipForward, Play, Pause, Home as HomeIcon, HandHeart, Users, User as UserIcon, BookMarked } from "lucide-react";

import heroImg from "@/assets/home/hero.png";
import iconBible from "@/assets/home/icon-bible.png";
import iconHymn from "@/assets/home/icon-hymn.png";
import iconPrayer from "@/assets/home/icon-prayer.png";
import iconMeeting from "@/assets/home/icon-meeting.png";
import iconCalendar from "@/assets/home/icon-calendar.png";
import iconMeditation from "@/assets/home/icon-meditation.png";
import continueImg from "@/assets/home/continue.png";
import playerImg from "@/assets/home/player.png";
import churchChalice from "@/assets/home/church-chalice.png";
import churchPeople from "@/assets/home/church-people.png";
import churchBell from "@/assets/home/church-bell.png";

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

  const quickCards = [
    { key: "bible", icon: iconBible, title: "اكمل القراءة", sub: "تابع حيث توقفت\nفي الكتاب المقدس", to: "/books" },
    { key: "hymn", icon: iconHymn, title: "ترنيمة اليوم", sub: "استمع لترنيمة مختارة\nكل يوم" },
    { key: "prayer", icon: iconPrayer, title: "طلبات الصلاة", sub: "قدم طلبك وصل\nمن أجل الآخرين" },
    { key: "meeting", icon: iconMeeting, title: "اجتماع اليوم", sub: "لا تفوت اجتماع\nكنيستك اليوم" },
    { key: "calendar", icon: iconCalendar, title: "المناسبات", sub: "اكتشف المناسبات\nالقادمة" },
    { key: "meditation", icon: iconMeditation, title: "التأمل اليومي", sub: "لحظات من التأمل\nوالقرب من الله" },
  ];

  const church = [
    { key: "mass", img: churchChalice, title: "قداس الأحد", time: "الأحد 12 مايو · 8:00 ص", place: "كنيسة مارمرقس" },
    { key: "youth", img: churchPeople, title: "اجتماع الشباب", time: "الجمعة 17 مايو · 7:00 م", place: "قاعة الاجتماعات" },
    { key: "notif", img: churchBell, title: "أشعار جديد", time: "تغيير في موعد اجتماع", place: "الخدمة القادمة" },
  ];

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]">
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
            <Pressable ariaLabel="بحث">
              <GlassChip className="h-11 w-11 grid place-items-center">
                <Search className="h-5 w-5 text-[#3a2a18]" />
              </GlassChip>
            </Pressable>
          </div>
        </header>


        {/* Hero verse card */}
        <section className="mt-4">
          <div className="relative overflow-hidden rounded-[28px] shadow-[0_20px_40px_-18px_rgba(120,80,30,0.45)]">
            <img src={heroImg} alt="آية اليوم" className="block w-full h-auto select-none pointer-events-none" draggable={false} />
            {/* invisible interactive overlays positioned on baked buttons */}
            <button
              aria-label="مشاركة"
              className="absolute bottom-[6%] right-[4%] w-[28%] h-[16%] rounded-full active:scale-95 transition-transform"
              onClick={() => navigator.share?.({ title: "آية اليوم", text: "ربنا هو ملجأنا وقوتنا" }).catch(() => {})}
            />
            <button
              aria-label="حفظ الآية"
              className={"absolute bottom-[6%] left-[4%] w-[28%] h-[16%] rounded-full active:scale-95 transition-transform " + (saved ? "ring-2 ring-[#c79356]" : "")}
              onClick={() => setSaved((s) => !s)}
            />
            {/* hidden labels for a11y */}
            <span className="sr-only"><Share2 /><Bookmark /></span>
          </div>
        </section>

        {/* Quick access grid 3x2 */}
        <section className="mt-4 grid grid-cols-3 gap-2.5">
          {quickCards.map((c) => (
            <Pressable key={c.key} to={c.to} ariaLabel={c.title} className="min-w-0">
              <div className="relative h-full rounded-3xl bg-[#fbf3e1] border border-[#efe2c4] shadow-[0_10px_24px_-14px_rgba(120,80,30,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] px-2 pt-2.5 pb-2 text-center min-w-0">
                <div className="mx-auto h-[72px] w-full grid place-items-center overflow-hidden">
                  <img src={c.icon} alt="" className="max-h-[72px] max-w-full object-contain drop-shadow-[0_8px_10px_rgba(80,40,10,0.18)]" draggable={false} />
                </div>
                <h3 className="mt-1.5 text-[12px] font-extrabold text-[#3a2a18] leading-tight [word-break:keep-all] [overflow-wrap:normal]">{c.title}</h3>
                <p className="mt-0.5 text-[10px] leading-[1.35] text-[#6a543a] whitespace-pre-line [word-break:keep-all]">{c.sub}</p>
                <div className="mt-1 flex justify-center">
                  <ChevronLeft className="h-3.5 w-3.5 text-[#b8893a]" />
                </div>
              </div>
            </Pressable>
          ))}
        </section>


        {/* Continue your journey */}
        <section className="mt-4">
          <Pressable to="/books" ariaLabel="استكمل رحلتك">
            <div className="flex items-center gap-3 rounded-3xl bg-[#fbf3e1] border border-[#efe2c4] p-2.5 shadow-[0_10px_24px_-14px_rgba(120,80,30,0.30)]">
              <img src={continueImg} alt="" className="h-[78px] w-[110px] rounded-2xl object-cover" draggable={false} />
              <div className="flex-1 text-right">
                <h3 className="text-[14px] font-extrabold text-[#3a2a18]">استكمل رحلتك</h3>
                <p className="mt-0.5 text-[11px] text-[#6a543a] leading-snug">خطة قراءة الكتاب المقدس<br />اليوم 5 من 30 يوم</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[#ecdcb6] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#c79356] to-[#7a4a26]" style={{ width: "35%" }} />
                  </div>
                  <span className="text-[11px] font-bold text-[#7a4a26]">35%</span>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-[#b8893a] shrink-0" />
            </div>
          </Pressable>
        </section>

        {/* From your church */}
        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-[13px] font-extrabold text-[#3a2a18]">من كنيستك</h2>
            <button className="text-[12px] font-bold text-[#b8893a]">عرض الكل</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {church.map((it) => (
              <Pressable key={it.key} ariaLabel={it.title}>
                <div className="rounded-2xl bg-[#fbf3e1] border border-[#efe2c4] p-2.5 text-right shadow-[0_8px_18px_-12px_rgba(120,80,30,0.30)]">
                  <img src={it.img} alt="" className="h-12 w-auto object-contain" draggable={false} />
                  <h3 className="mt-1 text-[12px] font-bold text-[#3a2a18] leading-tight">{it.title}</h3>
                  <p className="mt-0.5 text-[10px] leading-tight text-[#6a543a]">{it.time}</p>
                  <p className="text-[10px] leading-tight text-[#6a543a]">{it.place}</p>
                </div>
              </Pressable>
            ))}
          </div>
        </section>

        {/* Mini player */}
        <section className="mt-4">
          <div className="flex items-center gap-3 rounded-3xl bg-[#fbf3e1] border border-[#efe2c4] p-2.5 shadow-[0_10px_24px_-14px_rgba(120,80,30,0.30)]">
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
              <DockItem icon={HandHeart} label="الصلاة" color="#3a6fb5" />
              <DockItem icon={BookMarked} label="الكتاب المقدس" raised to="/books" />
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
  icon: Icon, label, active, raised, to, color,
}: { icon: any; label: string; active?: boolean; raised?: boolean; to?: string; color?: string }) {
  const inner = (
    <div className="flex w-full flex-col items-center justify-end gap-1">
      {raised ? (
        <div className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#e7c97a] to-[#a8782a] text-white shadow-[0_10px_24px_-4px_rgba(200,140,40,0.65),0_0_0_4px_rgba(255,234,190,0.8)]">
          <Icon className="h-7 w-7" strokeWidth={2.2} />
        </div>
      ) : (
        <Icon
          className="h-6 w-6"
          strokeWidth={2.2}
          style={{ color: active ? "#d96b2a" : (color || "#3a2a18") }}
        />
      )}
      <span
        className="text-[10px] font-bold leading-none whitespace-nowrap [word-break:keep-all]"
        style={{ color: active ? "#d96b2a" : "#3a2a18" }}
      >
        {label}
      </span>
    </div>
  );
  const cls = "flex items-end justify-center py-1 active:scale-95 transition-transform";
  if (to) return <Link to={to as any} className={cls}>{inner}</Link>;
  return <button type="button" className={cls}>{inner}</button>;
}
