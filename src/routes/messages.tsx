import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  buildAlphaConnectChatSearch,
  buildAlphaConnectSearch,
  parseAlphaConnectContactRole,
} from "@/features/alpha-connect/alpha-connect-nav";

/** Legacy /messages → Alpha Connect messages tab (temporary redirect). */
export const Route = createFileRoute("/messages")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    contactId: typeof search.contactId === "string" ? search.contactId : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
    role: parseAlphaConnectContactRole(search.role),
    phone: typeof search.phone === "string" ? search.phone : undefined,
    screen: search.screen === "settings" ? ("settings" as const) : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (search.contactId) {
      throw redirect({
        to: "/alpha-connect",
        search: buildAlphaConnectChatSearch({
          contactId: search.contactId,
          name: search.name,
          role: search.role,
          phone: search.phone,
        }),
      });
    }

    if (search.screen === "settings") {
      throw redirect({
        to: "/alpha-connect",
        search: buildAlphaConnectSearch({ tab: "settings" }),
      });
    }

    throw redirect({
      to: "/alpha-connect",
      search: buildAlphaConnectSearch({ tab: "messages" }),
    });
  },
  component: () => null,
});
