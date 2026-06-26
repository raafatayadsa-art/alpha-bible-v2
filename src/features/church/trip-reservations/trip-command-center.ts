/** ALPHA-098 — Trip command center snapshot */

import { patchTripOperations, readTripOperations } from "@/features/alpha-connect/trip-operations-store";
import { countParticipants } from "../post-registrations";
import { countWaiting } from "./trip-waitlist";
import { listTripBuses, busOccupancy } from "./trip-bus-store";
import { listCompanionGroups } from "./companion-matching";
import { listTripPrayerRequests } from "./trip-prayer-requests";

export type TripCommandCenterSnapshot = {
  postId: string;
  registered: number;
  capacity?: number;
  waitlist: number;
  checkedIn: number;
  absent: number;
  late: number;
  buses: { label: string; status: string; filled: number; capacity: number }[];
  housingGroups: number;
  prayerRequests: number;
  openAlerts: number;
  updatedAt: number;
};

export function buildCommandCenterSnapshot(postId: string, capacity?: number): TripCommandCenterSnapshot {
  const ops = readTripOperations(postId);
  const buses = listTripBuses(postId);
  const regs = getRegistrationsForPost(postId, "trip");

  return {
    postId,
    registered: countParticipants(postId, "trip"),
    capacity,
    waitlist: countWaiting(postId),
    checkedIn: ops.checkedIn,
    absent: ops.absent,
    late: ops.late,
    buses: buses.map((b) => ({
      label: b.label,
      status: b.status,
      filled: busOccupancy(b.id),
      capacity: b.capacity,
    })),
    housingGroups: listCompanionGroups(postId).length,
    prayerRequests: listTripPrayerRequests(postId).length,
    openAlerts: ops.adminAlerts.length,
    updatedAt: Date.now(),
  };
}

export function incrementCheckIn(postId: string, delta = 1) {
  const ops = readTripOperations(postId);
  patchTripOperations(postId, {
    checkedIn: ops.checkedIn + delta,
    lastCheckInAt: new Date().toISOString(),
  });
}
