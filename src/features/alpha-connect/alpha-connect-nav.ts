import type { AlphaConnectMode } from "@/components/alpha/alpha-connect-screen";

/** Bottom navigation tabs — isolated for future standalone app extraction. */
export type AlphaConnectNavTab = "alpha" | "channels" | "calls" | "messages" | "settings";

export type AlphaConnectContactRole = "priest" | "servant" | "admin";

/** URL deep-link tabs only — `alpha` is an exit action, not a routable screen tab. */
const URL_TABS = new Set<AlphaConnectNavTab>(["channels", "calls", "messages", "settings"]);

const CONTACT_ROLES = new Set<AlphaConnectContactRole>(["priest", "servant", "admin"]);

export function parseAlphaConnectContactRole(value: unknown): AlphaConnectContactRole | undefined {
  return typeof value === "string" && CONTACT_ROLES.has(value as AlphaConnectContactRole)
    ? (value as AlphaConnectContactRole)
    : undefined;
}

export function parseAlphaConnectNavTab(value: unknown): AlphaConnectNavTab | null {
  return typeof value === "string" && URL_TABS.has(value as AlphaConnectNavTab)
    ? (value as AlphaConnectNavTab)
    : null;
}

export function alphaConnectModeToNavTab(
  mode: AlphaConnectMode,
  settingsOpen = false,
): AlphaConnectNavTab {
  if (settingsOpen) return "settings";
  switch (mode) {
    case "groups":
      return "channels";
    case "messages":
      return "messages";
    case "individual":
    default:
      return "calls";
  }
}

export function alphaConnectNavTabToMode(tab: AlphaConnectNavTab): AlphaConnectMode | null {
  switch (tab) {
    case "channels":
      return "groups";
    case "calls":
      return "individual";
    case "messages":
      return "messages";
    default:
      return null;
  }
}

export type AlphaConnectNavHandlers = {
  exitToAlphaHome: () => void;
  openChannels: () => void;
  openCalls: () => void;
  openMessages: () => void;
  openSettings: () => void;
};

export type AlphaConnectRouteSearch = {
  chat?: string;
  tab?: AlphaConnectNavTab;
  channel?: string;
  name?: string;
  role?: AlphaConnectContactRole;
  phone?: string;
};

/** Router-safe empty search — all keys explicit for TanStack `validateSearch`. */
export function emptyAlphaConnectSearch(): AlphaConnectRouteSearch {
  return {
    chat: undefined,
    tab: undefined,
    channel: undefined,
    name: undefined,
    role: undefined,
    phone: undefined,
  };
}

export function buildAlphaConnectSearch(input: {
  tab?: AlphaConnectNavTab;
  chat?: string;
  channel?: string;
  name?: string;
  role?: AlphaConnectContactRole;
  phone?: string;
}): AlphaConnectRouteSearch {
  return {
    chat: input.chat,
    tab: input.tab && input.tab !== "alpha" ? input.tab : undefined,
    channel: input.channel,
    name: input.name,
    role: input.role,
    phone: input.phone,
  };
}

/** Deep-link into Alpha Connect messages tab — optional contact metadata for church leaders. */
export function buildAlphaConnectChatSearch(input: {
  contactId: string;
  name?: string;
  role?: AlphaConnectContactRole;
  phone?: string;
}): AlphaConnectRouteSearch {
  return buildAlphaConnectSearch({
    tab: "messages",
    chat: input.contactId,
    name: input.name,
    role: input.role,
    phone: input.phone,
  });
}

export function applyAlphaConnectNavTab(tab: AlphaConnectNavTab, handlers: AlphaConnectNavHandlers): void {
  switch (tab) {
    case "alpha":
      handlers.exitToAlphaHome();
      break;
    case "channels":
      handlers.openChannels();
      break;
    case "calls":
      handlers.openCalls();
      break;
    case "messages":
      handlers.openMessages();
      break;
    case "settings":
      handlers.openSettings();
      break;
  }
}
