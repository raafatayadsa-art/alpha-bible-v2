/** ALPHA-096 — Companion matching (local + Domain 10 `trip_companion_groups`) */

import { getRegistrationsForPost } from "../post-registrations";
import { getFamilyBookingMeta } from "./family-booking";
import {
  fetchTripCompanionGroups,
  isDomain10RemoteAvailable,
  replaceTripCompanionGroupsRemote,
} from "./trip-domain-api";

const KEY = "alpha:096:companion-groups";

export type CompanionGroup = {
  id: string;
  postId: string;
  label: string;
  registrationIds: string[];
  kind: "room" | "seat" | "housing";
};

function readAll(): CompanionGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CompanionGroup[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: CompanionGroup[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

function mergeRemoteLocal(postId: string, remote: CompanionGroup[]): CompanionGroup[] {
  const local = readAll().filter((g) => g.postId === postId);
  const merged = remote.map((g) => ({ ...g, postId }));
  for (const row of local) {
    if (!merged.some((x) => x.id === row.id)) merged.push(row);
  }
  return merged;
}

export function listCompanionGroups(postId: string): CompanionGroup[] {
  return readAll().filter((g) => g.postId === postId);
}

export async function syncCompanionGroupsFromDb(postId: string): Promise<void> {
  if (!postId || isDomain10RemoteAvailable() === false) return;

  const remoteRows = await fetchTripCompanionGroups(postId);
  const remote: CompanionGroup[] = remoteRows.map((r) => ({
    id: r.id,
    postId,
    label: r.label,
    registrationIds: r.registrationIds,
    kind: r.kind,
  }));

  const rest = readAll().filter((g) => g.postId !== postId);
  writeAll([...mergeRemoteLocal(postId, remote), ...rest]);
}

export function autoMatchCompanions(postId: string): CompanionGroup[] {
  const regs = getRegistrationsForPost(postId, "trip");
  const groups: CompanionGroup[] = [];
  let roomNum = 1;

  const familyRegs = regs.filter((r) => getFamilyBookingMeta(r.id)?.mode === "family");
  for (const r of familyRegs) {
    const meta = getFamilyBookingMeta(r.id)!;
    groups.push({
      id: `cg-fam-${r.id}`,
      postId,
      label: `${meta.householdName} — غرفة ${roomNum++}`,
      registrationIds: [r.id],
      kind: "room",
    });
  }

  const solo = regs.filter((r) => !getFamilyBookingMeta(r.id) || getFamilyBookingMeta(r.id)?.mode === "solo");
  for (let i = 0; i < solo.length; i += 2) {
    const pair = solo.slice(i, i + 2);
    groups.push({
      id: `cg-solo-${i}`,
      postId,
      label: `غرفة مشتركة ${roomNum++}`,
      registrationIds: pair.map((p) => p.id),
      kind: "room",
    });
  }

  writeAll([...readAll().filter((g) => g.postId !== postId), ...groups]);

  void replaceTripCompanionGroupsRemote({
    postId,
    groups: groups.map((g) => ({
      label: g.label,
      registrationIds: g.registrationIds,
      kind: g.kind,
    })),
  }).then((ok) => {
    if (ok) void syncCompanionGroupsFromDb(postId);
  });

  return groups;
}
