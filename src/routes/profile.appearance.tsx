import { createFileRoute, Navigate } from "@tanstack/react-router";

/** Appearance settings live inside Alpha Control Center. */
export const Route = createFileRoute("/profile/appearance")({
  ssr: false,
  component: () => <Navigate to="/settings" replace />,
});
