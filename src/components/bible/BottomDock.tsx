import { Link, useRouterState } from "@tanstack/react-router";
import { Home as HomeIcon, HandHeart, Church as ChurchIcon, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import logoBible from "@/assets/home/logo-bible.png";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/use-locale";

/**
 * Persistent floating Alpha Bible bottom navigation.
 * Auto-hides after 5s of no interaction; reappears on scroll-up, tap,
 * or any user input. The external `hidden` prop still forces it hidden.
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
  const { t } = useTranslation("common");
  const { dir } = useLocale();

  const isActive = (match: string | RegExp) =>
    typeof match === "string" ? pathname === match || pathname.startsWith(match + "/") : match.test(pathname);

  // ===== Auto-hide after idle =====
  const [autoHidden, setAutoHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastYRef = useRef<number>(typeof window !== "undefined" ? window.scrollY : 0);

  useEffect(() => {
    const IDLE_MS = 3000;

    const armTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setAutoHidden(true), IDLE_MS);
    };

    const reveal = () => {
      setAutoHidden(false);
      armTimer();
    };

    const onScroll = () => {
      const y = window.scrollY;
      const prev = lastYRef.current;
      lastYRef.current = y;
      // Scroll up (or near top) → reveal. Scroll down → keep hidden (no re-arm).
      if (y < prev - 2 || y < 8) {
        reveal();
      } else if (y > prev + 2) {
        setAutoHidden(true);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };

    const onActivity = () => reveal();

    // Initial idle timer.
    armTimer();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("click", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, []);

  // Reset on route change so the dock is visible when entering a new screen.
  useEffect(() => {
    setAutoHidden(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAutoHidden(true), 3000);
  }, [pathname]);

  const isHidden = hidden || autoHidden;

  return (
    <nav
      dir={dir}
      aria-label={t("nav.bottomDockAria")}
      aria-hidden={isHidden}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50",
        className,
      )}
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        transform: isHidden ? "translateY(100%)" : "translateY(0)",
        visibility: isHidden ? "hidden" : "visible",
        pointerEvents: isHidden ? "none" : "auto",
        transition: isHidden
          ? "transform 400ms cubic-bezier(0.22,1,0.36,1), visibility 0s linear 400ms"
          : "transform 400ms cubic-bezier(0.22,1,0.36,1), visibility 0s linear 0s",
        willChange: "transform",
      }}
    >


      <div className="mx-auto w-full max-w-[var(--alpha-dock-max-width)] px-3 pointer-events-auto alpha-app-dock">
        <div className="alpha-dock-bar relative rounded-[26px]">
          <div className="grid grid-cols-5 items-end px-1.5 py-2 gap-0.5 sm:px-2 sm:py-2.5 sm:gap-1">
            <DockItem icon={HomeIcon} label={t("nav.home")} to="/home" active={isActive("/home")} />
            <DockItem icon={HandHeart} label={t("nav.prayer")} to="/agpeya" active={isActive("/agpeya")} />
            <DockItem
              raised
              label={t("nav.bible")}
              to="/bible"
              active={isActive("/bible") || isActive("/books")}
            />
            <DockItem
              icon={ChurchIcon}
              label={t("nav.church")}
              to="/church"
              active={isActive("/profile/church") || isActive("/church")}
            />
            <DockItem icon={UserIcon} label={t("nav.profile")} to="/profile" active={isActive("/profile")} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes alphaDockRaisedPulse {
          0% { transform: scale(1); }
          45% { transform: scale(1.07); }
          100% { transform: scale(1); }
        }
        .alpha-dock-raised-pulse {
          animation: alphaDockRaisedPulse 520ms cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
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
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  label: string;
  active?: boolean;
  raised?: boolean;
  to?: string;
}) {
  const [pressing, setPressing] = useState(false);

  const inner = (
    <>
      {raised ? (
        <div
          className={cn(
            "alpha-dock-tab__icon relative grid place-items-center",
            pressing && "alpha-dock-raised-pulse",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-[-6px] rounded-full transition-opacity duration-200",
              pressing ? "opacity-100" : "opacity-0",
            )}
            style={{
              background:
                "radial-gradient(circle, rgba(240,215,140,0.38) 0%, rgba(231,201,122,0.14) 52%, transparent 72%)",
              boxShadow: pressing
                ? "0 0 22px 6px rgba(240,215,140,0.42), 0 0 40px 12px rgba(231,201,122,0.18)"
                : "none",
            }}
          />
          <img src={logoBible} alt="" className="relative h-full w-full object-contain" draggable={false} />
        </div>
      ) : Icon ? (
        <Icon className="alpha-dock-tab__icon h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.8} />
      ) : null}
      <span className="alpha-dock-tab__label font-semibold tracking-tight">{label}</span>
    </>
  );

  const className = cn(
    "alpha-dock-tab",
    active && "alpha-dock-tab--active",
    raised && "alpha-dock-tab--raised",
  );
  const pressHandlers = raised
    ? {
        onPointerDown: () => setPressing(true),
        onPointerUp: () => setPressing(false),
        onPointerLeave: () => setPressing(false),
        onPointerCancel: () => setPressing(false),
      }
    : {};

  if (to) {
    return (
      <Link to={to as any} aria-label={label} aria-current={active ? "page" : undefined} className={className} {...pressHandlers}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} aria-current={active ? "page" : undefined} className={className} {...pressHandlers}>
      {inner}
    </button>
  );
}
