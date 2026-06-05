import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft, Bell, CheckCheck, HandHeart, MessageSquareHeart, Newspaper,
  Megaphone, CalendarDays, Radio, Briefcase, MessageCircle, Crown, Filter,
} from "lucide-react";
import { CHURCH_NOTIFICATIONS, type ChurchNotification, type NotifCategory } from "@/data/church-notifications";

export const Route = createFileRoute("/church/notifications")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "إشعارات الكنيسة — ألفا" },
      { name: "description", content: "إشعارات الكنيسة، الصلوات، الاجتماعات والرسائل." },
    ],
  }),
  component: ChurchNotificationsScreen,
});

/* ---------------- category theming ---------------- */

type Tone = {
  bg: string;
  ring: string;
  iconBg: string;
  iconColor: string;
  dot: string;
  label: string;
  icon: any;
};

const TONES: Record<NotifCategory, Tone> = {
  prayer: {
    bg: "linear-gradient(135deg, rgba(196,69,105,0.10), rgba(168,109,194,0.10))",
    ring: "rgba(196,69,105,0.30)",
    iconBg: "rgba(196,69,105,0.14)",
    iconColor: "#9a2f47",
    dot: "#c44569",
    label: "طلب صلاة",
    icon: HandHeart,
  },
  "prayer-comment": {
    bg: "linear-gradient(135deg, rgba(168,109,194,0.10), rgba(196,69,105,0.08))",
    ring: "rgba(168,109,194,0.30)",
    iconBg: "rgba(168,109,194,0.16)",
    iconColor: "#6b3a8a",
    dot: "#a86dc2",
    label: "تعليق صلاة",
    icon: MessageSquareHeart,
  },
  encouragement: {
    bg: "linear-gradient(135deg, rgba(196,69,105,0.08), rgba(168,109,194,0.10))",
    ring: "rgba(168,109,194,0.30)",
    iconBg: "rgba(196,69,105,0.12)",
    iconColor: "#9a2f47",
    dot: "#c44569",
    label: "رسالة تشجيع",
    icon: MessageSquareHeart,
  },
  post: {
    bg: "linear-gradient(135deg, rgba(199,147,86,0.14), rgba(232,200,134,0.14))",
    ring: "rgba(199,147,86,0.35)",
    iconBg: "rgba(199,147,86,0.18)",
    iconColor: "#8a5a1f",
    dot: "#c79356",
    label: "منشور",
    icon: Newspaper,
  },
  announcement: {
    bg: "linear-gradient(135deg, rgba(199,147,86,0.14), rgba(232,200,134,0.14))",
    ring: "rgba(199,147,86,0.35)",
    iconBg: "rgba(199,147,86,0.18)",
    iconColor: "#8a5a1f",
    dot: "#c79356",
    label: "إعلان",
    icon: Megaphone,
  },
  meeting: {
    bg: "linear-gradient(135deg, rgba(64,124,196,0.10), rgba(100,170,230,0.10))",
    ring: "rgba(64,124,196,0.30)",
    iconBg: "rgba(64,124,196,0.14)",
    iconColor: "#1e4d8a",
    dot: "#407cc4",
    label: "اجتماع",
    icon: CalendarDays,
  },
  live: {
    bg: "linear-gradient(135deg, rgba(64,124,196,0.10), rgba(196,69,105,0.10))",
    ring: "rgba(64,124,196,0.30)",
    iconBg: "rgba(64,124,196,0.14)",
    iconColor: "#1e4d8a",
    dot: "#407cc4",
    label: "بث مباشر",
    icon: Radio,
  },
  service: {
    bg: "linear-gradient(135deg, rgba(31,138,90,0.10), rgba(120,200,150,0.10))",
    ring: "rgba(31,138,90,0.30)",
    iconBg: "rgba(31,138,90,0.14)",
    iconColor: "#106a3f",
    dot: "#1f8a5a",
    label: "خدمة",
    icon: Briefcase,
  },
  message: {
    bg: "linear-gradient(135deg, rgba(255,180,140,0.16), rgba(255,210,170,0.16))",
    ring: "rgba(232,150,100,0.35)",
    iconBg: "rgba(232,150,100,0.18)",
    iconColor: "#8a4a1f",
    dot: "#e89664",
    label: "رسالة",
    icon: MessageCircle,
  },
  membership: {
    bg: "linear-gradient(135deg, rgba(232,200,134,0.18), rgba(245,235,210,0.20))",
    ring: "rgba(199,147,86,0.30)",
    iconBg: "rgba(199,147,86,0.16)",
    iconColor: "#8a5a1f",
    dot: "#c79356",
    label: "عضوية",
    icon: Crown,
  },
};

