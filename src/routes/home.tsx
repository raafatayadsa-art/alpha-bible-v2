import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Menu, Bell, Search, Sun, Bookmark, Share2,
  BookOpen, Headphones, HandHeart, Users, CalendarDays, Flame,
  ChevronLeft, Play, SkipBack, SkipForward,
  User, Users2, BookMarked, HeartHandshake, Home as HomeIcon,
} from "lucide-react";

export const Route = createFileRoute("/home")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ألفا — الرئيسية" },
      { name: "description", content: "الشاشة الرئيسية لتطبيق ألفا — الكتاب المقدس، الصلوات، الترانيم، المجتمع." },
    ],
  }),
  component: HomeScreen,
});

// ---------- helpers ----------
function useGreeting() {
  const [h, setH] = useState(() => new Date().getHours());
  useEffect(() => {
    const t = setInterval(() => setH(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (h >= 5 && h < 12) return { text: "صباح الخير", icon: "☀️" };
  if (h >= 12 && h < 18) return { text: "نهارك سعيد", icon: "🌤️" };
  if (h >= 18 && h < 23) return { text: "مساء الخير", icon: "🌙" };
  return { text: "تصبح على خير", icon: "✨" };
}

const DAILY_VERSES = [
  { text: "«رَبَّنَا هُوَ مَلْجَأَنَا وَقُوَّتَنَا، عَوْنًا فِي الضِّيقَاتِ جِدًّا»", ref: "مزامير 46:1" },
  { text: "«الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ»", ref: "مزامير 23:1" },
  { text: "«أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي»", ref: "فيلبي 4:13" },
  { text: "«مَحَبَّةُ اللهِ قَدِ انْسَكَبَتْ فِي قُلُوبِنَا»", ref: "رومية 5:5" },
];

// ---------- atoms ----------
function GlassCard({
  children, className = "", as: As = "div", ...rest
}: React.HTMLAttributes<HTMLDivElement> & { as?: any; className?: string }) {
  return (
    <As
      className={[
        "relative rounded-3xl",
        "bg-white/55 backdrop-blur-xl",
        "border border-white/60",
        "shadow-[0_10px_30px_-12px_rgba(120,80,30,0.18),inset_0_1px_0_rgba(255,255,255,0.6)]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </As>
  );
}

function Pressable({
  children, onClick, to, params, className = "", ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  params?: Record<string, string>;
  className?: string;
  ariaLabel?: string;
}) {
  const [pressed, setPressed] = useState(false);
  const cls = [
    "block w-full text-right transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none",
    pressed ? "scale-[0.975]" : "scale-100",
    className,
  ].join(" ");
  const handlers = {
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onPointerCancel: () => setPressed(false),
  };
  if (to) {
    return (
      <Link to={to as any} params={params as any} aria-label={ariaLabel} className={cls} {...handlers}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={cls} {...handlers}>
      {children}
    </button>
  );
}

// ---------- screen ----------
function HomeScreen() {
  const greeting = useGreeting();
  const navigate = useNavigate();
  const userName = "رافت";

  const [verseIdx, setVerseIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setVerseIdx((i) => (i + 1) % DAILY_VERSES.length), 7000);
    return () => clearInterval(t);
  }, []);
  const verse = DAILY_VERSES[verseIdx];

  const quickCards = useMemo(
    () => [
      { key: "read", title: "اكمل القراءة", sub: "تابع حيث توقفت في الكتاب المقدس",
        icon: BookOpen, tint: "from-[#7a4a26] to-[#c79356]", to: "/books" },
      { key: "hymn", title: "ترنيمة اليوم", sub: "استمع لترنيمة مختارة كل يوم",
        icon: Headphones, tint: "from-[#5b4b8a] to-[#a48dd6]" },
      { key: "pray", title: "طلبات الصلاة", sub: "قدم طلبك وصل من أجل الآخرين",
        icon: HandHeart, tint: "from-[#b97a55] to-[#e3b48a]" },
      { key: "meet", title: "اجتماع اليوم", sub: "لا تفوت اجتماع كنيستك اليوم",
        icon: Users, tint: "from-[#2b6b8a] to-[#4ea3c2]" },
      { key: "cal",  title: "المناسبات",   sub: "اكتشف المناسبات القادمة",
        icon: CalendarDays, tint: "from-[#6a5a8c] to-[#b7a4dc]" },
      { key: "tafl", title: "التأمل اليومي", sub: "لحظات من التأمل والقرب من الله",
        icon: Flame, tint: "from-[#7a8a4a] to-[#c2b074]" },
    ],
    [],
  );

  const churchItems = [
    { key: "mass",  title: "قداس الأحد", time: "الأحد 12 مايو · 8:00 ص", place: "كنيسة مارمرقس", icon: "⛪" },
    { key: "youth", title: "اجتماع الشباب", time: "الجمعة 17 مايو · 7:00 م", place: "قاعة الاجتماعات", icon: "👥" },
    { key: "notif", title: "أشعار جديد", time: "تغيير في موعد اجتماع", place: "الخدمة القادمة", icon: "🔔" },
  ];

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      {/* Warm beige + gold ambient background */}
      <div className="absolute inset-0 -z-10 bg-[#f4ead8]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(255,231,184,0.55), transparent 60%)," +
            "radial-gradient(80% 60% at 100% 30%, rgba(231,201,138,0.35), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 80%, rgba(214,168,98,0.20), transparent 65%)",
        }}
      />

      <div className="mx-auto w-full max-w-md px-4 pb-32 pt-[max(env(safe-area-inset-top),12px)]">
        {/* ===== Top bar ===== */}
        <header className="flex items-center justify-between gap-3 pt-2">
          <Pressable ariaLabel="القائمة" className="!w-auto">
            <GlassCard className="h-11 w-11 grid place-items-center">
              <Menu className="h-5 w-5 text-[#3a2a18]" />
            </GlassCard>
          </Pressable>

          <div className="flex items-center gap-2 font-bold text-[#3a2a18]">
            <Sun className="h-4 w-4 text-[#c79356]" />
            <span className="text-[15px]">{greeting.text} يا {userName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Pressable ariaLabel="الإشعارات" className="!w-auto">
              <GlassCard className="relative h-11 w-11 grid place-items-center">
                <Bell className="h-5 w-5 text-[#3a2a18]" />
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#c79356] text-[10px] font-bold text-white shadow">1</span>
              </GlassCard>
            </Pressable>
            <Pressable ariaLabel="بحث" className="!w-auto">
              <GlassCard className="h-11 w-11 grid place-items-center">
                <Search className="h-5 w-5 text-[#3a2a18]" />
              </GlassCard>
            </Pressable>
          </div>
        </header>

        {/* ===== Verse of the day ===== */}
        <section className="mt-4">
          <GlassCard className="overflow-hidden">
            <div
              className="relative h-56 w-full"
              style={{
                background:
                  "linear-gradient(135deg, #f6c98a 0%, #d28a4f 45%, #6b3a26 100%)",
              }}
            >
              {/* soft sun + church silhouette done with pure CSS shapes for atmosphere */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(40% 40% at 80% 75%, rgba(255,240,200,0.9), transparent 60%)," +
                    "radial-gradient(60% 60% at 20% 110%, rgba(0,0,0,0.25), transparent 60%)",
                }}
              />
              <div className="absolute top-3 right-3">
                <GlassCard className="px-3 py-1 text-xs font-semibold text-[#3a2a18] flex items-center gap-1">
                  <Sun className="h-3.5 w-3.5 text-[#c79356]" /> آية اليوم
                </GlassCard>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <p
                  key={verse.ref}
                  className="text-white font-serif text-[18px] leading-[1.9] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] animate-[fadeIn_700ms_ease-out]"
                  style={{ fontFamily: '"Amiri","Scheherazade New",serif' }}
                >
                  {verse.text}
                </p>
                <p className="mt-3 text-white/95 text-sm font-semibold">{verse.ref}</p>
              </div>

              {/* dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {DAILY_VERSES.map((_, i) => (
                  <span
                    key={i}
                    className={[
                      "h-1.5 rounded-full transition-all",
                      i === verseIdx ? "w-4 bg-white" : "w-1.5 bg-white/50",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3">
              <Pressable ariaLabel="مشاركة" className="!w-auto">
                <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#3a2a18] border border-white/60">
                  <Share2 className="h-4 w-4" /> مشاركة
                </div>
              </Pressable>
              <Pressable ariaLabel="حفظ" className="!w-auto">
                <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#3a2a18] border border-white/60">
                  <Bookmark className="h-4 w-4" /> حفظ الآية
                </div>
              </Pressable>
            </div>
          </GlassCard>
        </section>

        {/* ===== Quick access grid ===== */}
        <section className="mt-4 grid grid-cols-3 gap-3">
          {quickCards.map((c) => {
            const Icon = c.icon;
            return (
              <Pressable
                key={c.key}
                to={c.to}
                ariaLabel={c.title}
                onClick={!c.to ? () => navigate({ to: "/home" }) : undefined}
              >
                <GlassCard className="h-full p-3 text-center">
                  <div className={`mx-auto mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.tint} shadow-[0_8px_20px_-8px_rgba(80,40,10,0.45)]`}>
                    <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[13px] font-bold text-[#3a2a18] leading-tight">{c.title}</h3>
                  <p className="mt-1 text-[10px] leading-snug text-[#6a543a]">{c.sub}</p>
                  <div className="mt-2 flex justify-center">
                    <ChevronLeft className="h-3.5 w-3.5 text-[#c79356]" />
                  </div>
                </GlassCard>
              </Pressable>
            );
          })}
        </section>

        {/* ===== Continue your journey ===== */}
        <section className="mt-4">
          <Pressable ariaLabel="استكمل رحلتك" to="/books">
            <GlassCard className="flex items-center gap-3 p-3">
              <div
                className="h-16 w-20 shrink-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #6b3a1d, #c79356), radial-gradient(circle at 30% 30%, rgba(255,220,160,0.6), transparent 60%)",
                }}
              />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#3a2a18]">استكمل رحلتك</h3>
                <p className="mt-0.5 text-[11px] text-[#6a543a]">خطة قراءة الكتاب المقدس · اليوم 5 من 30</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-[#e8d8b8] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#c79356] to-[#7a4a26]" style={{ width: "35%" }} />
                  </div>
                  <span className="text-[11px] font-bold text-[#7a4a26]">35%</span>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-[#c79356]" />
            </GlassCard>
          </Pressable>
        </section>

        {/* ===== From your church ===== */}
        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#3a2a18]">من كنيستك</h2>
            <button className="text-xs font-semibold text-[#c79356]">عرض الكل</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {churchItems.map((it) => (
              <Pressable key={it.key} ariaLabel={it.title}>
                <GlassCard className="p-2.5 text-right">
                  <div className="text-xl">{it.icon}</div>
                  <h3 className="mt-1 text-[12px] font-bold text-[#3a2a18] leading-tight">{it.title}</h3>
                  <p className="mt-0.5 text-[10px] leading-tight text-[#6a543a]">{it.time}</p>
                  <p className="text-[10px] leading-tight text-[#6a543a]">{it.place}</p>
                </GlassCard>
              </Pressable>
            ))}
          </div>
        </section>

        {/* ===== Mini player ===== */}
        <section className="mt-4">
          <GlassCard className="flex items-center gap-3 p-3">
            <div
              className="h-12 w-12 shrink-0 rounded-xl"
              style={{ background: "linear-gradient(135deg,#3a2a18,#c79356)" }}
            />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#3a2a18]">مجدك في الأعالي</h3>
              <p className="text-[11px] text-[#6a543a]">ترنيمة</p>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="السابق" className="grid h-9 w-9 place-items-center text-[#3a2a18]">
                <SkipBack className="h-5 w-5" />
              </button>
              <button aria-label="تشغيل" className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#e7c97a] to-[#a8782a] text-white shadow-[0_8px_20px_-6px_rgba(120,80,20,0.55)]">
                <Play className="h-5 w-5 fill-white" />
              </button>
              <button aria-label="التالي" className="grid h-9 w-9 place-items-center text-[#3a2a18]">
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </GlassCard>
        </section>
      </div>

      {/* ===== Bottom navigation (glass dock) ===== */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div className="mx-auto w-full max-w-md px-4">
          <GlassCard className="relative mb-2 flex items-end justify-around px-2 py-2">
            <NavItem icon={User}        label="الملف الشخصي" />
            <NavItem icon={Users2}      label="المجتمع" />
            <NavItem icon={BookMarked}  label="الكتاب المقدس" highlight to="/books" />
            <NavItem icon={HeartHandshake} label="الصلاة" />
            <NavItem icon={HomeIcon}    label="الرئيسية" active to="/home" />
          </GlassCard>
        </div>
      </nav>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: none;} }
      `}</style>
    </div>
  );
}

function NavItem({
  icon: Icon, label, active, highlight, to,
}: {
  icon: any; label: string; active?: boolean; highlight?: boolean; to?: string;
}) {
  const inner = (
    <div className="flex flex-col items-center gap-0.5 px-1">
      {highlight ? (
        <div className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#e7c97a] to-[#a8782a] shadow-[0_10px_24px_-8px_rgba(120,80,20,0.6)] border-4 border-[#f4ead8]">
          <Icon className="h-6 w-6 text-white" strokeWidth={2} />
        </div>
      ) : (
        <Icon
          className={[
            "h-5 w-5",
            active ? "text-[#c0532a]" : "text-[#3a2a18]/80",
          ].join(" ")}
          strokeWidth={2}
        />
      )}
      <span className={[
        "text-[10px] font-semibold",
        active ? "text-[#c0532a]" : "text-[#3a2a18]/80",
      ].join(" ")}>{label}</span>
    </div>
  );
  if (to) {
    return (
      <Link to={to as any} className="flex-1 py-1 active:scale-95 transition-transform">
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className="flex-1 py-1 active:scale-95 transition-transform">
      {inner}
    </button>
  );
}
