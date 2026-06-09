import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Cross, Home, MoreHorizontal } from "lucide-react";
import { alphaOmegaLogo } from "@/assets/bible-home";
import { bibleHomeColors } from "../tokens/colors";

const TABS = [
  { id: "home", label: "الرئيسية", to: "/home", icon: Home },
  { id: "katameros", label: "القطمارس", to: "/katameros", icon: CalendarDays },
  { id: "bible", label: "الكتاب المقدس", to: "/bible", raised: true },
  { id: "agpeya", label: "الأجبية", to: "/agpeya", icon: Cross },
  { id: "more", label: "المزيد", to: "/settings", icon: MoreHorizontal },
] as const;

export function BibleBottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => {
    if (to === "/bible") return pathname === "/bible" || pathname.startsWith("/books");
    return pathname === to || (to !== "/home" && pathname.startsWith(to + "/"));
  };

  return (
    <nav
      dir="rtl"
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-50"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="mx-auto w-full max-w-[440px] px-3">
        <div
          className="relative rounded-[28px] border px-2 pb-2 pt-2 backdrop-blur-2xl"
          style={{
            backgroundColor: bibleHomeColors.navGlass,
            borderColor: bibleHomeColors.cardBorder,
            boxShadow: `0 -10px 36px -14px ${bibleHomeColors.shadowSoft}, 0 0 28px -12px ${bibleHomeColors.glowWarm}, inset 0 1px 0 rgba(255,255,255,0.9)`,
          }}
        >
          <div className="grid grid-cols-5 items-end gap-1">
            {TABS.map((tab) => {
              const active = isActive(tab.to);
              if ("raised" in tab && tab.raised) {
                return (
                  <Link
                    key={tab.id}
                    to={tab.to}
                    aria-label={tab.label}
                    className="flex flex-col items-center justify-end pb-0.5 active:scale-95"
                  >
                    <div
                      className="-mt-6 grid h-[54px] w-[54px] place-items-center rounded-[20px] border border-white/80"
                      style={{
                        background: `linear-gradient(145deg, ${bibleHomeColors.champagne} 0%, ${bibleHomeColors.goldDeep} 100%)`,
                        boxShadow: `0 0 0 2px rgba(255,255,255,0.5), 0 12px 28px -10px ${bibleHomeColors.glowGold}, 0 0 22px -6px ${bibleHomeColors.glowGold}`,
                      }}
                    >
                      <img src={alphaOmegaLogo} alt="" className="h-8 w-8 object-contain" draggable={false} />
                    </div>
                    <span
                      className="mt-1 text-[9.5px] font-bold leading-none"
                      style={{ color: bibleHomeColors.goldDeep }}
                    >
                      {tab.label}
                    </span>
                  </Link>
                );
              }

              const Icon = tab.icon!;
              return (
                <Link
                  key={tab.id}
                  to={tab.to}
                  aria-label={tab.label}
                  className="flex flex-col items-center gap-1 py-1 active:scale-95"
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={active ? 2.4 : 2}
                    style={{ color: active ? bibleHomeColors.goldDeep : bibleHomeColors.textMuted }}
                  />
                  <span
                    className="text-[9.5px] font-semibold leading-none"
                    style={{ color: active ? bibleHomeColors.goldDeep : bibleHomeColors.textMuted }}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
