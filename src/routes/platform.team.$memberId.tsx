import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AlphaTeamMemberScreen } from "@/features/platform-admin/admin-team/AlphaTeamMemberScreen";

export const Route = createFileRoute("/platform/team/$memberId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    edit: search.edit === "1" || search.edit === 1 ? "1" : undefined,
  }),
  component: TeamMemberRoute,
});

function TeamMemberRoute() {
  const { memberId } = Route.useParams();
  const { edit } = Route.useSearch();
  const isDetail = useRouterState({
    select: (s) => s.location.pathname.replace(/\/+$/, "") === `/platform/team/${memberId}`,
  });

  if (isDetail) {
    return <AlphaTeamMemberScreen memberId={memberId} editMode={edit === "1"} />;
  }

  return <Outlet />;
}
