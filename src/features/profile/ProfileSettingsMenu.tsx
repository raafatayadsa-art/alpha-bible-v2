import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { Settings, User, UserPen, UserRound } from "lucide-react";
import { AvatarWithDisplayShield } from "@/components/alpha/AvatarWithDisplayShield";
import { getDisplayShieldRoleSync, subscribeAuthContext, useAlphaAuth } from "@/features/auth";
import { isGuestModeActive } from "@/features/auth/guest-mode";
import { cn } from "@/lib/utils";
import { useResolvedTheme } from "@/lib/alpha-theme";
import {
  GUEST_AVATAR_INITIALS,
  profileAvatarInitials,
  resolveProfileDisplayAvatar,
  useProfileUser,
} from "./profile-user-store";

type MenuRoute = "/profile" | "/profile/edit" | "/profile/personal" | "/settings" | "/login";

const MENU_WIDTH = 228;
const VIEWPORT_PAD = 10;

function computeAnchoredMenuLeft(rect: DOMRect, menuWidth: number): number {
  const maxLeft = window.innerWidth - menuWidth - VIEWPORT_PAD;
  // Align menu start with button start (avatar sits on visual left in RTL home).
  let left = rect.left;
  if (left + menuWidth > window.innerWidth - VIEWPORT_PAD) {
    left = rect.right - menuWidth;
  }
  return Math.max(VIEWPORT_PAD, Math.min(left, maxLeft));
}

