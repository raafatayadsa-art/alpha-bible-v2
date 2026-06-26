import { createFileRoute } from "@tanstack/react-router";
import { MonasteriesManagementScreen } from "@/features/platform-admin/MonasteriesManagementScreen";

export const Route = createFileRoute("/platform/monasteries")({
  ssr: false,
  component: () => <MonasteriesManagementScreen />,
});
