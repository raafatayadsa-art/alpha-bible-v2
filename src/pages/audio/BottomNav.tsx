import { Home, BookOpen, Headphones, Church, User } from "lucide-react";

const items = [
  { icon: Home, label: "الرئيسية" },
  { icon: BookOpen, label: "الكتاب المقدس" },
  { icon: Headphones, label: "الصوتيات", active: true },
  { icon: Church, label: "كنيستي" },
  { icon: User, label: "حسابي" },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 mt-2 px-4 pb-4 pt-2">
      <div className="glass-card flex items-end justify-around rounded-full px-2 py-2.5">
        {items.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full py-1.5 transition ${
              active ? "" : "text-muted-foreground"
            }`}
          >
            {active ? (
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)] text-white shadow-[0_8px_20px_-6px_rgba(180,130,60,0.6)] ring-1 ring-white/40">
                <Icon className="h-5 w-5" strokeWidth={2.4} />
              </span>
            ) : (
              <Icon className="h-5 w-5" strokeWidth={2} />
            )}
            <span
              className={`text-[10px] font-semibold leading-none ${
                active ? "text-[var(--gold-deep)]" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
