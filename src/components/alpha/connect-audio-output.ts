import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bluetooth,
  Ear,
  Headphones,
  Volume2,
  Watch,
  type LucideIcon,
} from "lucide-react";
import type { AudioOutput } from "./AlphaConnectSettings";

/** Legacy route bucket — maps to OS output family. */
export type ConnectAudioRoute = AudioOutput;

export type ConnectAudioDeviceKind =
  | "earpiece"
  | "speaker"
  | "bluetooth"
  | "watch"
  | "wired"
  | "external";

export type ConnectAudioOutputDevice = {
  id: string;
  label: string;
  kind: ConnectAudioDeviceKind;
  route: ConnectAudioRoute;
  nativeDeviceId?: string;
};

export type ConnectAudioSelection = ConnectAudioOutputDevice;

const BLUETOOTH_LABEL_RE =
  /bluetooth|airpods?|buds|headset|headphone|hands.?free|سماعات|بلوتوث/i;
const WATCH_LABEL_RE = /watch|ساعة|apple watch/i;
const WIRED_LABEL_RE = /wired|usb|aux|lightning|type-?c|سلك/i;
const EARPIECE_LABEL_RE = /earpiece|receiver|built-?in|internal|phone|مكالمات/i;
const SPEAKER_LABEL_RE = /speaker|loud|external|outside|خارجية/i;
const EXTERNAL_LABEL_RE = /hdmi|display|tv|screen|monitor|television/i;

const BUILTIN_EARPIECE: ConnectAudioOutputDevice = {
  id: "builtin:earpiece",
  label: "سماعة الهاتف",
  kind: "earpiece",
  route: "earpiece",
};

const BUILTIN_SPEAKER: ConnectAudioOutputDevice = {
  id: "builtin:speaker",
  label: "السماعة الخارجية",
  kind: "speaker",
  route: "speaker",
};

function classifyDeviceLabel(label: string): ConnectAudioDeviceKind {
  const value = label.toLowerCase();
  if (WATCH_LABEL_RE.test(value)) return "watch";
  if (BLUETOOTH_LABEL_RE.test(value)) return "bluetooth";
  if (WIRED_LABEL_RE.test(value)) return "wired";
  if (EARPIECE_LABEL_RE.test(value)) return "earpiece";
  if (SPEAKER_LABEL_RE.test(value)) return "speaker";
  if (EXTERNAL_LABEL_RE.test(value)) return "external";
  return "bluetooth";
}

function routeForKind(kind: ConnectAudioDeviceKind): ConnectAudioRoute {
  if (kind === "speaker" || kind === "external") return "speaker";
  if (kind === "earpiece") return "earpiece";
  return "bluetooth";
}

function fallbackLabel(kind: ConnectAudioDeviceKind, index: number): string {
  switch (kind) {
    case "watch":
      return "Apple Watch";
    case "bluetooth":
      return index > 0 ? `Bluetooth ${index + 1}` : "Bluetooth";
    case "wired":
      return "سماعة سلكية";
    case "external":
      return "جهاز خارجي";
    case "speaker":
      return "السماعة الخارجية";
    default:
      return "سماعة الهاتف";
  }
}

async function ensureAudioDeviceLabels(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
  } catch {
    /* labels may stay hidden until permission — still show built-ins */
  }
}

export async function listConnectAudioOutputDevices(): Promise<ConnectAudioOutputDevice[]> {
  const devices: ConnectAudioOutputDevice[] = [BUILTIN_EARPIECE, BUILTIN_SPEAKER];

  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return devices;
  }

  await ensureAudioDeviceLabels();

  try {
    const enumerated = await navigator.mediaDevices.enumerateDevices();
    const outputs = enumerated.filter((device) => device.kind === "audiooutput");
    const seen = new Set<string>();
    let anonymousBt = 0;

    for (const device of outputs) {
      if (!device.deviceId || device.deviceId === "default" || device.deviceId === "communications") {
        continue;
      }
      const dedupeKey = device.groupId || device.deviceId;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const kind = device.label.trim()
        ? classifyDeviceLabel(device.label)
        : "bluetooth";
      const label = device.label.trim() || fallbackLabel(kind, anonymousBt);

      if (!device.label.trim() && kind === "bluetooth") {
        anonymousBt += 1;
      }

      // Skip duplicates of built-in speaker/earpiece labels
      if (/built-?in|internal receiver/i.test(device.label) && kind === "earpiece") continue;
      if (/built-?in.*speaker|phone speaker/i.test(device.label) && kind === "speaker") continue;

      devices.push({
        id: `device:${device.deviceId}`,
        label,
        kind,
        route: routeForKind(kind),
        nativeDeviceId: device.deviceId,
      });
    }
  } catch {
    return devices;
  }

  return devices;
}

export async function applyConnectAudioSink(
  element: HTMLMediaElement | null | undefined,
  selection: ConnectAudioSelection,
): Promise<boolean> {
  if (!element || !selection.nativeDeviceId) return false;
  const sinkCapable = element as HTMLMediaElement & {
    setSinkId?: (id: string) => Promise<void>;
  };
  if (typeof sinkCapable.setSinkId !== "function") return false;
  try {
    await sinkCapable.setSinkId(selection.nativeDeviceId);
    return true;
  } catch {
    return false;
  }
}

