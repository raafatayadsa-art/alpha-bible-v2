import { createFileRoute, Navigate } from "@tanstack/react-router";

/** Security settings live inside Alpha Control Center. */
export const Route = createFileRoute("/profile/security")({
  ssr: false,
  component: () => <Navigate to="/settings" replace />,
});
