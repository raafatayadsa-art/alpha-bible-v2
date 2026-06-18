import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Crown,
  HandHeart,
  Megaphone,
  MessageCircle,
  MessageSquareHeart,
  Newspaper,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChurchNotification, NotifCategory } from "@/data/church-notifications";
import {
  useNotifItems,
  useNotifUnreadCount,
  useNotifLoading,
  refreshNotifications,
  markNotifRead,
  markAllNotifsRead,
} from "@/data/notifications-store";
import {
  CONNECT_THEME_CHANGED_EVENT,
  getConnectTheme,
  normalizeConnectTheme,
  type AlphaConnectThemeId,
} from "@/components/alpha/alpha-connect-theme";

type AlphaNotificationsPanelProps = {
  onClose: () => void;
};

type NotifSurface = "church" | "connect";

type NotifTab = "all" | "church" | "community" | "spiritual";

const TABS: { key: NotifTab; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "church", label: "الكنيسة" },
  { key: "community", label: "المجتمع" },
  { key: "spiritual", label: "الروحي" },
];

const CHURCH_CATEGORIES: NotifCategory[] = [
  "live",
  "prayer",
  "prayer-comment",
  "post",
  "announcement",
  "meeting",
  "service",
  "message",
  "membership",
];

const CLOSE_DRAG_THRESHOLD = 72;

