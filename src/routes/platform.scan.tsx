import { createFileRoute } from "@tanstack/react-router";
import { ScanCenterScreen } from "@/features/platform-admin/ScanCenterScreen";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/scan")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Scan Center — Alpha Control" }],
  }),
  component: PlatformScanRoute,
});

function PlatformScanRoute() {
  return (
    <PlatformAccessGate>
      <ScanCenterScreen />
    </PlatformAccessGate>
  );
}
