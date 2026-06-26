import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/analytics")({
  ssr: false,
  component: () => <AnalyticsScreen />,
});
