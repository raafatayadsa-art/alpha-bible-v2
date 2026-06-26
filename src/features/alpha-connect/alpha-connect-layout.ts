/** Alpha Connect layout — bottom nav clearance & list preview limits. */

export const CONNECT_ACTIVITY_PREVIEW_LIMIT = 1;

/** Dock bar content height (excluding safe-area padding). */
export const CONNECT_NAV_DOCK_HEIGHT_PX = 72;

/** Total clearance: dock + safe area — content must end above this. */
export const CONNECT_NAV_CLEARANCE_CSS =
  "var(--alpha-bottom-nav-clearance, calc(140px + env(safe-area-inset-bottom, 0px)))";

export function connectContentBottomPaddingClass(): string {
  return "pb-[var(--alpha-connect-nav-clearance)]";
}

export function connectBottomSheetHostClass(): string {
  return "alpha-bottom-sheet-host fixed inset-0 flex items-end justify-center";
}

export function connectDockFixedFooterClass(): string {
  return "alpha-dock-fixed-footer";
}
