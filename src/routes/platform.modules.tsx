import { createFileRoute } from "@tanstack/react-router";
import { ModuleControlScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/modules")({
  ssr: false,
  component: () => <ModuleControlScreen />,
});
