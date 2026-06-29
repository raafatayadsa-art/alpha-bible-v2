/** ALPHA-087 — Bus management (local + Domain 10 `buses` / `bus_assignments`) */

import type { TripBus } from "./trip-features-roadmap";
import { getRegistrationsForPost } from "../post-registrations";
import { patchTripOperations } from "@/features/alpha-connect/trip-operations-store";
import {
  ensureTripIdForPost,
  fetchTripBookingId,
  fetchTripIdByPostId,
  isDomain10RemoteAvailable,
  isMissingDomain10Error,
  markDomain10Available,
  markDomain10Unavailable,
} from "./trip-domain-api";
import { supabase } from "@/integrations/supabase/client";

export type BusAssignment = { registrationId: string; busId: string };

const KEY = "alpha:087:trip-buses";
const ASSIGN_KEY = "alpha:087:bus-assignments";

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

function busFromDb(row: Record<string, unknown>, postId: string): TripBus {
  return {
    id: String(row.id),
    postId,
    label: String(row.label),
    capacity: Number(row.capacity) || 1,
    supervisorUserId: row.supervisor_user_id ? String(row.supervisor_user_id) : undefined,
    supervisorName: undefined,
    status: (row.status as TripBus["status"]) ?? "idle",
  };
}

async function persistBusRemote(bus: TripBus): Promise<void> {
  if (isDomain10RemoteAvailable() === false) return;
  const tripId = await ensureTripIdForPost({ postId: bus.postId, title: "رحلة" });
  if (!tripId) return;

  const isUuid = /^[0-9a-f-]{36}$/i.test(bus.id);
  const payload = {
    trip_id: tripId,
    label: bus.label,
    capacity: bus.capacity,
    supervisor_user_id: bus.supervisorUserId ?? null,
    status: bus.status,
  };

  if (isUuid) {
    const { error } = await supabase.from("buses").update(payload).eq("id", bus.id);
    if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
    else if (!error) markDomain10Available();
    return;
  }

  const { data, error } = await supabase.from("buses").insert(payload).select("*").single();
  if (error) {
    if (isMissingDomain10Error(error)) markDomain10Unavailable();
    return;
  }
  markDomain10Available();
  const saved = busFromDb(data as Record<string, unknown>, bus.postId);
  writeBuses(readBuses().map((b) => (b.id === bus.id ? saved : b)));
}

async function deleteBusRemote(busId: string): Promise<void> {
  if (isDomain10RemoteAvailable() === false) return;
  if (!/^[0-9a-f-]{36}$/i.test(busId)) return;
  const { error } = await supabase.from("buses").delete().eq("id", busId);
  if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
}

async function persistAssignmentRemote(postId: string, assignment: BusAssignment): Promise<void> {
  if (isDomain10RemoteAvailable() === false) return;
  const reg = getRegistrationsForPost(postId, "trip").find((r) => r.id === assignment.registrationId);
  if (!reg) return;

  const bookingId = await fetchTripBookingId({ postId, userId: reg.userId });
  if (!bookingId || !/^[0-9a-f-]{36}$/i.test(assignment.busId)) return;

  await supabase.from("bus_assignments").delete().eq("booking_id", bookingId);
  const { error } = await supabase.from("bus_assignments").insert({
    bus_id: assignment.busId,
    booking_id: bookingId,
  });
  if (error && isMissingDomain10Error(error)) markDomain10Unavailable();
  else if (!error) markDomain10Available();
}

export async function syncTripBusesFromDb(postId: string): Promise<void> {
  if (!postId || isDomain10RemoteAvailable() === false) return;
  const tripId = await fetchTripIdByPostId(postId);
  if (!tripId) return;

  const { data: busRows, error: busError } = await supabase.from("buses").select("*").eq("trip_id", tripId);
  if (busError) {
    if (isMissingDomain10Error(busError)) markDomain10Unavailable();
    return;
  }

  const buses = (busRows ?? []).map((r) => busFromDb(r as Record<string, unknown>, postId));
  const busIds = buses.map((b) => b.id).filter((id) => /^[0-9a-f-]{36}$/i.test(id));

  let assignments: BusAssignment[] = [];
  if (busIds.length) {
    const { data: assignRows } = await supabase
      .from("bus_assignments")
      .select("bus_id, booking_id")
      .in("bus_id", busIds);
    const bookingIds = (assignRows ?? []).map((a) => String((a as { booking_id: string }).booking_id));
    if (bookingIds.length) {
      const { data: bookingRows } = await supabase
        .from("trip_bookings")
        .select("id, user_id")
        .in("id", bookingIds);
      const regs = getRegistrationsForPost(postId, "trip");
      for (const row of assignRows ?? []) {
        const busId = String((row as { bus_id: string }).bus_id);
        const bookingId = String((row as { booking_id: string }).booking_id);
        const booking = bookingRows?.find((b) => String(b.id) === bookingId);
        const reg = regs.find((r) => r.userId === String(booking?.user_id));
        if (reg) assignments.push({ registrationId: reg.id, busId });
      }
    }
  }

  markDomain10Available();
  const otherBuses = readBuses().filter((b) => b.postId !== postId);
  const otherAssign = readAssignments().filter((a) => {
    const bus = [...buses, ...otherBuses].find((b) => b.id === a.busId);
    return bus?.postId !== postId;
  });
  writeBuses([...otherBuses, ...buses]);
  writeAssignments([...otherAssign, ...assignments]);
  syncBusOpsSummary(postId);
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
  void persistBusRemote(bus);
  syncBusOpsSummary(input.postId);
  return bus;
}

export function updateTripBus(busId: string, patch: Partial<TripBus>) {
  const updated = readBuses().map((b) => (b.id === busId ? { ...b, ...patch } : b));
  writeBuses(updated);
  const bus = updated.find((b) => b.id === busId);
  if (bus) {
    void persistBusRemote(bus);
    syncBusOpsSummary(bus.postId);
  }
}

export function deleteTripBus(busId: string) {
  const bus = readBuses().find((b) => b.id === busId);
  writeBuses(readBuses().filter((b) => b.id !== busId));
  writeAssignments(readAssignments().filter((a) => a.busId !== busId));
  void deleteBusRemote(busId);
  if (bus) syncBusOpsSummary(bus.postId);
}

export function assignRegistrationToBus(registrationId: string, busId: string) {
  const bus = readBuses().find((b) => b.id === busId);
  const rest = readAssignments().filter((a) => a.registrationId !== registrationId);
  const next = { registrationId, busId };
  writeAssignments([...rest, next]);
  if (bus) {
    void persistAssignmentRemote(bus.postId, next);
    syncBusOpsSummary(bus.postId);
  }
}

export function getBusForRegistration(registrationId: string): TripBus | undefined {
  const a = readAssignments().find((x) => x.registrationId === registrationId);
  if (!a) return undefined;
  return readBuses().find((b) => b.id === a.busId);
}

export function busOccupancy(busId: string): number {
  return readAssignments().filter((a) => a.busId === busId).length;
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
  for (const a of assignments) void persistAssignmentRemote(postId, a);
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
