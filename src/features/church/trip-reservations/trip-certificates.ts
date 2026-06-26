/** ALPHA-089 — Digital participation certificates */

import { getMemberProfile } from "../post-registrations";
import type { ParticipationCertificate } from "./trip-features-roadmap";

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

  const cert: ParticipationCertificate = {
    id: `cert-${Date.now().toString(36)}`,
    userId: input.userId,
    eventTitle: input.eventTitle,
    eventDate: input.eventDate,
    organizerName: input.organizerName,
    verifyQr: `alpha://cert/${input.postId}/${input.userId}`,
  };
  writeAll([cert, ...readAll()]);
  return cert;
}
