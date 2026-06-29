import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { CyberPanel } from "../mission-control-ui";
import { MC } from "../platform-store";
import { formatPlatformNumber, PP_GOLD } from "../PlatformPremiumUI";
import type { Dash } from "./founder-dashboard-data";

export function FounderPlatformGrowth({ dash }: { dash: Dash }) {
  const metrics = useMemo(
    () => [
      { label: "المستخدمون", value: formatPlatformNumber(dash.stats.users), color: MC.blue },
      { label: "الكنائس", value: formatPlatformNumber(dash.stats.churches), color: PP_GOLD },
      { label: "الكهنة", value: formatPlatformNumber(dash.stats.priests), color: MC.purple },
      { label: "الخدام", value: formatPlatformNumber(dash.stats.servants), color: MC.gold },
    ],
    [dash.stats],
  );

  return (
    <CyberPanel glow={MC.purple} className="mb-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[8px] font-bold" style={{ color: MC.muted }}>
          بيانات حية من Supabase
        </span>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" style={{ color: MC.purple }} />
          <p className="text-[11px] font-extrabold" style={{ color: MC.white }}>
            نمو المنصة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-[14px] border px-2 py-3 text-center"
            style={{ borderColor: `${m.color}33`, background: "rgba(0,0,0,0.22)" }}
          >
            <p className="font-mono text-[20px] font-extrabold tabular-nums leading-none" style={{ color: m.color }}>
              {dash.loading ? "…" : m.value}
            </p>
            <p className="mt-1 text-[8px] font-bold" style={{ color: MC.muted }}>
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </CyberPanel>
  );
}
