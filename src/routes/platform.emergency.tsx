import { createFileRoute } from "@tanstack/react-router";
import { EmergencyCenterScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/emergency")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <EmergencyCenterScreen />
    </PlatformAccessGate>
  ),
});
