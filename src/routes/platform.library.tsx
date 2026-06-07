import { createFileRoute } from "@tanstack/react-router";
import { AlphaLibraryScreen } from "@/features/platform-admin";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/library")({
  ssr: false,
  component: () => (
    <PlatformAccessGate>
      <AlphaLibraryScreen />
    </PlatformAccessGate>
  ),
});
