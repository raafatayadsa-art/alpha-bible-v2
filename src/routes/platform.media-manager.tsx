import { createFileRoute } from "@tanstack/react-router";
import { MediaManagerScreen } from "@/features/platform-admin/MediaManagerScreen";

export const Route = createFileRoute("/platform/media-manager")({
  ssr: false,
  component: () => <MediaManagerScreen />,
});