type Tone = {
  bg: string;
  ring: string;
  iconBg: string;
  iconColor: string;
  dot: string;
  label: string;
  icon: typeof Bell;
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

function matchesTab(n: ChurchNotification, tab: NotifTab) {
  if (tab === "all") return true;
  if (n.scope === "system") return false;
  if (n.scope === "spiritual") return tab === "spiritual";
  if (n.scope === "community") return tab === "community";
  if (n.scope === "church") return tab === "church";
  if (tab === "church") return CHURCH_CATEGORIES.includes(n.category);
  if (tab === "community") return n.category === "encouragement";
  return false;
}

function useNotificationsSurface(): NotifSurface {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  return pathname === "/alpha-connect" || pathname.startsWith("/alpha-connect/")
    ? "connect"
    : "church";
}

function useConnectThemeForNotifications(): AlphaConnectThemeId {
  const [theme, setTheme] = useState<AlphaConnectThemeId>(() => getConnectTheme());

  useEffect(() => {
    const onThemeChanged = (event: Event) => {
      const next = (event as CustomEvent<{ theme: AlphaConnectThemeId }>).detail?.theme;
      if (next) setTheme(normalizeConnectTheme(next));
    };
    window.addEventListener(CONNECT_THEME_CHANGED_EVENT, onThemeChanged);
    return () => window.removeEventListener(CONNECT_THEME_CHANGED_EVENT, onThemeChanged);
  }, []);

  return theme;
}

function connectThemeShellClass(theme: AlphaConnectThemeId): string {
  return cn(
    "alpha-connect-theme connect-notifications-panel glass-strong text-foreground",
    theme === "classic" && "alpha-connect-theme--classic",
  );
}

/**
 * Top-down mobile notifications sheet — mounted only while open (via provider).
 * Opens from AlphaNotificationButton or legacy /church/notifications redirect.
 */
export function AlphaNotificationsPanel({ onClose }: AlphaNotificationsPanelProps) {
  const router = useRouter();
  const surface = useNotificationsSurface();
  const connectTheme = useConnectThemeForNotifications();
  const isConnect = surface === "connect";
  const items = useNotifItems();
  const unreadCount = useNotifUnreadCount();
  const loading = useNotifLoading();
  const [tab, setTab] = useState<NotifTab>("all");
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef(0);

  useEffect(() => {
    setTab("all");
    setDragOffset(0);
    setDragging(false);
    void refreshNotifications();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const filtered = useMemo(
    () => items.filter((n) => matchesTab(n, tab)),
    [items, tab],
  );

  const tabUnread = useMemo(() => {
    const counts: Record<NotifTab, number> = {
      all: items.filter((n) => !n.read).length,
      church: items.filter((n) => matchesTab(n, "church") && !n.read).length,
      community: items.filter((n) => matchesTab(n, "community") && !n.read).length,
      spiritual: items.filter((n) => matchesTab(n, "spiritual") && !n.read).length,
    };
    return counts;
  }, [items]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragging) return;
      const dy = e.touches[0].clientY - dragStartY.current;
      setDragOffset(Math.max(0, dy));
    },
    [dragging],
  );

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
    if (dragOffset >= CLOSE_DRAG_THRESHOLD) {
      onClose();
      setDragOffset(0);
      return;
    }
    setDragOffset(0);
  }, [dragOffset, onClose]);

  const sheetTransform = dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div dir="rtl" className="fixed inset-0 z-[130] pointer-events-auto">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className={cn(
          "fixed inset-0 opacity-100 transition-opacity duration-300",
          isConnect ? "bg-black/55 backdrop-blur-[2px]" : "bg-[#1a1408]/18 backdrop-blur-[3px]",
        )}
      />

      {/* Top-aligned sheet — hidden entirely when unmounted (never parked off-screen) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[131] flex justify-center px-3 pt-[max(10px,env(safe-area-inset-top))] pb-[max(10px,env(safe-area-inset-bottom))]">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="الإشعارات"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "connect-notifications-sheet pointer-events-auto flex h-[min(calc(100dvh-24px),760px)] w-full max-w-[var(--alpha-content-narrow-width)] flex-col overflow-hidden rounded-3xl",
            isConnect
              ? cn(
                  connectThemeShellClass(connectTheme),
                  "shadow-[0_16px_48px_rgba(0,0,0,0.42)]",
                )
              : "bg-[#fbf3e1] shadow-[0_16px_40px_-12px_rgba(58,42,24,0.32)]",
            !dragging && "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          )}
          style={sheetTransform ? { transform: sheetTransform } : undefined}
        >
        <header
          className={cn(
            "sticky top-0 z-10 shrink-0 backdrop-blur-xl",
            isConnect
              ? "border-b border-white/10 bg-transparent"
              : "border-b border-[#efe2c4]/70 bg-[#fbf3e1]/98",
          )}
          style={{ paddingTop: "12px" }}
        >
          <div className="flex items-center justify-between gap-2 px-4 pb-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className={cn(
                "shrink-0 place-items-center rounded-full transition-transform",
                isConnect
                  ? "glass flex h-9 w-9 items-center justify-center text-foreground/80 active:scale-95"
                  : "grid h-11 w-11 border border-[#efe2c4] bg-white/80 text-[#3a2a18] active:scale-90",
              )}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
            </button>

            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex items-center gap-1.5">
                <p
                  className={cn(
                    "text-[16px] font-extrabold leading-none",
                    isConnect ? "font-bold text-foreground" : "font-arabic-serif text-[#3a2a18]",
                  )}
                >
                  الإشعارات
                </p>
                {unreadCount > 0 ? (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold text-white",
                      isConnect ? "bg-destructive" : "bg-[#d88a2a]",
                    )}
                  >
                    {unreadCount.toLocaleString("ar-EG")}
                  </span>
                ) : null}
              </div>
              {unreadCount > 0 ? (
                <p className={cn("mt-0.5 text-[10.5px]", isConnect ? "text-muted-foreground" : "text-[#6a543a]")}>
                  {unreadCount.toLocaleString("ar-EG")} غير مقروء
                </p>
              ) : null}
            </div>

            <div className="flex w-11 shrink-0 justify-end">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllNotifsRead}
                  aria-label="قراءة الكل"
                  className={cn(
                    "shrink-0 place-items-center rounded-full transition-transform",
                    isConnect
                      ? "glass flex h-9 w-9 items-center justify-center text-foreground/80 active:scale-95"
                      : "grid h-11 w-11 border border-[#efe2c4] bg-white/80 text-[#3a2a18] active:scale-95",
                  )}
                >
                  <CheckCheck className="h-4 w-4" strokeWidth={2.2} />
                </button>
              ) : (
                <span className="h-11 w-11" aria-hidden />
              )}
            </div>
          </div>
        </header>

        <div
          className={cn(
            "shrink-0 border-b px-4 pb-2 pt-2",
            isConnect ? "border-white/10" : "border-[#efe2c4]/60",
          )}
        >
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const active = tab === t.key;
              const count = tabUnread[t.key];
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95",
                    isConnect
                      ? active
                        ? "connect-notif-tab connect-notif-tab--active"
                        : "glass border border-white/10 text-muted-foreground"
                      : active
                        ? "bg-[#3a2a18] text-white shadow-[0_8px_18px_-10px_rgba(58,42,24,0.55)]"
                        : "border border-[#efe2c4] bg-white/75 text-[#5a4626]",
                  )}
                >
                  {t.label}
                  {count > 0 ? (
                    <span
                      className={cn(
                        "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-extrabold",
                        isConnect
                          ? active
                            ? "bg-white/20 text-white"
                            : "bg-destructive text-white"
                          : active
                            ? "bg-white/20 text-white"
                            : "bg-[#d88a2a] text-white",
                      )}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
        >
          {loading ? (
            <LoadingState surface={surface} />
          ) : filtered.length === 0 ? (
            <EmptyState tab={tab} surface={surface} />
          ) : (
            <div className="space-y-2">
              {filtered.map((n) => (
                <NotificationCard
                  key={n.id}
                  n={n}
                  surface={surface}
                  onOpen={() => {
                    markNotifRead(n.id);
                    onClose();
                    if (n.href) void router.navigate({ to: n.href as never });
                  }}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function LoadingState({ surface }: { surface: NotifSurface }) {
  const isConnect = surface === "connect";
  return (
    <div className="space-y-2 py-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-2xl p-3",
            isConnect ? "glass" : "border border-[#efe2c4]/70 bg-white/70",
          )}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex gap-3">
            <div
              className={cn(
                "h-11 w-11 shrink-0 rounded-2xl",
                isConnect ? "bg-white/10" : "bg-[#efe2c4]/60",
              )}
            />
            <div className="flex-1 space-y-2">
              <div
                className={cn("h-3 w-1/3 rounded-full", isConnect ? "bg-white/10" : "bg-[#efe2c4]/70")}
              />
              <div
                className={cn("h-3 w-4/5 rounded-full", isConnect ? "bg-white/8" : "bg-[#efe2c4]/55")}
              />
              <div
                className={cn("h-2.5 w-1/4 rounded-full", isConnect ? "bg-white/6" : "bg-[#efe2c4]/45")}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab, surface }: { tab: NotifTab; surface: NotifSurface }) {
  const isConnect = surface === "connect";
  const label =
    tab === "all"
      ? "لا توجد إشعارات حالياً"
      : tab === "church"
        ? "لا توجد إشعارات من الكنيسة"
        : tab === "community"
          ? "لا توجد إشعارات من المجتمع"
          : "لا توجد إشعارات روحية حالياً";

  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-12 text-center",
        isConnect ? "glass" : "border border-[#efe2c4]/70 bg-white/75",
      )}
    >
      <div
        className={cn(
          "mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl",
          isConnect ? "glass-strong text-neon-green" : "bg-[#6a4ab5]/10 text-[#6a4ab5]",
        )}
      >
        <Bell className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <p className={cn("text-[13px] font-extrabold", isConnect ? "text-foreground" : "text-[#3a2a18]")}>
        {label}
      </p>
      <p className={cn("mt-1 text-[11.5px]", isConnect ? "text-muted-foreground" : "text-[#6a543a]")}>
        ستظهر هنا التحديثات الجديدة فور وصولها.
      </p>
    </div>
  );
}

function NotificationCard({
  n,
  onOpen,
  surface,
}: {
  n: ChurchNotification;
  onOpen: () => void;
  surface: NotifSurface;
}) {
  const tone = TONES[n.category];
  const Icon = tone.icon;
  const isConnect = surface === "connect";

  if (isConnect) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "glass relative block w-full overflow-hidden rounded-2xl text-right transition-transform active:scale-[0.99]",
          !n.read && "border-neon-green/25",
        )}
      >
        {!n.read ? (
          <span className="absolute bottom-0 right-0 top-0 w-[3px] bg-neon-green" />
        ) : null}

        <div className="flex gap-3 p-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-neon-green">
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="inline-flex h-[18px] items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 text-[9px] font-extrabold text-muted-foreground">
                {tone.label}
              </span>
              {!n.read ? <span className="h-1.5 w-1.5 rounded-full bg-neon-green" /> : null}
            </div>
            <h3
              className={cn(
                "mb-1 text-[13.5px] leading-tight text-foreground",
                n.read ? "font-bold" : "font-extrabold",
              )}
            >
              {n.title}
            </h3>
            <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{n.description}</p>
            <div className="mt-1.5 text-[10.5px] font-bold text-muted-foreground/80">{n.time}</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative block w-full overflow-hidden rounded-2xl text-right transition-transform active:scale-[0.99]"
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
      {!n.read ? (
        <span
          className="absolute bottom-0 right-0 top-0 w-[3px]"
          style={{ background: tone.dot }}
        />
      ) : null}

      <div className="flex gap-3 p-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border"
          style={{
            background: tone.iconBg,
            borderColor: tone.ring,
            color: tone.iconColor,
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <span
              className="inline-flex h-[18px] items-center gap-1 rounded-full px-2 text-[9px] font-extrabold"
              style={{
                background: tone.iconBg,
                color: tone.iconColor,
                border: `1px solid ${tone.ring}`,
              }}
            >
              {tone.label}
            </span>
            {!n.read ? (
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.dot }} />
            ) : null}
          </div>
          <h3
            className={cn(
              "mb-1 text-[13.5px] leading-tight",
              n.read ? "font-bold text-[#5a4626]" : "font-extrabold text-[#2a1d10]",
            )}
          >
            {n.title}
          </h3>
          <p className="line-clamp-2 text-[12px] leading-relaxed text-[#6b5436]">{n.description}</p>
          <div className="mt-1.5 text-[10.5px] font-bold text-[#9a7d4e]">{n.time}</div>
        </div>
      </div>
    </button>
  );
}
