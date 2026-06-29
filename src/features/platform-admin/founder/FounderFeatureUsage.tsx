import { LayoutGrid, TrendingDown, TrendingUp } from "lucide-react";
import { CyberPanel } from "../mission-control-ui";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";
import { buildFeatureUsage, type Dash } from "./founder-dashboard-data";
import { FounderIcon3D } from "./FounderIcon3D";

export function FounderFeatureUsage({ dash }: { dash: Dash }) {
  const rows = buildFeatureUsage(dash);

  return (
    <CyberPanel glow={MC.purple} className="mb-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[9px] font-bold" style={{ color: MC.muted }}>
          آخر 7 أيام
        </span>
        <div className="flex items-center gap-1.5">
          <LayoutGrid className="h-5 w-5" style={{ color: PP_GOLD }} />
          <p className="text-[13px] font-extrabold" style={{ color: MC.white }}>
            استخدام الميزات
          </p>
        </div>
      </div>
      <ul className="space-y-2.5" dir="rtl">
        {rows.map((row) => {
          const Icon = row.icon;
          const up = row.trend >= 0;
          const showTrend = row.trend !== 0;
          return (
            <li
              key={row.id}
              className="rounded-[16px] border px-3 py-2.5"
              style={{ borderColor: `${row.color}33`, background: "rgba(0,0,0,0.2)" }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                {showTrend ? (
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-extrabold"
                    style={{ color: up ? MC.green : MC.red }}
                  >
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}
                    {row.trend}%
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold" style={{ color: MC.muted }}>
                    مباشر
                  </span>
                )}
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="truncate text-[12px] font-extrabold" style={{ color: MC.white }}>
                    {row.label}
                  </span>
                  <FounderIcon3D icon={Icon} accent={row.color} size="sm" />
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[14px] font-extrabold tabular-nums" style={{ color: row.color }}>
                  {dash.loading ? "…" : row.display}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${row.pct}%`, background: row.color, boxShadow: `0 0 12px -2px ${row.color}` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </CyberPanel>
  );
}
