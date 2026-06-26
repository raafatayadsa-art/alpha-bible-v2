import { createFileRoute, Navigate } from "@tanstack/react-router";

/** Legacy route → unified edit screen (ALPHA-PROFILE-004). */
export const Route = createFileRoute("/profile/personal")({
  ssr: false,
  component: () => <Navigate to="/profile/edit" replace />,
});
