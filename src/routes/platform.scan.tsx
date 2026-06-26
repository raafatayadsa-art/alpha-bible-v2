import { createFileRoute } from "@tanstack/react-router";
import { ScanCenterScreen } from "@/features/platform-admin/ScanCenterScreen";

export const Route = createFileRoute("/platform/scan")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Scan Center — Alpha Control" }],
  }),
  component: PlatformScanRoute,
});

function PlatformScanRoute() {
  return <ScanCenterScreen />;
}
