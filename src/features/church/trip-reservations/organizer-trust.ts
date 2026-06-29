/** ALPHA-093 — Organizer trust & reputation (local + Domain 10) */

import type { OrganizerTrustStats } from "./trip-features-roadmap";
import { getRegistrationsForPost } from "../post-registrations";
import {
  fetchOrganizerTrustStatsRemote,
  isDomain10RemoteAvailable,
  persistOrganizerTrustStatsRemote,
} from "./trip-domain-api";

const KEY = "alpha:093:organizer-trust";

function readAll(): OrganizerTrustStats[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OrganizerTrustStats[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: OrganizerTrustStats[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export async function syncOrganizerTrustFromDb(organizerUserId: string): Promise<void> {
  if (!organizerUserId || isDomain10RemoteAvailable() === false) return;

  const remote = await fetchOrganizerTrustStatsRemote(organizerUserId);
  if (!remote) return;

  const next: OrganizerTrustStats = {
    organizerUserId,
    tripsCompleted: remote.tripsCompleted,
    attendanceRate: remote.attendanceRate,
    cancellationRate: remote.cancellationRate,
    commitmentScore: remote.commitmentScore,
  };
  writeAll([next, ...readAll().filter((s) => s.organizerUserId !== organizerUserId)]);
}

export function getOrganizerTrustStats(organizerUserId: string): OrganizerTrustStats {
  const existing = readAll().find((s) => s.organizerUserId === organizerUserId);
  if (existing) return existing;
  return {
    organizerUserId,
    tripsCompleted: 0,
    attendanceRate: 0,
    cancellationRate: 0,
    commitmentScore: 100,
  };
}

export function recordTripCompletionForOrganizer(organizerUserId: string, postId: string) {
  const regs = getRegistrationsForPost(postId, "trip");
  const totalSeats = regs.reduce((s, r) => s + r.seats, 0);
  const confirmed = regs.filter((r) => r.status === "confirmed").length;
  const attendanceRate = totalSeats > 0 ? Math.round((confirmed / regs.length) * 100) : 95;

  const cur = getOrganizerTrustStats(organizerUserId);
  const tripsCompleted = cur.tripsCompleted + 1;
  const next: OrganizerTrustStats = {
    organizerUserId,
    tripsCompleted,
    attendanceRate: Math.round((cur.attendanceRate * cur.tripsCompleted + attendanceRate) / tripsCompleted),
    cancellationRate: cur.cancellationRate,
    commitmentScore: Math.min(100, 70 + tripsCompleted * 3 + Math.floor(attendanceRate / 10)),
  };
  writeAll([next, ...readAll().filter((s) => s.organizerUserId !== organizerUserId)]);

  void persistOrganizerTrustStatsRemote(next);
  return next;
}
