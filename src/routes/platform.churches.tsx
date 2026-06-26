import { createFileRoute } from "@tanstack/react-router";
import { ChurchesManagementScreen } from "@/features/platform-admin/ChurchesManagementScreen";

export const Route = createFileRoute("/platform/churches")({
  ssr: false,
  component: () => <ChurchesManagementScreen />,
});
