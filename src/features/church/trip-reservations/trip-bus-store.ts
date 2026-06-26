/** ALPHA-087 — Bus management */

import type { TripBus } from "./trip-features-roadmap";
import { getRegistrationsForPost } from "../post-registrations";
import { patchTripOperations } from "@/features/alpha-connect/trip-operations-store";

const KEY = "alpha:087:trip-buses";
const ASSIGN_KEY = "alpha:087:bus-assignments";

export type BusAssignment = { registrationId: string; busId: string };

function readBuses(): TripBus[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TripBus[]) : [];
  } catch {
    return [];
  }
}

function writeBuses(rows: TripBus[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

function readAssignments(): BusAssignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ASSIGN_KEY);
    return raw ? (JSON.parse(raw) as BusAssignment[]) : [];
  } catch {
    return [];
  }
}

function writeAssignments(rows: BusAssignment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(rows));
}

export function listTripBuses(postId: string): TripBus[] {
  return readBuses().filter((b) => b.postId === postId);
}

export function createTripBus(input: {
  postId: string;
  label: string;
  capacity: number;
  supervisorName?: string;
}): TripBus {
  const bus: TripBus = {
    id: `bus-${Date.now().toString(36)}`,
    postId: input.postId,
    label: input.label,
    capacity: input.capacity,
    supervisorName: input.supervisorName,
    status: "idle",
  };
  writeBuses([bus, ...readBuses()]);
  syncBusOpsSummary(input.postId);
  return bus;
}

export function updateTripBus(busId: string, patch: Partial<TripBus>) {
  writeBuses(readBuses().map((b) => (b.id === busId ? { ...b, ...patch } : b)));
  const bus = readBuses().find((b) => b.id === busId);
  if (bus) syncBusOpsSummary(bus.postId);
}

export function deleteTripBus(busId: string) {
  const bus = readBuses().find((b) => b.id === busId);
  writeBuses(readBuses().filter((b) => b.id !== busId));
  writeAssignments(readAssignments().filter((a) => a.busId !== busId));
  if (bus) syncBusOpsSummary(bus.postId);
}

export function assignRegistrationToBus(registrationId: string, busId: string) {
  const rest = readAssignments().filter((a) => a.registrationId !== registrationId);
  writeAssignments([...rest, { registrationId, busId }]);
  const bus = readBuses().find((b) => b.id === busId);
  if (bus) syncBusOpsSummary(bus.postId);
}

export function getBusForRegistration(registrationId: string): TripBus | undefined {
  const a = readAssignments().find((x) => x.registrationId === registrationId);
  if (!a) return undefined;
  return readBuses().find((b) => b.id === a.busId);
}

export function busOccupancy(busId: string): number {
  const regs = readAssignments().filter((a) => a.busId === busId);
  return regs.length;
}

export function autoDistributeBuses(postId: string) {
  const buses = listTripBuses(postId);
  if (!buses.length) return;
  const regs = getRegistrationsForPost(postId, "trip");
  const assignments: BusAssignment[] = [];
  let busIdx = 0;
  let seatsInBus = 0;
  for (const r of regs) {
    while (busIdx < buses.length && seatsInBus + r.seats > buses[busIdx].capacity) {
      busIdx++;
      seatsInBus = 0;
    }
    if (busIdx >= buses.length) break;
    assignments.push({ registrationId: r.id, busId: buses[busIdx].id });
    seatsInBus += r.seats;
  }
  const other = readAssignments().filter((a) => {
    const reg = regs.find((r) => r.id === a.registrationId);
    return !reg;
  });
  writeAssignments([...other, ...assignments]);
  syncBusOpsSummary(postId);
}

function syncBusOpsSummary(postId: string) {
  const buses = listTripBuses(postId);
  const enRoute = buses.filter((b) => b.status === "en_route").length;
  const arrived = buses.filter((b) => b.status === "arrived").length;
  const label =
    buses.length === 0
      ? "لم تُنشأ حافلات"
      : `${arrived}/${buses.length} وصلت · ${enRoute} في الطريق`;
  patchTripOperations(postId, { busStatus: label });
}

export function busStatusSummary(postId: string): string {
  const buses = listTripBuses(postId);
  if (!buses.length) return "لم تُنشأ حافلات";
  return buses.map((b) => `${b.label}: ${b.status}`).join(" · ");
}
