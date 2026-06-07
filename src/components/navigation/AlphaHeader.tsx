import { Link } from "@tanstack/react-router";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/bible/primitives";
import { useAlphaNavigation } from "@/components/navigation/AlphaNavigationProvider";
import { AlphaNotificationButton, ALPHA_HEADER_BTN } from "@/components/navigation/AlphaNotificationButton";

export { ALPHA_HEADER_BTN };

export const ALPHA_HEADER_FRAME =
  "relative z-30 mx-auto w-full max-w-[440px] px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]";

export type AlphaHeaderVariant = "home" | "main" | "internal" | "reading";

export type AlphaHeaderProps = {
  variant: AlphaHeaderVariant;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backTo?: string;
  tone?: "light" | "dark";
  className?: string;
  center?: React.ReactNode;
  showNotifications?: boolean;
  onSearchClick?: () => void;
  searchTo?: string;
};

export function AlphaHeaderShell({
  children,
  sticky = false,
  className,
  style,
}: {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(ALPHA_HEADER_FRAME, sticky && "sticky top-0", className)}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * Alpha Header Standard — unified top bar.
 * RTL: menu/back (right) · title (center) · notifications + search (left).
 */
export function AlphaHeader({
  variant,
  title,
  subtitle,
  backTo,
  tone = "light",
  className,
  center,
  showNotifications = variant !== "reading",
  onSearchClick,
  searchTo = "/search",
}: AlphaHeaderProps) {
  const { openNavHub, goBack } = useAlphaNavigation();
  const btnClass =
    tone === "dark"
      ? "grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#0e1a2e]/55 backdrop-blur-xl text-[#f3e6c4] active:scale-95 transition"
      : ALPHA_HEADER_BTN;
  const titleClass = tone === "dark" ? "text-[#f3e6c4]" : "text-[#3a2a18]";
  const subtitleClass = tone === "dark" ? "text-[#c79356]/80" : "text-[#6a543a]";

  const searchBtn = onSearchClick ? (
    <button type="button" aria-label="بحث" onClick={onSearchClick} className={btnClass}>
      <Search className="h-5 w-5" />
    </button>
  ) : (
    <Link to={searchTo as any} aria-label="بحث" className={btnClass}>
      <Search className="h-5 w-5" />
    </Link>
  );

  const notifBtn = showNotifications ? (
    <AlphaNotificationButton tone={tone} />
  ) : null;

  return (
    <header dir="rtl" className={cn("flex items-center justify-between gap-2", className)}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center">
        {variant === "home" ? (
          <button type="button" aria-label="القائمة" onClick={openNavHub} className={btnClass}>
            <Menu className="h-5 w-5" />
          </button>
        ) : variant === "main" ? (
          <span className="h-11 w-11 shrink-0" aria-hidden />
        ) : (
          <BackButton compact tone={tone} to={backTo} onBack={backTo ? undefined : goBack} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center px-1">
        {center ?? (
          <>
            <div className={cn("min-w-0 truncate text-center font-extrabold text-[15px]", titleClass)}>
              {title}
            </div>
            {subtitle ? (
              <p className={cn("mt-0.5 truncate text-center text-[11px]", subtitleClass)}>{subtitle}</p>
            ) : null}
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {notifBtn}
        {searchBtn}
      </div>
    </header>
  );
}
