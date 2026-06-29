import { createFileRoute, redirect } from "@tanstack/react-router";
import { COMMUNITY_HUB_PATH } from "@/features/community/community-routes";

/** Legacy «مجتمعي» URL — canonical hub is `/community`. */
export const Route = createFileRoute("/my-community")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: COMMUNITY_HUB_PATH, replace: true });
  },
  component: () => null,
});
