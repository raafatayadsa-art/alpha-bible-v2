import type { AlphaConnectMode } from "@/components/alpha/alpha-connect-screen";

/** Bottom navigation tabs — isolated for future standalone app extraction. */
export type AlphaConnectNavTab = "alpha" | "channels" | "calls" | "messages" | "settings";

/** URL deep-link tabs only — `alpha` is an exit action, not a routable screen tab. */
const URL_TABS = new Set<AlphaConnectNavTab>(["channels", "calls", "messages", "settings"]);

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
};

/** Router-safe empty search — both keys explicit for TanStack `validateSearch`. */
export function emptyAlphaConnectSearch(): {
  chat: string | undefined;
  tab: AlphaConnectNavTab | undefined;
} {
  return { chat: undefined, tab: undefined };
}

export function buildAlphaConnectSearch(input: {
  tab?: AlphaConnectNavTab;
  chat?: string;
}): { chat: string | undefined; tab: AlphaConnectNavTab | undefined } {
  return {
    chat: input.chat,
    tab: input.tab && input.tab !== "alpha" ? input.tab : undefined,
  };
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
