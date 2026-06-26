import { createFileRoute } from "@tanstack/react-router";
import { ReportedContentScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/reports")({
  ssr: false,
  component: () => <ReportedContentScreen />,
});
