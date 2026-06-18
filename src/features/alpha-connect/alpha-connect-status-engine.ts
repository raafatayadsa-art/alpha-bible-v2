import {
  getPresenceStatus,
  getPresenceStoreVersion,
  getViewerUserId,
  initPresenceStore,
  PRESENCE_LABELS,
  presenceCountsAsOnline,
  subscribePresence,
  type AlphaPresenceStatus,
} from "./presence";
import { bindDeviceBatteryListeners, readDeviceBatteryState } from "./status/device-battery";
import { bindConnectionListeners, readConnectionStatusState } from "./status/network-connection";
import { bindSecurityListeners, readSecurityStatusState } from "./status/security-check";
import type {
  AlphaConnectStatusSnapshot,
  ConnectionStatusState,
  DeviceBatteryState,
  PresenceStatusState,
  SecurityStatusState,
} from "./status/types";

const DEFAULT_DEVICE: DeviceBatteryState = {
  supported: false,
  level: null,
  charging: null,
  label: "…",
};

const DEFAULT_CONNECTION: ConnectionStatusState = {
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  type: "unknown",
  quality: "fair",
  qualityLabel: "…",
  typeLabel: "…",
  rttMs: null,
  downlinkMbps: null,
  packetLossPercent: null,
  signalStrength: null,
};

const DEFAULT_SECURITY: SecurityStatusState = {
  state: "warning",
  label: "…",
  https: false,
  supabaseAvailable: false,
  sessionValid: false,
  authenticated: false,
};

const DEFAULT_PRESENCE: PresenceStatusState = {
  status: "available",
  label: PRESENCE_LABELS.available,
  online: true,
};

let snapshot: AlphaConnectStatusSnapshot = {
  device: DEFAULT_DEVICE,
  connection: DEFAULT_CONNECTION,
  security: DEFAULT_SECURITY,
  presence: DEFAULT_PRESENCE,
  version: 0,
};

const listeners = new Set<() => void>();
let initialized = false;
let refreshPromise: Promise<void> | null = null;
let batteryTimer: number | null = null;
let connectionTimer: number | null = null;
let securityTimer: number | null = null;
let teardown: (() => void) | null = null;

function buildPresenceState(): PresenceStatusState {
  initPresenceStore();
  const status = getPresenceStatus(getViewerUserId());
  return {
    status,
    label: PRESENCE_LABELS[status],
    online: presenceCountsAsOnline(status),
  };
}

function emitSnapshot() {
  snapshot = {
    ...snapshot,
    presence: buildPresenceState(),
    version: snapshot.version + 1,
  };
  listeners.forEach((listener) => listener());
}

async function refreshDevice() {
  const device = await readDeviceBatteryState();
  snapshot = { ...snapshot, device, version: snapshot.version + 1 };
  listeners.forEach((listener) => listener());
}

async function refreshConnection() {
  const connection = await readConnectionStatusState();
  snapshot = { ...snapshot, connection, version: snapshot.version + 1 };
  listeners.forEach((listener) => listener());
}

async function refreshSecurity() {
  const connection = snapshot.connection;
  const security = await readSecurityStatusState(connection.online);
  snapshot = { ...snapshot, security, version: snapshot.version + 1 };
  listeners.forEach((listener) => listener());
}

async function refreshAll() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const [device, connection] = await Promise.all([
      readDeviceBatteryState(),
      readConnectionStatusState(),
    ]);
    const security = await readSecurityStatusState(connection.online);
    const presence = buildPresenceState();
    snapshot = {
      device,
      connection,
      security,
      presence,
      version: snapshot.version + 1,
    };
    listeners.forEach((listener) => listener());
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function onPresenceChange() {
  void getPresenceStoreVersion();
  emitSnapshot();
}

export function initAlphaConnectStatusEngine() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  initPresenceStore();

  const unbindBattery = bindDeviceBatteryListeners(() => {
    void refreshDevice();
  });
  const unbindConnection = bindConnectionListeners(() => {
    void refreshConnection().then(() => refreshSecurity());
  });
  const unbindSecurity = bindSecurityListeners(() => {
    void refreshSecurity();
  });
  const unbindPresence = subscribePresence(onPresenceChange);

  batteryTimer = window.setInterval(() => void refreshDevice(), 60_000);
  connectionTimer = window.setInterval(() => {
    void refreshConnection().then(() => refreshSecurity());
  }, 30_000);
  securityTimer = window.setInterval(() => void refreshSecurity(), 45_000);

  teardown = () => {
    unbindBattery.then((dispose) => dispose());
    unbindConnection();
    unbindSecurity();
    unbindPresence();
    if (batteryTimer != null) window.clearInterval(batteryTimer);
    if (connectionTimer != null) window.clearInterval(connectionTimer);
    if (securityTimer != null) window.clearInterval(securityTimer);
    initialized = false;
  };

  void refreshAll();
}

export function getAlphaConnectStatusSnapshot(): AlphaConnectStatusSnapshot {
  return snapshot;
}

export function getAlphaConnectStatusVersion(): number {
  return snapshot.version;
}

export function subscribeAlphaConnectStatus(listener: () => void): () => void {
  initAlphaConnectStatusEngine();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function presencePresenceSubtitle(status: AlphaPresenceStatus): string {
  switch (status) {
    case "busy":
      return "مشغول حالياً";
    case "hidden":
      return "غير متصل";
    default:
      return "جاهز للاستماع والتحدث";
  }
}

export function connectionQualityTone(quality: ConnectionStatusState["quality"]): string {
  switch (quality) {
    case "excellent":
    case "good":
      return "text-neon-green";
    case "fair":
      return "text-[#F59E0B]";
    case "poor":
    case "offline":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

export function securityStateTone(state: SecurityStatusState["state"]): string {
  switch (state) {
    case "encrypted":
      return "text-neon-green";
    case "warning":
      return "text-[#F59E0B]";
    case "offline":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

export function batteryLevelTone(level: number | null): string {
  if (level == null) return "text-muted-foreground";
  if (level <= 15) return "text-destructive";
  if (level <= 35) return "text-[#F59E0B]";
  return "text-neon-green";
}
