import { createFileRoute } from "@tanstack/react-router";
import { AlphaTeamPermissionsScreen } from "@/features/platform-admin/admin-team/AlphaTeamPermissionsScreen";

export const Route = createFileRoute("/platform/team/$memberId/permissions")({
  ssr: false,
  component: TeamPermissionsRoute,
});

function TeamPermissionsRoute() {
  const { memberId } = Route.useParams();
  return <AlphaTeamPermissionsScreen memberId={memberId} />;
}
