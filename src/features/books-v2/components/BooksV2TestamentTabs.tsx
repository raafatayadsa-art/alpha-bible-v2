import { Link } from "@tanstack/react-router";
import { BookOpen, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";

export function BooksV2TestamentTabs({ active }: { active: "old" | "new" }) {
  const tabs = [
    { key: "new" as const, label: "العهد الجديد", icon: BookOpen },
    { key: "old" as const, label: "العهد القديم", icon: Scroll },
  ];

  return (
    <nav className="mt-4 flex gap-2" dir="rtl" aria-label="العهد">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.key}
            to="/books-v2"
            search={{ testament: tab.key }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-[20px] border px-3 py-3 text-[12px] font-bold transition",
              isActive
                ? "border-transparent bg-gradient-to-br from-[#1e2b54] to-[#3d5a9a] text-white shadow-[0_10px_24px_-10px_rgba(30,43,84,0.45)]"
                : "border-[#efe4c6] bg-white/80 text-[#7a5a18] shadow-[0_4px_12px_-8px_rgba(120,90,40,0.15)]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            <span className="truncate">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
