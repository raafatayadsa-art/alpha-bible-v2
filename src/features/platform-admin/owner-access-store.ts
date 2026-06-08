import { useCallback, useEffect, useState } from "react";

const PIN_STORAGE_KEY = "ab:owner-pin";
const LOCKOUT_KEY = "ab:owner-lockout";
const SESSION_KEY = "ab:owner-session";
const FAIL_KEY = "ab:owner-fail-count";

const DEFAULT_PIN = "000000";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

type LockoutState = { until: number; attempts: number };

function readPin(): string {
  if (typeof window === "undefined") return DEFAULT_PIN;
  try {
    const stored = localStorage.getItem(PIN_STORAGE_KEY);
    const pin = (stored ?? DEFAULT_PIN).trim();
    return pin.length > 0 ? pin : DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

function readLockout(): LockoutState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LockoutState;
    if (parsed.until > 0 && parsed.until <= Date.now()) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(FAIL_KEY);
      return null;
    }
    if (parsed.until === 0 && parsed.attempts === 0) {
      localStorage.removeItem(LOCKOUT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeLockout(state: LockoutState | null) {
  if (typeof window === "undefined") return;
  try {
    if (!state) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(FAIL_KEY);
    } else {
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
      localStorage.setItem(FAIL_KEY, String(state.attempts));
    }
    window.dispatchEvent(new CustomEvent("ab:owner-access"));
  } catch { /* ignore */ }
}

export function isOwnerSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function grantOwnerSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
    localStorage.removeItem(FAIL_KEY);
    writeLockout(null);
    window.dispatchEvent(new CustomEvent("ab:owner-access"));
  } catch { /* ignore */ }
}

export function revokeOwnerSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent("ab:owner-access"));
  } catch { /* ignore */ }
}

export function setOwnerPin(pin: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PIN_STORAGE_KEY, pin.trim());
  } catch { /* ignore */ }
}

export function getOwnerPin(): string {
  return readPin();
}

export function useOwnerAccess() {
  const [lockout, setLockout] = useState<LockoutState | null>(() => readLockout());
  const [sessionActive, setSessionActive] = useState(() => isOwnerSessionActive());

  useEffect(() => {
    const sync = () => {
      setLockout(readLockout());
      setSessionActive(isOwnerSessionActive());
    };
    window.addEventListener("ab:owner-access", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ab:owner-access", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isLockedOut = lockout !== null && lockout.until > Date.now();

  const lockoutRemainingSec = isLockedOut
    ? Math.ceil((lockout!.until - Date.now()) / 1000)
    : 0;

  const verifyPin = useCallback((input: string): "ok" | "wrong" | "locked" => {
    const currentLockout = readLockout();
    if (currentLockout && currentLockout.until > Date.now()) {
      setLockout(currentLockout);
      return "locked";
    }

    const normalizedInput = input.trim();
    const expectedPin = readPin();

    if (normalizedInput === expectedPin) {
      grantOwnerSession();
      setSessionActive(true);
      setLockout(null);
      return "ok";
    }

    const attempts = (currentLockout?.attempts ?? 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const next: LockoutState = { until: Date.now() + LOCKOUT_MS, attempts };
      writeLockout(next);
      setLockout(next);
      return "locked";
    }

    writeLockout({ until: 0, attempts });
    setLockout({ until: 0, attempts });
    return "wrong";
  }, []);

  return {
    sessionActive,
    isLockedOut,
    lockoutRemainingSec,
    verifyPin,
    grantOwnerSession,
    revokeOwnerSession,
  };
}
