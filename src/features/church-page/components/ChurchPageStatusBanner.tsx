import { ShieldAlert, ShieldCheck, Clock, Ban } from "lucide-react";
import type { ChurchPageStatus } from "../page-status";
import { churchPageStatusLabel, churchPageStatusMessage } from "../page-status";
import { CHURCH_DIR } from "@/features/church-directory/tokens";

type Props = {
  status: ChurchPageStatus;
};

export function ChurchPageStatusBanner({ status }: Props) {
  if (status === "verified") {
    return (
      <div
        className="flex items-start gap-2.5 rounded-[20px] border px-3.5 py-3"
        style={{ borderColor: "rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.08)" }}
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div className="text-right">
          <p className="text-[12px] font-extrabold text-emerald-800">{churchPageStatusLabel(status)}</p>
          <p className="mt-0.5 text-[11px] font-bold text-emerald-700/80">
            مجتمع الكنيسة متاح للأعضاء والخدام.
          </p>
        </div>
      </div>
    );
  }

  const message = churchPageStatusMessage(status);
  if (!message) return null;

  const icon =
    status === "pending_claim" ? Clock : status === "suspended" ? Ban : ShieldAlert;
  const Icon = icon;

  return (
    <div
      className="flex items-start gap-2.5 rounded-[20px] border px-3.5 py-3"
      style={{
        borderColor: status === "suspended" ? "rgba(239,68,68,0.25)" : CHURCH_DIR.border,
        background: status === "suspended" ? "rgba(239,68,68,0.06)" : CHURCH_DIR.glass,
      }}
    >
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: status === "suspended" ? "#dc2626" : CHURCH_DIR.purple }}
      />
      <div className="text-right">
        <p className="text-[12px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
          {churchPageStatusLabel(status)}
        </p>
        <p className="mt-0.5 text-[11px] font-bold leading-relaxed" style={{ color: CHURCH_DIR.sub }}>
          {message}
        </p>
      </div>
    </div>
  );
}