export function useConnectAudioOutput(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [devices, setDevices] = useState<ConnectAudioOutputDevice[]>([BUILTIN_EARPIECE, BUILTIN_SPEAKER]);
  const [selection, setSelection] = useState<ConnectAudioSelection>(BUILTIN_EARPIECE);
  const [pickerOpen, setPickerOpen] = useState(false);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  const refreshDevices = useCallback(async () => {
    if (!enabled) return [BUILTIN_EARPIECE, BUILTIN_SPEAKER];
    const next = await listConnectAudioOutputDevices();
    setDevices(next);
    setSelection((current) => next.find((device) => device.id === current.id) ?? next[0] ?? BUILTIN_EARPIECE);
    return next;
  }, [enabled]);

  const selectDevice = useCallback(
    async (deviceId: string) => {
      const picked = devices.find((device) => device.id === deviceId);
      if (!picked) return;
      setSelection(picked);
      setPickerOpen(false);
      if (playbackRef.current) {
        await applyConnectAudioSink(playbackRef.current, picked);
      }
    },
    [devices],
  );

  const openPicker = useCallback(async () => {
    await refreshDevices();
    setPickerOpen(true);
  }, [refreshDevices]);

  const registerPlaybackElement = useCallback((element: HTMLAudioElement | null) => {
    playbackRef.current = element;
    if (element && selection.nativeDeviceId) {
      void applyConnectAudioSink(element, selection);
    }
  }, [selection]);

  useEffect(() => {
    if (!enabled) return;
    void refreshDevices();
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.addEventListener) return;
    const onDeviceChange = () => {
      void refreshDevices();
    };
    mediaDevices.addEventListener("devicechange", onDeviceChange);
    return () => mediaDevices.removeEventListener("devicechange", onDeviceChange);
  }, [enabled, refreshDevices]);

  useEffect(() => {
    if (!enabled) return;
    const stillThere = devices.some((device) => device.id === selection.id);
    if (!stillThere && devices.length > 0) {
      setSelection(devices[0]);
    }
  }, [devices, selection.id, enabled]);

  useEffect(() => {
    if (playbackRef.current) {
      void applyConnectAudioSink(playbackRef.current, selection);
    }
  }, [selection]);

  return {
    selection,
    devices,
    output: selection.route,
    pickerOpen,
    setPickerOpen,
    openPicker,
    selectDevice,
    refreshDevices,
    registerPlaybackElement,
    /** @deprecated use openPicker + selectDevice */
    cycleAudioRoute: openPicker,
    rescanBluetooth: refreshDevices,
    bluetoothAvailable: devices.some((device) => device.kind === "bluetooth" || device.kind === "watch"),
    isEarpiece: selection.route === "earpiece",
    isSpeaker: selection.route === "speaker",
    isBluetooth: selection.route === "bluetooth",
    toggleSpeaker: openPicker,
  };
}

export function connectAudioDeviceIcon(kind: ConnectAudioDeviceKind): LucideIcon {
  switch (kind) {
    case "speaker":
      return Volume2;
    case "bluetooth":
      return Bluetooth;
    case "watch":
      return Watch;
    case "wired":
      return Headphones;
    case "external":
      return Volume2;
    default:
      return Ear;
  }
}

export function connectAudioRouteIcon(route: ConnectAudioRoute): LucideIcon {
  if (route === "speaker") return Volume2;
  if (route === "bluetooth") return Bluetooth;
  return Ear;
}

export function connectAudioSelectionIcon(selection: ConnectAudioSelection): LucideIcon {
  return connectAudioDeviceIcon(selection.kind);
}

export function connectAudioRouteLabel(route: ConnectAudioRoute): string {
  if (route === "speaker") return "السماعة الخارجية";
  if (route === "bluetooth") return "Bluetooth";
  return "سماعة الهاتف";
}

export function connectAudioRouteShortLabel(route: ConnectAudioRoute): string {
  if (route === "speaker") return "سماعة خارجية";
  if (route === "bluetooth") return "بلوتوث";
  return "سماعة الهاتف";
}

export function connectAudioSelectionShortLabel(selection: ConnectAudioSelection): string {
  if (selection.id.startsWith("builtin:")) {
    return connectAudioRouteShortLabel(selection.route);
  }
  return selection.label.length > 14 ? `${selection.label.slice(0, 12)}…` : selection.label;
}

/** @deprecated cycle helper — picker replaces manual cycle */
export function nextConnectAudioRoute(
  current: ConnectAudioRoute,
  bluetoothAvailable: boolean,
): ConnectAudioRoute {
  if (current === "earpiece") return "speaker";
  if (current === "speaker") return bluetoothAvailable ? "bluetooth" : "earpiece";
  return "earpiece";
}

export async function scanBluetoothAudioAvailable(): Promise<boolean> {
  const list = await listConnectAudioOutputDevices();
  return list.some((device) => device.kind === "bluetooth" || device.kind === "watch");
}

export function connectAudioToggleLabel(route: ConnectAudioRoute, bluetoothAvailable: boolean): string {
  const next = nextConnectAudioRoute(route, bluetoothAvailable);
  return `التبديل إلى ${connectAudioRouteShortLabel(next)}`;
}
