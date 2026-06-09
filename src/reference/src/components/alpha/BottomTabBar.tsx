import { Home, BookOpen, Cross, HandHeart, User } from "lucide-react";

const tabs = [
  { key: "profile", label: "الملف الشخصي", icon: User },
  { key: "library", label: "المكتبة", icon: BookOpen },
  { key: "home", label: "الرئيسية", icon: Home, active: true },
  { key: "spiritual", label: "الروحيات", icon: Cross },
  { key: "prayer", label: "الصلاة", icon: HandHeart },
];

export function BottomTabBar() {
  return (
    <div
      className="absolute inset-x-0 bottom-0 px-3 pb-5 pt-2 pointer-events-none"
      dir="rtl"
    >
      <div className="pointer-events-auto glass border border-border/70 shadow-luxe rounded-[28px] h-[68px] flex items-center justify-around px-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className="flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-2xl"
          >
            <span
              className={
                "w-9 h-9 rounded-xl flex items-center justify-center " +
                (t.active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground")
              }
            >
              <t.icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </span>
            <span
              className={
                "font-display text-[10px] " +
                (t.active ? "text-primary font-bold" : "text-muted-foreground")
              }
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>
      {/* Home indicator */}
      <div className="mx-auto mt-2 h-[5px] w-[120px] rounded-full bg-foreground/30" />
    </div>
  );
}
