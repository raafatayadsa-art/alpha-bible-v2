import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  SlidersHorizontal,
  CheckCheck,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Inbox,
  X,
  Crown,
  HandHeart,
  IdCard,
  ArrowRightLeft,
  Bell,
} from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark, CopticCross } from "@/components/coptic";

type Category = "كاهن" | "خدمة" | "عضوية" | "طلبات" | "إشعار";

type Msg = {
  id: number;
  from: string;
  role: string;
  category: Category;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  saved?: boolean;
  action?: { label: string; to?: string };
};

const COLORS: Record<Category, string> = {
  "كاهن": "#8a6ec1",
  "خدمة": "#4a9e6e",
  "عضوية": "#4a86c1",
  "طلبات": "#c98a3c",
  "إشعار": "#b85a5a",
};

const ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  "كاهن": Crown,
  "خدمة": HandHeart,
  "عضوية": IdCard,
  "طلبات": ArrowRightLeft,
  "إشعار": Bell,
};

const SEED: Msg[] = [
  {
    id: 1,
    from: "الأب داود عبد الملاك",
    role: "كاهن الكنيسة",
    category: "كاهن",
    title: "اجتماع الخدام",
    body: "اجتماع الخدام السبت القادم بعد القداس الإلهي مباشرة، نرجو الحضور في الموعد.",
    time: "منذ ٢٠ دقيقة",
    unread: true,
    action: { label: "تأكيد الحضور" },
  },
  {
    id: 2,
    from: "خدمة مدارس الأحد",
    role: "خدمة الأطفال",
    category: "خدمة",
    title: "تجهيزات رحلة الأطفال",
    body: "نحتاج متطوعين لتجهيز رحلة الأطفال السنوية يوم الخميس بعد صلاة العشية.",
    time: "منذ ساعتين",
    unread: true,
    action: { label: "أنا متطوع" },
  },
  {
    id: 3,
    from: "اللجنة الإدارية",
    role: "إدارة العضوية",
    category: "عضوية",
    title: "تم قبول طلب الانضمام",
    body: "تم قبول طلب انضمامك إلى كنيسة الشهيد مار جرجس. مرحباً بك في عائلتنا.",
    time: "أمس",
    unread: true,
    action: { label: "عرض تفاصيل العضوية", to: "/profile/membership" },
  },
  {
    id: 4,
    from: "إدارة الكنيسة",
    role: "طلب نقل",
    category: "طلبات",
    title: "طلب نقل العضوية",
    body: "طلب نقل عضويتك من إيبارشية الإسكندرية قيد المراجعة من الأب الأسقف.",
    time: "الإثنين",
    unread: false,
    action: { label: "متابعة الطلب" },
  },
  {
    id: 5,
    from: "كنيسة الشهيد مار جرجس",
    role: "إعلان عام",
    category: "إشعار",
    title: "قداس عيد الصعود",
    body: "يقام قداس عيد الصعود الإلهي يوم الخميس الساعة السابعة صباحاً.",
    time: "٢٦ مايو",
    unread: false,
    action: { label: "فتح كنيستي", to: "/profile/church" },
  },
];

const FILTERS = ["الكل", "الكاهن", "الخدمة", "العضوية", "الطلبات"] as const;
type Filter = typeof FILTERS[number];

function matchesFilter(m: Msg, f: Filter) {
  switch (f) {
    case "الكل": return true;
    case "الكاهن": return m.category === "كاهن";
    case "الخدمة": return m.category === "خدمة";
    case "العضوية": return m.category === "عضوية";
    case "الطلبات": return m.category === "طلبات";
  }
}

