import { Home, Hand, BookOpen, Library, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BottomNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const bottomNavItems: BottomNavItem[] = [
  { id: "settings", label: "الإعدادات", icon: Settings },
  { id: "library", label: "المكتبة", icon: Library },
  { id: "bible", label: "الكتاب المقدس", icon: BookOpen },
  { id: "prayers", label: "الصلوات", icon: Hand },
  { id: "home", label: "الرئيسية", icon: Home },
];

interface AlphaBottomNavigationProps {
  activeId?: string;
  onChange?: (id: string) => void;
}

export function AlphaBottomNavigation({
  activeId = "bible",
  onChange,
}: AlphaBottomNavigationProps) {
  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-50 px-3"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
    >
      <div className="mx-auto flex max-w-md items-end justify-between gap-1 rounded-[26px] bg-white/90 backdrop-blur-xl px-3 py-1.5 shadow-[0_-6px_24px_-8px_rgba(120,90,40,0.25)] ring-1 ring-[#ece1c6]">
        {bottomNavItems.map((item) => {
          const active = item.id === activeId;
          const Icon = item.icon;
          if (active) {
            return (
              <button
                key={item.id}
                onClick={() => onChange?.(item.id)}
                className="-mt-7 flex flex-col items-center gap-1 rounded-2xl bg-white px-4 py-2.5 shadow-[0_10px_22px_-6px_rgba(180,140,50,0.5)] ring-1 ring-[#e6d2a0] transition active:scale-95"
              >
                <Icon className="h-5 w-5 text-[#b08a2e]" />
                <span
                  className="text-[10px] font-bold text-[#1e2b54]"
                >
                  {item.label}
                </span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => onChange?.(item.id)}
              className="flex flex-1 flex-col items-center gap-0.5 py-1 text-[#8a7544] transition active:scale-95"
            >
              <Icon className="h-5 w-5" />
              <span
                className="text-[10px]"
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}