import { createFileRoute } from "@tanstack/react-router";
import { AlphaInviteAcceptScreen } from "@/features/platform-admin/admin-team/AlphaInviteAcceptScreen";

export const Route = createFileRoute("/invite/accept")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: () => <AlphaInviteAcceptScreen />,
});
