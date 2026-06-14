import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Church, Headphones, Home, User, type LucideIcon } from "lucide-react";

const items: { icon: LucideIcon; label: string; to: string }[] = [
  { icon: Home, label: "الرئيسية", to: "/home" },
  { icon: BookOpen, label: "الكتاب المقدس", to: "/bible" },
  { icon: Headphones, label: "الصوتيات", to: "/audio" },
  { icon: Church, label: "كنيستي", to: "/profile/church" },
  { icon: User, label: "حسابي", to: "/profile" },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <div className="glass-card mx-auto flex max-w-[430px] items-end justify-around rounded-full px-2 py-2.5">
        {items.map(({ icon: Icon, label, to }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              aria-current={active ? "page" : undefined}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
