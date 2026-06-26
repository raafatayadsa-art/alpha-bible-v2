import { createFileRoute } from "@tanstack/react-router";
import { AlphaLibraryScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/library")({
  ssr: false,
  component: () => <AlphaLibraryScreen />,
});
