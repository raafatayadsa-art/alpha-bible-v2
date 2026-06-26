import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Check, LoaderCircle, ScanLine, ShieldCheck, X } from "lucide-react";
import { normalizeAlphaMemberCode } from "@/features/publisher/components/AlphaMemberScanSheet";

type Props = {
  open: boolean;
  onClose: () => void;
  onResolved?: (alphaCode: string) => void;
};

export function AlphaMembershipQrScanner({ open, onClose, onResolved }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const resolvedRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [manual, setManual] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    readerRef.current = null;
  }, []);

  const handleResolved = useCallback(
    (code: string) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      stopCamera();
      setSuccessCode(code);
      onResolved?.(code);
    },
    [onResolved, stopCamera],
  );

  const tryResolveRaw = useCallback(
    (raw: string) => {
      const code = normalizeAlphaMemberCode(raw);
      if (!code) {
        setManualError("باركود غير معروف — جرّب بطاقة عضوية Alpha صالحة.");
        return false;
      }
      handleResolved(code);
      return true;
    },
    [handleResolved],
  );

  useEffect(() => {
    if (!open) {
      stopCamera();
      resolvedRef.current = false;
      setCameraError(null);
      setStarting(false);
      setManual("");
      setManualError(null);
      setSuccessCode(null);
      return;
    }

    let cancelled = false;
    setStarting(true);
    setCameraError(null);

    const start = async () => {
      try {
        const reader = new BrowserQRCodeReader(undefined, {
          delayBetweenScanAttempts: 280,
        });
        readerRef.current = reader;
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        const backCam =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ?? devices[0];
        if (!backCam?.deviceId || cancelled) {
          setCameraError("لم يتم العثور على كاميرا على هذا الجهاز.");
          setStarting(false);
          return;
        }
        const video = videoRef.current;
        if (!video || cancelled) return;

        const controls = await reader.decodeFromVideoDevice(
          backCam.deviceId,
          video,
          (result, _err, ctrl) => {
            if (result && !resolvedRef.current) {
              tryResolveRaw(result.getText());
              ctrl?.stop();
            }
          },
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStarting(false);
      } catch {
        if (!cancelled) {
          setCameraError("تعذّر فتح الكاميرا — تحقق من صلاحيات المتصفح.");
          setStarting(false);
        }
      }
    };

    void start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera, tryResolveRaw]);

  const submitManual = () => {
    setManualError(null);
    if (!tryResolveRaw(manual)) return;
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex flex-col bg-[#0a0604]"
      dir="rtl"
      role="dialog"
      aria-label="مسح باركود العضوية"
    >
      <div className="relative flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),12px)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/8 text-white backdrop-blur-md active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-[15px] font-extrabold text-white">مسح عضو</p>
          <p className="mt-0.5 text-[10px] font-semibold text-[#f0d78c]/65">
            وجّه الكاميرا نحو رمز QR
          </p>
        </div>
        <span className="w-10" aria-hidden />
      </div>

      <div className="relative mx-4 mt-2 flex flex-1 min-h-0 flex-col">
        <div className="relative flex-1 overflow-hidden rounded-[28px] border border-[#f0d78c]/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
          {!successCode ? (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                autoPlay
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 72% 58% at 50% 46%, transparent 52%, rgba(0,0,0,0.72) 100%)",
                }}
              />

              <div className="pointer-events-none absolute inset-0 grid place-items-center p-8">
                <div className="relative aspect-square w-full max-w-[min(78vw,300px)]">
                  <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-[3px] border-t-[3px] border-[#f0d78c]" />
                  <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-[3px] border-t-[3px] border-[#f0d78c]" />
                  <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-[3px] border-l-[3px] border-[#f0d78c]" />
                  <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-[3px] border-r-[3px] border-[#f0d78c]" />
                  <div className="absolute inset-x-3 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#f0d78c] to-transparent opacity-80 animate-pulse" />
                </div>
              </div>

              {(starting || cameraError) && (
                <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
                  {starting ? (
                    <div className="flex flex-col items-center gap-2 text-white/80">
                      <LoaderCircle className="h-8 w-8 animate-spin text-[#f0d78c]" />
                      <p className="text-[11px] font-bold">جاري تشغيل الكاميرا…</p>
                    </div>
                  ) : (
                    <p className="max-w-[240px] px-4 text-center text-[11px] font-bold leading-relaxed text-[#f0d78c]">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-[#1a1208] to-[#0a0604] p-6 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full border border-emerald-400/35 bg-emerald-500/15">
                <ShieldCheck className="h-8 w-8 text-emerald-300" strokeWidth={2.2} />
              </div>
              <p className="mt-4 text-[15px] font-extrabold text-white">تم التعرف على العضو</p>
              <p className="mt-2 font-mono text-[18px] font-black tracking-wide text-[#f0d78c]" dir="ltr">
                {successCode}
              </p>
              <p className="mt-2 text-[10px] font-semibold text-white/50">عضوية Alpha صالحة للتحقق</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#f0d78c]/35 bg-[#f0d78c]/12 px-5 py-2.5 text-[11px] font-extrabold text-[#f0d78c] active:scale-95"
              >
                <Check className="h-4 w-4" />
                تم
              </button>
            </div>
          )}
        </div>

        {!successCode ? (
          <div className="mt-4 shrink-0 rounded-[20px] border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <label className="block">
              <span className="mb-1.5 flex items-center justify-end gap-1 text-[10px] font-extrabold text-white/55">
                <ScanLine className="h-3.5 w-3.5 text-[#f0d78c]/70" />
                أو أدخل الكود يدوياً
              </span>
              <input
                value={manual}
                onChange={(e) => {
                  setManual(e.target.value);
                  setManualError(null);
                }}
                placeholder="A-7KX92M"
                dir="ltr"
                className="w-full rounded-xl border border-white/12 bg-black/35 px-3 py-2.5 text-center text-[13px] font-bold text-white outline-none focus:border-[#f0d78c]/40"
              />
            </label>
            {manualError ? (
              <p className="mt-2 text-center text-[10px] font-bold text-rose-300">{manualError}</p>
            ) : null}
            <button
              type="button"
              disabled={!manual.trim()}
              onClick={submitManual}
              className="mt-2.5 w-full rounded-xl py-2.5 text-[11px] font-extrabold text-[#1a1208] active:scale-[0.98] disabled:opacity-45"
              style={{
                background: "linear-gradient(135deg, #f0d78c 0%, #c99356 100%)",
              }}
            >
              تأكيد الكود
            </button>
          </div>
        ) : null}
      </div>

      <p className="shrink-0 pb-[max(env(safe-area-inset-bottom),14px)] pt-3 text-center text-[9px] font-semibold text-white/30">
        لا يتم حفظ صور الكاميرا — للتحقق فقط
      </p>
    </div>,
    document.body,
  );
}
