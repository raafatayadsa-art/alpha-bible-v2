import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, BookOpen, ChevronLeft, Crown, Mountain, Flame, Sparkles, Users } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SAINTS, getTodaySaint, type Saint } from "@/features/synaxarium";
import { BottomDock } from "@/components/bible/BottomDock";
import { GlassSurface } from "@/components/bible/primitives";
import { CopticCross, CopticWatermark, CopticSeparator } from "@/components/coptic";
import { SearchOverlay } from "@/components/overlays/SearchOverlay";
import { NotificationsCenter, type NotificationItem } from "@/components/overlays/NotificationsCenter";
import { cn } from "@/lib/utils";

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

type SaintCategory = "all" | "martyrs" | "monks" | "patriarchs" | "saintesses";

const CATEGORIES: { id: SaintCategory; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "martyrs", label: "شهداء" },
  { id: "monks", label: "رهبان" },
  { id: "patriarchs", label: "بطاركة" },
  { id: "saintesses", label: "قديسات" },
];

const CATEGORY_ICONS: Record<SaintCategory, ReactNode> = {
  all: <Users className="h-3.5 w-3.5" />,
  martyrs: <Flame className="h-3.5 w-3.5" />,
  monks: <Mountain className="h-3.5 w-3.5" />,
  patriarchs: <Crown className="h-3.5 w-3.5" />,
  saintesses: <Sparkles className="h-3.5 w-3.5" />,
};

// Local-only categorization (UI only — no backend changes to data model)
const SAINT_CATEGORY: Record<string, Exclude<SaintCategory, "all">> = {
  shenouda: "monks",
  antony: "monks",
  "shenouda-2": "monks",
};

const ACCENTS = ["#6a4ab5", "#b8893a", "#3e7a55", "#3a6a9b"];

