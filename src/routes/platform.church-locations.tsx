import { createFileRoute } from "@tanstack/react-router";
import { ChurchLocationManagerScreen } from "@/features/platform-admin/ChurchLocationManagerScreen";

export const Route = createFileRoute("/platform/church-locations")({
  ssr: false,
  component: () => <ChurchLocationManagerScreen />,
});
