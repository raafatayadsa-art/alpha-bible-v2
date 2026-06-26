import { createFileRoute } from "@tanstack/react-router";
import { SystemSettingsScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/settings")({
  ssr: false,
  component: () => <SystemSettingsScreen />,
});
