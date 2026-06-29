import { AlertTriangle, Bus, Home, Users, Activity } from "lucide-react";
import { getCurrentUser } from "@/features/church/current-user";
import { hasTripOrganizerPermission } from "@/features/alpha-connect/trip-channel-access";
import { findTripLinkByChannelId } from "@/features/alpha-connect/trip-channel-links";
import { pushInternalTripAlert, readTripOperations } from "@/features/alpha-connect/trip-operations-store";
import { buildCommandCenterSnapshot } from "@/features/church/trip-reservations/trip-command-center";
import { TripBusPanel } from "@/features/church/trip-reservations/components/TripBusPanel";
import { TripOrganizerPaymentPanel } from "@/features/church/trip-reservations/components/TripOrganizerPaymentPanel";
import { CompanionMatchingPanel } from "@/features/church/trip-reservations/components/CompanionMatchingPanel";
import { cn } from "@/lib/utils";

export function TripOperationsPanel({
  activeChannelId,
  capacity,
  onAlertSent,
}: {
  activeChannelId: string;
  capacity?: number;
  onAlertSent?: (message: string) => void;
}) {
  const link = findTripLinkByChannelId(activeChannelId);
  if (!link || activeChannelId !== link.organizerChannelId) return null;
  if (!hasTripOrganizerPermission(link.postId, "send_internal_alert")) return null;

  const ops = readTripOperations(link.postId);
  const cc = buildCommandCenterSnapshot(link.postId, capacity);

  const sendQuickAlert = (message: string) => {
    const user = getCurrentUser();
    pushInternalTripAlert({
      postId: link.postId,
      message,
      createdBy: user.id || "organizer",
      createdByName: user.name || "منظم",
    });
    onAlertSent?.("تم إرسال التنبيه الداخلي للمنظمين");
  };

  return (
    <section
      className="mb-4 overflow-hidden rounded-2xl border border-[#e7c97a]/25 bg-black/30 p-3"
      dir="rtl"
    >
      <p className="mb-2 text-[11px] font-extrabold text-[#f0d78c] inline-flex items-center gap-1">
        <Activity className="h-3.5 w-3.5" /> مركز قيادة الرحلة
      </p>

      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <StatChip icon={Users} label="مسجل" value={cc.registered} />
        <StatChip icon={Users} label="حضور" value={cc.checkedIn} />
        <StatChip icon={AlertTriangle} label="غائب" value={cc.absent} tone="warn" />
        <StatChip icon={AlertTriangle} label="انتظار" value={cc.waitlist} tone="warn" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
          <div className="flex items-center gap-1 font-bold text-white/55">
            <Bus className="h-3 w-3" /> الحافلات
          </div>
          <p className="mt-1 font-extrabold text-white/88">{ops.busStatus}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
          <div className="flex items-center gap-1 font-bold text-white/55">
            <Home className="h-3 w-3" /> السكن
          </div>
          <p className="mt-1 font-extrabold text-white/88">{cc.housingGroups ? `${cc.housingGroups} مجموعة` : ops.housingStatus}</p>
        </div>
      </div>

      <TripBusPanel postId={link.postId} />
      <TripOrganizerPaymentPanel postId={link.postId} />
      <CompanionMatchingPanel postId={link.postId} />

      {ops.adminAlerts[0] ? (
        <p className="mt-2 rounded-xl border border-[#e7c97a]/20 bg-[#e7c97a]/8 px-2.5 py-2 text-[10px] leading-relaxed text-[#f0d78c]">
          <span className="font-bold">آخر تنبيه: </span>
          {ops.adminAlerts[0].message}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {[
          "تأخر إحدى الحافلات",
          "تغيير نقطة التجمع",
          "حالة طبية طارئة",
        ].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => sendQuickAlert(label)}
            className="rounded-full border border-[#e7c97a]/30 bg-black/40 px-2.5 py-1 text-[9.5px] font-bold text-white/80 active:scale-95"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-1.5 py-2 text-center">
      <Icon className={cn("mx-auto h-3 w-3", tone === "warn" ? "text-[#ff9f7a]" : "text-[#8fd4ff]")} />
      <p className="mt-0.5 text-[8px] font-bold text-white/50">{label}</p>
      <p className="text-[12px] font-extrabold tabular-nums text-white">{value}</p>
    </div>
  );
}
