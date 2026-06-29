import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { MC } from "./platform-store";
import { grantOwnerSession, isOwnerSessionActive } from "./owner-access-store";
import { tryClaimFirstPlatformOwner, checkIsPlatformOwnerRpc } from "./platform-owner-api";
import { fetchMyAdminPermissions } from "./admin-team/admin-team-api";
import { OwnerAccessPinSheet } from "./OwnerAccessPinSheet";
import { isPlatformOwnerSync, refreshAuthContext, subscribeAuthContext, isFounderEmail, getAuthUserSync } from "@/features/auth";

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
    const tryOwnerBypass = async () => {
      if (isOwnerSessionActive()) {
        setSessionActive(true);
        return;
      }
      const founder = isFounderEmail(getAuthUserSync()?.email);
      if (founder && (isPlatformOwnerSync() || (await checkIsPlatformOwnerRpc()))) {
        grantOwnerSession();
        setSessionActive(true);
      }
    };

    void tryOwnerBypass();
    return subscribeAuthContext(() => {
      void tryOwnerBypass();
    });
  }, []);

  useEffect(() => {
    if (sessionActive) return;
    void (async () => {
      await refreshAuthContext();
      const founder = isFounderEmail(getAuthUserSync()?.email);
      if (founder && (isPlatformOwnerSync() || (await checkIsPlatformOwnerRpc()))) {
        grantOwnerSession();
        setSessionActive(true);
        return;
      }
      const perms = await fetchMyAdminPermissions();
      if (perms.length > 0) {
        grantOwnerSession();
        setSessionActive(true);
      }
    })();
  }, [sessionActive]);

  useEffect(() => {
    if (!sessionActive) return;
    void (async () => {
      if (!isPlatformOwnerSync()) {
        await tryClaimFirstPlatformOwner();
      }
      await refreshAuthContext();
      const founder = isFounderEmail(getAuthUserSync()?.email);
      if (founder && (isPlatformOwnerSync() || (await checkIsPlatformOwnerRpc()))) {
        grantOwnerSession();
        setSessionActive(true);
        return;
      }
      const perms = await fetchMyAdminPermissions();
      if (perms.length > 0) {
        grantOwnerSession();
        setSessionActive(true);
      }
    })();
  }, [sessionActive]);

  const openPin = () => setPinOpen(true);

  if (sessionActive) return <>{children}</>;

  return (
    <>
      <div
        dir="rtl"
        className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
        style={{
          background: "#000000",
          color: MC.text,
        }}
      >
        <div
          className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border"
          style={{ borderColor: `${MC.green}44`, background: `${MC.green}14` }}
        >
          <Shield className="h-8 w-8" style={{ color: MC.green }} />
        </div>
        <h1 className="text-[16px] font-extrabold text-white">Alpha Control Center</h1>
        <p className="mt-2 max-w-xs text-[11px] font-bold leading-relaxed" style={{ color: MC.muted }}>
          لوحة تحكم المالك — أدخل رمز الدخول (6 أرقام) للمتابعة.
        </p>
        <button
          type="button"
          onClick={openPin}
          className="mt-5 rounded-full px-6 py-2.5 text-[12px] font-extrabold text-black"
          style={{ background: MC.green }}
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
