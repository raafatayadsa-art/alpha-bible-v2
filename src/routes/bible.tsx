import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/bible")({
  ssr: false,
  component: () => <Outlet />,
});
