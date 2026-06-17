import { useCallback, useSyncExternalStore } from "react";

const ALPHA_CONNECT_SCREEN_KEY = "ab.alpha-connect.screen.v1";

export type AlphaConnectMode = "individual" | "messages" | "groups";
export type AlphaConnectMessagesTab = "voice" | "conversations";

export type AlphaConnectScreenState = {
  mode: AlphaConnectMode;
  messagesTab: AlphaConnectMessagesTab;
};

const DEFAULT_ALPHA_CONNECT_SCREEN: AlphaConnectScreenState = {
  mode: "individual",
  messagesTab: "voice",
};

const VALID_MODES = new Set<AlphaConnectMode>(["individual", "messages", "groups"]);
const VALID_MESSAGES_TABS = new Set<AlphaConnectMessagesTab>(["voice", "conversations"]);

const screenListeners = new Set<() => void>();

function emitScreenChange() {
  screenListeners.forEach((listener) => listener());
}

function subscribeScreen(listener: () => void) {
  screenListeners.add(listener);
  return () => screenListeners.delete(listener);
}

function normalizeScreenState(raw: unknown): AlphaConnectScreenState {
  if (!raw || typeof raw !== "object") return DEFAULT_ALPHA_CONNECT_SCREEN;
  const value = raw as Partial<AlphaConnectScreenState>;
  return {
    mode: value.mode && VALID_MODES.has(value.mode) ? value.mode : DEFAULT_ALPHA_CONNECT_SCREEN.mode,
    messagesTab:
      value.messagesTab && VALID_MESSAGES_TABS.has(value.messagesTab)
        ? value.messagesTab
        : DEFAULT_ALPHA_CONNECT_SCREEN.messagesTab,
  };
}

let memoryScreen: AlphaConnectScreenState | null = null;

function readScreenFromStorage(): AlphaConnectScreenState {
  if (typeof window === "undefined") return DEFAULT_ALPHA_CONNECT_SCREEN;
  try {
    const raw = localStorage.getItem(ALPHA_CONNECT_SCREEN_KEY);
    if (!raw) return DEFAULT_ALPHA_CONNECT_SCREEN;
    return normalizeScreenState(JSON.parse(raw));
  } catch {
    return DEFAULT_ALPHA_CONNECT_SCREEN;
  }
}

function getScreenSnapshot(): AlphaConnectScreenState {
  if (typeof window === "undefined") return DEFAULT_ALPHA_CONNECT_SCREEN;
  if (!memoryScreen) memoryScreen = readScreenFromStorage();
  return memoryScreen;
}

function getServerScreenSnapshot(): AlphaConnectScreenState {
  return DEFAULT_ALPHA_CONNECT_SCREEN;
}

export function loadAlphaConnectScreen(): AlphaConnectScreenState {
  return getScreenSnapshot();
}

export function saveAlphaConnectScreen(state: AlphaConnectScreenState) {
  if (typeof window === "undefined") return;
  memoryScreen = normalizeScreenState(state);
  localStorage.setItem(ALPHA_CONNECT_SCREEN_KEY, JSON.stringify(memoryScreen));
  emitScreenChange();
}

export function useAlphaConnectScreen() {
  const screen = useSyncExternalStore(subscribeScreen, getScreenSnapshot, getServerScreenSnapshot);

  const setMode = useCallback((mode: AlphaConnectMode) => {
    saveAlphaConnectScreen({ ...getScreenSnapshot(), mode });
  }, []);

  const setMessagesTab = useCallback((messagesTab: AlphaConnectMessagesTab) => {
    saveAlphaConnectScreen({ ...getScreenSnapshot(), messagesTab });
  }, []);

  return {
    mode: screen.mode,
    messagesTab: screen.messagesTab,
    setMode,
    setMessagesTab,
  };
}
