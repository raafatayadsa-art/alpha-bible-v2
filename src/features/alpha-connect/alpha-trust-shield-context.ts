import { useCallback, useSyncExternalStore } from "react";
import type { AlphaConnectMessagesTab, AlphaConnectMode } from "@/components/alpha/alpha-connect-screen";

export type AlphaTrustShieldContextType =
  | "channel"
  | "user"
  | "conversation"
  | "messages"
  | "voice_messages"
  | "call"
  | "church"
  | "service"
  | "group"
  | "settings"
  | "unknown";

export type AlphaTrustShieldContext = {
  type: AlphaTrustShieldContextType;
  channelId?: string;
  userId?: string;
  conversationId?: string;
  churchId?: string;
  serviceId?: string;
};

const listeners = new Set<() => void>();
let globalContext: AlphaTrustShieldContext | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAlphaTrustShieldContext(context: AlphaTrustShieldContext | null) {
  globalContext = context;
  emit();
}

export function getAlphaTrustShieldContext(): AlphaTrustShieldContext | null {
  return globalContext;
}

export function useAlphaTrustShieldContext(): AlphaTrustShieldContext | null {
  return useSyncExternalStore(subscribe, getAlphaTrustShieldContext, () => null);
}

export function resolveAlphaConnectTrustContext(input: {
  mode: AlphaConnectMode;
  messagesTab: AlphaConnectMessagesTab;
  settingsOpen: boolean;
  channelSettingsOpen: boolean;
  channelId: string;
}): AlphaTrustShieldContext {
  if (input.settingsOpen) {
    return { type: "settings" };
  }

  if (input.channelSettingsOpen || input.mode === "groups") {
    return { type: "channel", channelId: input.channelId };
  }

  if (input.mode === "messages") {
    if (input.messagesTab === "voice") {
      return { type: "voice_messages" };
    }
    return { type: "messages" };
  }

  if (input.mode === "individual") {
    return { type: "call" };
  }

  return { type: "unknown" };
}

export function resolveActiveTrustShieldContext(
  alphaConnect: {
    mode: AlphaConnectMode;
    messagesTab: AlphaConnectMessagesTab;
    settingsOpen: boolean;
    channelSettingsOpen: boolean;
    channelId: string;
  },
): AlphaTrustShieldContext {
  const routeOverride = getAlphaTrustShieldContext();
  if (routeOverride && routeOverride.type !== "unknown") {
    return routeOverride;
  }
  return resolveAlphaConnectTrustContext(alphaConnect);
}

export function useSetAlphaTrustShieldContext() {
  return useCallback((context: AlphaTrustShieldContext | null) => {
    setAlphaTrustShieldContext(context);
  }, []);
}
