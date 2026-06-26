import { createFileRoute } from "@tanstack/react-router";
import { OwnerSecurityScreen } from "@/features/platform-admin";

export const Route = createFileRoute("/platform/owner-security")({
  ssr: false,
  component: () => <OwnerSecurityScreen />,
});
