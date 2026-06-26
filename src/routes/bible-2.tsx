import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy preview URL — canonical Bible home is `/bible`. */
export const Route = createFileRoute("/bible-2")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/bible", replace: true });
  },
  component: () => null,
});
