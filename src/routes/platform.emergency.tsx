import { createFileRoute } from "@tanstack/react-router";
import { EmergencyCenterScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/emergency")({
  ssr: false,
  component: () => <EmergencyCenterScreen />,
});
