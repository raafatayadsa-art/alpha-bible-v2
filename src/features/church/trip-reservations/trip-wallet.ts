/** ALPHA-095 — Trip wallet & payment tracking */

import type { TripPaymentLedger } from "./trip-features-roadmap";

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

export function initTripWallet(input: {
  registrationId: string;
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
  writeAll([ledger, ...readAll()]);
  return ledger;
}

export function recordTripPayment(registrationId: string, amount: number, note?: string) {
  const ledger = readAll().find((l) => l.registrationId === registrationId);
  if (!ledger) return null;
  const payment = { at: new Date().toISOString(), amount, note };
  const next: TripPaymentLedger = {
    ...ledger,
    amountPaid: ledger.amountPaid + amount,
    payments: [payment, ...ledger.payments],
  };
  writeAll([next, ...readAll().filter((l) => l.registrationId !== registrationId)]);
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
