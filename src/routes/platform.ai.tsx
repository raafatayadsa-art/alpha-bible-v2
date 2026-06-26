import { createFileRoute } from "@tanstack/react-router";
import { AIControlScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/ai")({
  ssr: false,
  component: () => <AIControlScreen />,
});
