import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlphaScreenFrame } from "@/components/alpha/AlphaScreenFrame";
import { AlphaChatScreen } from "./AlphaChatScreen";
import { AlphaConversationsScreen } from "./AlphaConversationsScreen";
import { AlphaMessageSettings } from "./AlphaMessageSettings";
import { conversationFromContact, type Conversation } from "./messaging-data";

type Screen = "list" | "chat" | "settings";

export type AlphaMessagingInitialContact = {
  id: string;
  name: string;
  role: "priest" | "servant" | "admin";
  phone?: string;
};

function chatRoleParam(role: Conversation["role"]): "priest" | "servant" | "admin" {
  if (role === "priest") return "priest";
  if (role === "servant") return "servant";
  return "admin";
}

export function navigateToAlphaChat(
  navigate: ReturnType<typeof useNavigate>,
  profile: Conversation,
  options?: { from?: string },
) {
  void navigate({
    to: "/messages/chat/$contactId",
    params: { contactId: profile.id },
    search: {
      name: profile.name,
      role: chatRoleParam(profile.role),
      phone: profile.phone,
      from: options?.from,
    },
  });
}

/**
 * `embedded` — renders without AlphaScreenFrame (for use inside Alpha Connect overlay).
 * `onClose`  — called instead of navigate() when user exits the messaging system.
 */
export function AlphaMessagingSystem({
  initialContact,
  returnTo,
  embedded = false,
  onClose,
  initialScreen,
}: {
  initialContact?: AlphaMessagingInitialContact;
  returnTo?: string;
  embedded?: boolean;
  onClose?: () => void;
  initialScreen?: "settings";
}) {
  const navigate = useNavigate();
  const openedDirectRef = useRef(Boolean(initialContact));
  const directProfile = useMemo(
    () => (initialContact ? conversationFromContact(initialContact) : undefined),
    [initialContact],
  );
  const [screen, setScreen] = useState<Screen>(
    initialScreen ?? (embedded && directProfile ? "chat" : "list"),
  );
  const [activeProfile, setActiveProfile] = useState(directProfile);

  useEffect(() => {
    if (embedded || !directProfile) return;
    navigateToAlphaChat(navigate, directProfile, { from: returnTo });
  }, [embedded, directProfile, navigate, returnTo]);

  const exitToOrigin = () => {
    if (onClose) {
      onClose();
      return;
    }
    if (returnTo) {
      void navigate({ to: returnTo as "/" });
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    void navigate({ to: "/" });
  };

  const wrap = (children: ReactNode) =>
    embedded ? (
      <div className="flex h-full flex-col overflow-hidden">{children}</div>
    ) : (
      <AlphaScreenFrame mode="fixed" showShellBackground={false} viewportBackdrop="messaging">
        {children}
      </AlphaScreenFrame>
    );

  if (screen === "settings") {
    return wrap(<AlphaMessageSettings onBack={() => setScreen("list")} />);
  }

  if (screen === "chat" && embedded) {
    return wrap(
      <AlphaChatScreen
        key={activeProfile?.id ?? "chat"}
        profile={activeProfile}
        returnTo={returnTo ?? "/messages"}
        onBack={() => {
          if (returnTo && openedDirectRef.current) {
            exitToOrigin();
            return;
          }
          setActiveProfile(undefined);
          setScreen("list");
        }}
      />,
    );
  }

  return wrap(
    <AlphaConversationsScreen
      returnTo={embedded ? undefined : returnTo}
      onBack={embedded ? exitToOrigin : undefined}
      onOpenChat={(profile) => {
        if (!embedded) {
          navigateToAlphaChat(navigate, profile, { from: returnTo });
          return;
        }
        openedDirectRef.current = false;
        setActiveProfile(profile);
        setScreen("chat");
      }}
      onOpenSettings={() => setScreen("settings")}
    />,
  );
}
