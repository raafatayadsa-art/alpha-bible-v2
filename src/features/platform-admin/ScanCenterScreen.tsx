import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Clock, Keyboard, QrCode, ShieldCheck } from "lucide-react";
import {
  CyberBtn,
  CyberPanel,
  CyberSearch,
  MissionSubShell,
  PrivacyStrip,
} from "./mission-control-ui";
import { MC } from "./platform-store";
import { usePlatformStore } from "./platform-store";
import {
  getTrustProfile,
  logScanAccess,
  normalizeQrCode,
  resolveQrCode,
  resolveQrCodeAsync,
  useScanStore,
  type QrScanType,
} from "./scan-store";

const QR_TYPE_LABEL: Record<QrScanType, string> = {
  user: "User QR",
  church: "Church QR",
  priest: "Priest QR",
  servant: "Servant QR",
};

function ScannerViewport({ active }: { active: boolean }) {
  return (
    <div
      className="relative mx-auto aspect-[4/3] max-h-[200px] w-full overflow-hidden rounded-[10px] border"
      style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.45)" }}
    >
      <div className="absolute inset-0 opacity-30" style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${MC.grid} 2px, ${MC.grid} 4px)` }} />
      <div className="absolute inset-4 rounded-[8px] border" style={{ borderColor: `${MC.cyan}44` }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <Camera className="h-8 w-8 text-slate-500" strokeWidth={1.6} />
        <p className="text-[10px] font-bold text-slate-400">Camera QR Scanner Area</p>
        <p className="text-[8px] leading-relaxed text-slate-600">
          {active ? "جاهز للمسح — استخدم الإدخال اليدوي أو أكواد التطوير" : "لا يتم حفظ صورة QR — بيانات ثقة إدارية فقط"}
        </p>
      </div>
      {active && (
        <div
          className="pointer-events-none absolute left-4 right-4 h-0.5 animate-pulse"
          style={{ top: "45%", background: `linear-gradient(90deg, transparent, ${MC.cyan}, transparent)`, opacity: 0.5 }}
        />
      )}
    </div>
  );
}

export function ScanCenterScreen() {
  const navigate = useNavigate();
  const { addAudit } = usePlatformStore();
  const { recent, refresh } = useScanStore();
  const [manualCode, setManualCode] = useState("");
  const [accessReason, setAccessReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const openProfile = useCallback(
    (trustId: string, profile: NonNullable<ReturnType<typeof resolveQrCode>>) => {
      logScanAccess(profile, addAudit, accessReason);
      refresh();
      navigate({ to: "/platform/scan/trust/$trustId", params: { trustId } });
    },
    [accessReason, addAudit, navigate, refresh],
  );

  const handleSubmit = useCallback(async () => {
    setError(null);
    const code = normalizeQrCode(manualCode);
    if (!code) {
      setError("أدخل كود QR صالح");
      return;
    }
    const profile = (await resolveQrCodeAsync(code)) ?? resolveQrCode(code);
    if (!profile) {
      setError("كود غير معروف — جرّب USER-A128 أو CHURCH-C356");
      return;
    }
    openProfile(profile.id, profile);
  }, [manualCode, openProfile]);

  const handleRescan = useCallback(
    (trustId: string) => {
      const profile = getTrustProfile(trustId);
      if (profile) {
        logScanAccess(profile, addAudit, accessReason);
        refresh();
      }
      navigate({ to: "/platform/scan/trust/$trustId", params: { trustId } });
    },
    [accessReason, addAudit, navigate, refresh],
  );

  return (
    <MissionSubShell title="Scan Center" titleEn="مركز المسح" navActive="quick">
      <PrivacyStrip>
        يتم عرض بيانات الثقة الإدارية فقط، ولا يمكن الوصول إلى المحتوى الخاص.
      </PrivacyStrip>

      <CyberPanel glow={MC.steel} className="mb-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-300">QR Scanner</p>
          <span className="flex items-center gap-1 text-[8px] font-semibold text-slate-500">
            <ShieldCheck className="h-3 w-3" style={{ color: MC.green }} />
            Privacy Safe
          </span>
        </div>
        <ScannerViewport active={scanning} />
        <div className="mt-2 grid grid-cols-4 gap-1">
          {(Object.keys(QR_TYPE_LABEL) as QrScanType[]).map((t) => (
            <span
              key={t}
              className="rounded-[6px] border px-1 py-1 text-center text-[7px] font-semibold text-slate-500"
              style={{ borderColor: MC.panelBorder }}
            >
              {QR_TYPE_LABEL[t]}
            </span>
          ))}
        </div>
        <CyberBtn
          label={scanning ? "إيقاف المسح" : "تفعيل منطقة المسح"}
          className="mt-2 w-full"
          variant="ghost"
          onClick={() => setScanning((v) => !v)}
        />
      </CyberPanel>

      <p className="mb-1.5 text-[9px] font-bold text-slate-500">إدخال الكود يدوياً</p>
      <CyberSearch value={manualCode} onChange={setManualCode} placeholder="USER-A128 · PRIEST-P125 · SERVANT-S042 · CHURCH-C356" />
      <input
        value={accessReason}
        onChange={(e) => setAccessReason(e.target.value)}
        placeholder="سبب الوصول (اختياري — يُسجّل في Audit)"
        className="mb-2 w-full rounded-lg border bg-black/30 px-3 py-2 text-[11px] text-slate-300 placeholder:text-slate-600 outline-none"
        style={{ borderColor: MC.panelBorder }}
      />
      {error && <p className="mb-2 text-[10px] font-bold text-[#b85450]">{error}</p>}
      <CyberBtn label="فتح Platform Trust Profile" className="mb-3 w-full" onClick={handleSubmit} />

      <div className="mb-2 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-slate-500" />
        <p className="text-[10px] font-bold text-slate-400">آخر عمليات مسح</p>
      </div>
      {recent.length === 0 ? (
        <CyberPanel glow={MC.steel}>
          <p className="text-center text-[10px] text-slate-500">لا توجد عمليات مسح بعد</p>
        </CyberPanel>
      ) : (
        <div className="space-y-1.5">
          {recent.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleRescan(entry.trustId)}
              className="flex w-full items-center justify-between gap-2 rounded-[10px] border px-3 py-2.5 text-right active:scale-[0.99]"
              style={{ borderColor: MC.panelBorder, background: MC.panel }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-slate-200">{entry.label}</p>
                <p className="text-[8px] text-slate-500">
                  {QR_TYPE_LABEL[entry.qrType]} · {new Date(entry.timestamp).toLocaleString("ar-EG")}
                </p>
              </div>
              <QrCode className="h-4 w-4 shrink-0 text-slate-500" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 rounded-[8px] border px-2.5 py-2" style={{ borderColor: `${MC.amber}33`, background: `${MC.amber}0d` }}>
        <Keyboard className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: MC.amber }} />
        <p className="text-[8px] leading-relaxed text-slate-500">
          لا يتم حفظ صورة QR. كل مسح يُسجّل في Audit Logs مع نوع QR ووقت الوصول.
        </p>
      </div>
    </MissionSubShell>
  );
}
