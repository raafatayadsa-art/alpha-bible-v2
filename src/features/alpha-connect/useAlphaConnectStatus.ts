import { useSyncExternalStore } from "react";
import {
  getAlphaConnectStatusSnapshot,
  getAlphaConnectStatusVersion,
  initAlphaConnectStatusEngine,
  subscribeAlphaConnectStatus,
} from "./alpha-connect-status-engine";

function useStatusVersion() {
  return useSyncExternalStore(
    subscribeAlphaConnectStatus,
    () => getAlphaConnectStatusVersion(),
    () => 0,
  );
}

export function useDeviceStatus() {
  useStatusVersion();
  initAlphaConnectStatusEngine();
  return getAlphaConnectStatusSnapshot().device;
}

export function useConnectionStatus() {
  useStatusVersion();
  initAlphaConnectStatusEngine();
  return getAlphaConnectStatusSnapshot().connection;
}

export function useSecurityStatus() {
  useStatusVersion();
  initAlphaConnectStatusEngine();
  return getAlphaConnectStatusSnapshot().security;
}

export function useAlphaConnectPresenceStatus() {
  useStatusVersion();
  initAlphaConnectStatusEngine();
  return getAlphaConnectStatusSnapshot().presence;
}

export function useAlphaConnectStatus() {
  useStatusVersion();
  initAlphaConnectStatusEngine();
  return getAlphaConnectStatusSnapshot();
}
