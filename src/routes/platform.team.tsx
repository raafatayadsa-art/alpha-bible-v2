import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AlphaTeamScreen } from "@/features/platform-admin/admin-team/AlphaTeamScreen";

export const Route = createFileRoute("/platform/team")({
  ssr: false,
  head: () => ({ meta: [{ title: "فريق Alpha — Alpha Control" }] }),
  component: PlatformTeamRoute,
});

function PlatformTeamRoute() {
  const isList = useRouterState({
    select: (s) => s.location.pathname.replace(/\/+$/, "") === "/platform/team",
  });

  return isList ? <AlphaTeamScreen /> : <Outlet />;
}
