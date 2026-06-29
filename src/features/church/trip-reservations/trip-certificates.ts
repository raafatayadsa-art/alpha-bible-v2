/** ALPHA-089 — Digital participation certificates (local + Domain 10) */

import { getMemberProfile } from "../post-registrations";
import type { ParticipationCertificate } from "./trip-features-roadmap";
import {
  fetchTripCertificatesForUser,
  isDomain10RemoteAvailable,
  persistTripCertificateRemote,
} from "./trip-domain-api";

const KEY = "alpha:089:certificates";

function readAll(): ParticipationCertificate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ParticipationCertificate[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: ParticipationCertificate[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

function mergeRemoteLocal(userId: string, remote: ParticipationCertificate[]): ParticipationCertificate[] {
  const local = readAll().filter((c) => c.userId === userId);
  const merged = [...remote];
  for (const row of local) {
    if (!merged.some((x) => x.verifyQr === row.verifyQr)) merged.push(row);
  }
  return merged;
}

export async function syncMyCertificatesFromDb(userId?: string): Promise<void> {
  const id = userId ?? getMemberProfile().id;
  if (!id || isDomain10RemoteAvailable() === false) return;

  const remoteRows = await fetchTripCertificatesForUser(id);
  const remote: ParticipationCertificate[] = remoteRows.map((r) => ({
    id: r.id,
    userId: r.userId,
    eventTitle: r.eventTitle,
    eventDate: r.eventDate,
    organizerName: r.organizerName,
    verifyQr: r.verifyQr,
  }));

  const rest = readAll().filter((c) => c.userId !== id);
  writeAll([...mergeRemoteLocal(id, remote), ...rest]);
}

export function listMyCertificates(userId?: string): ParticipationCertificate[] {
  const id = userId ?? getMemberProfile().id;
  if (!id) return [];
  return readAll().filter((c) => c.userId === id);
}

export function issueCertificate(input: {
  userId: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  postId: string;
}): ParticipationCertificate {
  const existing = readAll().find((c) => c.userId === input.userId && c.verifyQr.includes(input.postId));
  if (existing) return existing;

  const verifyQr = `alpha://cert/${input.postId}/${input.userId}`;
  const cert: ParticipationCertificate = {
    id: `cert-${Date.now().toString(36)}`,
    userId: input.userId,
    eventTitle: input.eventTitle,
    eventDate: input.eventDate,
    organizerName: input.organizerName,
    verifyQr,
  };
  writeAll([cert, ...readAll()]);

  void persistTripCertificateRemote({
    postId: input.postId,
    userId: input.userId,
    eventTitle: input.eventTitle,
    eventDate: input.eventDate,
    organizerName: input.organizerName,
    verifyQr,
  }).then((remoteId) => {
    if (!remoteId) return;
    writeAll(readAll().map((c) => (c.id === cert.id ? { ...c, id: remoteId } : c)));
  });

  return cert;
}
