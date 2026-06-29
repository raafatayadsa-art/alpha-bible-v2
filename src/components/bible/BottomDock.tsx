import { Link, useRouterState } from "@tanstack/react-router";
import { House, Church, UsersRound, CircleUser, BookMarked } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/use-locale";
import { activateBottomNavLayout } from "@/components/navigation/alpha-bottom-nav-layout";
import { usePlatformModules } from "@/lib/platform-modules";
import { COMMUNITY_HUB_PATH, isCommunityHubPath } from "@/features/community/community-routes";

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
  const { isModuleEnabled } = usePlatformModules();
  const showCommunity = isModuleEnabled("community");
  const showAgpeya = isModuleEnabled("agpeya");

  const dockSlotCount = 2 + (showAgpeya ? 1 : 0) + (showCommunity ? 1 : 0) + 1;
  const dockGridClass =
    dockSlotCount === 6
      ? "grid-cols-6"
      : dockSlotCount === 5
      ? "grid-cols-5"
      : dockSlotCount === 4
        ? "grid-cols-4"
        : dockSlotCount === 3
          ? "grid-cols-3"
          : "grid-cols-2";

  const isActive = (match: string | RegExp) =>
    typeof match === "string" ? pathname === match || pathname.startsWith(match + "/") : match.test(pathname);

  const isBibleArea =
    isActive("/bible") ||
    isActive("/books") ||
    (() => {
      const parts = pathname.split("/").filter(Boolean);
      return parts.length === 2 && /^\d+$/.test(parts[1] ?? "");
    })();

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

  useEffect(() => {
    if (isHidden) return;
    return activateBottomNavLayout();
  }, [isHidden]);

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
          ? "transform var(--alpha-duration-slow) var(--alpha-ease-standard), visibility 0s linear var(--alpha-duration-slow)"
          : "transform var(--alpha-duration-slow) var(--alpha-ease-standard), visibility 0s linear 0s",
        willChange: "transform",
      }}
    >


      <div className="mx-auto w-full max-w-[var(--alpha-dock-max-width)] px-3 pointer-events-auto alpha-app-dock">
        <div className="alpha-dock-bar relative rounded-[var(--alpha-radius-card)]">
          <div className={cn("grid items-end px-2 py-2.5 gap-1 sm:px-2.5 sm:py-3 sm:gap-1.5", dockGridClass)}>
            <DockItem icon={House} label={t("nav.home")} to="/home" active={isActive("/home")} />
            {showAgpeya ? (
              <DockItem icon={Church} label={t("nav.prayer")} to="/agpeya" active={isActive("/agpeya")} />
            ) : null}
            <DockItem
              icon={BookMarked}
              label={t("nav.bible")}
              to="/bible"
              active={isBibleArea}
            />
            {showCommunity ? (
              <DockItem
                icon={UsersRound}
                label={t("nav.community")}
                to={COMMUNITY_HUB_PATH}
                active={isCommunityHubPath(pathname)}
              />
            ) : null}
            <DockItem icon={CircleUser} label={t("nav.profile")} to="/profile" active={isActive("/profile")} />
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
  to,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  label: string;
  active?: boolean;
  to?: string;
}) {
  const inner = (
    <>
      {Icon ? (
        <Icon className="alpha-dock-tab__icon h-[21px] w-[21px] sm:h-[23px] sm:w-[23px]" strokeWidth={2} />
      ) : null}
      <span className="alpha-dock-tab__label font-semibold tracking-tight">{label}</span>
    </>
  );

  const className = cn("alpha-dock-tab", active && "alpha-dock-tab--active");

  if (to) {
    return (
      <Link to={to as any} aria-label={label} aria-current={active ? "page" : undefined} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} aria-current={active ? "page" : undefined} className={className}>
      {inner}
    </button>
  );
}
