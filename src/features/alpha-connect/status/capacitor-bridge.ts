import type { ConnectionType } from "./types";

type CapacitorNetworkStatus = {
  connected: boolean;
  connectionType: string;
};

type CapacitorBatteryInfo = {
  level?: number;
  isCharging?: boolean;
};

function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.(),
  );
}

async function importCapacitorModule<T>(specifier: string): Promise<T | null> {
  if (!isCapacitorNative()) return null;
  try {
    const loader = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<T>;
    return await loader(specifier);
  } catch {
    return null;
  }
}

/** Optional Capacitor plugins — used when native shell is present. */
export async function readCapacitorNetworkStatus(): Promise<CapacitorNetworkStatus | null> {
  const mod = await importCapacitorModule<{ Network: { getStatus: () => Promise<CapacitorNetworkStatus> } }>(
    "@capacitor/network",
  );
  if (!mod) return null;
  try {
    return await mod.Network.getStatus();
  } catch {
    return null;
  }
}

export async function readCapacitorBatteryInfo(): Promise<CapacitorBatteryInfo | null> {
  const mod = await importCapacitorModule<{
    Device: { getBatteryInfo: () => Promise<{ batteryLevel?: number; isCharging?: boolean }> };
  }>("@capacitor/device");
  if (!mod) return null;
  try {
    const info = await mod.Device.getBatteryInfo();
    return {
      level: typeof info.batteryLevel === "number" ? info.batteryLevel : undefined,
      isCharging: info.isCharging,
    };
  } catch {
    return null;
  }
}

export function mapCapacitorConnectionType(raw: string): ConnectionType {
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

export function subscribeCapacitorNetwork(
  listener: (status: CapacitorNetworkStatus) => void,
): () => void {
  let disposed = false;
  let remove: (() => void) | undefined;

  void (async () => {
    const mod = await importCapacitorModule<{
      Network: {
        addListener: (
          event: "networkStatusChange",
          cb: (status: CapacitorNetworkStatus) => void,
        ) => Promise<{ remove: () => void }>;
      };
    }>("@capacitor/network");
    if (!mod || disposed) return;
    try {
      const handler = await mod.Network.addListener("networkStatusChange", listener);
      remove = () => handler.remove();
    } catch {
      // Web fallback only
    }
  })();

  return () => {
    disposed = true;
    remove?.();
  };
}
