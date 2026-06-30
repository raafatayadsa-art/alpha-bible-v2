import { useCallback, useEffect, useRef, useState } from "react";
import { Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MC } from "./platform-store";
import { useOwnerAccess } from "./owner-access-store";

export function OwnerAccessPinSheet({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { verifyPin, isLockedOut, lockoutRemainingSec } = useOwnerAccess();
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setDigits([]);
      setError("");
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pin = digits.join("");

  const submit = useCallback(() => {
    if (pin.length !== 6) return;
    if (isLockedOut) {
      setError(`محاولات كثيرة — انتظر ${Math.ceil(lockoutRemainingSec / 60)} د`);
      return;
    }
    const result = verifyPin(pin.trim());
    if (result === "ok") {
      setDigits([]);
      setError("");
      onSuccess();
      return;
    }
    if (result === "locked") {
      setError("تم إغلاق الدخول لمدة 5 دقائق");
      setDigits([]);
      setTimeout(onClose, 1600);
      return;
    }
    setError("الرمز غير صحيح");
    setDigits([]);
  }, [pin, isLockedOut, lockoutRemainingSec, verifyPin, onSuccess, onClose]);

  useEffect(() => {
    if (!open || isLockedOut || digits.length !== 6) return;
    submit();
  }, [open, isLockedOut, digits.length, submit]);

  const appendDigit = (d: string) => {
    if (isLockedOut || digits.length >= 6) return;
    setError("");
    setDigits((prev) => [...prev, d]);
  };

  const backspace = () => {
    setError("");
    setDigits((prev) => prev.slice(0, -1));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div
        dir="rtl"
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-t-2xl border sm:rounded-2xl"
        style={{
          borderColor: MC.panelBorder,
          background: "linear-gradient(180deg, #0a1220 0%, #030508 100%)",
          boxShadow: `0 0 40px ${MC.cyan}33`,
        }}
        role="dialog"
        aria-labelledby="owner-access-title"
      >
        <div className="relative px-4 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              aria-label="إلغاء"
              className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-900/50 bg-black/40"
            >
              <X className="h-4 w-4 text-cyan-400" />
            </button>
            <Shield className="h-8 w-8 text-cyan-400" strokeWidth={1.8} />
            <span className="w-10" />
          </div>

          <div className="mt-3 flex flex-col items-center">
            <Shield className="h-6 w-6 text-cyan-400" strokeWidth={2} />
            <h2 id="owner-access-title" className="mt-2 text-center text-[16px] font-extrabold tracking-wide text-white">
              Owner Access
            </h2>
            <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Alpha Control Center</p>
            <p className="mt-2 text-center text-[11px] text-slate-400">أدخل رمز PIN المكوّن من 6 أرقام</p>
          </div>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setError("");
              setDigits(v.split(""));
            }}
            className="sr-only"
            aria-label="رمز PIN"
          />

          <div className="mt-5 flex justify-center gap-2.5" dir="ltr">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-lg border text-[18px] font-extrabold",
                  digits[i] ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" : "border-slate-700 bg-black/30 text-transparent",
                )}
              >
                •
              </span>
            ))}
          </div>

          {error && <p className="mt-3 text-center text-[12px] font-bold text-red-400">{error}</p>}
          {isLockedOut && !error && (
            <p className="mt-3 text-center text-[12px] font-bold text-red-400">
              تم إغلاق الدخول — {Math.ceil(lockoutRemainingSec / 60)} د
            </p>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2" dir="ltr">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((key) => {
              if (key === "") return <span key="spacer" />;
              if (key === "⌫") {
                return (
                  <button
                    key="back"
                    type="button"
                    onClick={backspace}
                    disabled={isLockedOut}
                    className="grid h-12 place-items-center rounded-lg border border-slate-700 bg-slate-900/80 text-[16px] text-slate-200 disabled:opacity-40"
                  >
                    ⌫
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => appendDigit(key)}
                  disabled={isLockedOut}
                  className="grid h-12 place-items-center rounded-lg border border-slate-600 bg-slate-800/90 text-[17px] font-extrabold text-white disabled:opacity-40"
                >
                  {key}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] rounded-lg border border-slate-600 py-3 text-[13px] font-extrabold text-slate-300"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pin.length !== 6 || isLockedOut}
              className="min-h-[48px] rounded-lg border border-cyan-500/50 bg-cyan-500/20 py-3 text-[13px] font-extrabold text-cyan-300 disabled:opacity-40"
              style={{ boxShadow: `0 0 20px ${MC.cyan}33` }}
            >
              تأكيد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
