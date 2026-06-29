/** ALPHA-095 — Trip wallet & payment tracking (local + Domain 10 `trip_payments`) */

import type { TripPaymentLedger } from "./trip-features-roadmap";
import { getMemberProfile, getRegistrationsForPost } from "../post-registrations";
import {
  fetchTripWalletLedger,
  persistOrganizerTripPayment as persistOrganizerTripPaymentRemote,
  persistTripPaymentRemote,
  persistTripWalletInit,
} from "./trip-domain-api";

const KEY = "alpha:095:trip-wallet";

function readAll(): TripPaymentLedger[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TripPaymentLedger[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: TripPaymentLedger[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function upsertTripWalletLedger(ledger: TripPaymentLedger) {
  writeAll([ledger, ...readAll().filter((l) => l.registrationId !== ledger.registrationId)]);
}

export async function syncTripWalletFromDb(opts: {
  postId: string;
  registrationId: string;
}): Promise<void> {
  const reg = getRegistrationsForPost(opts.postId, "trip").find((r) => r.id === opts.registrationId);
  const userId = reg?.userId ?? getMemberProfile().id;
  if (!userId) return;

  const remote = await fetchTripWalletLedger({
    postId: opts.postId,
    userId,
    registrationId: opts.registrationId,
  });
  if (remote) upsertTripWalletLedger(remote);
}

export function initTripWallet(input: {
  registrationId: string;
  postId: string;
  amountDue: number;
  currency?: string;
}): TripPaymentLedger {
  const existing = readAll().find((l) => l.registrationId === input.registrationId);
  if (existing) return existing;
  const ledger: TripPaymentLedger = {
    registrationId: input.registrationId,
    amountDue: input.amountDue,
    amountPaid: 0,
    currency: input.currency ?? "EGP",
    payments: [],
  };
  upsertTripWalletLedger(ledger);

  const reg = getRegistrationsForPost(input.postId, "trip").find((r) => r.id === input.registrationId);
  const userId = reg?.userId ?? getMemberProfile().id;
  if (userId) {
    void persistTripWalletInit({
      postId: input.postId,
      registrationId: input.registrationId,
      userId,
      amountDue: input.amountDue,
      currency: input.currency,
    });
  }

  return ledger;
}

export function recordTripPayment(
  registrationId: string,
  amount: number,
  note?: string,
  postId?: string,
) {
  const ledger = readAll().find((l) => l.registrationId === registrationId);
  if (!ledger) return null;
  const payment = { at: new Date().toISOString(), amount, note };
  const next: TripPaymentLedger = {
    ...ledger,
    amountPaid: ledger.amountPaid + amount,
    payments: [payment, ...ledger.payments],
  };
  upsertTripWalletLedger(next);

  if (postId) {
    const reg = getRegistrationsForPost(postId, "trip").find((r) => r.id === registrationId);
    const userId = reg?.userId ?? getMemberProfile().id;
    if (userId) void persistTripPaymentRemote({ postId, userId, amount, note });
  }

  return next;
}

export function getTripWallet(registrationId: string): TripPaymentLedger | undefined {
  return readAll().find((l) => l.registrationId === registrationId);
}

export function walletRemaining(ledger: TripPaymentLedger): number {
  return Math.max(0, ledger.amountDue - ledger.amountPaid);
}

export function isPaymentDue(ledger: TripPaymentLedger): boolean {
  return walletRemaining(ledger) > 0;
}

export async function recordOrganizerTripPayment(opts: {
  postId: string;
  registrationId: string;
  targetUserId: string;
  amount: number;
  note?: string;
}): Promise<boolean> {
  recordTripPayment(opts.registrationId, opts.amount, opts.note, opts.postId);
  return persistOrganizerTripPaymentRemote({
    postId: opts.postId,
    targetUserId: opts.targetUserId,
    amount: opts.amount,
    note: opts.note,
  });
}