export function ProfileSettingsMenu({
  menuAlign = "start",
  variant,
  trigger = "settings",
  avatarSize = "md",
  avatarVariant = "default",
  showSettingsMenuItem = true,
}: {
  menuAlign?: "start" | "end";
  variant?: "light" | "dark";
  trigger?: "settings" | "avatar";
  avatarSize?: "md" | "lg";
  avatarVariant?: "default" | "home-premium" | "community-hub";
  showSettingsMenuItem?: boolean;
}) {
  const resolvedDark = useResolvedTheme() === "dark";
  const tone = variant ?? (resolvedDark ? "dark" : "light");
  const [open, setOpen] = useState(false);
  const [shieldTick, setShieldTick] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, refresh } = useAlphaAuth();
  const { state: profileUser } = useProfileUser();

  const avatarUrl = useMemo(
    () => resolveProfileDisplayAvatar(profileUser.customAvatarUrl, user?.avatarUrl),
    [profileUser.customAvatarUrl, user?.avatarUrl],
  );

  useEffect(() => {
    if (isAuthenticated) void refresh();
  }, [isAuthenticated, refresh]);

  useEffect(() => subscribeAuthContext(() => setShieldTick((n) => n + 1)), []);

  const isGuest = !isAuthenticated && isGuestModeActive();

  const initials = useMemo(
    () => profileAvatarInitials(user?.displayName ?? "", { guest: isGuest }),
    [user?.displayName, isGuest],
  );

  const avatarDim = avatarSize === "lg" ? "h-14 w-14" : "h-11 w-11";
  const avatarTextSize = avatarSize === "lg" ? "text-[13px]" : "text-[11px]";

  const updateMenuPosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const left =
      menuAlign === "end" || trigger === "avatar"
        ? computeAnchoredMenuLeft(rect, MENU_WIDTH)
        : Math.max(VIEWPORT_PAD, Math.min(rect.left, window.innerWidth - MENU_WIDTH - VIEWPORT_PAD));

    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 10,
      left,
      width: MENU_WIDTH,
      zIndex: 10060,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, menuAlign, trigger]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [open]);

  const goTo = (to: MenuRoute) => {
    setOpen(false);
    void navigate({ to });
  };

  const btnClass =
    tone === "dark"
      ? "grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/35 text-white shadow-sm backdrop-blur-xl active:scale-95 transition-transform touch-manipulation"
      : "alpha-chrome-btn relative z-[60] grid h-11 w-11 touch-manipulation place-items-center rounded-full active:scale-95 transition";

  const avatarBtnClass = cn(
    "relative z-[1] shrink-0 touch-manipulation overflow-visible rounded-full active:scale-95 transition-transform",
    avatarDim,
    avatarVariant === "home-premium"
      ? "border-0 bg-white/90 shadow-[0_8px_20px_-12px_rgba(120,80,30,0.28)] backdrop-blur-xl"
      : avatarVariant === "community-hub"
        ? "border-0 bg-white/88 shadow-[0_8px_20px_-12px_rgba(120,80,30,0.28)] backdrop-blur-xl"
        : cn(
          "relative z-[60] border-0",
          tone === "dark"
            ? "bg-black/35 shadow-md backdrop-blur-xl"
            : "bg-white/85 shadow-[0_8px_18px_-10px_rgba(120,80,30,0.35)] backdrop-blur-xl",
        ),
  );

  const menuItemClass = (extra?: string) =>
    cn(
      "flex w-full items-center gap-3 px-4 py-3.5 text-right transition-colors",
      tone === "dark" ? "active:bg-white/8" : "active:bg-white/10",
      extra,
    );

  const menuIconClass = (accent: "gold" | "blue" | "green") =>
    cn(
      "h-[18px] w-[18px] shrink-0",
      accent === "gold" &&
        "text-[#ffe9a8] drop-shadow-[0_0_6px_rgba(255,220,120,0.85),0_0_14px_rgba(231,196,88,0.55)]",
      accent === "blue" &&
        "text-[#9fd0ff] drop-shadow-[0_0_6px_rgba(120,190,255,0.85),0_0_14px_rgba(74,134,193,0.55)]",
      accent === "green" &&
        "text-[#8ef0b8] drop-shadow-[0_0_6px_rgba(120,240,180,0.85),0_0_14px_rgba(63,157,110,0.55)]",
    );

  const menuLabelClass = cn(
    "text-[15px] font-extrabold leading-snug text-[#f0d78c] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
  );

  const menu = open ? (
    <div
      ref={menuRef}
      style={menuStyle}
      className={cn(
        "overflow-hidden rounded-[var(--alpha-radius-dock-tab)] border backdrop-blur-xl shadow-[var(--alpha-shadow-featured)] animate-in fade-in slide-in-from-top-1 duration-150",
        tone === "dark"
          ? "border-[#f0d78c]/22 bg-[color-mix(in_srgb,#1a1208_94%,transparent)]"
          : "border-[#e7c97a]/35 bg-[color-mix(in_srgb,#2a1f12_92%,transparent)] shadow-[0_16px_40px_rgba(40,28,12,0.28)]",
      )}
      role="menu"
    >
      {trigger === "avatar" && isAuthenticated ? (
        <>
          <button type="button" role="menuitem" onClick={() => goTo("/profile")} className={menuItemClass()}>
            <UserRound className={menuIconClass("gold")} strokeWidth={2.2} />
            <span className={menuLabelClass}>الملف الشخصي</span>
          </button>
          <div className={cn("h-px", tone === "dark" ? "bg-white/10" : "bg-[#f0d78c]/18")} />
        </>
      ) : null}
      {trigger !== "avatar" ? (
        <>
          <button type="button" role="menuitem" onClick={() => goTo("/profile/edit")} className={menuItemClass()}>
            <UserPen className={menuIconClass("blue")} strokeWidth={2.2} />
            <span className={menuLabelClass}>
              {isAuthenticated ? "تعديل الملف الشخصي" : "تعديل الملف / تسجيل الدخول"}
            </span>
          </button>
          <div className={cn("h-px", tone === "dark" ? "bg-white/10" : "bg-[#f0d78c]/18")} />
        </>
      ) : null}
      {showSettingsMenuItem ? (
        <button type="button" role="menuitem" onClick={() => goTo("/settings")} className={menuItemClass()}>
          <Settings className={menuIconClass("green")} strokeWidth={2.2} />
          <span className={menuLabelClass}>الإعدادات</span>
        </button>
      ) : null}
    </div>
  ) : null;

  const handleTriggerClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (trigger === "avatar" && !isAuthenticated && !loading) {
      void navigate({ to: "/login" });
      return;
    }
    setOpen((v) => !v);
  };

  const displayShieldRole = getDisplayShieldRoleSync();
  void shieldTick;

  const avatarInner =
    trigger === "avatar" ? (
      isAuthenticated && !loading ? (
        <AvatarWithDisplayShield
          userName={user?.displayName ?? "Alpha"}
          userAvatar={avatarUrl || undefined}
          shieldRole={displayShieldRole}
          shieldSize={avatarSize === "lg" ? "md" : "sm"}
          avatarClassName={avatarDim}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <span
              className={cn(
                "grid h-full w-full place-items-center font-extrabold",
                avatarTextSize,
                avatarVariant === "home-premium"
                  ? "bg-gradient-to-br from-[#fdfbf7] via-[#f4ead8] to-[#e7c97a]/40 text-[var(--alpha-gold-deep)]"
                  : tone === "dark"
                    ? "bg-gradient-to-br from-[#5a3d92]/80 to-[#3a2560] text-[#f0d78c]"
                    : "bg-gradient-to-br from-[#f4ead8] to-[#e7c97a]/35 text-[#5a1f2a]",
              )}
            >
              {initials}
            </span>
          )}
        </AvatarWithDisplayShield>
      ) : isGuest ? (
        <span
          className={cn(
            "grid h-full w-full place-items-center font-extrabold",
            avatarTextSize,
            avatarVariant === "home-premium"
              ? "bg-gradient-to-br from-[#fdfbf7] via-[#f4ead8] to-[#e7c97a]/40 text-[var(--alpha-gold-deep)]"
              : tone === "dark"
                ? "bg-gradient-to-br from-[#5a3d92]/80 to-[#3a2560] text-[#f0d78c]"
                : "bg-gradient-to-br from-[#f4ead8] to-[#e7c97a]/35 text-[#5a1f2a]",
          )}
        >
          {GUEST_AVATAR_INITIALS}
        </span>
      ) : loading ? (
        <span className="h-6 w-6 animate-pulse rounded-full bg-[#e7c97a]/35" aria-hidden />
      ) : (
        <span
          className={cn(
            "grid h-full w-full place-items-center",
            tone === "dark" ? "bg-white/10 text-white/85" : "bg-[#f4ead8] text-[#6a543a]",
          )}
        >
          <User className="h-6 w-6" strokeWidth={2.1} />
        </span>
      )
    ) : (
      <Settings className={cn("h-5 w-5", tone === "light" && "text-alpha")} />
    );

  const triggerButton = (
    <button
      ref={btnRef}
      type="button"
      aria-label={trigger === "avatar" ? "الملف الشخصي" : "الإعدادات"}
      aria-expanded={open}
      aria-haspopup="menu"
      data-alpha-edge-ignore
      onClick={handleTriggerClick}
      className={trigger === "avatar" ? avatarBtnClass : btnClass}
    >
      {avatarInner}
    </button>
  );

  return (
    <>
      {trigger === "avatar" && avatarVariant === "home-premium" ? (
        <div className={cn("alpha-home-avatar-shell relative shrink-0", avatarDim)}>
          <span className="alpha-home-avatar-pulse-ring" aria-hidden />
          <span className="alpha-home-avatar-pulse-ring alpha-home-avatar-pulse-ring--delay" aria-hidden />
          {triggerButton}
        </div>
      ) : (
        triggerButton
      )}
      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </>
  );
}
