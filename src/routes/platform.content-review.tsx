import { createFileRoute } from "@tanstack/react-router";
import { ContentReviewCenterScreen } from "@/features/platform-admin/ContentReviewCenterScreen";

export const Route = createFileRoute("/platform/content-review")({
  ssr: false,
  component: () => <ContentReviewCenterScreen />,
});
