import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ClipboardList } from "lucide-react";
import { CyberPanel } from "../mission-control-ui";
import { MC, usePlatformStore } from "../platform-store";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return `منذ ${Math.floor(hours / 24)} ي`;
}

export function FounderRecentActivity({ loading }: { loading?: boolean }) {
  const { auditLog } = usePlatformStore();
  const items = useMemo(() => auditLog.slice(0, 5), [auditLog]);

  return (
    <CyberPanel glow={MC.blue} className="mb-3">
      <div className="mb-2 flex items-center justify-between">
        <Link
          to="/platform/audit"
          className="text-[9px] font-extrabold"
          style={{ color: MC.gold }}
        >
          عرض الكل
        </Link>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ color: MC.muted }}>
          Recent Activity
        </p>
      </div>
      {loading ? (
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-12 animate-pulse rounded-[12px] border"
              style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.18)" }}
            />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="py-2 text-center text-[10px] font-bold" style={{ color: MC.muted }}>
          لا توجد أنشطة مسجّلة بعد
        </p>
      ) : (
        <ul className="space-y-2 text-right" dir="rtl">
          {items.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-2 rounded-[12px] border px-2.5 py-2"
              style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.18)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-extrabold" style={{ color: MC.white }}>
                  {entry.action}
                </p>
                <p className="text-[9px] font-bold" style={{ color: MC.muted }}>
                  {entry.admin} · {timeAgo(entry.timestamp)}
                </p>
                {entry.reason ? (
                  <p className="mt-0.5 truncate text-[8px]" style={{ color: MC.cyan }}>
                    {entry.reason}
                  </p>
                ) : null}
              </div>
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: MC.green }} strokeWidth={3} />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex items-center justify-end gap-1 text-[8px] font-bold" style={{ color: MC.muted }}>
        <span>Audit Logs</span>
        <ClipboardList className="h-3 w-3" />
      </div>
    </CyberPanel>
  );
}
