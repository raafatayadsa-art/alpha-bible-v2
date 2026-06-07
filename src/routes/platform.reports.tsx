import { createFileRoute } from "@tanstack/react-router";
import { ReportedContentScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/reports")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <ReportedContentScreen />
    </PlatformAccessGate>
  ),
});
