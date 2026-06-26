import { createFileRoute } from "@tanstack/react-router";
import { PublisherCenterScreen } from "@/features/platform-admin/PublisherCenterScreen";

export const Route = createFileRoute("/platform/publisher-center")({
  ssr: false,
  component: () => <PublisherCenterScreen />,
});
