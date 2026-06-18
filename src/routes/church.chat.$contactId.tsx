import { createFileRoute, redirect } from "@tanstack/react-router";
import { getChurchContact } from "@/data/church-contacts";
import { fetchChurchRoleById } from "@/features/church/church-dashboard-api";

export const Route = createFileRoute("/church/chat/$contactId")({
  ssr: false,
  beforeLoad: async ({ params }) => {
    const local = getChurchContact(params.contactId);
    const remote = local ? null : await fetchChurchRoleById(params.contactId);
    const contact = local ?? remote;

    throw redirect({
      to: "/messages/chat/$contactId",
      params: { contactId: params.contactId },
      search: contact
        ? {
            name: contact.name,
            role: contact.roleType,
            phone: contact.phone,
            from: "/church",
          }
        : { from: "/church" },
    });
  },
  component: () => null,
});
