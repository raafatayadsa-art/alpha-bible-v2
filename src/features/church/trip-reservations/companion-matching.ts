/** ALPHA-096 — Companion matching (rooms / seats / housing) */

import { getRegistrationsForPost } from "../post-registrations";
import { getFamilyBookingMeta } from "./family-booking";

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

export function listCompanionGroups(postId: string): CompanionGroup[] {
  return readAll().filter((g) => g.postId === postId);
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
  return groups;
}
