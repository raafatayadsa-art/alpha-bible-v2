import { createFileRoute, redirect } from "@tanstack/react-router";
import { buildAlphaConnectSearch } from "@/features/alpha-connect/alpha-connect-nav";

/** Legacy /profile/messages → Alpha Connect messages tab (temporary redirect). */
export const Route = createFileRoute("/profile/messages")({
  ssr: false,
  head: () => ({ meta: [{ title: "Alpha Connect — الرسائل" }] }),
  beforeLoad: () => {
    throw redirect({
      to: "/alpha-connect",
      search: buildAlphaConnectSearch({ tab: "messages" }),
    });
  },
  component: () => null,
});