const FILTERS: { key: "all" | "unread" | NotifCategory; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "unread", label: "غير مقروءة" },
  { key: "prayer", label: "صلوات" },
  { key: "post", label: "منشورات" },
  { key: "meeting", label: "اجتماعات" },
  { key: "live", label: "بث مباشر" },
  { key: "message", label: "رسائل" },
  { key: "service", label: "خدمة" },
];

/* ---------------- screen ---------------- */

function ChurchNotificationsScreen() {
  const [items, setItems] = useState<ChurchNotification[]>(CHURCH_NOTIFICATIONS);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.category === filter);
  }, [items, filter]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const markOneRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-24"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #fff8ec 0%, #faeed4 45%, #f3e0b8 100%)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#efe2c4]/70"
        style={{
          background: "linear-gradient(180deg, rgba(255,248,236,0.92), rgba(250,238,212,0.85))",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
        }}
      >
        <div className="flex items-center justify-between px-4 pb-3">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-extrabold text-[#3a2a18]">الإشعارات</h1>
            {unreadCount > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#c44569] text-white text-[10px] font-extrabold border border-white">
                {unreadCount}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] text-[11px] font-bold active:scale-95 transition-transform disabled:opacity-40"
          >
            <CheckCheck className="h-4 w-4" strokeWidth={2.2} />
            قراءة الكل
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  "shrink-0 h-8 px-3 rounded-full text-[11px] font-bold border transition-all " +
                  (active
                    ? "bg-[#3a2a18] text-white border-[#3a2a18] shadow-[0_8px_18px_-10px_rgba(58,42,24,0.6)]"
                    : "bg-white/70 text-[#5a4626] border-[#efe2c4] active:scale-95")
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* List */}
      <main className="px-4 pt-4 space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((n) => (
            <NotificationCard key={n.id} n={n} onOpen={() => markOneRead(n.id)} />
          ))
        )}
      </main>
    </div>
  );
}

/* ---------------- card ---------------- */

function NotificationCard({
  n,
  onOpen,
}: {
  n: ChurchNotification;
  onOpen: () => void;
}) {
  const tone = TONES[n.category];
  const Icon = tone.icon;
  return (
    <Link
      to={n.href}
      onClick={onOpen}
      className="block relative rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
      style={{
        background: n.read
          ? "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,251,242,0.85))"
          : `${tone.bg}, linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,251,242,0.9))`,
        border: `1px solid ${n.read ? "rgba(239,226,196,0.7)" : tone.ring}`,
        boxShadow: n.read
          ? "0 8px 20px -16px rgba(120,80,30,0.25)"
          : "0 14px 30px -18px rgba(120,80,30,0.45), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      {/* unread accent bar */}
      {!n.read ? (
        <span
          className="absolute top-0 bottom-0 right-0 w-[3px]"
          style={{ background: tone.dot }}
        />
      ) : null}

      <div className="flex gap-3 p-3">
        {/* Icon */}
        <div
          className="shrink-0 h-11 w-11 rounded-2xl grid place-items-center border"
          style={{
            background: tone.iconBg,
            borderColor: tone.ring,
            color: tone.iconColor,
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="inline-flex items-center gap-1 px-2 h-[18px] rounded-full text-[9px] font-extrabold"
              style={{
                background: tone.iconBg,
                color: tone.iconColor,
                border: `1px solid ${tone.ring}`,
              }}
            >
              {tone.label}
            </span>
            {!n.read ? (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tone.dot }}
              />
            ) : null}
          </div>
          <h3
            className={
              "text-[13.5px] leading-tight mb-1 " +
              (n.read ? "font-bold text-[#5a4626]" : "font-extrabold text-[#2a1d10]")
            }
          >
            {n.title}
          </h3>
          <p className="text-[12px] leading-relaxed text-[#6b5436] line-clamp-2">
            {n.description}
          </p>
          <div className="mt-1.5 text-[10.5px] font-bold text-[#9a7d4e]">
            {n.time}
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-[#efe2c4]/70 bg-white/70 backdrop-blur-xl p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl grid place-items-center bg-[#faeed4] border border-[#efe2c4] text-[#8a5a1f] mb-3">
        <Bell className="h-6 w-6" strokeWidth={2} />
      </div>
      <h3 className="text-[14px] font-extrabold text-[#3a2a18] mb-1">
        لا توجد إشعارات
      </h3>
      <p className="text-[12px] text-[#6b5436]">
        ستظهر هنا كل تحديثات كنيستك والصلوات والرسائل.
      </p>
    </div>
  );
}
