import type { AlphaConnectSettingsState } from "./AlphaConnectSettings";

export const ALPHA_CONNECT_UNLOCK_KEY = "alpha_connect_unlocked";
export const ALPHA_CONNECT_SCREENSHOT_EVENT = "alpha-connect-screenshot-alert";
export const SECURITY_PIN_LENGTH = 6;
const BIOMETRIC_CREDENTIAL_KEY = "alpha_connect_biometric_credential";
const BIOMETRIC_USER_ID_KEY = "alpha_connect_biometric_user_id";

let screenshotListener: (() => void) | null = null;

export function hasSecurityCode(settings: AlphaConnectSettingsState): boolean {
  return settings.securityPin.length === SECURITY_PIN_LENGTH;
}

export function isBiometricLockActive(settings: AlphaConnectSettingsState): boolean {
  if (!settings.fingerprintLock && !settings.faceIdLock) return false;
  return !!getStoredBiometricCredentialId();
}

export function isSecurityLockEnabled(settings: AlphaConnectSettingsState): boolean {
  return isBiometricLockActive(settings) || hasSecurityCode(settings);
}

/** Clears biometric flags when no WebAuthn credential was registered (avoids a dead-end lock). */
export function normalizeAlphaConnectSettings(settings: AlphaConnectSettingsState): AlphaConnectSettingsState {
  if (isBiometricLockActive(settings)) return settings;
  if (!settings.fingerprintLock && !settings.faceIdLock) return settings;
  return { ...settings, fingerprintLock: false, faceIdLock: false };
}

export function isAlphaConnectUnlocked(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(ALPHA_CONNECT_UNLOCK_KEY) === "1";
}

export function unlockAlphaConnect(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ALPHA_CONNECT_UNLOCK_KEY, "1");
}

export function lockAlphaConnect(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ALPHA_CONNECT_UNLOCK_KEY);
}

export function clearAlphaConnectSecurityEffects(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("alpha-connect-secure-screen");
  if (screenshotListener) {
    document.removeEventListener("visibilitychange", screenshotListener);
    screenshotListener = null;
  }
}

export function applyAlphaConnectSecurity(settings: AlphaConnectSettingsState): void {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("alpha-connect-secure-screen", settings.blockScreenshots);

  if (screenshotListener) {
    document.removeEventListener("visibilitychange", screenshotListener);
    screenshotListener = null;
  }

  if (settings.screenshotAlert) {
    screenshotListener = () => {
      if (document.hidden) {
        window.dispatchEvent(new CustomEvent(ALPHA_CONNECT_SCREENSHOT_EVENT));
      }
    };
    document.addEventListener("visibilitychange", screenshotListener);
  }
}

function randomChallenge(): Uint8Array {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return buf;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  return bufferToBase64(buffer).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function storedIdToBuffer(storedId: string): ArrayBuffer {
  if (storedId.includes("+") || storedId.includes("/")) {
    return base64ToBuffer(storedId);
  }
  let base64 = storedId.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return base64ToBuffer(base64);
}

function getRpId(): string {
  if (typeof window === "undefined") return "localhost";
  return window.location.hostname || "localhost";
}

function getBioUserId(): Uint8Array {
  if (typeof window === "undefined") return randomChallenge();
  let stored = localStorage.getItem(BIOMETRIC_USER_ID_KEY);
  if (!stored) {
    stored = bufferToBase64(randomChallenge());
    localStorage.setItem(BIOMETRIC_USER_ID_KEY, stored);
  }
  return new Uint8Array(base64ToBuffer(stored));
}

export function getStoredBiometricCredentialId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(BIOMETRIC_CREDENTIAL_KEY);
}

export function clearStoredBiometricCredential(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BIOMETRIC_CREDENTIAL_KEY);
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential || !window.isSecureContext) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function biometricErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") return "تم إلغاء التحقق";
    if (error.name === "SecurityError") {
      return "Face ID / البصمة يتطلب HTTPS — افتح التطبيق عبر رابط آمن";
    }
    if (error.name === "InvalidStateError") {
      return "انتهت صلاحية التسجيل — اضغط الزر مرة أخرى لإعادة التفعيل";
    }
  }
  return fallback;
}

