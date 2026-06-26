import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { Settings, UserPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResolvedTheme } from "@/lib/alpha-theme";

export function ProfileSettingsMenu({
  menuAlign = "start",
  variant,
}: {
  menuAlign?: "start" | "end";
  variant?: "light" | "dark";
}) {
  const resolvedDark = useResolvedTheme() === "dark";
  const tone = variant ?? (resolvedDark ? "dark" : "light");
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const navigate = useNavigate();

  const updateMenuPosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuW = 196;
    const left =
      menuAlign === "end"
        ? Math.min(rect.right - menuW, window.innerWidth - menuW - 8)
        : Math.max(8, rect.left);
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width: menuW,
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
  }, [open, menuAlign]);

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

  const goTo = (to: "/profile/personal" | "/settings") => {
    setOpen(false);
    void navigate({ to });
  };

  const btnClass =
    tone === "dark"
      ? "grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/35 text-white shadow-sm backdrop-blur-xl active:scale-95 transition-transform touch-manipulation"
      : "alpha-chrome-btn relative z-[60] grid h-11 w-11 touch-manipulation place-items-center rounded-full active:scale-95 transition";

  const menu = open ? (
    <div
      ref={menuRef}
      style={menuStyle}
      className={cn(
        "overflow-hidden rounded-[16px] border backdrop-blur-md shadow-[0_16px_40px_-12px_rgba(42,31,69,0.45)]",
        tone === "dark"
          ? "border-white/12 bg-[#120c08]/96"
          : "border-alpha bg-alpha-surface-glass",
      )}
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => goTo("/profile/personal")}
        className={cn(
          "flex w-full items-center gap-2.5 px-3.5 py-3 text-right transition-colors",
          tone === "dark" ? "active:bg-white/8" : "active:bg-[var(--alpha-bg-elevated)]",
        )}
      >
        <UserPen className="h-4 w-4 shrink-0 text-[#4a86c1]" />
        <span className={cn("text-[12px] font-extrabold", tone === "dark" ? "text-white/90" : "text-alpha")}>
          تعديل الملف الشخصي
        </span>
      </button>
      <div className={cn("h-px", tone === "dark" ? "bg-white/10" : "bg-alpha-border")} />
      <button
        type="button"
        role="menuitem"
        onClick={() => goTo("/settings")}
        className={cn(
          "flex w-full items-center gap-2.5 px-3.5 py-3 text-right transition-colors",
          tone === "dark" ? "active:bg-white/8" : "active:bg-[var(--alpha-bg-elevated)]",
        )}
      >
        <Settings className="h-4 w-4 shrink-0 text-[#3f9d6e]" />
        <span className={cn("text-[12px] font-extrabold", tone === "dark" ? "text-white/90" : "text-alpha")}>
          الإعدادات
        </span>
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="الإعدادات"
        aria-expanded={open}
        aria-haspopup="menu"
        data-alpha-edge-ignore
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={btnClass}
      >
        <Settings className={cn("h-5 w-5", tone === "light" && "text-alpha")} />
      </button>
      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </>
  );
}
