import { Link, useRouterState } from "@tanstack/react-router";
import { Home as HomeIcon, HandHeart, BookOpen, User as UserIcon } from "lucide-react";
import logoBible from "@/assets/home/logo-bible.png";
import { cn } from "@/lib/utils";

/**
 * Persistent floating Alpha Bible bottom navigation.
 * Supports a light parchment theme and a dark navy glass theme (spiritualMode)
 * that harmonizes with the auto-scroll controller.
 */
export function BottomDock({
  className = "",
  hidden = false,
  spiritualMode = false,
}: {
  className?: string;
  hidden?: boolean;
  spiritualMode?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (match: string | RegExp) =>
    typeof match === "string" ? pathname === match || pathname.startsWith(match + "/") : match.test(pathname);

  return (
    <nav
      dir="rtl"
      aria-label="التنقل السفلي"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden ? "translate-y-[120%] opacity-0" : "translate-y-0 opacity-100",
        className,
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="mx-auto w-full max-w-[420px] px-3 pointer-events-auto">
        <div
          className={cn(
            "relative rounded-[26px] border backdrop-blur-2xl",
            // Unified dark navy/emerald glass — matches auto-scroll controller
            "bg-gradient-to-b from-[#0b1a2c]/75 to-[#08131f]/70 border-white/10",
            "shadow-[0_-12px_36px_-16px_rgba(0,0,0,0.85),0_0_28px_-10px_rgba(62,180,130,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]",
          )}
        >
          <div className="grid grid-cols-5 items-end px-3 pt-2 pb-1.5 gap-1">
            <DockItem icon={HomeIcon} label="الرئيسية" to="/home" active={isActive("/home")} />
            <DockItem icon={HandHeart} label="الصلاة" to="/agpeya" active={isActive("/agpeya")} />
            <DockItem
              raised
              label="الكتاب المقدس"
              to="/bible"
              active={isActive("/bible") || isActive("/books")}
            />
            <DockItem icon={BookOpen} label="المكتبة" to="/books" active={isActive("/books")} />
            <DockItem icon={UserIcon} label="الملف الشخصي" to="/profile" active={isActive("/profile")} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function DockItem({
  icon: Icon,
  label,
  active,
  raised,
  to,
  spiritualMode,
}: {
  icon?: any;
  label: string;
  active?: boolean;
  raised?: boolean;
  to?: string;
  spiritualMode?: boolean;
}) {
  // Unified dark-glass palette to match auto-scroll controller
  const iconColor = active ? "#f0d78c" : "#e8e2cf";
  const labelColor = active ? "#f0d78c" : "rgba(232,226,207,0.78)";
  const dotColor = "#7af0b8";

  const raisedFilter =
    "drop-shadow(0 0 14px rgba(122,240,184,0.45)) drop-shadow(0 0 10px rgba(231,201,122,0.35)) drop-shadow(0 6px 10px rgba(0,0,0,0.55))";

  const inner = (
    <div className="flex w-full flex-col items-center justify-end gap-1">
      {raised ? (
        <div
          className="-mt-7 grid h-14 w-14 place-items-center"
          style={{ filter: raisedFilter }}
        >
          <img src={logoBible} alt="" className="h-full w-full object-contain" draggable={false} />
        </div>
      ) : Icon ? (
        <Icon
          className="h-[18px] w-[18px]"
          strokeWidth={1.8}
          style={{ color: iconColor, opacity: active ? 1 : 0.88 }}
        />
      ) : null}
      <span
        className="text-[10.5px] font-semibold leading-none whitespace-nowrap [word-break:keep-all] tracking-tight"
        style={{ color: labelColor }}
      >
        {label}
      </span>
      {active && !raised && (
        <span
          className="mt-0.5 h-1 w-1 rounded-full"
          style={{
            background: dotColor,
            boxShadow: "0 0 6px rgba(122,240,184,0.7)",
          }}
          aria-hidden
        />
      )}
    </div>
  );

  const className = "block py-1 active:scale-[0.94] transition-transform";
  if (to) {
    return (
      <Link to={to as any} aria-label={label} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} className={className}>
      {inner}
    </button>
  );
}
