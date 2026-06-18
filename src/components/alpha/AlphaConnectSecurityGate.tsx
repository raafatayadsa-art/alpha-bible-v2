import { useState } from "react";
import { Fingerprint, ScanFace, ShieldCheck } from "lucide-react";
import type { AlphaConnectSettingsState } from "./AlphaConnectSettings";
import {
  unlockWithBiometricCredential,
  verifySecurityPin,
  hasSecurityCode,
  isBiometricLockActive,
  SECURITY_PIN_LENGTH,
} from "./alpha-connect-security";
import { ConnectPinInput } from "./connect-code-ui";

type AlphaConnectSecurityGateProps = {
  settings: AlphaConnectSettingsState;
  onUnlock: () => void;
};

export function AlphaConnectSecurityGate({ settings, onUnlock }: AlphaConnectSecurityGateProps) {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const biometricActive = isBiometricLockActive(settings);

  const unlockWithBiometric = async (label: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await unlockWithBiometricCredential();
      if (result.ok) {
        onUnlock();
      } else if (result.error !== "تم إلغاء التحقق") {
        setError(result.error ?? `تعذّر التحقق عبر ${label}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const unlockWithPin = (value = pin) => {
    if (!settings.securityPin) {
      setError("لم يتم تعيين كود بعد — أنشئه من الإعدادات");
      return;
    }
    if (verifySecurityPin(value, settings.securityPin)) {
      setPinError(false);
      setError(null);
      onUnlock();
      return;
    }
    setPinError(true);
    setError("الكود غير صحيح");
    setPin("");
    window.setTimeout(() => setPinError(false), 800);
  };

  return (
    <div dir="rtl" className="relative mx-auto flex min-h-full w-full max-w-[var(--alpha-content-narrow-width)] flex-col items-center justify-center px-6 py-10">
      <div className="glass-strong w-full max-w-[360px] rounded-3xl p-6 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[oklch(0.82_0.22_145/0.35)] bg-[oklch(0.82_0.22_145/0.08)]">
          <ShieldCheck className="h-8 w-8 text-neon-green" strokeWidth={2.1} />
        </div>
        <h1 className="text-[18px] font-bold">Alpha Connect مقفول</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          تم تفعيل حماية الأمان. أكّد هويتك للمتابعة.
        </p>

        <div className="mt-5 space-y-2">
          {settings.fingerprintLock && biometricActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void unlockWithBiometric("البصمة")}
              className="neon-ring flex w-full items-center justify-center gap-2 rounded-2xl border border-[oklch(0.82_0.22_145/0.45)] bg-[oklch(0.82_0.22_145/0.12)] py-3 text-[13px] font-semibold text-neon-green active:scale-[0.98] disabled:opacity-60"
            >
              <Fingerprint className="h-4 w-4" />
              {busy ? "جاري التحقق…" : "فتح بالبصمة"}
            </button>
          ) : null}

          {settings.faceIdLock && biometricActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void unlockWithBiometric("Face ID")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-[13px] font-semibold text-foreground/92 active:scale-[0.98] disabled:opacity-60"
            >
              <ScanFace className="h-4 w-4 text-neon-green" />
              {busy ? "جاري التحقق…" : "فتح بـ Face ID"}
            </button>
          ) : null}

          {hasSecurityCode(settings) ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-3 text-center text-[12px] font-medium text-foreground/90">أدخل الكود السري</p>
              <ConnectPinInput
                id="connect-unlock-pin"
                value={pin}
                onChange={(value) => {
                  setPin(value);
                  setPinError(false);
                  setError(null);
                  if (value.length === SECURITY_PIN_LENGTH) {
                    unlockWithPin(value);
                  }
                }}
                error={pinError}
              />
              <button
                type="button"
                onClick={() => unlockWithPin()}
                disabled={pin.length !== SECURITY_PIN_LENGTH}
                className="mt-3 w-full rounded-xl bg-neon-green py-2.5 text-[13px] font-bold text-[#0a1430] active:scale-[0.98] disabled:opacity-40"
              >
                تأكيد
              </button>
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-3 text-[11px] font-medium text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