export async function registerBiometricCredential(): Promise<{ ok: boolean; error?: string }> {
  if (!(await isBiometricAvailable())) {
    return { ok: false, error: "البصمة / Face ID غير متاح على هذا الجهاز" };
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge(),
        rp: {
          name: "Alpha Connect",
          id: getRpId(),
        },
        user: {
          id: getBioUserId(),
          name: "alpha-connect",
          displayName: "Alpha Connect",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60_000,
      },
    });

    if (!credential || !(credential instanceof PublicKeyCredential)) {
      return { ok: false, error: "تعذّر تسجيل البصمة / Face ID" };
    }

    localStorage.setItem(BIOMETRIC_CREDENTIAL_KEY, bufferToBase64Url(credential.rawId));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: biometricErrorMessage(error, "تعذّر تسجيل البصمة / Face ID") };
  }
}

export async function verifyBiometricCredential(): Promise<{ ok: boolean; error?: string }> {
  const storedId = getStoredBiometricCredentialId();
  if (!storedId) {
    return { ok: false, error: "فعّل البصمة أو Face ID من الإعدادات أولاً" };
  }

  if (!(await isBiometricAvailable())) {
    return { ok: false, error: "البصمة / Face ID غير متاح على هذا الجهاز" };
  }

  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        rpId: getRpId(),
        allowCredentials: [
          {
            id: storedIdToBuffer(storedId),
            type: "public-key",
            transports: ["internal"],
          },
        ],
        userVerification: "required",
        timeout: 60_000,
      },
    });

    if (!assertion) return { ok: false, error: "فشل التحقق" };
    return { ok: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === "InvalidStateError") {
      clearStoredBiometricCredential();
    }
    return { ok: false, error: biometricErrorMessage(error, "فشل التحقق بالبصمة / Face ID") };
  }
}

/** Registers WebAuthn if needed, then verifies — used from the lock screen (requires user tap on iOS). */
export async function unlockWithBiometricCredential(): Promise<{ ok: boolean; error?: string }> {
  if (!(await isBiometricAvailable())) {
    return { ok: false, error: "البصمة / Face ID غير متاح — تأكد من HTTPS أو Safari" };
  }

  if (!getStoredBiometricCredentialId()) {
    const enrolled = await registerBiometricCredential();
    if (!enrolled.ok) return enrolled;
  }

  return verifyBiometricCredential();
}

/** @deprecated Use verifyBiometricCredential */
export async function tryBiometricUnlock(): Promise<boolean> {
  const result = await verifyBiometricCredential();
  return result.ok;
}

export function verifySecurityPin(input: string, expected: string): boolean {
  return input.length === SECURITY_PIN_LENGTH && input === expected;
}

export async function enableBiometricLock(
  settings: AlphaConnectSettingsState,
  kind: "fingerprint" | "faceId",
): Promise<{ ok: boolean; settings?: Partial<AlphaConnectSettingsState>; error?: string }> {
  if (!getStoredBiometricCredentialId()) {
    const enrolled = await registerBiometricCredential();
    if (!enrolled.ok) return enrolled;
  }

  return {
    ok: true,
    settings: kind === "fingerprint" ? { fingerprintLock: true } : { faceIdLock: true },
  };
}

export function disableBiometricLock(
  settings: AlphaConnectSettingsState,
  kind: "fingerprint" | "faceId",
): Partial<AlphaConnectSettingsState> {
  const next = kind === "fingerprint" ? { fingerprintLock: false } : { faceIdLock: false };
  const fingerprintLock = kind === "fingerprint" ? false : settings.fingerprintLock;
  const faceIdLock = kind === "faceId" ? false : settings.faceIdLock;
  if (!fingerprintLock && !faceIdLock) clearStoredBiometricCredential();
  return next;
}
