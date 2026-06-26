import { createFileRoute } from "@tanstack/react-router";
import { ApprovalDetailsScreen } from "@/features/platform-admin/ApprovalDetailsScreen";

export const Route = createFileRoute("/platform/approvals/$id")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Approval Details — Alpha Control" }],
  }),
  component: PlatformApprovalDetailsRoute,
});

function PlatformApprovalDetailsRoute() {
  return <ApprovalDetailsScreen />;
}
