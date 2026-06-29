import { type ReactNode, useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { resolveModuleKeyForPath } from "./module-route-map";
import { usePlatformModules } from "./usePlatformModules";

/** Redirects to home when the route's module is disabled platform-wide. */
export function PlatformModuleGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { isModuleEnabled, loading } = usePlatformModules();
  const moduleKey = resolveModuleKeyForPath(pathname);
  const blocked = !loading && moduleKey != null && !isModuleEnabled(moduleKey);

  useEffect(() => {
    if (blocked) {
      navigate({ to: "/home", replace: true });
    }
  }, [blocked, navigate]);

  if (blocked) return null;
  return <>{children}</>;
}
