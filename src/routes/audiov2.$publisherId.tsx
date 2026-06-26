import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy route — merged into /publisher/$publisherId */
export const Route = createFileRoute("/audiov2/$publisherId")({
  ssr: false,
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/publisher/$publisherId",
      params: { publisherId: params.publisherId },
    });
  },
});
