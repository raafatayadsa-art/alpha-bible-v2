import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, HandHeart, Home, Settings } from "lucide-react";
import logoBible from "@/assets/home/logo-bible.png";
import { bibleV2Tokens } from "../tokens";

const TABS = [
  { id: "settings", label: "الإعدادات", to: "/settings", icon: Settings },
  { id: "library", label: "المكتبة", to: "/books", icon: BookOpen },
  { id: "bible", label: "الكتاب المقدس", to: "/bible-2", raised: true as const },
  { id: "prayers", label: "الصلوات", to: "/agpeya", icon: HandHeart },
  { id: "home", label: "الرئيسية", to: "/home", icon: Home },
] as const;

export function BibleV2BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => {
    if (to === "/bible-2") return pathname === "/bible-2";
    return pathname === to || pathname.startsWith(to + "/");
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
          className="relative rounded-[28px] border border-white/80 px-2 pb-2 pt-2 backdrop-blur-2xl"
          style={{
            backgroundColor: bibleV2Tokens.navGlass,
            boxShadow: `0 -10px 36px -14px ${bibleV2Tokens.shadowWarm}, inset 0 1px 0 rgba(255,255,255,0.9)`,
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
                        background: `linear-gradient(145deg, ${bibleV2Tokens.champagne} 0%, ${bibleV2Tokens.goldDeep} 100%)`,
                        boxShadow: `0 0 0 2px rgba(255,255,255,0.5), 0 12px 28px -10px rgba(212,175,55,0.55)`,
                      }}
                    >
                      <img src={logoBible} alt="" className="h-8 w-8 object-contain" draggable={false} />
                    </div>
                    <span
                      className="mt-1 text-[9.5px] font-bold leading-none"
                      style={{ color: bibleV2Tokens.goldDeep }}
                    >
                      {tab.label}
                    </span>
                  </Link>
                );
              }

              if (!("icon" in tab)) return null;
              const Icon = tab.icon;
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
                    style={{ color: active ? bibleV2Tokens.goldDeep : bibleV2Tokens.textMuted }}
                  />
                  <span
                    className="text-[9.5px] font-semibold leading-none"
                    style={{ color: active ? bibleV2Tokens.goldDeep : bibleV2Tokens.textMuted }}
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
