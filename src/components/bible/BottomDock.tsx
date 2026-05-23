import { Link, useRouterState } from "@tanstack/react-router";
import { Home as HomeIcon, HandHeart, Users, User as UserIcon } from "lucide-react";
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
            spiritualMode
              ? "bg-gradient-to-b from-[#0b1a2c]/75 to-[#08131f]/70 border-[#e7c97a]/22 shadow-[0_-12px_36px_-16px_rgba(0,0,0,0.85),0_0_28px_-10px_rgba(62,180,130,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "bg-[#fbf3e1]/80 border-white/70 shadow-[0_-10px_30px_-12px_rgba(120,80,30,0.30),inset_0_1px_0_rgba(255,255,255,0.8)]",
          )}
        >
          <div className="grid grid-cols-5 items-end px-3 pt-2 pb-1.5">
            <DockItem icon={HomeIcon} label="الرئيسية" to="/home" active={isActive("/home")} spiritualMode={spiritualMode} />
            <DockItem icon={HandHeart} label="الصلاة" spiritualMode={spiritualMode} />
            <DockItem
              raised
              label="الكتاب المقدس"
              to="/bible"
              active={isActive("/bible") || isActive("/books") || pathname.split("/").length >= 2}
              spiritualMode={spiritualMode}
            />
            <DockItem icon={Users} label="المجتمع" spiritualMode={spiritualMode} />
            <DockItem icon={UserIcon} label="الملف الشخصي" spiritualMode={spiritualMode} />
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
  const iconColor = spiritualMode
    ? (active ? "#f0d78c" : "#e8e2cf")
    : "#b8893a";
  const labelColor = spiritualMode
    ? (active ? "#f0d78c" : "rgba(232,226,207,0.78)")
    : (active ? "#7a4a26" : "#3a2a18");
  const dotColor = spiritualMode ? "#7af0b8" : "#c79356";

  const raisedFilter = spiritualMode
    ? "drop-shadow(0 0 14px rgba(122,240,184,0.45)) drop-shadow(0 0 10px rgba(231,201,122,0.35)) drop-shadow(0 6px 10px rgba(0,0,0,0.55))"
    : "drop-shadow(0 0 12px rgba(231,201,122,0.45)) drop-shadow(0 6px 10px rgba(168,120,42,0.20))";

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
            boxShadow: spiritualMode ? "0 0 6px rgba(122,240,184,0.7)" : undefined,
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
