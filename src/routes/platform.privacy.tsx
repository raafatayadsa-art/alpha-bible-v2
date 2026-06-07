import { createFileRoute } from "@tanstack/react-router";
import { PrivacySecurityScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/privacy")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <PrivacySecurityScreen />
    </PlatformAccessGate>
  ),
});
