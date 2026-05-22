import { Link, useRouterState } from "@tanstack/react-router";
import { Home as HomeIcon, HandHeart, Users, User as UserIcon } from "lucide-react";
import logoBible from "@/assets/home/logo-bible.png";
import { cn } from "@/lib/utils";

/**
 * Persistent floating Alpha Bible bottom navigation.
 * Mirrors the approved Home dock — glass surface, raised center, safe-area aware.
 * Use on any page that should keep the global navigation visible.
 */
export function BottomDock({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (match: string | RegExp) =>
    typeof match === "string" ? pathname === match || pathname.startsWith(match + "/") : match.test(pathname);

  return (
    <nav
      dir="rtl"
      aria-label="التنقل السفلي"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 pointer-events-none",
        className,
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="mx-auto w-full max-w-[440px] px-3 pointer-events-auto">
        <div className="relative rounded-[28px] bg-[#fbf3e1]/80 border border-white/70 shadow-[0_-10px_30px_-12px_rgba(120,80,30,0.30),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl">
          <div className="grid grid-cols-5 items-end px-2 pt-2.5 pb-2">
            <DockItem icon={HomeIcon} label="الرئيسية" to="/home" active={isActive("/home")} />
            <DockItem icon={HandHeart} label="الصلاة" />
            <DockItem
              raised
              label="الكتاب المقدس"
              to="/bible"
              active={isActive("/bible") || isActive("/books") || pathname.split("/").length >= 2}
            />
            <DockItem icon={Users} label="المجتمع" />
            <DockItem icon={UserIcon} label="الملف الشخصي" />
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
}: {
  icon?: any;
  label: string;
  active?: boolean;
  raised?: boolean;
  to?: string;
}) {
  const goldColor = "#b8893a";
  const inner = (
    <div className="flex w-full flex-col items-center justify-end gap-1.5">
      {raised ? (
        <div
          className="-mt-8 grid h-16 w-16 place-items-center"
          style={{
            filter:
              "drop-shadow(0 0 12px rgba(231,201,122,0.45)) drop-shadow(0 6px 10px rgba(168,120,42,0.20))",
          }}
        >
          <img src={logoBible} alt="" className="h-full w-full object-contain" draggable={false} />
        </div>
      ) : Icon ? (
        <Icon
          className="h-6 w-6"
          strokeWidth={1.8}
          style={{ color: goldColor, opacity: active ? 1 : 0.92 }}
        />
      ) : null}
      <span
        className="text-[11px] font-bold leading-none whitespace-nowrap [word-break:keep-all]"
        style={{ color: active ? "#7a4a26" : "#3a2a18" }}
      >
        {label}
      </span>
      {active && !raised && (
        <span className="mt-0.5 h-1 w-1 rounded-full bg-[#c79356]" aria-hidden />
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
