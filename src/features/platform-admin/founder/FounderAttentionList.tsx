import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { CyberPanel } from "../mission-control-ui";
import { MC } from "../platform-store";
import { formatPlatformNumber } from "../PlatformPremiumUI";
import type { MediaManagerStats } from "../media-manager-api";
import { buildAttentionItems, type Dash } from "./founder-dashboard-data";
import { FounderIcon3D } from "./FounderIcon3D";

export function FounderAttentionList({
  dash,
  mediaStats,
}: {
  dash: Dash;
  mediaStats: MediaManagerStats | null;
}) {
  const items = buildAttentionItems(dash, mediaStats);

  return (
    <CyberPanel glow={MC.gold} className="mb-3">
      <div className="mb-3 flex items-center justify-between">
        <span
          className="rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tabular-nums"
          style={{ borderColor: `${MC.gold}44`, color: MC.gold, background: `${MC.gold}12` }}
        >
          {items.length} عناصر
        </span>
        <p className="text-[13px] font-extrabold" style={{ color: MC.white }}>
          يحتاج انتباهك الآن
        </p>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-center text-[11px] font-bold" style={{ color: MC.green }}>
          ✓ لا توجد عناصر عاجلة
        </p>
      ) : (
        <ul className="space-y-2" dir="rtl">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="flex items-center gap-2.5 rounded-[16px] border px-3 py-2.5"
                style={{ borderColor: `${item.color}44`, background: "rgba(0,0,0,0.22)" }}
              >
                <Link to={item.to} className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span
                    className="grid h-8 min-w-[32px] place-items-center rounded-full px-1 font-mono text-[12px] font-extrabold tabular-nums"
                    style={{ background: `${item.color}33`, color: item.color, boxShadow: `0 0 12px -4px ${item.color}` }}
                  >
                    {formatPlatformNumber(item.count)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold" style={{ color: MC.white }}>
                    {item.title}
                  </span>
                  <span
                    className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-extrabold"
                    style={{ color: item.color }}
                  >
                    {item.action}
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <FounderIcon3D icon={Icon} accent={item.color} size="sm" />
              </li>
            );
          })}
        </ul>
      )}
    </CyberPanel>
  );
}
