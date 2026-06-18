import type { AlphaPresenceStatus } from "../presence";

export type DeviceBatteryState = {
  supported: boolean;
  level: number | null;
  charging: boolean | null;
  label: string;
};

export type ConnectionType = "wifi" | "cellular" | "ethernet" | "none" | "unknown";

export type ConnectionQualityLevel = "excellent" | "good" | "fair" | "poor" | "offline";

export type ConnectionStatusState = {
  online: boolean;
  type: ConnectionType;
  quality: ConnectionQualityLevel;
  qualityLabel: string;
  typeLabel: string;
  rttMs: number | null;
  downlinkMbps: number | null;
  packetLossPercent: number | null;
  signalStrength: number | null;
};

export type SecurityEncryptionState = "encrypted" | "warning" | "offline";

export type SecurityStatusState = {
  state: SecurityEncryptionState;
  label: string;
  https: boolean;
  supabaseAvailable: boolean;
  sessionValid: boolean;
  authenticated: boolean;
};

export type PresenceStatusState = {
  status: AlphaPresenceStatus;
  label: string;
  online: boolean;
};

export type AlphaConnectStatusSnapshot = {
  device: DeviceBatteryState;
  connection: ConnectionStatusState;
  security: SecurityStatusState;
  presence: PresenceStatusState;
  version: number;
};
