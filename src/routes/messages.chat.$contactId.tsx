import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  buildAlphaConnectChatSearch,
  parseAlphaConnectContactRole,
} from "@/features/alpha-connect/alpha-connect-nav";

/** Legacy /messages/chat/$contactId → Alpha Connect conversation (temporary redirect). */
export const Route = createFileRoute("/messages/chat/$contactId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : undefined,
    role: parseAlphaConnectContactRole(search.role),
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: "/alpha-connect",
      search: buildAlphaConnectChatSearch({
        contactId: params.contactId,
        name: search.name,
        role: search.role,
        phone: search.phone,
      }),
    });
  },
  component: () => null,
});
