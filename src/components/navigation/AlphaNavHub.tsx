import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  BookMarked,
  Church,
  Heart,
  Headphones,
  Home,
  Library,
  Music2,
  Settings,
  Sparkles,
  User,
  X,
  ChevronLeft,
} from "lucide-react";
import {
  MESSAGING_GLASS_ICON_BOX,
  MESSAGING_GLASS_SHELL,
} from "@/components/alpha/messaging-ui";
import { getCurrentUser } from "@/features/church/current-user";
import { subscribeAuthContext, getAlphaRoleSync } from "@/features/auth";
import { deriveAlphaIdShort } from "@/features/identity/alpha-identity";
import { AlphaShield } from "@/components/alpha/AlphaShield";
import { NAV_ITEM_MODULE_KEY, usePlatformModules } from "@/lib/platform-modules";
import avatarMina from "@/assets/avatar-mina.jpg";

const NAV_ITEMS = [
  { key: "home", label: "الرئيسية", to: "/home", icon: Home, tone: "#b8893a" },
  { key: "bible", label: "الكتاب المقدس", to: "/bible", icon: BookOpen, tone: "#8a6ec1" },
  { key: "agpeya", label: "الأجبية", to: "/agpeya", icon: Heart, tone: "#1f8a5a" },
  { key: "kholagy", label: "الخولاجي", to: "/kholagy", icon: Music2, tone: "#7a5cb0" },
  { key: "audio", label: "الصوتيات", to: "/audio", icon: Headphones, tone: "#c44569" },
  { key: "katameros", label: "القطمارس", to: "/katameros", icon: BookMarked, tone: "#4a9e6e" },
  { key: "synaxarium", label: "السنكسار", to: "/synaxarium", icon: Sparkles, tone: "#c98a3c" },
  { key: "library", label: "المكتبة", to: "/books", icon: Library, tone: "#6a4ab5" },
  { key: "church", label: "كنيستك معاك", to: "/church", icon: Church, tone: "#5b8fd1" },
  { key: "profile", label: "الملف الشخصي", to: "/profile", icon: User, tone: "#8a6ec1" },
  { key: "settings", label: "الإعدادات", to: "/settings", icon: Settings, tone: "#3f9d6e" },
] as const;

type AlphaNavHubProps = {
  open: boolean;
  onClose: () => void;
};

function NavDivider() {
  return (
    <div
      aria-hidden
      className="mx-3.5 h-px bg-gradient-to-l from-transparent via-white/42 to-transparent"
    />
  );
}

export function AlphaNavHub({ open, onClose }: AlphaNavHubProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState(() => getCurrentUser());
  const { isModuleEnabled } = usePlatformModules();

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    const moduleKey = NAV_ITEM_MODULE_KEY[item.key];
    return moduleKey ? isModuleEnabled(moduleKey) : true;
  });

  useEffect(() => {
    return subscribeAuthContext(() => setUser(getCurrentUser()));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const isActive = (to: string) =>
    pathname === to || (to !== "/home" && pathname.startsWith(`${to}/`));

  const drawer = (
    <>
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
        className="fixed inset-0 z-[10050] bg-[#1a1208]/30 backdrop-blur-[4px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل"
        dir="rtl"
        className="fixed inset-y-0 right-0 z-[10051] flex w-[min(300px,88vw)] flex-col overflow-hidden border-l border-white/32 bg-white/48 shadow-[-28px_0_56px_-16px_rgba(0,0,0,0.16),inset_1px_0_0_rgba(255,255,255,0.45)] backdrop-blur-3xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/35 to-transparent"
        />

        <div
          className="relative flex items-center justify-between gap-3 border-b border-white/22 px-4 py-4"
          style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-full border border-white/40 bg-white/20 p-[2px] shadow-sm">
              <img
                src={user.avatarUrl || avatarMina}
                alt={user.name || "مينا جورج"}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[15px] font-bold text-[#1F2937]">{user.name?.trim() || "مينا جورج"}</p>
              <div className="flex items-center gap-1.5">
                <AlphaShield
                  role={getAlphaRoleSync() || "member"}
                  size="sm"
                  userName={user.name?.trim() || "مينا جورج"}
                  userAvatar={user.avatarUrl || avatarMina}
                />
                <span className="text-[11px] font-bold tracking-wide text-[#6B7280] font-mono">
                  {deriveAlphaIdShort(user.id)}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/35 bg-white/45 text-[#374151] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md transition active:scale-90"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 py-4">
          <div className={`${MESSAGING_GLASS_SHELL} overflow-hidden`}>
            {visibleNavItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <div key={item.key}>
                  <Link
                    to={item.to as any}
                    onClick={() => setTimeout(onClose, 0)}
                    className={`flex w-full items-center gap-3 px-3.5 py-3.5 text-right transition-all active:scale-[0.99] ${
                      active
                        ? "bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
                        : "hover:bg-white/42"
                    }`}
                  >
                    <span
                      className={`${MESSAGING_GLASS_ICON_BOX} ${
                        active ? "border-white/45 bg-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]" : ""
                      }`}
                    >
                      <Icon
                        className="size-4"
                        style={{
                          color: item.tone,
                          filter: `drop-shadow(0 1px 0 rgba(255,255,255,0.35)) drop-shadow(0 2px 4px ${item.tone}33)`,
                        }}
                        strokeWidth={2.15}
                      />
                    </span>
                    <span
                      className={`flex-1 text-[13px] font-semibold ${
                        active ? "text-[#1F2937]" : "text-[#374151]"
                      }`}
                    >
                      {item.label}
                    </span>
                    <ChevronLeft
                      className={`h-4 w-4 shrink-0 -scale-x-100 ${
                        active ? "text-[#b8893a]" : "text-[#9CA3AF]"
                      }`}
                      strokeWidth={2.2}
                    />
                  </Link>
                  {index < visibleNavItems.length - 1 ? <NavDivider /> : null}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="relative border-t border-white/22 px-4 py-3 text-center backdrop-blur-sm">
          <p className="text-[9.5px] font-semibold tracking-wide text-[#6B7280]/85">
            Ⲁ · ألفا — كلمة الله دائماً معك · Ⲱ
          </p>
        </div>
      </aside>
    </>
  );

  return createPortal(drawer, document.body);
}