function SynaxariumHome() {
  const [active, setActive] = useState<SaintCategory>("all");
  const today = getTodaySaint();
  const list: Saint[] =
    active === "all" ? SAINTS : SAINTS.filter((s) => SAINT_CATEGORY[s.id] === active);
  const upcoming = list.filter((s) => s.id !== today.id);
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    {
      id: "saint-today",
      title: `سيرة اليوم: ${today.name}`,
      description: today.summary,
      time: "اليوم",
      read: false,
      icon: <CopticCross size={14} />,
      onOpen: () => navigate({ to: "/synaxarium/$saintId", params: { saintId: today.id } }),
    },
  ]);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const handleMartyrs = () => {
    setActive("martyrs");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const searchResults = SAINTS.filter((s) => {
    if (!query.trim()) return true;
    const q = query.trim();
    return (
      s.name.includes(q) ||
      s.title.includes(q) ||
      s.summary.includes(q) ||
      s.copticDate.includes(q)
    );
  });

  return (
    <div ref={topRef} dir="rtl" className="relative min-h-dvh bg-[#faf8f3]">
      <CopticWatermark />

      {/* Header */}
      <header
        className="relative z-10 mx-auto w-full max-w-[430px] px-4 flex items-center justify-between"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: 8 }}
      >
        <button
          type="button"
          onClick={() => setNotifOpen(true)}
          aria-label="التنبيهات"
          className="relative grid h-10 w-10 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#6a4ab5]" />
        </button>
        <div className="flex flex-col items-center -mt-1">
          <CopticCross className="text-[#b8893a]" size={18} />
          <h1 className="font-arabic-serif text-[20px] font-extrabold text-[#3a2a18] leading-tight">
            السنكسار
          </h1>
          <p className="text-[10.5px] text-[#6a543a] -mt-0.5">سير القديسين وقراءات اليوم</p>
        </div>
        <button
          type="button"
          aria-label="البحث في السنكسار"
          onClick={() => setSearchOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#ead9b1] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]"
        >
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

        {/* Today hero — Saint of the day */}
        <Link
          to="/synaxarium/$saintId"
          params={{ saintId: today.id }}
          className="block mt-3 active:scale-[0.99] transition-transform"
        >
          <GlassSurface className="overflow-hidden p-0 bg-white border-[#ead9b1] shadow-[0_18px_40px_-22px_rgba(120,80,30,0.55)]">
            <div className="relative h-[230px] overflow-hidden">
              <img
                src={today.image}
                alt={today.name}
                loading="eager"
                decoding="async"
                draggable={false}
                className="absolute inset-y-0 right-0 h-full w-[68%] object-cover object-center select-none"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to left, rgba(255,255,255,0) 30%, rgba(255,251,240,0.35) 50%, rgba(255,250,238,0.85) 60%, #ffffff 70%)",
                }}
              />
              <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />

              <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-[#3a2a18] border border-[#ead9b1] shadow-[0_4px_10px_-8px_rgba(120,80,30,0.5)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6a4ab5]" />
                قديس اليوم
              </div>

              <div className="absolute inset-y-0 left-0 right-[42%] p-6 pl-7 flex flex-col justify-center">
                <div className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#b8893a]">
                  <CopticCross size={10} />
                  <span>{today.copticDate}</span>
                  <span className="text-[#b8893a]/60">· Ⲁ Ⲱ</span>
                </div>
                <h2 className="font-arabic-serif text-[20px] font-extrabold text-[#3a2a18] leading-tight text-right mt-1.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] line-clamp-2">
                  {today.name}
                </h2>
                <p className="text-[11.5px] text-[#6a543a] mt-1 text-right line-clamp-1">{today.title}</p>
                <p className="text-[12px] text-[#3a2a18] mt-2.5 leading-relaxed line-clamp-3 text-right">
                  {today.summary}
                </p>
                <span className="mt-3 self-end inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-[#6a4ab5] to-[#8c6fd1] text-white px-3.5 h-9 text-[11.5px] font-bold shadow-[0_10px_18px_-10px_rgba(106,74,181,0.6)]">
                  <BookOpen className="h-3.5 w-3.5" />
                  اقرأ السيرة
                </span>
              </div>
            </div>
          </GlassSurface>
        </Link>

        {/* Timeline list */}
        <h3 className="mt-5 mb-2 px-1 font-arabic-serif text-[14px] font-extrabold text-[#3a2a18] flex items-center gap-2">
          <span className="text-[#b8893a]/70 text-[12px]">Ⲁ</span>
          سير القديسين
          <span className="flex-1 h-px bg-[#ead9b1]" />
          <span className="text-[#b8893a]/70 text-[12px]">Ⲱ</span>
        </h3>

        <div className="space-y-3">
          {upcoming.map((s, idx) => {
            const accent = ACCENTS[idx % ACCENTS.length];
            return (
              <Link
                key={s.id}
                to="/synaxarium/$saintId"
                params={{ saintId: s.id }}
                className="group block origin-center touch-manipulation select-none [-webkit-tap-highlight-color:transparent] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:scale-[1.02] active:scale-[0.985] active:translate-y-0 focus:outline-none"
              >
                <div className="relative pr-3">
                  <span
                    className="absolute top-1/2 -translate-y-1/2 right-0 h-2 w-2 rounded-full"
                    style={{ background: accent, boxShadow: `0 0 0 3px ${accent}22` }}
                    aria-hidden
                  />
                  <GlassSurface className="relative overflow-hidden p-0 bg-white border-[#ead9b1] shadow-[0_10px_24px_-20px_rgba(120,80,30,0.5)] transition-shadow duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] [@media(hover:hover)]:group-hover:shadow-[0_22px_40px_-22px_rgba(120,80,30,0.6)] group-focus-visible:shadow-[0_22px_40px_-22px_rgba(120,80,30,0.6)] group-active:shadow-[0_14px_28px_-20px_rgba(120,80,30,0.55)]">
                    <img
                      src={s.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="absolute inset-y-0 left-0 h-full w-[44%] object-cover object-center select-none transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [@media(hover:hover)]:group-hover:scale-[1.035] [@media(hover:hover)]:group-hover:-translate-x-0.5 group-focus-visible:scale-[1.035] group-focus-visible:-translate-x-0.5 group-active:scale-[1.02] group-active:-translate-x-0.5"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(255,255,255,0) 30%, rgba(255,250,238,0.5) 48%, #ffffff 62%)",
                      }}
                    />
                    <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />

                    <div className="relative grid grid-cols-[64px_minmax(0,1fr)_44%] items-center gap-3 p-3 min-h-[96px]">
                      {/* date block */}
                      <div
                        className="relative rounded-2xl border bg-white/95 backdrop-blur px-1.5 py-2 text-center shadow-[0_6px_14px_-10px_rgba(120,80,30,0.45)]"
                        style={{ borderColor: `${accent}40` }}
                      >
                        <div
                          className="text-[8.5px] font-extrabold uppercase tracking-wide leading-none"
                          style={{ color: accent }}
                        >
                          قبطي
                        </div>
                        <div
                          className="font-arabic-serif text-[15px] font-extrabold leading-tight mt-1.5"
                          style={{ color: accent }}
                        >
                          {s.copticDate.split(" ")[0]}
                        </div>
                        <div className="mx-auto mt-1 h-px w-6" style={{ background: `${accent}55` }} />
                        <div className="text-[9px] text-[#6a543a] mt-1 leading-none line-clamp-1">
                          {s.copticDate.split(" ").slice(1).join(" ")}
                        </div>
                      </div>
                      {/* center: name + summary */}
                      <div className="min-w-0 text-right">
                        <div className="font-arabic-serif text-[15.5px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
                          {s.name}
                        </div>
                        <div className="text-[12px] text-[#5a4630] line-clamp-2 mt-1 leading-relaxed">
                          {s.summary}
                        </div>
                        <div
                          className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-bold"
                          style={{ color: accent }}
                        >
                          <CopticCross size={10} />
                          <span>اقرأ السيرة</span>
                          <ChevronLeft className="h-3 w-3" />
                        </div>
                      </div>
                      <div aria-hidden />
                    </div>
                  </GlassSurface>
                </div>
              </Link>
            );
          })}
          {upcoming.length === 0 && (
            <div className="rounded-2xl bg-white border border-[#ead9b1] p-6 text-center text-[12px] text-[#6a543a]">
              لا توجد سير ضمن هذا التصنيف بعد.
            </div>
          )}
        </div>

        <CopticSeparator />

        {/* Bottom quick sections */}
        <div className="grid grid-cols-2 gap-2.5">
          <QuickTile
            tone="#6a4ab5"
            icon={<CopticCross size={14} />}
            label="قديس اليوم"
            sub={today.name.replace("القديس ", "").slice(0, 18)}
            to="/synaxarium/$saintId"
            params={{ saintId: today.id }}
          />
          <QuickTile
            tone="#b8423a"
            icon={<Flame className="h-3.5 w-3.5" />}
            label="شهداء اليوم"
            sub="تذكار الشهداء"
            onClick={handleMartyrs}
          />
          <QuickTile
            tone="#3e7a55"
            icon={<Crown className="h-3.5 w-3.5" />}
            label="أحداث الكنيسة"
            sub="من تاريخ اليوم"
            to="/feasts"
          />
          <QuickTile
            tone="#3a6a9b"
            icon={<Search className="h-3.5 w-3.5" />}
            label="البحث في السنكسار"
            sub="ابحث عن قديس"
            onClick={() => setSearchOpen(true)}
          />
        </div>

        {/* Alpha watermark footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[#b8893a]/70 font-bold tracking-widest">
          <span>Ⲁ</span>
          <span className="h-px w-10 bg-[#ead9b1]" />
          <span>ALPHA · السنكسار</span>
          <span className="h-px w-10 bg-[#ead9b1]" />
          <span>Ⲱ</span>
        </div>
      </main>

      <BottomDock />

      {/* Search Overlay */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="البحث في السنكسار"
        placeholder="ابحث باسم القديس أو التاريخ القبطي"
        query={query}
        onQueryChange={setQuery}
      >
        {searchResults.length === 0 ? (
          <p className="text-center text-[12px] text-[#6a543a] py-6">لا توجد نتائج</p>
        ) : (
          searchResults.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSearchOpen(false);
                navigate({ to: "/synaxarium/$saintId", params: { saintId: s.id } });
              }}
              className="w-full text-right flex items-center gap-3 rounded-2xl bg-[#faf8f3] border border-[#ead9b1] p-2.5 active:scale-[0.98] transition-transform"
            >
              <img src={s.image} alt="" className="h-12 w-12 rounded-xl object-cover" draggable={false} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">{s.name}</div>
                <div className="text-[11px] text-[#6a543a] mt-0.5 line-clamp-1">{s.copticDate} · {s.title}</div>
              </div>
              <ChevronLeft className="h-4 w-4 text-[#b8893a]" />
            </button>
          ))
        )}
      </SearchOverlay>

      {/* Notifications Center */}
      <NotificationsCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onDelete={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />
    </div>
  );
}

function QuickTile({
  icon,
  label,
  sub,
  tone,
  onClick,
  to,
  params,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  tone: string;
  onClick?: () => void;
  to?: string;
  params?: Record<string, string>;
}) {
  const inner = (
    <>
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ background: `${tone}14`, color: tone }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-extrabold text-[#3a2a18] leading-tight line-clamp-1">
          {label}
        </span>
        <span className="block text-[10.5px] text-[#6a543a] leading-tight mt-0.5 line-clamp-1">
          {sub}
        </span>
      </span>
      <ChevronLeft className="h-3.5 w-3.5 text-[#b8893a]" />
    </>
  );
  const className =
    "text-right rounded-2xl bg-white border border-[#ead9b1] p-3 flex items-center gap-2.5 shadow-[0_8px_18px_-12px_rgba(120,80,30,0.5)] active:scale-[0.98] transition-transform";
  if (to) {
    return (
      <Link to={to as any} params={params as any} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