function Header({ onSearch, onFilter, unreadCount, onMarkAll }: {
  onSearch: () => void; onFilter: () => void; unreadCount: number; onMarkAll: () => void;
}) {
  return (
    <header className="pt-2">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={"/profile" as any}
          aria-label="رجوع"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl active:scale-95 transition"
        >
          <ChevronRight className="h-5 w-5 text-[#3a2a18]" />
        </Link>
        <div className="flex items-center gap-2">
          <CopticCross className="text-[#b8893a]" size={14} />
          <h1 className="text-[15px] font-extrabold text-[#3a2a18]">رسائل الكنيسة</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSearch}
            aria-label="بحث"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl active:scale-95 transition"
          >
            <Search className="h-4.5 w-4.5 text-[#3a2a18]" />
          </button>
          <button
            onClick={onFilter}
            aria-label="فرز"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#efe2c4] bg-white/70 backdrop-blur-xl active:scale-95 transition"
          >
            <SlidersHorizontal className="h-4.5 w-4.5 text-[#3a2a18]" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11.5px] text-[#6a543a] text-center">
        رسائلك الخاصة من الكنيسة والخدمة
      </p>
      {unreadCount > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border border-[#efe2c4] bg-white/60 backdrop-blur-xl">
          <span className="text-[11px] text-[#6a543a] font-semibold">
            لديك <span className="text-[#b8893a]">{unreadCount}</span> رسائل غير مقروءة
          </span>
          <button
            onClick={onMarkAll}
            className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2.5 py-1 rounded-full text-[#3a2a10]"
            style={{
              background: "linear-gradient(180deg,#fbecb2,#e7c97a 55%,#c98a3c)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px -2px rgba(216,138,42,0.5)",
            }}
          >
            <CheckCheck className="h-3 w-3" />
            تحديد الكل كمقروء
          </button>
        </div>
      )}
    </header>
  );
}

