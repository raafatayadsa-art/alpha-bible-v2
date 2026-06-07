import { createFileRoute } from "@tanstack/react-router";
import { OwnerSecurityScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/owner-security")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <OwnerSecurityScreen />
    </PlatformAccessGate>
  ),
});
