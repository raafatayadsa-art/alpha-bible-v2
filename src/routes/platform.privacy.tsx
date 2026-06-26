import { createFileRoute } from "@tanstack/react-router";
import { PrivacySecurityScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/privacy")({
  ssr: false,
  component: () => <PrivacySecurityScreen />,
});
