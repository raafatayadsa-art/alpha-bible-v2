import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlphaScreenFrame } from "@/components/alpha/AlphaScreenFrame";
import { AlphaChatScreen } from "@/components/alpha/AlphaChatScreen";
import {
  CONVERSATION_CONTACTS,
  conversationFromContact,
  mergeConversationWithDb,
} from "@/components/alpha/messaging-data";
import { useAlphaPresenceBootstrap, usePresenceStoreVersion } from "@/features/alpha-connect/useAlphaPresence";
import { useAlphaConnectConversationList } from "@/features/alpha-connect/useAlphaConnectConversationList";

export const Route = createFileRoute("/messages/chat/$contactId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : undefined,
    role:
      search.role === "priest" || search.role === "servant" || search.role === "admin"
        ? search.role
        : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  component: MessagesChatPage,
});

function MessagesChatPage() {
  useAlphaPresenceBootstrap();
  usePresenceStoreVersion();
  const { contactId } = Route.useParams();
  const { name, role, phone, from } = Route.useSearch();
  const navigate = useNavigate();
  const { conversations: dbConversations } = useAlphaConnectConversationList();

  const profile = useMemo(() => {
    const fromDb = dbConversations.find((c) => c.id === contactId);
    if (fromDb) return fromDb;

    const contact = CONVERSATION_CONTACTS.find((c) => c.id === contactId);
    if (contact) return mergeConversationWithDb(contact, undefined);

    if (name) {
      return conversationFromContact({
        id: contactId,
        name,
        role: role ?? "priest",
        phone,
      });
    }

    return undefined;
  }, [contactId, dbConversations, name, phone, role]);

  const returnTo = from ?? "/messages";

  if (!profile) {
    return (
      <AlphaScreenFrame mode="fixed" showShellBackground={false} viewportBackdrop="messaging">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-[14px] font-bold text-[#1F2937]">لم يتم العثور على المحادثة</p>
          <button
            type="button"
            onClick={() => void navigate({ to: "/messages" })}
            className="mt-4 text-[13px] font-semibold text-[#7c5cbf]"
          >
            العودة إلى الرسائل
          </button>
        </div>
      </AlphaScreenFrame>
    );
  }

  return (
    <AlphaScreenFrame mode="fixed" showShellBackground={false} viewportBackdrop="messaging">
      <AlphaChatScreen
        key={profile.id}
        profile={profile}
        returnTo={returnTo}
        onBack={() => {
          if (from) {
            void navigate({ to: from as "/" });
            return;
          }
          void navigate({ to: "/messages" });
        }}
      />
    </AlphaScreenFrame>
  );
}
