import type { ConnectionQualityLevel, ConnectionStatusState, ConnectionType } from "./types";
import {
  mapCapacitorConnectionType,
  readCapacitorNetworkStatus,
  subscribeCapacitorNetwork,
} from "./capacitor-bridge";

type NetworkInformation = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  type?: string;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

const QUALITY_LABELS: Record<ConnectionQualityLevel, string> = {
  excellent: "ممتاز",
  good: "جيد",
  fair: "مقبول",
  poor: "ضعيف",
  offline: "غير متصل",
};

const TYPE_LABELS: Record<ConnectionType, string> = {
  wifi: "Wi‑Fi",
  cellular: "بيانات الجوال",
  ethernet: "Ethernet",
  none: "بدون اتصال",
  unknown: "غير معروف",
};

function getNetworkInformation(): NetworkInformation | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function mapNavigatorConnectionType(raw: string | undefined, online: boolean): ConnectionType {
  if (!online) return "none";
  switch (raw) {
    case "wifi":
      return "wifi";
    case "cellular":
      return "cellular";
    case "ethernet":
      return "ethernet";
    case "none":
      return "none";
    default:
      return "unknown";
  }
}

function deriveQuality(input: {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}): ConnectionQualityLevel {
  if (!input.online) return "offline";

  const rtt = input.rtt ?? null;
  const downlink = input.downlink ?? null;
  const effectiveType = input.effectiveType ?? "";

  if (effectiveType === "slow-2g" || (rtt != null && rtt > 600)) return "poor";
  if (effectiveType === "2g" || (rtt != null && rtt > 350)) return "poor";
  if (effectiveType === "3g" || (rtt != null && rtt > 180) || (downlink != null && downlink < 1.5)) return "fair";
  if (effectiveType === "4g" && downlink != null && downlink >= 8 && (rtt == null || rtt <= 80)) return "excellent";
  if (effectiveType === "4g" || (downlink != null && downlink >= 4) || (rtt != null && rtt <= 120)) return "good";
  if (downlink != null && downlink >= 2) return "good";
  if (rtt != null && rtt <= 200) return "fair";
  return "fair";
}

function deriveSignalStrength(quality: ConnectionQualityLevel, downlink: number | null, rtt: number | null): number | null {
  if (quality === "offline") return 0;
  if (downlink != null) return Math.max(0, Math.min(100, Math.round((downlink / 10) * 100)));
  if (rtt != null) return Math.max(0, Math.min(100, Math.round(100 - rtt / 4)));
  switch (quality) {
    case "excellent":
      return 95;
    case "good":
      return 78;
    case "fair":
      return 55;
    case "poor":
      return 28;
    default:
      return null;
  }
}

function derivePacketLoss(quality: ConnectionQualityLevel, rtt: number | null): number | null {
  if (quality === "offline") return null;
  if (rtt == null) {
    switch (quality) {
      case "excellent":
        return 0;
      case "good":
        return 0.2;
      case "fair":
        return 0.8;
      case "poor":
        return 2;
      default:
        return null;
    }
  }
  return Math.max(0, Math.min(5, +(rtt / 120).toFixed(2)));
}

export async function readConnectionStatusState(): Promise<ConnectionStatusState> {
  if (typeof window === "undefined") {
    return {
      online: false,
      type: "none",
      quality: "offline",
      qualityLabel: QUALITY_LABELS.offline,
      typeLabel: TYPE_LABELS.none,
      rttMs: null,
      downlinkMbps: null,
      packetLossPercent: null,
      signalStrength: 0,
    };
  }

  const capacitor = await readCapacitorNetworkStatus();
  const online = capacitor ? capacitor.connected : navigator.onLine;
  const connection = getNetworkInformation();
  const type = capacitor
    ? mapCapacitorConnectionType(capacitor.connectionType)
    : mapNavigatorConnectionType(connection?.type, online);

  const rttMs = typeof connection?.rtt === "number" ? Math.round(connection.rtt) : null;
  const downlinkMbps = typeof connection?.downlink === "number" ? connection.downlink : null;
  const quality = deriveQuality({
    online,
    effectiveType: connection?.effectiveType,
    downlink: downlinkMbps ?? undefined,
    rtt: rttMs ?? undefined,
  });
  const signalStrength = deriveSignalStrength(quality, downlinkMbps, rttMs);

  return {
    online,
    type,
    quality,
    qualityLabel: QUALITY_LABELS[quality],
    typeLabel: TYPE_LABELS[type],
    rttMs,
    downlinkMbps,
    packetLossPercent: derivePacketLoss(quality, rttMs),
    signalStrength,
  };
}

export function bindConnectionListeners(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const connection = getNetworkInformation();
  const onOnline = () => onChange();
  const onOffline = () => onChange();
  const onConnectionChange = () => onChange();

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  connection?.addEventListener?.("change", onConnectionChange);
  const removeCapacitor = subscribeCapacitorNetwork(onConnectionChange);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    connection?.removeEventListener?.("change", onConnectionChange);
    removeCapacitor();
  };
}

export { QUALITY_LABELS, TYPE_LABELS };
