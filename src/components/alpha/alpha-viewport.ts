import { useEffect } from "react";
import {
  CONNECT_THEME_CHANGED_EVENT,
  getConnectTheme,
  normalizeConnectTheme,
  type AlphaConnectThemeId,
} from "./alpha-connect-theme";

export type AlphaViewportBackdrop =
  | "shell"
  | "messaging"
  | "connect-secure"
  | "connect-classic"
  | "default";

const BG_CLASS_PREFIX = "alpha-viewport-bg-";
const BG_CLASSES: AlphaViewportBackdrop[] = [
  "shell",
  "messaging",
  "connect-secure",
  "connect-classic",
  "default",
];

export function resolveAlphaViewportBackdrop(pathname: string, connectTheme?: AlphaConnectThemeId): {
  lock: boolean;
  backdrop: AlphaViewportBackdrop;
} {
  if (pathname === "/intro") {
    return { lock: false, backdrop: "default" };
  }

  if (
    pathname.startsWith("/platform") ||
    pathname.startsWith("/dev") ||
    pathname === "/diagnostics"
  ) {
    return { lock: false, backdrop: "default" };
  }

  if (
    pathname === "/alpha-connect" ||
    pathname.startsWith("/alpha-connect/") ||
    pathname === "/call" ||
    pathname === "/personal-call"
  ) {
    const theme = connectTheme ?? getConnectTheme();
    return {
      lock: true,
      backdrop: theme === "classic" ? "connect-classic" : "connect-secure",
    };
  }

  if (pathname === "/messages" || pathname.startsWith("/messages/")) {
    return { lock: true, backdrop: "messaging" };
  }

  return { lock: true, backdrop: "shell" };
}

export function backdropToRootClass(backdrop: AlphaViewportBackdrop): string {
  const key = backdrop === "default" ? "shell" : backdrop;
  return `alpha-viewport-root--${key}`;
}

/** @deprecated Use backdropToRootClass — backgrounds live on .alpha-viewport-root */
export function backdropToClass(backdrop: AlphaViewportBackdrop): string {
  return backdropToRootClass(backdrop);
}

export function getConnectViewportBackdrop(theme: AlphaConnectThemeId): AlphaViewportBackdrop {
  return theme === "classic" ? "connect-classic" : "connect-secure";
}

function applyViewportDocumentState(lock: boolean, backdrop: AlphaViewportBackdrop) {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  html.classList.toggle("alpha-viewport-lock", lock);

  for (const cls of BG_CLASSES) {
    html.classList.remove(`${BG_CLASS_PREFIX}${cls}`);
  }

  if (lock) {
    html.classList.add(`${BG_CLASS_PREFIX}${backdrop}`);
  }
}

/** Syncs html/body lock + overscroll backdrop color with active route/theme. */
export function AlphaViewportSync({ pathname }: { pathname: string }) {
  useEffect(() => {
    const sync = (theme?: AlphaConnectThemeId) => {
      const profile = resolveAlphaViewportBackdrop(pathname, theme);
      applyViewportDocumentState(profile.lock, profile.backdrop);
    };

    sync();

    const onThemeChanged = (event: Event) => {
      const theme = (event as CustomEvent<{ theme: AlphaConnectThemeId }>).detail?.theme;
      if (theme) sync(normalizeConnectTheme(theme));
    };

    window.addEventListener(CONNECT_THEME_CHANGED_EVENT, onThemeChanged);
    return () => {
      window.removeEventListener(CONNECT_THEME_CHANGED_EVENT, onThemeChanged);
    };
  }, [pathname]);

  useEffect(() => {
    return () => applyViewportDocumentState(false, "default");
  }, []);

  return null;
}
