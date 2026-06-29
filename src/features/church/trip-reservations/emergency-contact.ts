/** ALPHA-094 — Emergency contact per booking (local + Domain 10) */

import { getMemberProfile } from "../post-registrations";
import type { EmergencyContact } from "./trip-features-roadmap";
import {
  fetchEmergencyContactRemote,
  isDomain10RemoteAvailable,
  persistEmergencyContactRemote,
} from "./trip-domain-api";

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

export function saveEmergencyContact(contact: EmergencyContact, postId?: string) {
  const rest = readAll().filter((c) => c.registrationId !== contact.registrationId);
  writeAll([contact, ...rest]);

  const userId = getMemberProfile().id;
  if (postId && userId) {
    void persistEmergencyContactRemote({
      postId,
      registrationId: contact.registrationId,
      userId,
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
    });
  }
}

export async function syncEmergencyContactFromDb(opts: {
  postId: string;
  registrationId: string;
}): Promise<void> {
  if (isDomain10RemoteAvailable() === false) return;

  const remote = await fetchEmergencyContactRemote(opts);
  if (!remote) return;

  const contact: EmergencyContact = {
    registrationId: opts.registrationId,
    ...remote,
  };
  const rest = readAll().filter((c) => c.registrationId !== opts.registrationId);
  writeAll([contact, ...rest]);
}

export function getEmergencyContact(registrationId: string): EmergencyContact | undefined {
  return readAll().find((c) => c.registrationId === registrationId);
}

export function listEmergencyContactsForPost(postId: string, registrationIds: string[]): EmergencyContact[] {
  const set = new Set(registrationIds);
  return readAll().filter((c) => set.has(c.registrationId));
}
