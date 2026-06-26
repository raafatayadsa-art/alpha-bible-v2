/**
 * ALPHA-105 — Global bottom navigation safe clearance.
 * Call when a fixed bottom dock is mounted and visible.
 */

let activeDockMounts = 0;

export const ALPHA_BOTTOM_NAV_CLEARANCE_CSS =
  "calc(140px + env(safe-area-inset-bottom, 0px))";

/** Apply to fixed `inset-0 flex items-end` sheet hosts when a dock is visible. */
export const ALPHA_BOTTOM_SHEET_HOST_CLASS = "alpha-bottom-sheet-host";

/** Apply to fixed bottom action bars (save buttons, toolbars). */
export const ALPHA_DOCK_FIXED_FOOTER_CLASS = "alpha-dock-fixed-footer";

/** Scroll region inside a bottom sheet panel. */
export const ALPHA_BOTTOM_SHEET_SCROLL_CLASS = "alpha-bottom-sheet-scroll";

/** Register that a bottom navigation bar is visible; returns cleanup. */
export function activateBottomNavLayout(): () => void {
  activeDockMounts += 1;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-alpha-bottom-nav", "active");
  }
  return () => {
    activeDockMounts = Math.max(0, activeDockMounts - 1);
    if (activeDockMounts === 0 && typeof document !== "undefined") {
      document.documentElement.removeAttribute("data-alpha-bottom-nav");
    }
  };
}
