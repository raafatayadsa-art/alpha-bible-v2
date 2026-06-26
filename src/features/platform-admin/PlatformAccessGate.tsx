import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { grantOwnerSession, isOwnerSessionActive } from "./owner-access-store";
import { OwnerAccessPinSheet } from "./OwnerAccessPinSheet";
import { isPlatformOwnerSync, subscribeAuthContext } from "@/features/auth";

/** Blocks platform routes unless Owner PIN session is active. */
export function PlatformAccessGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [sessionActive, setSessionActive] = useState(() => isOwnerSessionActive());
  const [pinOpen, setPinOpen] = useState(false);

  useEffect(() => {
    const sync = () => setSessionActive(isOwnerSessionActive());
    window.addEventListener("ab:owner-access", sync);
    return () => window.removeEventListener("ab:owner-access", sync);
  }, []);

  useEffect(() => {
    const tryOwnerBypass = () => {
      if (isOwnerSessionActive()) {
        setSessionActive(true);
        return;
      }
      if (isPlatformOwnerSync()) {
        grantOwnerSession();
        setSessionActive(true);
      }
    };

    tryOwnerBypass();
    return subscribeAuthContext(() => tryOwnerBypass());
  }, []);

  const openPin = () => setPinOpen(true);

  if (sessionActive) return <>{children}</>;

  return (
    <>
      <div
        dir="rtl"
        className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
        style={{
          background: "linear-gradient(180deg, #0a0e1a 0%, #12182a 100%)",
          color: "#e2e8f0",
        }}
      >
        <div
          className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border"
          style={{ borderColor: "rgba(231,201,122,0.35)", background: "rgba(231,201,122,0.08)" }}
        >
          <Shield className="h-8 w-8" style={{ color: "#e7c97a" }} />
        </div>
        <h1 className="text-[16px] font-extrabold text-white">Alpha Control Center</h1>
        <p className="mt-2 max-w-xs text-[11px] font-bold leading-relaxed text-slate-400">
          لوحة تحكم المالك — أدخل رمز الدخول (6 أرقام) للمتابعة.
        </p>
        <button
          type="button"
          onClick={openPin}
          className="mt-5 rounded-full px-6 py-2.5 text-[12px] font-extrabold text-[#0a0e1a]"
          style={{ background: "linear-gradient(160deg, #f0d78c, #e7c97a)" }}
        >
          إدخال رمز المالك
        </button>
        {import.meta.env.DEV ? (
          <button
            type="button"
            onClick={() => {
              grantOwnerSession();
              setSessionActive(true);
            }}
            className="mt-2 rounded-full border border-cyan-500/40 px-5 py-2 text-[11px] font-extrabold text-cyan-300"
          >
            دخول سريع (تطوير)
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => navigate({ to: "/home", replace: true })}
          className="mt-4 text-[11px] font-bold text-slate-500"
        >
          العودة للرئيسية
        </button>
        <p className="mt-6 text-[9px] font-bold text-slate-600">الرمز الافتراضي للتطوير: 000000</p>
      </div>

      <OwnerAccessPinSheet
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={() => {
          setSessionActive(true);
          setPinOpen(false);
        }}
      />
    </>
  );
}
