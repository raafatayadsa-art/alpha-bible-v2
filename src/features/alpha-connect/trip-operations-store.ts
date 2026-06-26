import type { TripInternalAlert, TripLiveOperations } from "./trip-channel-types";

const OPS_KEY = "alpha:083:trip-operations";

function readMap(): Record<string, TripLiveOperations> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OPS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TripLiveOperations>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, TripLiveOperations>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OPS_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

function defaultOps(postId: string): TripLiveOperations {
  return {
    postId,
    checkedIn: 0,
    absent: 0,
    late: 0,
    busStatus: "في الانتظار",
    housingStatus: "لم يبدأ التوزيع",
    adminAlerts: [],
    updatedAt: Date.now(),
  };
}

export function readTripOperations(postId: string): TripLiveOperations {
  return readMap()[postId] ?? defaultOps(postId);
}

export function patchTripOperations(
  postId: string,
  patch: Partial<Omit<TripLiveOperations, "postId" | "adminAlerts">> & { adminAlerts?: TripInternalAlert[] },
): TripLiveOperations {
  const current = readTripOperations(postId);
  const next: TripLiveOperations = {
    ...current,
    ...patch,
    postId,
    updatedAt: Date.now(),
    adminAlerts: patch.adminAlerts ?? current.adminAlerts,
  };
  const map = readMap();
  map[postId] = next;
  writeMap(map);
  return next;
}

export function pushInternalTripAlert(input: {
  postId: string;
  message: string;
  createdBy: string;
  createdByName: string;
}): TripInternalAlert {
  const alert: TripInternalAlert = {
    id: `alert-${Date.now().toString(36)}`,
    postId: input.postId,
    message: input.message,
    createdAt: Date.now(),
    createdBy: input.createdBy,
    createdByName: input.createdByName,
  };
  const ops = readTripOperations(input.postId);
  patchTripOperations(input.postId, {
    adminAlerts: [alert, ...ops.adminAlerts].slice(0, 20),
  });
  return alert;
}
