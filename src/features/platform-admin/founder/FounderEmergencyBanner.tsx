import { Link } from "@tanstack/react-router";
import { Radio, Siren } from "lucide-react";
import { MC } from "../platform-store";
import { usePlatformStore } from "../platform-store";

export function FounderEmergencyBanner() {
  const { emergency } = usePlatformStore();
  const active =
    emergency.lockdown ||
    emergency.maintenance ||
    emergency.disableRegistration ||
    emergency.disableMessaging ||
    emergency.disableCommunity;

  return (
    <Link
      to="/platform/emergency"
      className="mb-3 block overflow-hidden rounded-[16px] border transition active:scale-[0.99]"
      style={{
        borderColor: active ? `${MC.red}66` : `${MC.red}33`,
        background: active ? `${MC.red}14` : MC.panel,
      }}
    >
      <div className="flex items-center gap-3 px-3.5 py-3" dir="rtl">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px]"
          style={{ background: `${MC.red}33`, color: MC.red }}
        >
          {active ? <Siren className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[12px] font-extrabold" style={{ color: MC.white }}>
            Emergency Center
          </p>
          <p className="text-[9px] font-bold" style={{ color: MC.muted }}>
            {active
              ? "⚠ وضع طوارئ أو صيانة مفعّل — اضغط للإدارة"
              : "Maintenance · Lockdown · Platform broadcast"}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-extrabold"
          style={{ borderColor: `${MC.red}55`, color: MC.red }}
        >
          فتح
        </span>
      </div>
    </Link>
  );
}
