import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy route — merged into /publisher/preview/$publisherId */
export const Route = createFileRoute("/audiov2/preview/$publisherId")({
  ssr: false,
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/publisher/preview/$publisherId",
      params: { publisherId: params.publisherId },
    });
  },
});
