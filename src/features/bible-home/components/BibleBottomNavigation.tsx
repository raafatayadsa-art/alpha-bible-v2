import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Cross, Home, MoreHorizontal } from "lucide-react";
import { alphaOmegaLogo } from "@/assets/bible-home";
import { bibleHomeColors } from "../tokens/colors";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "home", label: "الرئيسية", to: "/home", icon: Home },
  { id: "katameros", label: "القطمارس", to: "/katameros", icon: CalendarDays },
  { id: "bible", label: "الكتاب المقدس", raised: true as const },
  { id: "agpeya", label: "الأجبية", to: "/agpeya", icon: Cross },
  { id: "more", label: "المزيد", to: "/settings", icon: MoreHorizontal },
] as const;

export function BibleBottomNavigation({
  biblePath = "/bible",
  booksPrefix = "/books",
}: {
  /** Raised center tab route — `/bible` or `/bible-2` */
  biblePath?: string;
  /** Prefix that keeps the bible tab active — `/books` or `/books-v2` */
  booksPrefix?: string;
} = {}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => {
    if (to === biblePath) {
      return pathname === biblePath || pathname.startsWith(booksPrefix);
    }
    return pathname === to || (to !== "/home" && pathname.startsWith(to + "/"));
  };

  return (
    <nav
      dir="rtl"
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-50"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="mx-auto w-full max-w-[var(--alpha-content-max-width)] px-3 alpha-app-dock">
        <div className="alpha-dock-bar relative rounded-[28px] px-1.5 py-2 sm:px-2 sm:py-2.5">
          <div className="grid grid-cols-5 items-end gap-0.5 sm:gap-1">
            {TABS.map((tab) => {
              const tabTo = "to" in tab ? tab.to : biblePath;
              const active = isActive(tabTo);
              if ("raised" in tab && tab.raised) {
                return (
                  <Link
                    key={tab.id}
                    to={biblePath}
                    aria-label={tab.label}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "alpha-dock-tab alpha-dock-tab--raised flex flex-col items-center justify-end",
                      active && "alpha-dock-tab--active",
                    )}
                  >
                    <div
                      className="alpha-dock-tab__icon grid h-[54px] w-[54px] place-items-center rounded-[20px] border border-white/80"
                      style={{
                        background: `linear-gradient(145deg, ${bibleHomeColors.champagne} 0%, ${bibleHomeColors.goldDeep} 100%)`,
                        boxShadow: `0 0 0 2px rgba(255,255,255,0.5), 0 12px 28px -10px ${bibleHomeColors.glowGold}, 0 0 22px -6px ${bibleHomeColors.glowGold}`,
                      }}
                    >
                      <img src={alphaOmegaLogo} alt="" className="h-8 w-8 object-contain" draggable={false} />
                    </div>
                    <span className="alpha-dock-tab__label mt-1 font-bold" style={{ color: bibleHomeColors.goldDeep }}>
                      {tab.label}
                    </span>
                  </Link>
                );
              }

              const Icon = tab.icon!;
              return (
                <Link
                  key={tab.id}
                  to={tabTo}
                  aria-label={tab.label}
                  aria-current={active ? "page" : undefined}
                  className={cn("alpha-dock-tab", active && "alpha-dock-tab--active")}
                >
                  <Icon className="alpha-dock-tab__icon h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={active ? 2.4 : 2} />
                  <span className="alpha-dock-tab__label font-semibold">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
