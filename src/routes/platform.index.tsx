import { createFileRoute } from "@tanstack/react-router";
import { AlphaMissionControl } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/")({
  ssr: false,
  head: () => ({
    meta: [{ title: "ALPHA CONTROL CENTER — Owner Access" }],
  }),
  component: PlatformHomeRoute,
});

function PlatformHomeRoute() {
  return (
    <PlatformAccessGate>
      <AlphaMissionControl />
    </PlatformAccessGate>
  );
}
