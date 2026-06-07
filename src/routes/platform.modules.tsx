import { createFileRoute } from "@tanstack/react-router";
import { ModuleControlScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/modules")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <ModuleControlScreen />
    </PlatformAccessGate>
  ),
});
