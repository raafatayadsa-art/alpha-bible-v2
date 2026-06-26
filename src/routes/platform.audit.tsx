import { createFileRoute } from "@tanstack/react-router";
import { AuditLogsScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/audit")({
  ssr: false,
  component: () => <AuditLogsScreen />,
});
