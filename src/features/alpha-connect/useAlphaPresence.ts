import { useCallback, useSyncExternalStore } from "react";
import {
  cycleMyPresenceStatus,
  getPresenceStatus,
  getPresenceStoreVersion,
  getViewerUserId,
  initPresenceStore,
  resolvePresenceDotForUser,
  setMyPresenceStatus,
  subscribePresence,
  type AlphaPresenceStatus,
} from "./presence";

function usePresenceVersion() {
  return useSyncExternalStore(
    subscribePresence,
    () => getPresenceStoreVersion(),
    () => 0,
  );
}

export function useAlphaPresenceBootstrap() {
  useSyncExternalStore(
    () => () => {},
    () => {
      initPresenceStore();
      return true;
    },
    () => false,
  );
}

export function useMyPresenceStatus(): AlphaPresenceStatus {
  usePresenceVersion();
  initPresenceStore();
  return getPresenceStatus(getViewerUserId());
}

export function useUserPresenceStatus(userId: string): AlphaPresenceStatus {
  usePresenceVersion();
  initPresenceStore();
  return getPresenceStatus(userId);
}

export function usePresenceDot(userId: string): AlphaPresenceStatus | null {
  usePresenceVersion();
  initPresenceStore();
  return resolvePresenceDotForUser(userId);
}

export function usePresenceActions() {
  return {
    setMyPresenceStatus: useCallback((status: AlphaPresenceStatus) => setMyPresenceStatus(status), []),
    cycleMyPresenceStatus: useCallback(() => cycleMyPresenceStatus(), []),
  };
}

export function usePresenceStoreVersion(): number {
  return usePresenceVersion();
}
