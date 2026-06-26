import { Link } from "@tanstack/react-router";
import { BookOpen, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOOKS_PREMIUM } from "../books-premium-tokens";

export function BooksPremiumTestamentTabs({ active }: { active: "old" | "new" }) {
  const tabs = [
    { key: "new" as const, label: "العهد الجديد", sub: "27 سفراً", icon: BookOpen, tone: "nt" as const },
    { key: "old" as const, label: "العهد القديم", sub: "أسفار العهد الأول", icon: ScrollText, tone: "ot" as const },
  ];

  return (
    <nav className="mt-4 flex gap-2.5" dir="rtl" aria-label="العهد">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.key}
            to="/books"
            search={{ testament: tab.key }}
            className={cn(
              "relative flex min-h-[76px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[22px] border px-2 py-2.5 text-center transition duration-200 active:scale-[0.97]",
              isActive ? "books-tab-chip--active z-[1]" : "z-0",
            )}
            style={
              isActive
                ? {
                    borderColor: "rgba(212,175,55,0.5)",
                    background:
                      tab.tone === "ot"
                        ? BOOKS_PREMIUM.heroOtGradient
                        : BOOKS_PREMIUM.heroNtGradient,
                  }
                : {
                    borderColor: BOOKS_PREMIUM.cardBorder,
                    background: "rgba(255,255,255,0.82)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95), 0 6px 16px -10px rgba(70,55,30,0.1)",
                  }
            }
          >
            <Icon
              className="h-[18px] w-[18px]"
              style={{ color: isActive ? BOOKS_PREMIUM.goldDeep : BOOKS_PREMIUM.textMuted }}
              strokeWidth={2.2}
            />
            <span
              className="text-[12px] font-extrabold leading-tight"
              style={{ color: isActive ? BOOKS_PREMIUM.navy : BOOKS_PREMIUM.textSecondary }}
            >
              {tab.label}
            </span>
            <span className="text-[9px] font-semibold text-[#8a7355]">{tab.sub}</span>
          </Link>
        );
      })}
    </nav>
  );
}
