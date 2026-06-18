import type { DeviceBatteryState } from "./types";
import { readCapacitorBatteryInfo } from "./capacitor-bridge";

type BatteryManager = {
  level: number;
  charging: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

function formatBatteryLabel(level: number | null, charging: boolean | null): string {
  if (level == null) return "غير متاح";
  const pct = Math.round(level);
  if (charging) return `${pct}% · شحن`;
  return `${pct}%`;
}

export async function readDeviceBatteryState(): Promise<DeviceBatteryState> {
  if (typeof window === "undefined") {
    return { supported: false, level: null, charging: null, label: "غير متاح" };
  }

  const capacitor = await readCapacitorBatteryInfo();
  if (capacitor && typeof capacitor.level === "number") {
    const level = Math.round(capacitor.level * 100);
    const charging = capacitor.isCharging ?? null;
    return {
      supported: true,
      level,
      charging,
      label: formatBatteryLabel(level, charging),
    };
  }

  const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
  if (typeof nav.getBattery !== "function") {
    return { supported: false, level: null, charging: null, label: "غير متاح" };
  }

  try {
    const battery = await nav.getBattery();
    const level = Math.round(battery.level * 100);
    const charging = battery.charging;
    return {
      supported: true,
      level,
      charging,
      label: formatBatteryLabel(level, charging),
    };
  } catch {
    return { supported: false, level: null, charging: null, label: "غير متاح" };
  }
}

export async function bindDeviceBatteryListeners(onChange: () => void): Promise<() => void> {
  if (typeof window === "undefined") return () => {};

  const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
  if (typeof nav.getBattery !== "function") return () => {};

  try {
    const battery = await nav.getBattery();
    const onLevel = () => onChange();
    const onCharge = () => onChange();
    battery.addEventListener("levelchange", onLevel);
    battery.addEventListener("chargingchange", onCharge);
    return () => {
      battery.removeEventListener("levelchange", onLevel);
      battery.removeEventListener("chargingchange", onCharge);
    };
  } catch {
    return () => {};
  }
}
