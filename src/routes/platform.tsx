import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform")({
  ssr: false,
  component: PlatformLayoutRoute,
});

function PlatformLayoutRoute() {
  return (
    <PlatformAccessGate>
      <Outlet />
    </PlatformAccessGate>
  );
}
