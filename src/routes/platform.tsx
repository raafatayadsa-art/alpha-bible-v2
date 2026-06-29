import { createFileRoute, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminPermissionsProvider, useAdminPermissions } from "@/features/platform-admin/admin-team/useAdminPermissions";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";
import { routeRequiresPermission } from "@/features/platform-admin/admin-team/permissions";

export const Route = createFileRoute("/platform")({
  ssr: false,
  component: PlatformLayoutRoute,
});

function PlatformRoutePermissionGuard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { canAccessRoute, loading } = useAdminPermissions();

  useEffect(() => {
    if (loading) return;
    const normalized = pathname.replace(/\/+$/, "") || "/";
    if (normalized === "/platform") return;
    if (routeRequiresPermission(normalized) != null && !canAccessRoute(normalized)) {
      void navigate({ to: "/platform", replace: true });
    }
  }, [pathname, canAccessRoute, loading, navigate]);

  return <Outlet />;
}

function PlatformLayoutRoute() {
  return (
    <PlatformAccessGate>
      <AdminPermissionsProvider>
        <PlatformRoutePermissionGuard />
      </AdminPermissionsProvider>
    </PlatformAccessGate>
  );
}
