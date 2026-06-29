import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { MC } from "../platform-store";
import { formatPlatformNumber } from "../PlatformPremiumUI";
import type { usePlatformDashboard } from "../use-platform-dashboard";

type Dash = ReturnType<typeof usePlatformDashboard>;

export function FounderSyncStrip({
  dash,
  onRefresh,
  mediaPending,
  mediaLoading,
}: {
  dash: Dash;
  onRefresh?: () => void;
  mediaPending?: number;
  mediaLoading?: boolean;
}) {
  const [sync, setSync] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  );

  useEffect(() => {
    const t = window.setInterval(() => {
      setSync(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div
      className="mb-3 overflow-hidden rounded-[16px] border"
      style={{
        borderColor: MC.panelBorder,
        background: MC.panel,
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-3.5 py-2.5"
        style={{ borderColor: MC.panelBorder }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: MC.green, boxShadow: `0 0 8px ${MC.green}` }} />
          <span className="text-[10px] font-bold" style={{ color: MC.green }}>
            Operational · Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mediaLoading ? (
            <span
              className="inline-block h-5 w-14 animate-pulse rounded-full border"
              style={{ borderColor: `${MC.gold}33`, background: `${MC.gold}12` }}
              aria-label="Loading media stats"
            />
          ) : mediaPending != null && mediaPending > 0 ? (
            <Link
              to="/platform/media-manager"
              className="rounded-full border px-2 py-0.5 text-[8px] font-extrabold"
              style={{ borderColor: `${MC.gold}55`, color: MC.gold, background: `${MC.gold}15` }}
            >
              Media {formatPlatformNumber(mediaPending)}
            </Link>
          ) : null}
          {onRefresh ? (
            <button
              type="button"
              aria-label="Refresh dashboard"
              disabled={dash.loading}
              onClick={onRefresh}
              className="grid h-7 w-7 place-items-center rounded-full border active:scale-95 disabled:opacity-40"
              style={{ borderColor: MC.panelBorder, color: MC.cyan }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${dash.loading ? "animate-spin" : ""}`} />
            </button>
          ) : null}
          <span className="font-mono text-[9px] font-semibold tabular-nums" style={{ color: MC.muted }}>
            Sync {sync}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px sm:grid-cols-5" style={{ background: MC.panelBorder }}>
        {[
          { label: "Users", value: formatPlatformNumber(dash.stats.users), color: MC.blue },
          { label: "Churches", value: formatPlatformNumber(dash.stats.churches), color: MC.green },
          { label: "Priests", value: formatPlatformNumber(dash.stats.priests), color: MC.purple },
          { label: "Messages", value: formatPlatformNumber(dash.stats.messages), color: MC.cyan },
          { label: "Reports", value: formatPlatformNumber(dash.stats.reports), color: MC.red },
        ].map((item) => (
          <div key={item.label} className="px-2 py-2.5 text-center" style={{ background: MC.panel }}>
            <p className="truncate text-[8px] font-bold uppercase tracking-wide" style={{ color: MC.muted }}>
              {item.label}
            </p>
            <p className="mt-0.5 font-mono text-[20px] font-extrabold tabular-nums" style={{ color: item.color }}>
              {dash.loading ? "…" : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