function FilterChips({ value, onChange, counts }: {
  value: Filter; onChange: (f: Filter) => void; counts: Record<Filter, number>;
}) {
  return (
    <div className="mt-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 min-w-max">
        {FILTERS.map((f) => {
          const active = value === f;
          return (
            <button
              key={f}
              onClick={() => onChange(f)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition"
              style={
                active
                  ? {
                      background: "linear-gradient(180deg,#4d3c70,#2a1d45)",
                      color: "#f7e7b8",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 14px -8px rgba(40,25,75,0.7)",
                      border: "1px solid rgba(240,215,140,0.35)",
                    }
                  : {
                      background: "rgba(255,255,255,0.65)",
                      color: "#3a2a18",
                      border: "1px solid #efe2c4",
                      backdropFilter: "blur(8px)",
                    }
              }
            >
              {f}
              <span
                className="text-[9.5px] px-1 rounded-full"
                style={{
                  background: active ? "rgba(240,215,140,0.25)" : "rgba(58,42,24,0.08)",
                  color: active ? "#f7e7b8" : "#6a543a",
                }}
              >
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MessageCard({ m, onOpen }: { m: Msg; onOpen: () => void }) {
  const color = COLORS[m.category];
  const Icon = ICONS[m.category];
  return (
    <button
      onClick={onOpen}
      className="block w-full text-right active:scale-[0.99] transition-transform"
    >
      <div
        className="relative rounded-[20px] overflow-hidden p-3.5"
        style={{
          background: m.unread
            ? "linear-gradient(180deg, #fffaec 0%, #fbf3e1 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(244,234,216,0.6) 100%)",
          border: `1px solid ${m.unread ? "#efe2c4" : "rgba(239,226,196,0.6)"}`,
          boxShadow: m.unread
            ? `0 14px 30px -20px rgba(120,80,30,0.55), 0 0 22px -14px ${color}66, inset 0 1px 0 rgba(255,255,255,0.7)`
            : "0 6px 14px -12px rgba(120,80,30,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        {m.unread && (
          <span
            aria-hidden
            className="absolute top-3 left-3 h-2 w-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
        )}
        <div className="flex items-start gap-3">
          <div
            className="relative shrink-0 grid h-11 w-11 place-items-center rounded-[13px] overflow-hidden"
            style={{
              background: `radial-gradient(120% 90% at 30% 20%, ${color}55, ${color}1a 70%)`,
              border: `1px solid ${color}66`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -5px 9px ${color}30, 0 6px 14px -8px ${color}80`,
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`truncate ${m.unread ? "font-extrabold text-[#3a2a18]" : "font-semibold text-[#6a543a]"}`}
                style={{ fontSize: 13 }}
              >
                {m.from}
              </h3>
              <span className="text-[10px] text-[#9a7e5a] shrink-0">{m.time}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${color}1f`, color, border: `1px solid ${color}40` }}
              >
                {m.category}
              </span>
              <span className="text-[10px] text-[#9a7e5a]">• {m.role}</span>
            </div>
            <div
              className={`mt-1.5 ${m.unread ? "font-extrabold text-[#3a2a18]" : "font-semibold text-[#3a2a18]/80"}`}
              style={{ fontSize: 12.5 }}
            >
              {m.title}
            </div>
            <p className="text-[11.5px] text-[#6a543a] mt-0.5 leading-snug line-clamp-2">
              {m.body}
            </p>
          </div>
          <ChevronLeft className="h-4 w-4 text-[#b8893a]/60 shrink-0 self-center" />
        </div>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center text-center px-6">
      <div
        className="grid h-20 w-20 place-items-center rounded-3xl mb-4"
        style={{
          background: "radial-gradient(120% 90% at 30% 20%, rgba(240,215,140,0.6), rgba(216,138,42,0.18) 70%)",
          border: "1px solid rgba(240,215,140,0.5)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 24px -12px rgba(216,138,42,0.6)",
        }}
      >
        <Inbox className="h-9 w-9 text-[#b8893a]" />
      </div>
      <h3 className="text-[15px] font-extrabold text-[#3a2a18]">لا توجد رسائل حالياً</h3>
      <p className="mt-1 text-[12px] text-[#6a543a] leading-relaxed">
        ستظهر هنا رسائل الكنيسة والكاهن والخدمة.
      </p>
    </div>
  );
}

function DetailSheet({ msg, onClose, onToggleSave, onDelete, onMarkRead }: {
  msg: Msg | null;
  onClose: () => void;
  onToggleSave: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkRead: (id: number) => void;
}) {
  if (!msg) return null;
  const color = COLORS[msg.category];
  const Icon = ICONS[msg.category];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-[#2a1d45]/55 backdrop-blur-sm" onClick={onClose} />
      <div
        dir="rtl"
        className="relative w-full max-w-[440px] rounded-t-[28px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg,#fbf3e1 0%, #f4ead8 100%)",
          border: "1px solid #efe2c4",
          boxShadow: "0 -20px 50px -10px rgba(40,25,75,0.4)",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="h-1 w-10 rounded-full bg-[#b8893a]/30 mx-auto absolute left-0 right-0 top-2" />
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: `${color}1f`, color, border: `1px solid ${color}40` }}
          >
            <Icon className="h-3 w-3" />
            {msg.category}
          </span>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/80 border border-[#efe2c4]"
          >
            <X className="h-4 w-4 text-[#3a2a18]" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-5 text-right">
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 grid h-12 w-12 place-items-center rounded-2xl"
              style={{
                background: `radial-gradient(120% 90% at 30% 20%, ${color}55, ${color}1a 70%)`,
                border: `1px solid ${color}66`,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-extrabold text-[#3a2a18] truncate">{msg.from}</div>
              <div className="text-[11px] text-[#6a543a]">{msg.role} • {msg.time}</div>
            </div>
          </div>

          <h2 className="mt-4 text-[17px] font-extrabold text-[#3a2a18] leading-snug">
            {msg.title}
          </h2>
          <p className="mt-2 text-[13px] text-[#3a2a18]/85 leading-relaxed">
            {msg.body}
          </p>

          {msg.action && (
            msg.action.to ? (
              <Link
                to={msg.action.to as any}
                className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[13px] font-extrabold text-[#f7e7b8]"
                style={{
                  background: "linear-gradient(180deg,#4d3c70,#2a1d45)",
                  border: "1px solid rgba(240,215,140,0.4)",
                  boxShadow: "0 14px 28px -14px rgba(40,25,75,0.7)",
                }}
              >
                {msg.action.label}
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => onMarkRead(msg.id)}
                className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[13px] font-extrabold text-[#3a2a10]"
                style={{
                  background: "linear-gradient(180deg,#fbecb2,#e7c97a 55%,#c98a3c)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 22px -10px rgba(216,138,42,0.6)",
                }}
              >
                {msg.action.label}
              </button>
            )
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => onToggleSave(msg.id)}
              className="flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11.5px] font-bold text-[#3a2a18] bg-white/70 border border-[#efe2c4]"
            >
              {msg.saved ? <BookmarkCheck className="h-4 w-4 text-[#b8893a]" /> : <Bookmark className="h-4 w-4 text-[#b8893a]" />}
              {msg.saved ? "محفوظة" : "حفظ"}
            </button>
            <button
              onClick={() => onMarkRead(msg.id)}
              className="flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11.5px] font-bold text-[#3a2a18] bg-white/70 border border-[#efe2c4]"
            >
              <CheckCheck className="h-4 w-4 text-[#4a9e6e]" />
              مقروء
            </button>
            <button
              onClick={() => { onDelete(msg.id); onClose(); }}
              className="flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11.5px] font-bold text-[#b85a5a] bg-white/70 border border-[#efe2c4]"
            >
              <Trash2 className="h-4 w-4" />
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagesScreen() {
  const [items, setItems] = useState<Msg[]>(SEED);
  const [filter, setFilter] = useState<Filter>("الكل");
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const counts = useMemo(() => {
    const out = {} as Record<Filter, number>;
    FILTERS.forEach((f) => { out[f] = items.filter((m) => matchesFilter(m, f)).length; });
    return out;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return items
      .filter((m) => matchesFilter(m, filter))
      .filter((m) => !q || m.from.includes(q) || m.title.includes(q) || m.body.includes(q));
  }, [items, filter, query]);

  const unreadCount = items.filter((m) => m.unread).length;
  const open = items.find((m) => m.id === openId) ?? null;

  const markRead = (id: number) =>
    setItems((s) => s.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  const markAll = () => setItems((s) => s.map((m) => ({ ...m, unread: false })));
  const toggleSave = (id: number) =>
    setItems((s) => s.map((m) => (m.id === id ? { ...m, saved: !m.saved } : m)));
  const del = (id: number) => setItems((s) => s.filter((m) => m.id !== id));

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-x-hidden">
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 55% at 50% 0%, rgba(231,201,122,0.35), transparent 60%)," +
            "linear-gradient(180deg,#f7eed6 0%,#f4ead8 50%,#ecdcb6 100%)",
        }}
      />
      <CopticWatermark />
      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-[max(env(safe-area-inset-top),12px)]">
        <Header
          onSearch={() => setShowSearch((s) => !s)}
          onFilter={() => {
            const idx = FILTERS.indexOf(filter);
            setFilter(FILTERS[(idx + 1) % FILTERS.length]);
          }}
          unreadCount={unreadCount}
          onMarkAll={markAll}
        />


        {showSearch && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-2xl border border-[#efe2c4] bg-white/80">
            <Search className="h-4 w-4 text-[#9a7e5a]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في الرسائل…"
              className="flex-1 bg-transparent outline-none text-[12.5px] text-[#3a2a18] placeholder:text-[#9a7e5a]"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="مسح">
                <X className="h-4 w-4 text-[#9a7e5a]" />
              </button>
            )}
          </div>
        )}

        <FilterChips value={filter} onChange={setFilter} counts={counts} />

        <div className="mt-4 space-y-2.5">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((m) => (
              <MessageCard
                key={m.id}
                m={m}
                onOpen={() => { setOpenId(m.id); if (m.unread) markRead(m.id); }}
              />
            ))
          )}
        </div>
      </div>

      <DetailSheet
        msg={open}
        onClose={() => setOpenId(null)}
        onToggleSave={toggleSave}
        onDelete={del}
        onMarkRead={markRead}
      />

      <BottomDock />
    </div>
  );
}

export const Route = createFileRoute("/profile/messages")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — رسائل الكنيسة" }] }),
  component: MessagesScreen,
});
