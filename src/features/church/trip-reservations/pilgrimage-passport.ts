/** ALPHA-097 — Pilgrimage passport (local + Domain 10) */

import { getMemberProfile } from "../post-registrations";
import type { PilgrimagePassportEntry } from "./trip-features-roadmap";
import {
  fetchPilgrimagePassportEntries,
  isDomain10RemoteAvailable,
  persistPilgrimageEntryRemote,
} from "./trip-domain-api";

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

function mergeRemoteLocal(userId: string, remote: PilgrimagePassportEntry[]): PilgrimagePassportEntry[] {
  const local = readAll().filter((e) => e.userId === userId);
  const merged = [...remote];
  for (const row of local) {
    if (!merged.some((x) => x.title === row.title && x.completedAt === row.completedAt)) merged.push(row);
  }
  return merged.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export async function syncPilgrimagePassportFromDb(userId?: string): Promise<void> {
  const id = userId ?? getMemberProfile().id;
  if (!id || isDomain10RemoteAvailable() === false) return;

  const remoteRows = await fetchPilgrimagePassportEntries(id);
  const remote: PilgrimagePassportEntry[] = remoteRows.map((r) => ({
    id: r.id,
    userId: r.userId,
    kind: r.kind as PilgrimagePassportEntry["kind"],
    title: r.title,
    completedAt: r.completedAt,
  }));

  const rest = readAll().filter((e) => e.userId !== id);
  writeAll([...mergeRemoteLocal(id, remote), ...rest]);
}

export function listPilgrimagePassport(userId?: string): PilgrimagePassportEntry[] {
  const id = userId ?? getMemberProfile().id;
  if (!id) return [];
  return readAll()
    .filter((e) => e.userId === id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export function addPilgrimageEntry(input: Omit<PilgrimagePassportEntry, "id"> & { postId?: string }) {
  const dup = readAll().find(
    (e) => e.userId === input.userId && e.title === input.title && e.completedAt === input.completedAt,
  );
  if (dup) return dup;

  const entry: PilgrimagePassportEntry = {
    userId: input.userId,
    kind: input.kind,
    title: input.title,
    completedAt: input.completedAt,
    id: `pp-${Date.now().toString(36)}`,
  };
  writeAll([entry, ...readAll()]);

  void persistPilgrimageEntryRemote({
    postId: input.postId,
    userId: input.userId,
    kind: input.kind,
    title: input.title,
    completedAt: input.completedAt,
  }).then((remoteId) => {
    if (!remoteId) return;
    writeAll(readAll().map((e) => (e.id === entry.id ? { ...e, id: remoteId } : e)));
  });

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
