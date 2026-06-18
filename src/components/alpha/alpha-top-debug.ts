import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { CSSProperties } from "react";

export const ALPHA_TOP_DEBUG_QUERY_KEY = "alphaTopDebug";

/** Temporary visual debug — one shell layer at a time via ?alphaTopDebug=1..8 */
export const ALPHA_TOP_DEBUG_TARGETS = {
  1: "AlphaScreenFrame",
  2: "alpha-viewport-root",
  3: "alpha-viewport-stage",
  4: "AlphaHeaderShell",
  5: "AlphaHeader",
  6: "Fixed Background Layer",
  7: "PNG Background Layer",
  8: "Safe Area Container",
} as const;

export type AlphaTopDebugTargetId = keyof typeof ALPHA_TOP_DEBUG_TARGETS;

const TARGET_ALIASES: Record<string, AlphaTopDebugTargetId> = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  screenframe: 1,
  "alpha-screen-frame": 1,
  viewportroot: 2,
  "alpha-viewport-root": 2,
  viewportstage: 3,
  "alpha-viewport-stage": 3,
  headershell: 4,
  "alpha-header-shell": 4,
  header: 5,
  "alpha-header": 5,
  fixedbg: 6,
  "fixed-background": 6,
  pngbg: 7,
  "png-background": 7,
  safearea: 8,
  "safe-area": 8,
};

export function parseAlphaTopDebugTarget(raw: string | null): AlphaTopDebugTargetId | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return TARGET_ALIASES[key] ?? null;
}

export function useAlphaTopDebugTarget(): AlphaTopDebugTargetId | null {
  const search = useRouterState({ select: (s) => s.location.searchStr });
  return useMemo(() => {
    const params = new URLSearchParams(search);
    return parseAlphaTopDebugTarget(params.get(ALPHA_TOP_DEBUG_QUERY_KEY));
  }, [search]);
}

export function isAlphaTopDebugActive(
  target: AlphaTopDebugTargetId,
  active: AlphaTopDebugTargetId | null,
): boolean {
  return active === target;
}

export const ALPHA_TOP_DEBUG_BORDER: CSSProperties = {
  border: "5px solid red",
  boxSizing: "border-box",
};

export function alphaTopDebugBorderStyle(active: boolean): CSSProperties | undefined {
  return active ? ALPHA_TOP_DEBUG_BORDER : undefined;
}
