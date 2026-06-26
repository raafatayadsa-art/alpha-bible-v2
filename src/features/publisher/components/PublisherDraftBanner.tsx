import { Clock, ShieldAlert } from "lucide-react";
import type { PublisherStatus } from "../types";
import { publisherDraftBannerMessage, PUBLISHER_STATUS_LABELS } from "../types";

type Props = {
  status: PublisherStatus;
};

export function PublisherDraftBanner({ status }: Props) {
  const message = publisherDraftBannerMessage(status);
  if (!message) return null;

  const isSuspended = status === "suspended";
  const Icon = isSuspended ? ShieldAlert : Clock;

  return (
    <div
      className="flex items-start gap-2.5 rounded-[20px] border px-3.5 py-3"
      style={{
        borderColor: isSuspended ? "rgba(239,68,68,0.25)" : "rgba(93,50,145,0.18)",
        background: isSuspended ? "rgba(239,68,68,0.06)" : "rgba(93,50,145,0.06)",
      }}
    >
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: isSuspended ? "#dc2626" : "#5D3291" }}
      />
      <div className="text-right">
        <p className="text-[12px] font-extrabold" style={{ color: "#3a3258" }}>
          {PUBLISHER_STATUS_LABELS[status]}
        </p>
        <p className="mt-0.5 text-[11px] font-bold leading-relaxed" style={{ color: "#6b658a" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
