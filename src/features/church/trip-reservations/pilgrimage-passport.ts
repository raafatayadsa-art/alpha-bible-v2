/** ALPHA-097 — Pilgrimage passport */

import { getMemberProfile } from "../post-registrations";
import type { PilgrimagePassportEntry } from "./trip-features-roadmap";

const KEY = "alpha:097:pilgrimage-passport";

function readAll(): PilgrimagePassportEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PilgrimagePassportEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: PilgrimagePassportEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function listPilgrimagePassport(userId?: string): PilgrimagePassportEntry[] {
  const id = userId ?? getMemberProfile().id;
  if (!id) return [];
  return readAll()
    .filter((e) => e.userId === id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export function addPilgrimageEntry(input: Omit<PilgrimagePassportEntry, "id">) {
  const dup = readAll().find(
    (e) => e.userId === input.userId && e.title === input.title && e.completedAt === input.completedAt,
  );
  if (dup) return dup;
  const entry: PilgrimagePassportEntry = { ...input, id: `pp-${Date.now().toString(36)}` };
  writeAll([entry, ...readAll()]);
  return entry;
}

export function passportStats(userId?: string) {
  const entries = listPilgrimagePassport(userId);
  return {
    total: entries.length,
    monasteries: entries.filter((e) => e.kind === "monastery").length,
    conferences: entries.filter((e) => e.kind === "conference").length,
    trips: entries.filter((e) => e.kind === "trip").length,
  };
}
