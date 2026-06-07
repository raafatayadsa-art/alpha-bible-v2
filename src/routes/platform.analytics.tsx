import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/analytics")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <AnalyticsScreen />
    </PlatformAccessGate>
  ),
});
