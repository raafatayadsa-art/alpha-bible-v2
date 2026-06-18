/** Alpha Connect layout — bottom nav clearance & list preview limits. */

export const CONNECT_ACTIVITY_PREVIEW_LIMIT = 1;

/** Dock bar content height (excluding safe-area padding). */
export const CONNECT_NAV_DOCK_HEIGHT_PX = 72;

/** Total clearance: dock + safe area — content must end above this. */
export const CONNECT_NAV_CLEARANCE_CSS =
  "calc(var(--alpha-connect-nav-dock-height, 72px) + max(16px, env(safe-area-inset-bottom)))";

export function connectContentBottomPaddingClass(): string {
  return "pb-[var(--alpha-connect-nav-clearance)]";
}

export function connectSheetBottomInsetClass(): string {
  return "mb-[var(--alpha-connect-nav-clearance)]";
}
