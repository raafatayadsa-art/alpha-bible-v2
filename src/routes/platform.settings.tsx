import { createFileRoute } from "@tanstack/react-router";
import { SystemSettingsScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/settings")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <SystemSettingsScreen />
    </PlatformAccessGate>
  ),
});
