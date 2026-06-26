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

  if (loading && moduleKey != null) {
    return (
      <div className="grid min-h-[40dvh] place-items-center px-6 text-center text-sm text-[#6a5488]">
        جاري التحميل…
      </div>
    );
  }

  if (blocked) return null;
  return <>{children}</>;
}
