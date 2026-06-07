import { createFileRoute } from "@tanstack/react-router";
import { AIControlScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/ai")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <AIControlScreen />
    </PlatformAccessGate>
  ),
});
