import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$book")({
  ssr: false,
  component: () => <Outlet />,
});
