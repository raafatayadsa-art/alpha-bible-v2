import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

/** Returns the appropriate fallback route when no app history exists. */
function getSmartFallback(pathname: string): string {
  if (pathname.startsWith("/settings/")) return "/settings";
  if (pathname.startsWith("/profile/")) return "/profile";
  if (pathname.startsWith("/church/")) return "/church";
  if (pathname.startsWith("/agpeya/")) return "/agpeya";
  if (pathname.startsWith("/audio")) return "/audio";
  if (pathname.startsWith("/synaxarium/")) return "/synaxarium";
  if (pathname.startsWith("/katameros/")) return "/katameros";
  if (pathname.startsWith("/feasts/")) return "/feasts";
  if (pathname === "/books" || pathname === "/books-v2") return "/bible";
  if (pathname.startsWith("/bible/")) return "/bible";
  if (pathname === "/search" || pathname.startsWith("/search/")) return "/home";
  if (pathname === "/prayer-requests") return "/church";
  if (
    pathname === "/messages" ||
    pathname.startsWith("/messages/") ||
    pathname.startsWith("/alpha-connect") ||
    pathname === "/personal-call"
  ) {
    return "/church";
  }
  return "/home";
}

/** Reads TanStack Router's navigation index from browser history state. */
function getHistoryIdx(): number {
  if (typeof window === "undefined") return 0;
  return ((window.history.state as Record<string, unknown>)?.idx as number) ?? 0;
}
import { AlphaNavHub } from "@/components/navigation/AlphaNavHub";
import { AlphaEdgeGestures } from "@/components/navigation/AlphaEdgeGestures";
import { AlphaNotificationsProvider } from "@/components/navigation/AlphaNotificationsProvider";
import {
  canBackFromEdge,
  canOpenNavFromEdge,
  getAlphaScreenKind,
  type AlphaScreenKind,
} from "@/components/navigation/alpha-screen-kind";

type AlphaNavigationContextValue = {
  screenKind: AlphaScreenKind;
  navOpen: boolean;
  openNavHub: () => void;
  closeNavHub: () => void;
  goBack: () => void;
  canGoBack: boolean;
  navEdgeEnabled: boolean;
  backEdgeEnabled: boolean;
};

const AlphaNavigationContext = createContext<AlphaNavigationContextValue | null>(null);

export function AlphaNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const screenKind = useMemo(() => getAlphaScreenKind(pathname), [pathname]);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const canGoBack = getHistoryIdx() > 0;

  const openNavHub = useCallback(() => setNavOpen(true), []);
  const closeNavHub = useCallback(() => setNavOpen(false), []);

  const goBack = useCallback(() => {
    if (getHistoryIdx() > 0) {
      router.history.back();
      return;
    }
    void router.navigate({ to: getSmartFallback(pathname) as any });
  }, [router, pathname]);

  const navEdgeEnabled = canOpenNavFromEdge(screenKind) && !navOpen;
  const backEdgeEnabled = canBackFromEdge(screenKind, canGoBack) && !navOpen;

  const value = useMemo(
    () => ({
      screenKind,
      navOpen,
      openNavHub,
      closeNavHub,
      goBack,
      canGoBack,
      navEdgeEnabled,
      backEdgeEnabled,
    }),
    [screenKind, navOpen, openNavHub, closeNavHub, goBack, canGoBack, navEdgeEnabled, backEdgeEnabled],
  );

  return (
    <AlphaNotificationsProvider>
      <AlphaNavigationContext.Provider value={value}>
        {children}
        <AlphaEdgeGestures />
        <AlphaNavHub open={navOpen} onClose={closeNavHub} />
      </AlphaNavigationContext.Provider>
    </AlphaNotificationsProvider>
  );
}

export function useAlphaNavigation() {
  const ctx = useContext(AlphaNavigationContext);
  if (!ctx) {
    throw new Error("useAlphaNavigation must be used within AlphaNavigationProvider");
  }
  return ctx;
}
