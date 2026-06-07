import { createFileRoute } from "@tanstack/react-router";
import { AuditLogsScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/audit")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <AuditLogsScreen />
    </PlatformAccessGate>
  ),
});
