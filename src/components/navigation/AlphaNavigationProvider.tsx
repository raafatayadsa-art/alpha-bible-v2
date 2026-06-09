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

  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  const openNavHub = useCallback(() => setNavOpen(true), []);
  const closeNavHub = useCallback(() => setNavOpen(false), []);

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
      return;
    }
    router.navigate({ to: "/home" });
  }, [router]);

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
