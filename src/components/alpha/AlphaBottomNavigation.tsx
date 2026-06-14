import { Home, BookOpen, Users, MoreHorizontal, Plus } from "lucide-react";

const items = [
  { id: "more", label: "المزيد", icon: MoreHorizontal },
  { id: "community", label: "المجتمع", icon: Users },
  { id: "plus", label: "", icon: Plus, center: true },
  { id: "bible", label: "الكتاب المقدس", icon: BookOpen },
  { id: "home", label: "الرئيسية", icon: Home, active: true },
];

export function AlphaBottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-[max(env(safe-area-inset-bottom),12px)] px-3 pt-2"
      style={{ background: "linear-gradient(to top, var(--navy-deep) 60%, transparent)" }}
    >
      <div className="mx-auto max-w-[420px] relative rounded-[28px] bg-card/85 backdrop-blur-xl border border-gold/25 px-2 py-2 flex items-end justify-between gap-1 shadow-2xl">
        {items.map((it) => {
          const Icon = it.icon;
          if (it.center) {
            return (
              <button
                key={it.id}
                aria-label="إضافة"
                className="-mt-7 size-14 rounded-full bg-gradient-to-b from-gold-soft to-gold-deep grid place-items-center gold-glow border-4 border-navy-deep shrink-0"
              >
                <Plus className="size-7 text-navy-deep" strokeWidth={3} />
              </button>
            );
          }
          return (
            <button
              key={it.id}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition ${
                it.active ? "text-gold" : "text-foreground/65"
              }`}
            >
              <Icon className={`size-5 ${it.active ? "drop-shadow-[0_0_8px_var(--gold)]" : ""}`} />
              <span className="text-[10px] font-semibold leading-none">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
