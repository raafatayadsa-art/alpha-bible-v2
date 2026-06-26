/** ALPHA-094 — Emergency contact per booking */

import type { EmergencyContact } from "./trip-features-roadmap";

const KEY = "alpha:094:emergency-contacts";

function readAll(): EmergencyContact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EmergencyContact[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: EmergencyContact[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function saveEmergencyContact(contact: EmergencyContact) {
  const rest = readAll().filter((c) => c.registrationId !== contact.registrationId);
  writeAll([contact, ...rest]);
}

export function getEmergencyContact(registrationId: string): EmergencyContact | undefined {
  return readAll().find((c) => c.registrationId === registrationId);
}

export function listEmergencyContactsForPost(postId: string, registrationIds: string[]): EmergencyContact[] {
  const set = new Set(registrationIds);
  return readAll().filter((c) => set.has(c.registrationId));
}
