import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy Lovable preview — canonical Bible home is `/bible`. */
export const Route = createFileRoute("/bible-lovable")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/bible", replace: true });
  },
  component: () => null,
});
